import { PrefixSumComputer } from './prefixSumComputer';
import { IPosition, Position } from './position';

interface IPiece {
	isOriginalBuffer: boolean;
	offset: number;
	length: number;
	
	lineFeedCnt: number;
	lineStarts: PrefixSumComputer;
}

interface BufferCursor {
	/**
	 * Piece Index
	 */
	index: number;
	
	/**
	 * Character Offset in the particular buffer. 
	 */
	offset: number;
	/** 
	 * remainer in current piece.
	*/
	remainder: number;
}

interface IRange {
	/**
	 * Line number on which the range starts (starts at 1).
	 */
	readonly startLineNumber: number;
	/**
	 * Column on which the range starts in line `startLineNumber` (starts at 1).
	 */
	readonly startColumn: number;
	/**
	 * Line number on which the range ends.
	 */
	readonly endLineNumber: number;
	/**
	 * Column on which the range ends in line `endLineNumber`.
	 */
	readonly endColumn: number;
}

export class PieceTable {
	private _originalBuffer: string;
	private _changeBuffer: string;
	private _pieces: IPiece[];
	private _lineStarts: PrefixSumComputer; // piece index to line
	private _indexStarts: PrefixSumComputer; // piece index to offset
	
	constructor(originalBuffer: string, size?: number) {
		this._originalBuffer = originalBuffer;
		this._changeBuffer = '';
		
		const { lineFeedCount, lineLengths } = this.udpateLFCount(originalBuffer);
		const lineStarts = new PrefixSumComputer(lineLengths);
		
		this._pieces = [{
			isOriginalBuffer: true,
			offset: 0,
			length: size ? size : originalBuffer.length,
			lineFeedCnt: lineFeedCount,
			lineStarts: lineStarts
		}];
	}
	
	//#region basic operations
	insert(value: string, offset: number): void {
		let hasPieces = this._pieces.length > 0;
		const startOffset = this._changeBuffer.length;
		this._changeBuffer += value;
		
		const { lineFeedCount, lineLengths } = this.udpateLFCount(value);
		const lineStarts = new PrefixSumComputer(lineLengths);

		const newPiece: IPiece = {
			isOriginalBuffer: false,
			offset: startOffset,
			length: value.length,
			lineFeedCnt: lineFeedCount,
			lineStarts: lineStarts
		};
		
		// insert newPiece into the piece table.
		let insertPosition = this.offsetToPieceIndex(offset);
		if (!insertPosition) {
			if (this._pieces.length === 0) {
				this._pieces.push(newPiece);
				return;
			} else {
				throw('this should not happen');
			}
		}
		
		let originalPiece = this._pieces[insertPosition.index];
		
		let { index, remainder } = originalPiece.lineStarts.getIndexOf(insertPosition.remainder);
		let firstPart = insertPosition.offset - originalPiece.offset > 0 ? {
			isOriginalBuffer: originalPiece.isOriginalBuffer,
			offset: originalPiece.offset,
			length: insertPosition.offset - originalPiece.offset,
			lineFeedCnt: index,
			lineStarts: PrefixSumComputer.deepCopy(originalPiece.lineStarts.values)
		} : null;
		
		if (firstPart) {
			firstPart.lineStarts.removeValues(index + 1, originalPiece.lineStarts.values.length - index - 1);
			firstPart.lineStarts.changeValue(index, remainder);
		}
		
		let secondPart = originalPiece.length - (insertPosition.offset - originalPiece.offset) > 0 ? {
			isOriginalBuffer: originalPiece.isOriginalBuffer,
			offset: insertPosition.offset,
			length: originalPiece.length - (insertPosition.offset - originalPiece.offset),
			lineFeedCnt: originalPiece.lineFeedCnt - index,
			lineStarts: PrefixSumComputer.deepCopy(originalPiece.lineStarts.values)
		} : null;
		
		if (secondPart) {
			// change value first otherwise the index is wrong.
			secondPart.lineStarts.changeValue(index, secondPart.lineStarts.values[index] - remainder);
			
			if (index > 0) {
				// removeValues (start, cnt!) cnt is 1 based.
				secondPart.lineStarts.removeValues(0, index);
			}
			
		}

		let newPieces: IPiece[] = [
			firstPart,
			newPiece,
			secondPart
		].filter( piece => {
			return piece && piece.length > 0;
		});

		this._pieces.splice(insertPosition.index, 1, ...newPieces);
		
		if (hasPieces && this._pieces.length === 0) {
			throw('woqu');
		}
	}
	
	delete(offset: number, cnt: number): void {
		let hasPieces = this._pieces.length > 0;
		let firstTouchedPiecePos = this.offsetToPieceIndex(offset);
		let lastTouchedPiecePos = this.offsetToPieceIndex(offset + cnt);
		
		if (!firstTouchedPiecePos) {
			return; // delete is out of range.
		}
		
		if (!lastTouchedPiecePos) {
			const piece = this._pieces[firstTouchedPiecePos.index];
			lastTouchedPiecePos = {
				index: firstTouchedPiecePos.index,
				offset: piece.offset + piece.length,
				remainder: length
			};
		}
		
		if (firstTouchedPiecePos.index === lastTouchedPiecePos.index) {
			const piece = this._pieces[firstTouchedPiecePos.index];
			
			let deleteBegin = piece.lineStarts.getIndexOf(firstTouchedPiecePos.remainder);
			let deleteEnd = piece.lineStarts.getIndexOf(firstTouchedPiecePos.remainder + cnt);
			
			if (firstTouchedPiecePos.offset === piece.offset) {
				piece.offset += cnt;
				piece.length -= cnt;
				piece.lineFeedCnt -= deleteEnd.index;
				piece.lineStarts.changeValue(deleteEnd.index, piece.lineStarts.values[deleteEnd.index] - deleteEnd.remainder);
				piece.lineStarts.removeValues(0, deleteEnd.index);
				return;
			} else if (lastTouchedPiecePos.offset === piece.offset + piece.length) {
				piece.length -= cnt;
				piece.lineFeedCnt -= piece.lineStarts.values.length - deleteBegin.index - 1;
				piece.lineStarts.removeValues(deleteBegin.index + 1, piece.lineStarts.values.length - deleteBegin.index - 1);
				piece.lineStarts.changeValue(deleteBegin.index, deleteBegin.remainder);
				return;
			}
		}
		
		const firstTouchedPiece = this._pieces[firstTouchedPiecePos.index];
		const lastTouchedPiece = this._pieces[lastTouchedPiecePos.index];
		
		let newFirstPiece;
		{
			let { index, remainder } = firstTouchedPiece.lineStarts.getIndexOf(firstTouchedPiecePos.remainder);
			newFirstPiece = {
				isOriginalBuffer: firstTouchedPiece.isOriginalBuffer,
				offset: firstTouchedPiece.offset,
				length: firstTouchedPiecePos.offset - firstTouchedPiece.offset,
				lineFeedCnt: index,
				lineStarts: PrefixSumComputer.deepCopy(firstTouchedPiece.lineStarts.values)
			};
		
			newFirstPiece.lineStarts.removeValues(index + 1, firstTouchedPiece.lineStarts.values.length - index - 1);
			newFirstPiece.lineStarts.changeValue(index, remainder);
		}
		
		let newLastPiece;
		{
			let { index, remainder } = lastTouchedPiece.lineStarts.getIndexOf(lastTouchedPiecePos.remainder);
			newLastPiece = {
				isOriginalBuffer: lastTouchedPiece.isOriginalBuffer,
				offset: lastTouchedPiecePos.offset,
				length: lastTouchedPiece.length + lastTouchedPiece.offset - lastTouchedPiecePos.offset,
				lineFeedCnt: lastTouchedPiece.lineFeedCnt - index,
				lineStarts: PrefixSumComputer.deepCopy(lastTouchedPiece.lineStarts.values)
			};
			
			// todo I doubt whether I should delete `offset`
			// change value first otherwise the index is wrong.
			newLastPiece.lineStarts.changeValue(index, newLastPiece.lineStarts.values[index] - remainder/* lastTouchedPiece.offset + lastTouchedPiece.length - offset */);
			
			if (index > 0) {
				newLastPiece.lineStarts.removeValues(0, index);
			}
		}
		
		const newPieces: IPiece[] = [
			newFirstPiece,
			newLastPiece
		].filter( piece => {
			return piece.length > 0;
		});
		
		this._pieces.splice(firstTouchedPiecePos.index, lastTouchedPiecePos.index - firstTouchedPiecePos.index + 1, ...newPieces);
	}
	
	substr(offset: number, cnt: number): string {
		let ret = '';
		const firstTouchedPiecePos = this.offsetToPieceIndex(offset);
		const lastTouchedPiecePos = this.offsetToPieceIndex(offset + cnt);

		for (let i = firstTouchedPiecePos.index; i <= lastTouchedPiecePos.index; i++) {
			let piece = this._pieces[i];
			
			let buffer;
			
			if (piece.isOriginalBuffer) {
				buffer = this._originalBuffer;
			} else {
				buffer = this._changeBuffer;
			}
			
			let start;
			let end;
			if (i === firstTouchedPiecePos.index) {
				start = piece.offset + firstTouchedPiecePos.remainder;
			} else {
				start = piece.offset;
			}
			
			if (i === lastTouchedPiecePos.index) {
				end = piece.offset + lastTouchedPiecePos.remainder;
			} else {
				end = piece.offset + piece.length;
			}
			
			ret += buffer.substring(start, end);
	}
		
		return ret;
	}
	
	//#endregion
	
	//#region Model API
	getContent() {
        let str = "";
        this._pieces.forEach(piece => {
            if (piece.isOriginalBuffer) {
                str += this._originalBuffer.substr(piece.offset, piece.length);
            }
            else {
                str += this._changeBuffer.substr(piece.offset, piece.length);
            }
        });
        return str;
	};
		
	getLineCount(): number {
		let cnt = 0;
		for (let i = 0; i < this._pieces.length; i++) {
			cnt += this._pieces[i].lineFeedCnt;
		}
		
		return cnt + 1;
	}
	
	getValueInRange(range: IRange): string {
		return '';
	}

	getLineContent(lineNumber: number): string {
		return '';
	}
	
	getOffsetAt(position: IPosition): number {
		// todo this can definitely be O(logN) with prefix sum, or a tree data structure.
		let lineNumber = position.lineNumber;
		let cnt = 0;
		let index = -1;
		let leftLen = 0;
		for (let i = 0; i < this._pieces.length; i++) {
			cnt += this._pieces[i].lineFeedCnt;
			if (cnt + 1 >= lineNumber) {
				index = i;
				break;
			} else {
				leftLen += this._pieces[i].length;
			}
		}
		
		// TODO, we need to think about lines across pieces.
		
		let remainingLine = lineNumber - (cnt - this._pieces[index].lineFeedCnt);
		// try to get accumulated value of previous line
		return leftLen + this._pieces[index].lineStarts.getAccumulatedValue(remainingLine - 2) + position.column - 1;
	}

	getPositionAt(offset: number): Position {
		// todo this can definitely be O(logN) with prefix sum, or a tree data structure.
		let remainingOffset = offset;
		let index = -1;
		let lfCnt = 0;
		
		for (let i = 0; i < this._pieces.length; i++) {
			if (remainingOffset > this._pieces[i].length) {
				remainingOffset -= this._pieces[i].length;
				lfCnt += this._pieces[i].lineFeedCnt;
			} else {
				index = i;
				break;
			}
		}
	
		let out = this._pieces[index].lineStarts.getIndexOf(remainingOffset);
		
		let column = 0;
		if (out.index === 0) {
			if (index > 0) {
				let lineLens = this._pieces[index - 1].lineStarts.values;
				column += lineLens[lineLens.length - 1];
			}
		}
		
		// Ensure we return a valid position
		lfCnt += out.index;
		return new Position(lfCnt + 1, column + out.remainder + 1);
	}

	//#endregion
	
	private offsetToPieceIndex(offset: number, searchStartIndex?: number): BufferCursor {
		// todo this can be done in O(logN) by prefix sum.
		if (offset < 0) {
			return {
				index: 0,
				offset: 0,
				remainder: 0
			};
		}
		
		let remainingOffset = offset;
		for (let i = 0; i < this._pieces.length; i++) {
			let piece = this._pieces[i];
			
			if (remainingOffset <= piece.length) {
				return {
					index: i,
					offset: piece.offset + remainingOffset,
					remainder: remainingOffset
				};
			}
			remainingOffset -= piece.length;
		}
		
		return null;
	}

	private udpateLFCount(chunk: string): { lineFeedCount: number, lineLengths: Uint32Array } {
		let chunkLineFeedCnt = 0;
		let lastLineFeedIndex = -1;
		let lineFeedStarts: number[] = [-1];

		while ((lastLineFeedIndex = chunk.indexOf('\n', lastLineFeedIndex + 1)) !== -1) {
			chunkLineFeedCnt++;
			lineFeedStarts.push(lastLineFeedIndex);
		}
		
		const lineStartValues = new Uint32Array(chunkLineFeedCnt + 1);
		for (let i = 1; i <= chunkLineFeedCnt; i++) {
			lineStartValues[i - 1] = lineFeedStarts[i] - lineFeedStarts[i - 1];
		}
		
		lineStartValues[chunkLineFeedCnt] = chunk.length - lineFeedStarts[lineFeedStarts.length - 1] - 1;

		return {
			lineFeedCount: chunkLineFeedCnt,
			lineLengths: lineStartValues
		};
	}
}
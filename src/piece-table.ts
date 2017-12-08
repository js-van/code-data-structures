interface IPiece {
	isOriginalBuffer: boolean;
	offset: number;
	length: number;
}

interface IPosition {
	/**
	 * Piece Index
	 */
	index: number;
	
	/**
	 * Character Offset in the particular buffer.
	 */
	offset: number;
}

export class PieceTable {
	private _originalBuffer: string;
	private _changeBuffer: string;
	private _pieces: IPiece[];
	
	constructor(originalBuffer: string, size?: number) {
		this._originalBuffer = originalBuffer;
		this._changeBuffer = '';
		
		this._pieces = [{
			isOriginalBuffer: true,
			offset: 0,
			length: size ? size : originalBuffer.length
		}];
	}
	
	insert(value: string, offset: number): void {
		const startOffset = this._changeBuffer.length;
		this._changeBuffer += value;
				
		const newPiece: IPiece = {
			isOriginalBuffer: false,
			offset: startOffset,
			length: value.length
		};
		
		// insert newPiece into the piece table.
		let insertPosition = this.offsetToPieceIndex(offset);
		if (!insertPosition) {
			throw('this should not happen');
		}
		let originalPiece = this._pieces[insertPosition.index]
		let newPieces: IPiece[] = [
			{
				isOriginalBuffer: originalPiece.isOriginalBuffer,
				offset: originalPiece.offset,
				length: insertPosition.offset - originalPiece.offset
			},
			newPiece,
			{
				isOriginalBuffer: originalPiece.isOriginalBuffer,
				offset: insertPosition.offset,
				length: originalPiece.length - (insertPosition.offset - originalPiece.offset)
			}
		].filter( piece => {
			return piece.length > 0;
		});
;
		this._pieces.splice(insertPosition.index, 1, ...newPieces);
	}
	
	delete(offset: number, cnt: number): void {
		const firstTouchedPiecePos = this.offsetToPieceIndex(offset);
		const lastTouchedPiecePos = this.offsetToPieceIndex(offset + cnt);
		
		if (firstTouchedPiecePos.index === lastTouchedPiecePos.index) {
			const piece = this._pieces[firstTouchedPiecePos.index];
			
			if (firstTouchedPiecePos.offset === piece.offset) {
				piece.offset += cnt;
				piece.length -= cnt;
				return;
			} else if (lastTouchedPiecePos.offset === piece.offset + piece.length) {
				piece.length -= cnt;
				return;
			}
		}
		
		const firstTouchedPiece = this._pieces[firstTouchedPiecePos.index];
		const lastTouchedPiece = this._pieces[lastTouchedPiecePos.index];
		
		const newPieces: IPiece[] = [
			{
				isOriginalBuffer: firstTouchedPiece.isOriginalBuffer,
				offset: firstTouchedPiece.offset,
				length: firstTouchedPiecePos.offset - firstTouchedPiece.offset
			},
			{
				isOriginalBuffer: lastTouchedPiece.isOriginalBuffer,
				offset: lastTouchedPiecePos.offset,
				length: lastTouchedPiece.length + lastTouchedPiece.offset - lastTouchedPiecePos.offset
			}
		].filter( piece => {
			return piece.length > 0;
		});
		
		this._pieces.splice(firstTouchedPiecePos.index, lastTouchedPiecePos.index - firstTouchedPiecePos.index + 1, ...newPieces);
	}
	
	offsetToPieceIndex(offset: number): IPosition {
		if (offset < 0) {
			return {
				index: 0,
				offset: 0
			};
		}
		
		let remainingOffset = offset;
		for (let i = 0; i < this._pieces.length; i++) {
			let piece = this._pieces[i];
			
			if (remainingOffset <= piece.length) {
				return {
					index: i,
					offset: piece.offset + remainingOffset
				};
			}
			remainingOffset -= piece.length;
		}
		
		return null;
	}
	
	getSequence() {
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
}
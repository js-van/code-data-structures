import { IModel } from './piece-table';
import { Range, IRange } from './range';
import { IPosition, Position } from './position';
import { PrefixSumComputer, PrefixSumIndexOfResult } from './prefixSumComputer';
import { posix } from 'path';

export const enum NodeColor {
	Black = 0,
	Red = 1,
}

function getNodeColor(node: TreeNode) {
	return node.color;
}

function setNodeColor(node: TreeNode, color: NodeColor) {
	node.color = color;
}

function leftest(node: TreeNode): TreeNode {
	while (node.left !== SENTINEL) {
		node = node.left;
	}
	return node;
}

function righttest(node: TreeNode): TreeNode {
	while (node.right !== SENTINEL) {
		node = node.right;
	}
	return node;
}

function calculateSize(node: TreeNode): number {
	if (node === SENTINEL) {
		return 0;
	}

	return node.size_left + node.piece.length + calculateSize(node.right);
}

function calculateLF(node: TreeNode): number {
	if (node === SENTINEL) {
		return 0;
	}

	return node.lf_left + node.piece.lineFeedCnt + calculateLF(node.right);
}

function resetSentinel(): void {
	SENTINEL.parent = SENTINEL;
}

function debug(str: string, indent: number = 0) {
	let output = '';
	for (let i = 0; i < indent; i++) {
		output += '  ';
	}

	output += str;
	console.log(output);
}

export class TreeNode {
	parent: TreeNode;
	left: TreeNode;
	right: TreeNode;
	color: NodeColor;

	// Piece
	piece: Piece;
	size_left: number; // size of the left subtree (not inorder)
	lf_left: number; // line feeds cnt in the left subtree (not in order)

	constructor(piece: Piece, color: NodeColor) {
		this.piece = piece;
		this.color = color;
		this.size_left = 0;
		this.lf_left = 0;
		this.parent = null;
		this.left = null;
		this.right = null;
	}

	public next(): TreeNode {
		if (this.right !== SENTINEL) {
			return leftest(this.right);
		}

		let node: TreeNode = this;

		while (node.parent !== SENTINEL) {
			if (node.parent.left === node) {
				break;
			}

			node = node.parent;
		}

		if (node.parent === SENTINEL) {
			return SENTINEL;
		} else {
			return node.parent;
		}
	}

	public prev(): TreeNode {
		if (this.left !== SENTINEL) {
			return righttest(this.left);
		}

		let node: TreeNode = this;

		while (node.parent !== SENTINEL) {
			if (node.parent.right === node) {
				break;
			}

			node = node.parent;
		}

		if (node.parent === SENTINEL) {
			return SENTINEL;
		} else {
			return node.parent;
		}
	}

	public print(tree: TextBuffer, indent: number = 0) {
		if (!this.piece) {
			return;
		}

		let content = tree.getNodeContent(this).replace(/\n/g, '\\n').replace(/\r/g, '\\r');

		debug(`${this.color === NodeColor.Red ? 'R' : 'B'} (${this.piece.isOriginalBuffer ? 'Original' : 'Changed'}, left: ${this.size_left}, lf_left: ${this.lf_left}, offsetInBuf: ${this.piece.offset}, len: ${this.piece.length}, content: '${content}')`, indent);
		if (this.left && this.left.piece) {
			debug('--- left tree:', indent);
			++indent;
			this.left.print(tree, indent);
			--indent;
		}

		if (this.right && this.right.piece) {
			debug('--- right tree:', indent);
			++indent;
			this.right.print(tree, indent);
			--indent;
		}
	}

	public detach(): void {
		this.parent = null;
		this.left = null;
		this.right = null;
	}
}

export const SENTINEL: TreeNode = new TreeNode(null, NodeColor.Black);
SENTINEL.parent = SENTINEL;
SENTINEL.left = SENTINEL;
SENTINEL.right = SENTINEL;
setNodeColor(SENTINEL, NodeColor.Black);

export interface BufferCursor {
	/**
	 * Piece Index
	 */
	node: TreeNode;
	/**
	 * remainer in current piece.
	*/
	remainder: number;
}

export class Piece {
	isOriginalBuffer: boolean;
	offset: number;
	length: number; // size of current piece

	lineFeedCnt: number;
	lineStarts: PrefixSumComputer;

	constructor(isOriginalBuffer: boolean, offset: number, length: number, lineFeedCnt: number, lineLengthsVal: Uint32Array) {
		this.isOriginalBuffer = isOriginalBuffer;
		this.offset = offset;
		this.length = length;
		this.lineFeedCnt = lineFeedCnt;
		this.lineStarts = null;

		if (lineLengthsVal) {
			let newVal = new Uint32Array(lineLengthsVal.length);
			newVal.set(lineLengthsVal);
			this.lineStarts = new PrefixSumComputer(newVal);
		}
	}
}

export class TextBuffer {
	private _BOM: string;
	private _EOL: string;
	private _mightContainRTL: boolean;
	private _mightContainNonBasicASCII: boolean;

	private _originalBuffer: string;
	private _changeBuffer: string;
	private _regex: RegExp;
	root: TreeNode;

	constructor(originalBuffer: string, size?: number) {
		this._originalBuffer = originalBuffer;
		this._changeBuffer = '';
		this.root = SENTINEL;
		this._BOM = '';
		this._EOL = '';
		this._mightContainNonBasicASCII = false;
		this._mightContainRTL = false;
		this._regex = new RegExp(/\r\n|\r|\n/g);

		if (originalBuffer.length > 0) {
			let { lineFeedCount, lineLengths } = this.calculateNewLineCount(originalBuffer);
			let piece = new Piece(true, 0, originalBuffer.length, lineFeedCount, lineLengths);
			this.rbInsertLeft(null, piece);
		}
	}

	// #region TextBuffer
	getLinesContent() {
		return this.getContentOfSubTree(this.root);
	}

	getLineCount(): number {
		let x = this.root;

		let ret = 1;
		while (x !== SENTINEL) {
			ret += x.lf_left + x.piece.lineFeedCnt;
			x = x.right;
		}

		return ret;
	}

	getValueInRange(range: Range | IRange): string {
		// todo, validate range.
		if (range.startLineNumber === range.endLineNumber && range.startColumn === range.endColumn) {
			return '';
		}

		let startPosition = this.nodeAt2(new Position(range.startLineNumber, range.startColumn));
		let endPosition = this.nodeAt2(new Position(range.endLineNumber, range.endColumn));

		if (startPosition.node === endPosition.node) {
			let node = startPosition.node;
			let buffer = node.piece.isOriginalBuffer ? this._originalBuffer : this._changeBuffer;
			return buffer.substring(node.piece.offset + startPosition.remainder, node.piece.offset + endPosition.remainder);
		}


		let x = startPosition.node;
		let buffer = x.piece.isOriginalBuffer ? this._originalBuffer : this._changeBuffer;
		let ret = buffer.substring(x.piece.offset + startPosition.remainder, x.piece.offset + x.piece.length);

		x = x.next();
		while (x !== SENTINEL) {
			let buffer = x.piece.isOriginalBuffer ? this._originalBuffer : this._changeBuffer;

			if (x === endPosition.node) {
				ret += buffer.substring(x.piece.offset, x.piece.offset + endPosition.remainder);
				break;
			} else {
				ret += buffer.substr(x.piece.offset, x.piece.length);
			}

			x = x.next();
		}

		return ret;
	}

	getLineContent(lineNumber: number): string {
		let x = this.root;

		let ret = '';
		while (x !== SENTINEL) {
			if (x.left !== SENTINEL && x.lf_left >= lineNumber - 1) {
				x = x.left;
			} else if (x.lf_left + x.piece.lineFeedCnt > lineNumber - 1) {
				let prevAccumualtedValue = x.piece.lineStarts.getAccumulatedValue(lineNumber - x.lf_left - 2);
				let accumualtedValue = x.piece.lineStarts.getAccumulatedValue(lineNumber - x.lf_left - 1);
				let buffer = x.piece.isOriginalBuffer ? this._originalBuffer : this._changeBuffer;

				return buffer.substring(x.piece.offset + prevAccumualtedValue, x.piece.offset + accumualtedValue);
			} else if (x.lf_left + x.piece.lineFeedCnt === lineNumber - 1) {
				let prevAccumualtedValue = x.piece.lineStarts.getAccumulatedValue(lineNumber - x.lf_left - 2);
				let buffer = x.piece.isOriginalBuffer ? this._originalBuffer : this._changeBuffer;

				ret = buffer.substring(x.piece.offset + prevAccumualtedValue, x.piece.offset + x.piece.length);
				break;
			} else {
				lineNumber -= x.lf_left + x.piece.lineFeedCnt;
				x = x.right;
			}
		}

		// if (x === SENTINEL) {
		// 	throw('not possible');
		// }

		// search in order, to find the node contains end column
		x = x.next();
		while (x !== SENTINEL) {
			let buffer = x.piece.isOriginalBuffer ? this._originalBuffer : this._changeBuffer;

			if (x.piece.lineFeedCnt > 0) {
				let accumualtedValue = x.piece.lineStarts.getAccumulatedValue(0);

				ret += buffer.substring(x.piece.offset, x.piece.offset + accumualtedValue);
				return ret;
			} else {
				ret += buffer.substr(x.piece.offset, x.piece.length);
			}

			x = x.next();
		}

		return ret;

	}

	getOffsetAt(position: Position | IPosition): number {
		let leftLen = 0; // inorder
		let lineNumber = position.lineNumber;

		let x = this.root;

		while (x !== SENTINEL) {
			if (x.left !== SENTINEL && x.lf_left + 1 >= lineNumber) {
				x = x.left;
			} else if (x.lf_left + x.piece.lineFeedCnt + 1 >= lineNumber) {
				leftLen += x.size_left;
				// lineNumber >= 2
				let accumualtedValInCurrentIndex = x.piece.lineStarts.getAccumulatedValue(lineNumber - x.lf_left - 2);
				return leftLen += accumualtedValInCurrentIndex + position.column - 1;
			} else {
				lineNumber -= x.lf_left + x.piece.lineFeedCnt;
				leftLen += x.size_left + x.piece.length;
				x = x.right;
			}
		}

		return leftLen;
	}

	getPositionAt(offset: number): Position {
		let x = this.root;
		let lfCnt = 0;

		while (x !== SENTINEL) {
			if (x.size_left !== 0 && x.size_left >= offset) {
				x = x.left;
			} else if (x.size_left + x.piece.length >= offset) {
				let out = x.piece.lineStarts.getIndexOf(offset - x.size_left);

				let column = 0;

				if (out.index === 0) {
					let prev = x.prev();

					if (prev !== SENTINEL) {
						let lineLens = prev.piece.lineStarts.values;
						column += lineLens[lineLens.length - 1];
					}
				}

				lfCnt += x.lf_left + out.index;
				return new Position(lfCnt + 1, column + out.remainder + 1);
			} else {
				offset -= x.size_left + x.piece.length;
				lfCnt += x.lf_left + x.piece.lineFeedCnt;
				x = x.right;
			}
		}

		return null;
	}
	// #endregion

	// #region Piece Table
	insert(value: string, offset: number): void {
		// todo, validate value and offset.
		if (this.root !== SENTINEL) {
			let { node, remainder } = this.nodeAt(offset);
			let insertPos = node.piece.lineStarts.getIndexOf(remainder);
			let nodeOffsetInDocument = this.offsetOfNode(node);
			const startOffset = this._changeBuffer.length;

			if (!node.piece.isOriginalBuffer && (node.piece.offset + node.piece.length === this._changeBuffer.length) && (nodeOffsetInDocument + node.piece.length === offset)) {
				// append content to this node, we don't want to keep adding node when users simply type in sequence
				// unless we want to make the structure immutable
				this.appendToNode(node, value);
			} else {
				if (nodeOffsetInDocument === offset) {
					// we are inserting content to the beginning of node
					let nodesToDel = [];
					if (value.charCodeAt(value.length - 1) === 13) {
						// inserted content ends with \r
						if (node !== SENTINEL) {
							if (this.nodeCharCodeAt(node, 0) === 10) {
								// move `\n` forward
								value += '\n';
								node.piece.offset++;
								node.piece.length--;
								node.piece.lineFeedCnt--;
								node.piece.lineStarts.removeValues(0, 1); // remove the first line, which is empty.
								this.updateMetadata(node, -1, -1);

								if (node.piece.length === 0) {
									nodesToDel.push(node);
								}
							}
						}
					}

					this._changeBuffer += value;
					const { lineFeedCount, lineLengths } = this.calculateNewLineCount(value);
					let newPiece: Piece = new Piece(false, startOffset, value.length, lineFeedCount, lineLengths);
					let newNode = this.rbInsertLeft(node, newPiece);
					this.fixCRLFWithPrev(newNode);

					for (let i = 0; i < nodesToDel.length; i++) {
						this.rbDelete(nodesToDel[i]);
					}
				} else if (nodeOffsetInDocument + node.piece.length > offset) {
					let nodesToDel = [];

					// we need to split node. Create the new piece first as we are reading current node info before modifying it.
					let newRightPiece = new Piece(
						node.piece.isOriginalBuffer,
						node.piece.offset + offset - nodeOffsetInDocument,
						nodeOffsetInDocument + node.piece.length - offset,
						node.piece.lineFeedCnt - insertPos.index,
						node.piece.lineStarts.values
					);
					
					if (value.charCodeAt(value.length - 1) === 13 /** \r */) {
						let headOfRight = this.nodeCharCodeAt(node, offset - nodeOffsetInDocument);

						if (headOfRight === 10 /** \n */) {
							newRightPiece.offset++;
							newRightPiece.length--;
							newRightPiece.lineFeedCnt--;
							newRightPiece.lineStarts.removeValues(0, insertPos.index + 1);
							value += '\n';
						} else {
							this.deletePrefixSumHead(newRightPiece.lineStarts, insertPos);
						}
					} else {
						this.deletePrefixSumHead(newRightPiece.lineStarts, insertPos);
					}

					// reuse node
					if (value.charCodeAt(0) === 10/** \n */) {
						let tailOfLeft = this.nodeCharCodeAt(node, offset - nodeOffsetInDocument - 1);
						if (tailOfLeft === 13 /** \r */) {
							let previousPos = node.piece.lineStarts.getIndexOf(remainder - 1);
							this.deleteNodeTail(node, previousPos);
							value = '\r' + value;

							if (node.piece.length === 0) {
								nodesToDel.push(node);
							}
						} else {
							this.deleteNodeTail(node, insertPos);
						}
					} else {
						this.deleteNodeTail(node, insertPos);
					}

					this._changeBuffer += value;
					const { lineFeedCount, lineLengths } = this.calculateNewLineCount(value);
					let newPiece: Piece = new Piece(false, startOffset, value.length, lineFeedCount, lineLengths);

					if (newRightPiece.length > 0) {
						this.rbInsertRight(node, newRightPiece);
					}
					this.rbInsertRight(node, newPiece);
					for (let i = 0; i < nodesToDel.length; i++) {
						this.rbDelete(nodesToDel[i]);
					}
				} else {
					// we are inserting to the right of this node.
					if (this.adjustCarriageReturnFromNext(value, node)) {
						value += '\n';
					}

					this._changeBuffer += value;
					const { lineFeedCount, lineLengths } = this.calculateNewLineCount(value);
					let newPiece: Piece = new Piece(false, startOffset, value.length, lineFeedCount, lineLengths);
					let newNode = this.rbInsertRight(node, newPiece);
					this.fixCRLFWithPrev(newNode);
				}
			}
		} else {
			// insert new node
			const startOffset = this._changeBuffer.length;
			this._changeBuffer += value;
			const { lineFeedCount, lineLengths } = this.calculateNewLineCount(value);
			let piece = new Piece(false, startOffset, value.length, lineFeedCount, lineLengths);

			this.rbInsertLeft(null, piece);
		}
	}

	delete(offset: number, cnt: number): void {
		if (cnt <= 0) {
			return;
		}

		if (this.root !== SENTINEL) {
			let startPosition = this.nodeAt(offset);
			let endPosition = this.nodeAt(offset + cnt);
			let startNode = startPosition.node;
			let endNode = endPosition.node;

			let length = startNode.piece.length;
			let startNodeOffsetInDocument = this.offsetOfNode(startNode);
			let splitPos = startNode.piece.lineStarts.getIndexOf(offset - startNodeOffsetInDocument);

			if (startNode === endNode) {
				// deletion falls into one node.
				let endSplitPos = startNode.piece.lineStarts.getIndexOf(offset - startNodeOffsetInDocument + cnt);

				if (startNodeOffsetInDocument === offset) {
					if (cnt === length) { // delete node
						let next = startNode.next();
						this.rbDelete(startNode);
						this.fixCRLFWithPrev(next);
						return;
					}
					this.deleteNodeHead(startNode, endSplitPos);
					this.fixCRLFWithPrev(startNode);
					return;
				}

				if (startNodeOffsetInDocument + length === offset + cnt) {
					this.deleteNodeTail(startNode, splitPos);
					this.fixCRLFWithNext(startNode);
					return;
				}

				// delete content in the middle, this node will be splitted to nodes
				return this.shrinkNode(startNode, splitPos, endSplitPos);
			}

			// perform read operations before any write operation.
			let endNodeOffsetInDocument = this.offsetOfNode(endNode);

			// update first touched node
			this.deleteNodeTail(startNode, splitPos);
			let nodesToDel = [];
			if (startNode.piece.length === 0) {
				nodesToDel.push(startNode);
			}

			// update last touched node
			let endSplitPos = endNode.piece.lineStarts.getIndexOf(offset - endNodeOffsetInDocument + cnt);
			this.deleteNodeHead(endNode, endSplitPos);

			if (endNode.piece.length === 0) {
				nodesToDel.push(endNode);
			}

			let secondNode = startNode.next();
			for (let node = secondNode; node !== SENTINEL && node !== endNode; node = node.next()) {
				nodesToDel.push(node);
			}

			let prev = startNode.piece.length === 0 ? startNode.prev() : startNode;

			for (let i = 0; i < nodesToDel.length; i++) {
				this.rbDelete(nodesToDel[i]);
			}

			if (prev !== SENTINEL) {
				this.fixCRLFWithNext(prev);
			}
		}
	}
	
	// #region node operations
	deleteNodeHead(node: TreeNode, pos?: PrefixSumIndexOfResult) {
		// it's okay to delete CR in CRLF.
		let cnt = node.piece.lineStarts.getAccumulatedValue(pos.index - 1) + pos.remainder;
		node.piece.length -= cnt;
		node.piece.offset += cnt;
		node.piece.lineFeedCnt -= pos.index;
		this.deletePrefixSumHead(node.piece.lineStarts, pos);
		this.updateMetadata(node, -cnt, -pos.index);
	}
	
	deleteNodeTail(node: TreeNode, start: PrefixSumIndexOfResult) {
		let cnt = node.piece.length - node.piece.lineStarts.getAccumulatedValue(start.index - 1) - start.remainder;
		let hitCRLF = this.hitTestCRLF(node, node.piece.lineStarts.getAccumulatedValue(start.index - 1) + start.remainder, start);
		node.piece.length -= cnt;
		let lf_delta = start.index - node.piece.lineFeedCnt;
		node.piece.lineFeedCnt = start.index;
		this.deletePrefixSumTail(node.piece.lineStarts, start);

		if (hitCRLF) {
			node.piece.lineFeedCnt += 1;
			lf_delta += 1;
			node.piece.lineStarts.insertValues(node.piece.lineStarts.values.length, new Uint32Array(1) /*[0]*/);
		}

		this.updateMetadata(node, -cnt, lf_delta);
	}
	
	// remove start-end from node.
	shrinkNode(node: TreeNode, start: PrefixSumIndexOfResult, end?: PrefixSumIndexOfResult) {
		// read operation first
		let oldLineLengthsVal = node.piece.lineStarts.values;
		let offset = node.piece.lineStarts.getAccumulatedValue(start.index - 1) + start.remainder;
		let endOffset = node.piece.lineStarts.getAccumulatedValue(end.index - 1) + end.remainder;

		// write.
		let startHitCRLF = this.hitTestCRLF(node, offset, start);
		let nodeOldLength = node.piece.length;
		node.piece.length = offset;
		let lf_delta = start.index - node.piece.lineFeedCnt;
		node.piece.lineFeedCnt = start.index;
		node.piece.lineStarts = new PrefixSumComputer(oldLineLengthsVal.slice(0, start.index + 1));
		node.piece.lineStarts.changeValue(start.index, start.remainder);

		if (startHitCRLF) {
			node.piece.lineFeedCnt += 1;
			lf_delta += 1;
			node.piece.lineStarts.insertValues(node.piece.lineStarts.values.length, new Uint32Array(1) /*[0]*/);
		}
		this.updateMetadata(node, offset - nodeOldLength, lf_delta);

		let newPieceLength = nodeOldLength - endOffset;
		if (newPieceLength <= 0) {
			return;
		}

		let newPiece: Piece = new Piece(
			node.piece.isOriginalBuffer,
			endOffset + node.piece.offset,
			newPieceLength,
			oldLineLengthsVal.length - end.index - 1,
			oldLineLengthsVal.slice(end.index)
		);
		newPiece.lineStarts.changeValue(0, newPiece.lineStarts.values[0] - end.remainder);

		let newNode = this.rbInsertRight(node, newPiece);
		this.fixCRLFWithPrev(newNode);
	}
	
	appendToNode(node: TreeNode, value: string): void {
		if (this.adjustCarriageReturnFromNext(value, node)) {
			value += '\n';
		}

		let hitCRLF = value.charCodeAt(0) === 10 && this.nodeCharCodeAt(node, node.piece.length - 1) === 13;
		this._changeBuffer += value;
		node.piece.length += value.length;
		const { lineFeedCount, lineLengths } = this.calculateNewLineCount(value);

		let lf_delta = lineFeedCount;
		if (hitCRLF) {
			node.piece.lineFeedCnt += lineFeedCount - 1;
			lf_delta--;
			let lineStarts = node.piece.lineStarts;
			lineStarts.removeValues(lineStarts.values.length - 1, 1);
			lineStarts.changeValue(lineStarts.values.length - 1, lineStarts.values[lineStarts.values.length - 1] + 1);
			lineStarts.insertValues(lineStarts.values.length, lineLengths.slice(1));
		} else {
			node.piece.lineFeedCnt += lineFeedCount;
			let lineStarts = node.piece.lineStarts;
			lineStarts.changeValue(lineStarts.values.length - 1, lineStarts.values[lineStarts.values.length - 1] + lineLengths[0]);
			lineStarts.insertValues(lineStarts.values.length, lineLengths.slice(1));
		}

		this.updateMetadata(node, value.length, lf_delta);
	}

	nodeAt(offset: number): BufferCursor {
		let x = this.root;

		while (x !== SENTINEL) {
			if (x.size_left > offset) {
				x = x.left;
			} else if (x.size_left + x.piece.length >= offset) {
				return {
					node: x,
					remainder: offset - x.size_left
				};
			} else {
				offset -= x.size_left + x.piece.length;
				x = x.right;
			}
		}

		return null;
	}

	nodeAt2(position: Position): BufferCursor {
		let x = this.root;
		let lineNumber = position.lineNumber;
		let column = position.column;

		while (x !== SENTINEL) {
			if (x.left !== SENTINEL && x.lf_left >= lineNumber - 1) {
				x = x.left;
			} else if (x.lf_left + x.piece.lineFeedCnt > lineNumber - 1) {
				let prevAccumualtedValue = x.piece.lineStarts.getAccumulatedValue(lineNumber - x.lf_left - 2);
				let accumualtedValue = x.piece.lineStarts.getAccumulatedValue(lineNumber - x.lf_left - 1);

				return {
					node: x,
					remainder: Math.min(prevAccumualtedValue + column - 1, accumualtedValue)
				};
			} else if (x.lf_left + x.piece.lineFeedCnt === lineNumber - 1) {
				let prevAccumualtedValue = x.piece.lineStarts.getAccumulatedValue(lineNumber - x.lf_left - 2);
				if (prevAccumualtedValue + column - 1 <= x.piece.length) {
					return {
						node: x,
						remainder: prevAccumualtedValue + column - 1
					};
				} else {
					column -= x.piece.length - prevAccumualtedValue;
					break;
				}
			} else {
				lineNumber -= x.lf_left + x.piece.lineFeedCnt;
				x = x.right;
			}
		}

		// search in order, to find the node contains position.column
		x = x.next();
		while (x !== SENTINEL) {

			if (x.piece.lineFeedCnt > 0) {
				let accumualtedValue = x.piece.lineStarts.getAccumulatedValue(0);
				return {
					node: x,
					remainder: Math.min(column - 1, accumualtedValue)
				};
			} else {
				if (x.piece.length >= column - 1) {
					return {
						node: x,
						remainder: column - 1
					};
				} else {
					column -= x.piece.length;
				}
			}

			x = x.next();
		}
	}

	offsetOfNode(node: TreeNode): number {
		if (!node) {
			return 0;
		}
		let pos = node.size_left;
		while (node !== this.root) {
			if (node.parent.right === node) {
				pos += node.parent.size_left + node.parent.piece.length;
			}

			node = node.parent;
		}

		return pos;
	}

	getNodeContent(node: TreeNode): string {
		let buffer = node.piece.isOriginalBuffer ? this._originalBuffer : this._changeBuffer;
		let currentContent = buffer.substr(node.piece.offset, node.piece.length);

		return currentContent;
	}

	deletePrefixSumTail(prefixSum: PrefixSumComputer, position: PrefixSumIndexOfResult): void {
		prefixSum.removeValues(position.index + 1, prefixSum.values.length - position.index - 1);
		prefixSum.changeValue(position.index, position.remainder);
	}

	deletePrefixSumHead(prefixSum: PrefixSumComputer, position: PrefixSumIndexOfResult): void {
		prefixSum.changeValue(position.index, prefixSum.values[position.index] - position.remainder);
		if (position.index > 0) {
			prefixSum.removeValues(0, position.index);
		}
	}

	// #endregion

	// #region CRLF
	hitTestCRLF(node: TreeNode, offset: number, position: PrefixSumIndexOfResult) {
		if (node.piece.lineFeedCnt < 1) {
			return false;
		}

		let currentLineLen = node.piece.lineStarts.getAccumulatedValue(position.index);
		if (offset === currentLineLen - 1) {
			// charCodeAt becomes slow (single or even two digits ms) when the changed buffer is long
			return this.nodeCharCodeAt(node, offset - 1) === 13/* \r */ && this.nodeCharCodeAt(node, offset) === 10 /* \n */;
		}
		return false;
	}

	fixCRLFWithPrev(nextNode: TreeNode) {
		if (nextNode == SENTINEL || nextNode.piece.lineFeedCnt === 0) {
			return;
		}

		if (nextNode.piece.lineStarts.getAccumulatedValue(0) !== 1 /* if it's \n, the first line is 1 char */) {
			return;
		}

		if (this.nodeCharCodeAt(nextNode, 0) === 10 /* \n */) {
			let node = nextNode.prev();

			if (node === SENTINEL || node.piece.lineFeedCnt === 0) {
				return;
			}

			if (this.nodeCharCodeAt(node, node.piece.length - 1) === 13) {
				this.fixCRLF(node, nextNode);
			}
		}
	}

	fixCRLFWithNext(node: TreeNode) {
		if (node === SENTINEL) {
			return;
		}

		if (this.nodeCharCodeAt(node, node.piece.length - 1) === 13 /* \r */) {
			let nextNode = node.next();
			if (nextNode !== SENTINEL && this.nodeCharCodeAt(nextNode, 0) === 10 /* \n */) {
				this.fixCRLF(node, nextNode);
			}
		}
	}

	fixCRLF(prev: TreeNode, next: TreeNode) {
		let nodesToDel = [];
		// update node
		prev.piece.length -= 1;
		prev.piece.lineFeedCnt -= 1;
		let lineStarts = prev.piece.lineStarts;
		// lineStarts.values.length >= 2 due to a `\r`
		lineStarts.removeValues(lineStarts.values.length - 1, 1)
		lineStarts.changeValue(lineStarts.values.length - 1, lineStarts.values[lineStarts.values.length - 1] - 1);
		this.updateMetadata(prev, - 1, -1);

		if (prev.piece.length === 0) {
			nodesToDel.push(prev);
		}

		// update nextNode
		next.piece.length -= 1;
		next.piece.offset += 1;
		next.piece.lineFeedCnt -= 1;
		lineStarts = next.piece.lineStarts;
		lineStarts.removeValues(0, 1);
		this.updateMetadata(next, - 1, -1);
		if (next.piece.length === 0) {
			nodesToDel.push(next);
		}

		// create new piece which contains \r\n
		let startOffset = this._changeBuffer.length;
		this._changeBuffer += '\r\n';
		const { lineFeedCount, lineLengths } = this.calculateNewLineCount('\r\n');
		let piece = new Piece(false, startOffset, 2, lineFeedCount, lineLengths);
		this.rbInsertRight(prev, piece);
		// delete empty nodes

		for (let i = 0; i < nodesToDel.length; i++) {
			this.rbDelete(nodesToDel[i]);
		}
	}

	adjustCarriageReturnFromNext(value: string, node: TreeNode): boolean {
		if (value.charCodeAt(value.length - 1) === 13) {
			// inserted content ends with \r
			let nextNode = node.next();
			if (nextNode !== SENTINEL) {
				if (this.nodeCharCodeAt(nextNode, 0) === 10) {
					// move `\n` forward
					value += '\n';

					if (nextNode.piece.length === 1) {
						this.rbDelete(nextNode);
					} else {
						nextNode.piece.offset += 1;
						nextNode.piece.length -= 1;
						nextNode.piece.lineFeedCnt -= 1;
						nextNode.piece.lineStarts.removeValues(0, 1); // remove the first line, which is empty.
						this.updateMetadata(nextNode, -1, -1);
					}
					return true;
				}
			}
		}

		return false;
	}

	nodeCharCodeAt(node: TreeNode, offset: number): number {
		if (node.piece.lineFeedCnt < 1) {
			return -1;
		}
		let buffer = node.piece.isOriginalBuffer ? this._originalBuffer : this._changeBuffer;

		return buffer.charCodeAt(node.piece.offset + offset);
	}
	// #endregion

	// #endregion

	// #region Red Black Tree

	leftRotate(x: TreeNode) {
		let y = x.right;

		// fix size_left
		y.size_left += x.size_left + (x.piece ? x.piece.length : 0);
		y.lf_left += x.lf_left + (x.piece ? x.piece.lineFeedCnt : 0);
		x.right = y.left;

		if (y.left !== SENTINEL) {
			y.left.parent = x;
		}
		y.parent = x.parent;
		if (x.parent === SENTINEL) {
			this.root = y;
		} else if (x.parent.left === x) {
			x.parent.left = y;
		} else {
			x.parent.right = y;
		}
		y.left = x;
		x.parent = y;
	}

	rightRotate(y: TreeNode) {
		let x = y.left;
		y.left = x.right;
		if (x.right !== SENTINEL) {
			x.right.parent = y;
		}
		x.parent = y.parent;

		// fix size_left
		y.size_left -= x.size_left + (x.piece ? x.piece.length : 0);
		y.lf_left -= x.lf_left + (x.piece ? x.piece.lineFeedCnt : 0);

		if (y.parent === SENTINEL) {
			this.root = x;
		} else if (y === y.parent.right) {
			y.parent.right = x;
		} else {
			y.parent.left = x;
		}

		x.right = y;
		y.parent = x;
	}

	/**
	 *      node              node
	 *     /  \              /  \
	 *    a   b    <----   a    b
	 *                         /
	 *                        z
	 */
	rbInsertRight(node: TreeNode, p: Piece): TreeNode {
		let z = new TreeNode(p, NodeColor.Red);
		z.left = SENTINEL;
		z.right = SENTINEL;
		z.parent = SENTINEL;
		z.size_left = 0;
		z.lf_left = 0;

		let x = this.root;
		if (x === SENTINEL) {
			this.root = z;
			setNodeColor(z, NodeColor.Black);
		} else if (node.right === SENTINEL) {
			node.right = z;
			z.parent = node;
		} else {
			let nextNode = leftest(node.right);
			nextNode.left = z;
			z.parent = nextNode;
		}

		this.fixInsert(z);
		return z;
	}

	/**
	 *      node              node
	 *     /  \              /  \
	 *    a   b     ---->   a    b
	 *                       \
	 *                        z
	 */
	rbInsertLeft(node: TreeNode, p: Piece): TreeNode {
		let z = new TreeNode(p, NodeColor.Red);
		z.left = SENTINEL;
		z.right = SENTINEL;
		z.parent = SENTINEL;
		z.size_left = 0;
		z.lf_left = 0;

		let x = this.root;
		if (x === SENTINEL) {
			this.root = z;
			setNodeColor(z, NodeColor.Black);
		} else if (node.left === SENTINEL) {
			node.left = z;
			z.parent = node;
		} else {
			let prevNode = righttest(node.left); // a
			prevNode.right = z;
			z.parent = prevNode;
		}

		this.fixInsert(z);
		return z;
	}

	rbDelete(z: TreeNode) {
		let x: TreeNode;
		let y: TreeNode;

		if (z.left === SENTINEL) {
			y = z;
			x = y.right;
		} else if (z.right === SENTINEL) {
			y = z;
			x = y.left;
		} else {
			y = leftest(z.right);
			x = y.right;
		}

		if (y === this.root) {
			this.root = x;

			// if x is null, we are removing the only node
			setNodeColor(x, NodeColor.Black);

			z.detach();
			resetSentinel();
			this.root.parent = SENTINEL;

			return;
		}

		let yWasRed = (getNodeColor(y) === NodeColor.Red);

		if (y === y.parent.left) {
			y.parent.left = x;
		} else {
			y.parent.right = x;
		}

		if (y === z) {
			x.parent = y.parent;
			this.recomputeMetadata(x);
		} else {
			if (y.parent === z) {
				x.parent = y;
			} else {
				x.parent = y.parent;
			}

			// as we make changes to x's hierarchy, update size_left of subtree first
			this.recomputeMetadata(x);

			y.left = z.left;
			y.right = z.right;
			y.parent = z.parent;
			setNodeColor(y, getNodeColor(z));

			if (z === this.root) {
				this.root = y;
			} else {
				if (z === z.parent.left) {
					z.parent.left = y;
				} else {
					z.parent.right = y;
				}
			}

			if (y.left !== SENTINEL) {
				y.left.parent = y;
			}
			if (y.right !== SENTINEL) {
				y.right.parent = y;
			}
			// update metadata
			// we replace z with y, so in this sub tree, the length change is z.item.length
			y.size_left = z.size_left;
			y.lf_left = z.lf_left;
			this.recomputeMetadata(y);
		}

		z.detach();

		if (x.parent.left === x) {
			let newSizeLeft = calculateSize(x);
			let newLFLeft = calculateLF(x);
			if (newSizeLeft !== x.parent.size_left || newLFLeft !== x.parent.lf_left) {
				let delta = newSizeLeft - x.parent.size_left;
				let lf_delta = newLFLeft - x.parent.lf_left;
				x.parent.size_left = newSizeLeft;
				x.parent.lf_left = newLFLeft;
				this.updateMetadata(x.parent, delta, lf_delta);
			}
		}

		this.recomputeMetadata(x.parent);

		if (yWasRed) {
			resetSentinel();
			return;
		}

		// RB-DELETE-FIXUP
		let w: TreeNode;
		while (x !== this.root && getNodeColor(x) === NodeColor.Black) {
			if (x === x.parent.left) {
				w = x.parent.right;

				if (getNodeColor(w) === NodeColor.Red) {
					setNodeColor(w, NodeColor.Black);
					setNodeColor(x.parent, NodeColor.Red);
					this.leftRotate(x.parent);
					w = x.parent.right;
				}

				if (getNodeColor(w.left) === NodeColor.Black && getNodeColor(w.right) === NodeColor.Black) {
					setNodeColor(w, NodeColor.Red);
					x = x.parent;
				} else {
					if (getNodeColor(w.right) === NodeColor.Black) {
						setNodeColor(w.left, NodeColor.Black);
						setNodeColor(w, NodeColor.Red);
						this.rightRotate(w);
						w = x.parent.right;
					}

					setNodeColor(w, getNodeColor(x.parent));
					setNodeColor(x.parent, NodeColor.Black);
					setNodeColor(w.right, NodeColor.Black);
					this.leftRotate(x.parent);
					x = this.root;
				}
			} else {
				w = x.parent.left;

				if (getNodeColor(w) === NodeColor.Red) {
					setNodeColor(w, NodeColor.Black);
					setNodeColor(x.parent, NodeColor.Red);
					this.rightRotate(x.parent);
					w = x.parent.left;
				}

				if (getNodeColor(w.left) === NodeColor.Black && getNodeColor(w.right) === NodeColor.Black) {
					setNodeColor(w, NodeColor.Red);
					x = x.parent;

				} else {
					if (getNodeColor(w.left) === NodeColor.Black) {
						setNodeColor(w.right, NodeColor.Black);
						setNodeColor(w, NodeColor.Red);
						this.leftRotate(w);
						w = x.parent.left;
					}

					setNodeColor(w, getNodeColor(x.parent));
					setNodeColor(x.parent, NodeColor.Black);
					setNodeColor(w.left, NodeColor.Black);
					this.rightRotate(x.parent);
					x = this.root;
				}
			}
		}
		setNodeColor(x, NodeColor.Black);
		resetSentinel();
	}

	fixInsert(x: TreeNode) {
		this.recomputeMetadata(x);

		while (x !== this.root && getNodeColor(x.parent) === NodeColor.Red) {
			if (x.parent === x.parent.parent.left) {
				const y = x.parent.parent.right;

				if (getNodeColor(y) === NodeColor.Red) {
					setNodeColor(x.parent, NodeColor.Black);
					setNodeColor(y, NodeColor.Black);
					setNodeColor(x.parent.parent, NodeColor.Red);
					x = x.parent.parent;
				} else {
					if (x === x.parent.right) {
						x = x.parent;
						this.leftRotate(x);
					}

					setNodeColor(x.parent, NodeColor.Black);
					setNodeColor(x.parent.parent, NodeColor.Red);
					this.rightRotate(x.parent.parent);
				}
			} else {
				const y = x.parent.parent.left;

				if (getNodeColor(y) === NodeColor.Red) {
					setNodeColor(x.parent, NodeColor.Black);
					setNodeColor(y, NodeColor.Black);
					setNodeColor(x.parent.parent, NodeColor.Red);
					x = x.parent.parent;
				} else {
					if (x === x.parent.left) {
						x = x.parent;
						this.rightRotate(x);
					}
					setNodeColor(x.parent, NodeColor.Black);
					setNodeColor(x.parent.parent, NodeColor.Red);
					this.leftRotate(x.parent.parent);
				}
			}
		}

		setNodeColor(this.root, NodeColor.Black);
	}

	updateMetadata(x: TreeNode, delta: number, lineFeedCntDelta: number): void {
		// node length change, we need to update the roots of all subtrees containing this node.
		while (x !== this.root && x !== SENTINEL) {
			if (x.parent.left === x) {
				x.parent.size_left += delta;
				x.parent.lf_left += lineFeedCntDelta;
			}

			x = x.parent;
		}
	}

	recomputeMetadata(x: TreeNode) {
		let delta = 0;
		let lf_delta = 0;
		if (x === this.root) {
			return;
		}

		if (delta === 0) {
			// go upwards till the node whose left subtree is changed.
			while (x !== this.root && x === x.parent.right) {
				x = x.parent;
			}

			if (x === this.root) {
				// well, it means we add a node to the end (inorder)
				return;
			}

			// x is the node whose right subtree is changed.
			x = x.parent;

			delta = calculateSize(x.left) - x.size_left;
			lf_delta = calculateLF(x.left) - x.lf_left;
			x.size_left += delta;
			x.lf_left += lf_delta;
		}

		// go upwards till root. O(logN)
		while (x !== this.root && (delta !== 0 || lf_delta !== 0)) {
			if (x.parent.left === x) {
				x.parent.size_left += delta;
				x.parent.lf_left += lf_delta;
			}

			x = x.parent;
		}
	}

	getContentOfSubTree(node: TreeNode): string {
		if (node === SENTINEL) {
			return '';
		}

		let buffer = node.piece.isOriginalBuffer ? this._originalBuffer : this._changeBuffer;
		let currentContent = buffer.substr(node.piece.offset, node.piece.length);

		return this.getContentOfSubTree(node.left) + currentContent + this.getContentOfSubTree(node.right);
	}

	calculateNewLineCount(chunk: string): { lineFeedCount: number, lineLengths: Uint32Array } {
		let lineStarts = [0];

		// Reset regex to search from the beginning
		this._regex.lastIndex = 0;
		let prevMatchStartIndex = -1;
		let prevMatchLength = 0;

		let m: RegExpExecArray;
		do {
			if (prevMatchStartIndex + prevMatchLength === chunk.length) {
				// Reached the end of the line
				break;
			}

			m = this._regex.exec(chunk);
			if (!m) {
				break;
			}

			const matchStartIndex = m.index;
			const matchLength = m[0].length;

			if (matchStartIndex === prevMatchStartIndex && matchLength === prevMatchLength) {
				// Exit early if the regex matches the same range twice
				break;
			}

			prevMatchStartIndex = matchStartIndex;
			prevMatchLength = matchLength;

			lineStarts.push(matchStartIndex + matchLength);

		} while (m)

		const lineLengths = new Uint32Array(lineStarts.length);
		for (let i = 1; i < lineStarts.length; i++) {
			lineLengths[i - 1] = lineStarts[i] - lineStarts[i - 1];
		}

		lineLengths[lineStarts.length - 1] = chunk.length - lineStarts[lineStarts.length - 1];

		return {
			lineFeedCount: lineLengths.length - 1,
			lineLengths: lineLengths
		};
	}
	// #endregion

	// #region test
	print() {
		if (this.root) {
			this.root.print(this);
		}
	}
	// #endregion
}
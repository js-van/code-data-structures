import { IModel } from './piece-table';
import { Range, IRange } from './range';
import { IPosition, Position } from './position';
import { PrefixSumComputer, PrefixSumIndexOfResult } from './prefixSumComputer';
import { posix } from 'path';

export const enum NodeColor {
	Black = 0,
	Red = 1,
}

export let error = {
	sizeLeft: false
};

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

/**
 *       y                 x
 *     /  \              /  \
 *    x    c    <----   a    y
 *  /  \                   /  \
 * a    b                 b    c
 *
 * @param tree
 * @param x
 */
function leftRotate(tree: TextBuffer, x: TreeNode) {
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
		tree.root = y;
	} else if (x.parent.left === x){
		x.parent.left = y;
	} else {
		x.parent.right = y;
	}
	y.left = x;
	x.parent = y;
}

/**
 *       y                 x
 *     /  \              /  \
 *    x    c    ---->   a    y
 *  /  \                   /  \
 * a    b                 b    c
 *
 * @param tree
 * @param x
 */
function rightRotate(tree: TextBuffer, y: TreeNode) {
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
		tree.root = x;
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
 *
 * @param tree
 * @param node
 * @param p
 */
export function rbInsertRight(tree: TextBuffer, node: TreeNode, p: Piece) {
	let z = new TreeNode(p, NodeColor.Red);
	z.left = SENTINEL;
	z.right = SENTINEL;
	z.parent = SENTINEL;
	z.size_left = 0;
	z.lf_left = 0;

	let x = tree.root;
	if (x === SENTINEL) {
		tree.root = z;
		setNodeColor(z, NodeColor.Black);
	} else if (node.right === SENTINEL) {
		node.right = z;
		z.parent = node;
	} else {
		let nextNode = leftest(node.right);
		nextNode.left = z;
		z.parent = nextNode;
	}

	fixInsert(tree, z);
}

/**
 *      node              node
 *     /  \              /  \
 *    a   b     ---->   a    b
 *                       \
 *                        z
 *
 * @param tree
 * @param node
 * @param p
 */
export function rbInsertLeft(tree: TextBuffer, node: TreeNode, p: Piece) {
	let z = new TreeNode(p, NodeColor.Red);
	z.left = SENTINEL;
	z.right = SENTINEL;
	z.parent = SENTINEL;
	z.size_left = 0;
	z.lf_left = 0;

	let x = tree.root;
	if (x === SENTINEL) {
		tree.root = z;
		setNodeColor(z, NodeColor.Black);
	} else if (node.left === SENTINEL) {
		node.left = z;
		z.parent = node;
	} else {
		let prevNode = righttest(node.left); // a
		prevNode.right = z;
		z.parent = prevNode;
	}

	fixInsert(tree, z);
}

export function fixInsert(tree: TextBuffer, x: TreeNode) {
	recomputeMetadata(tree, x);

	while(x !== tree.root && getNodeColor(x.parent) === NodeColor.Red) {
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
					leftRotate(tree, x);
				}

				setNodeColor(x.parent, NodeColor.Black);
				setNodeColor(x.parent.parent, NodeColor.Red);
				rightRotate(tree, x.parent.parent);
			}
		} else {
			const y = x.parent.parent.left;

			if (getNodeColor(y) === NodeColor.Red) {
				setNodeColor(x.parent, NodeColor.Black);
				setNodeColor(y, NodeColor.Black);
				setNodeColor(x.parent.parent, NodeColor.Red);
				x =x.parent.parent;
			} else {
				if (x === x.parent.left) {
					x = x.parent;
					rightRotate(tree, x);
				}
				setNodeColor(x.parent, NodeColor.Black);
				setNodeColor(x.parent.parent, NodeColor.Red);
				leftRotate(tree, x.parent.parent);
			}
		}
	}

	setNodeColor(tree.root, NodeColor.Black);
}

export function updateMetadata(tree: TextBuffer, x: TreeNode, delta: number, lineFeedCntDelta: number): void {
	// node length change, we need to update the roots of all subtrees containing this node.
	while (x !== tree.root && x !== SENTINEL) {
		if (x.parent.left === x) {
			x.parent.size_left += delta;
			x.parent.lf_left += lineFeedCntDelta;
		}

		x = x.parent;
	}
}

export function recomputeMetadata(tree: TextBuffer, x: TreeNode) {
	let delta = 0;
	let lf_delta = 0;
	if (x === tree.root) {
		return;
	}

	if (delta === 0) {
		// go upwards till the node whose left subtree is changed.
		while (x !== tree.root && x === x.parent.right) {
			x = x.parent;
		}

		if (x === tree.root) {
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
	while (x !== tree.root && (delta !== 0 || lf_delta !== 0)) {
		if (x.parent.left === x) {
			x.parent.size_left += delta;
			x.parent.lf_left += lf_delta;
		}

		x = x.parent;
	}
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

export function rbDelete(tree: TextBuffer, z: TreeNode) {
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

	if (y === tree.root) {
		tree.root = x;

		// if x is null, we are removing the only node
		setNodeColor(x, NodeColor.Black);

		z.detach();
		resetSentinel();
		tree.root.parent = SENTINEL;

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
		recomputeMetadata(tree, x);
	} else {
		if (y.parent === z) {
			x.parent = y;
		} else {
			x.parent = y.parent;
		}

		// as we make changes to x's hierarchy, update size_left of subtree first
		recomputeMetadata(tree, x);

		y.left = z.left;
		y.right = z.right;
		y.parent = z.parent;
		setNodeColor(y, getNodeColor(z));

		if (z === tree.root) {
			tree.root = y;
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
		recomputeMetadata(tree, y);
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
			updateMetadata(tree, x.parent, delta, lf_delta);
		}
	}

	recomputeMetadata(tree, x.parent);

	if (yWasRed) {
		resetSentinel();
		return;
	}

	// RB-DELETE-FIXUP
	let w: TreeNode;
	while (x !== tree.root && getNodeColor(x) === NodeColor.Black) {
		if (x === x.parent.left) {
			w = x.parent.right;

			if (getNodeColor(w) === NodeColor.Red) {
				setNodeColor(w, NodeColor.Black);
				setNodeColor(x.parent, NodeColor.Red);
				leftRotate(tree, x.parent);
				w = x.parent.right;
			}

			if (getNodeColor(w.left) === NodeColor.Black && getNodeColor(w.right) === NodeColor.Black) {
				setNodeColor(w, NodeColor.Red);
				x = x.parent;
			} else {
				if (getNodeColor(w.right) === NodeColor.Black) {
					setNodeColor(w.left, NodeColor.Black);
					setNodeColor(w, NodeColor.Red);
					rightRotate(tree, w);
					w = x.parent.right;
				}

				setNodeColor(w, getNodeColor(x.parent));
				setNodeColor(x.parent, NodeColor.Black);
				setNodeColor(w.right, NodeColor.Black);
				leftRotate(tree, x.parent);
				x = tree.root;
			}
		} else {
			w = x.parent.left;

			if (getNodeColor(w) === NodeColor.Red) {
				setNodeColor(w, NodeColor.Black);
				setNodeColor(x.parent, NodeColor.Red);
				rightRotate(tree, x.parent);
				w = x.parent.left;
			}

			if (getNodeColor(w.left) === NodeColor.Black && getNodeColor(w.right) === NodeColor.Black) {
				setNodeColor(w, NodeColor.Red);
				x = x.parent;

			} else {
				if (getNodeColor(w.left) === NodeColor.Black) {
					setNodeColor(w.right, NodeColor.Black);
					setNodeColor(w, NodeColor.Red);
					leftRotate(tree, w);
					w = x.parent.left;
				}

				setNodeColor(w, getNodeColor(x.parent));
				setNodeColor(x.parent, NodeColor.Black);
				setNodeColor(w.left, NodeColor.Black);
				rightRotate(tree, x.parent);
				x = tree.root;
			}
		}
	}
	setNodeColor(x, NodeColor.Black);
	resetSentinel();
}

function resetSentinel(): void {
	SENTINEL.parent = SENTINEL;
}

function debug(str: string, indent: number = 0) {
	let output = '';
	for(let i = 0; i < indent; i++) {
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

		while(node.parent !== SENTINEL) {
			if (node.parent.left === node) {
				break;
			}

			node = node.parent;
		}

		if (node.parent === SENTINEL) {
			// root
			// if (node.right === SENTINEL) {
				return SENTINEL;
			// }
			// return leftest(node.right);
		} else {
			return node.parent;
		}
	}

	public prev(): TreeNode {
		if (this.left !== SENTINEL) {
			return righttest(this.left);
		}

		let node: TreeNode = this;

		while(node.parent !== SENTINEL) {
			if (node.parent.right === node) {
				break;
			}

			node = node.parent;
		}

		if (node.parent === SENTINEL) {
			// root
			// if (node.left === SENTINEL) {
				return SENTINEL;
			// }
			// return righttest(node.left);
		} else {
			return node.parent;
		}
	}

	public size(): number {
		if (this === SENTINEL) {
			return 0;
		}
		this.size_left = this.left.size();
		return this.size_left + this.piece.length + this.right.size();
	}

	public validate() {
		if (this === SENTINEL) {
			return;
		}

		this.left.validate();
		this.right.validate();
		let left = calculateSize(this.left);
		if (left !== this.size_left) {
			// console.debug();
			error.sizeLeft = true;
		}
	}

	public print(tree: TextBuffer,indent: number = 0) {
		if (!this.piece) {
			return;
		}
		
		let content = tree.getNodeContent(this).replace(/\n/g, '\\n').replace(/\r/g, '\\r');

		debug(`${this.color === NodeColor.Red ? 'R' : 'B'} (${this.piece.isOriginalBuffer ? 'Original' : 'Changed'}, left: ${this.size_left}, lf_left: ${this.lf_left}, offsetInBuf: ${this.piece.offset}, len: ${this.piece.length}, content: '${content}')`, indent);
		if (this.left && this.left.piece)
		{
			debug('--- left tree:', indent);
			++indent;
			this.left.print(tree, indent);
			--indent;
		}

		if (this.right && this.right.piece)
		{
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
			let newVal =  new Uint32Array(lineLengthsVal.length);
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
			let { lineFeedCount, lineLengths } = this.udpateLFCount(originalBuffer);
			let piece = new Piece(true, 0, originalBuffer.length, lineFeedCount, lineLengths);
			rbInsertLeft(this, null, piece);
		}
	}

	insert(value: string, offset: number): void {
		// todo, validate value and offset.

		if (this.root !== SENTINEL) {
			let { node, remainder } = this.nodeAt(offset);
			let insertPos = node.piece.lineStarts.getIndexOf(remainder);

			let nodeOffsetInDocument = this.offsetOfNode(node);
			const startOffset = this._changeBuffer.length;

			if (!node.piece.isOriginalBuffer && (node.piece.offset + node.piece.length === this._changeBuffer.length ) && (nodeOffsetInDocument + node.piece.length === offset) ) {
				// append content to this node, we don't want to keep adding node when users simply type in sequence
				// unless we want to make the structure immutable
				if (this.adjustCarriageReturnFromNext(value, node)) {
					value += '\n';
				}
				
				let hitCRLF = this.nodeCharCodeAt(node, node.piece.length - 1) === 13 && value.charCodeAt(0) === 10;
				this._changeBuffer += value;
				node.piece.length += value.length;
				const { lineFeedCount, lineLengths } = this.udpateLFCount(value);

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
				
				updateMetadata(this, node, value.length, lf_delta);
			} else {
				if (nodeOffsetInDocument === offset) {
					// we are inserting content to the beginning of node
					let nodesToDel = [];
					if (value.charCodeAt(value.length -1) === 13) {
						// inserted content ends with \r
						if (node !== SENTINEL) {
							if (this.nodeCharCodeAt(node, 0) === 10) {
								// move `\n` forward
								value += '\n';
								
								node.piece.offset += 1;
								node.piece.length -= 1;
								node.piece.lineFeedCnt -= 1;
								node.piece.lineStarts.removeValues(0, 1); // remove the first line, which is empty.
								updateMetadata(this, node, -1, -1);
								
								if (node.piece.length === 0) {
									nodesToDel.push(node);
								}
							}
						}
					}
					
					this._changeBuffer += value;
					const { lineFeedCount, lineLengths } = this.udpateLFCount(value);
					let newPiece: Piece = new Piece(false, startOffset, value.length, lineFeedCount, lineLengths);

					let prev = node.prev();
					rbInsertLeft(this, node, newPiece);
					this.fixCRLF(prev);
					
					for (let i = 0; i < nodesToDel.length; i++) {
						rbDelete(this, nodesToDel[i]);
					}
				} else if (nodeOffsetInDocument + node.piece.length > offset) {
					let nodesToDel = [];
					
					// we need to split node.
					let headOfRight = this.nodeCharCodeAt(node, offset - nodeOffsetInDocument);
					let tailOfLeft = this.nodeCharCodeAt(node, offset - nodeOffsetInDocument - 1);
					let newRightPiece: Piece;
					
					// create the new piece first as we are reading current node info before mdofiying it.
					
					if (value.charCodeAt(value.length - 1) === 13 /** \r */ && headOfRight === 10 /** \n */) {
						newRightPiece = new Piece(
							node.piece.isOriginalBuffer,
							node.piece.offset + offset - nodeOffsetInDocument + 1,
							nodeOffsetInDocument + node.piece.length - offset - 1,
							node.piece.lineFeedCnt - insertPos.index - 1,
							node.piece.lineStarts.values
						);
						newRightPiece.lineStarts.removeValues(0, insertPos.index + 1);
						value += '\n';
					} else {
						newRightPiece = new Piece(
							node.piece.isOriginalBuffer,
							node.piece.offset + offset - nodeOffsetInDocument,
							nodeOffsetInDocument + node.piece.length - offset,
							node.piece.lineFeedCnt - insertPos.index,
							node.piece.lineStarts.values
						);
						this.sliceLeftPrefixSumComputer(newRightPiece.lineStarts, insertPos);
					}
					
					// update node metadata
					
					if (tailOfLeft === 13 /** \r */ && value.charCodeAt(0) === 10/** \n */) {
						let delta = (offset - nodeOffsetInDocument - 1) - node.piece.length;
						node.piece.length = offset - nodeOffsetInDocument - 1;
						let previousPos = node.piece.lineStarts.getIndexOf(remainder - 1);
						let lf_delta = previousPos.index - node.piece.lineFeedCnt;
						// let lf_delta = insertPos.index - node.piece.lineFeedCnt - 1;
						
						node.piece.lineFeedCnt = previousPos.index;
						this.sliceRightPrefixSumComputer(node.piece.lineStarts, previousPos);
						
						updateMetadata(this, node, delta, lf_delta);
						
						value = '\r' + value;
						
						if (node.piece.length === 0) {
							nodesToDel.push(node);
						}
					} else {
						let hitCRLF = this.CRLFTest(node, offset - nodeOffsetInDocument);
						let delta = (offset - nodeOffsetInDocument) - node.piece.length;
						node.piece.length = offset - nodeOffsetInDocument;
						let lf_delta = insertPos.index - node.piece.lineFeedCnt;
						node.piece.lineFeedCnt = insertPos.index;
						this.sliceRightPrefixSumComputer(node.piece.lineStarts, insertPos);
						
						if (hitCRLF) {
							node.piece.lineFeedCnt += 1;
							lf_delta += 1;
							node.piece.lineStarts.insertValues(node.piece.lineStarts.values.length, new Uint32Array(1) /*[0]*/);
	
						}
						updateMetadata(this, node, delta, lf_delta);						
					}
					
					this._changeBuffer += value;
					const { lineFeedCount, lineLengths } = this.udpateLFCount(value);
					let newPiece: Piece = new Piece(false, startOffset, value.length, lineFeedCount, lineLengths);

					if (newRightPiece.length > 0) {
						rbInsertRight(this, node, newRightPiece);
					}
					rbInsertRight(this, node, newPiece);
					for (let i = 0; i < nodesToDel.length; i++) {
						rbDelete(this, nodesToDel[i]);
					}
				} else {
					// we are inserting to the right of this node.
					if (this.adjustCarriageReturnFromNext(value, node)) {
						value += '\n';
					}
					
					this._changeBuffer += value;

					const { lineFeedCount, lineLengths } = this.udpateLFCount(value);
					let newPiece: Piece = new Piece(false, startOffset, value.length, lineFeedCount, lineLengths);
	
					rbInsertRight(this, node, newPiece);
					this.fixCRLF(node);
				}
			}
		} else {
			// insert new node
			const startOffset = this._changeBuffer.length;
			this._changeBuffer += value;
			const { lineFeedCount, lineLengths } = this.udpateLFCount(value);
			let piece = new Piece(false, startOffset, value.length, lineFeedCount, lineLengths);

			rbInsertLeft(this, null, piece);
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
					if (cnt === length) {
						let prev = startNode.prev();
						rbDelete(this, startNode);
						if (prev !== SENTINEL) {
							this.fixCRLF(prev);
						}
						return;
					}

					// delete head
					// it's okay to delete CR in CRLF.
					startNode.piece.length -= cnt;
					startNode.piece.offset += cnt;
					startNode.piece.lineFeedCnt -= endSplitPos.index;
					this.sliceLeftPrefixSumComputer(startNode.piece.lineStarts, endSplitPos);
					updateMetadata(this, startNode, -cnt, -endSplitPos.index);
					
					let prev = startNode.prev();
					if (prev !== SENTINEL) {
						this.fixCRLF(prev);
					}
					return;
				}

				if (startNodeOffsetInDocument + length === offset + cnt) {
					// delete tail
					let hitCRLF = this.CRLFTest(startNode, offset - startNodeOffsetInDocument);
					startNode.piece.length -= cnt;
					let lf_delta = splitPos.index - startNode.piece.lineFeedCnt;
					startNode.piece.lineFeedCnt = splitPos.index;
					this.sliceRightPrefixSumComputer(startNode.piece.lineStarts, splitPos);

					if (hitCRLF) {
						startNode.piece.lineFeedCnt += 1;
						lf_delta += 1;
						startNode.piece.lineStarts.insertValues(startNode.piece.lineStarts.values.length, new Uint32Array(1) /*[0]*/);
					}
					
					updateMetadata(this, startNode, -cnt, lf_delta);
					
					this.fixCRLF(startNode);
					return;
				}

				// delete content in the middle, this node will be splitted to nodes

				// read operations first
				let oldLineLengthsVal = startNode.piece.lineStarts.values;

				let startHitCRLF = this.CRLFTest(startNode, offset - startNodeOffsetInDocument);
				startNode.piece.length = offset - startNodeOffsetInDocument;
				let lf_delta = splitPos.index - startNode.piece.lineFeedCnt;
				startNode.piece.lineFeedCnt = splitPos.index;
				startNode.piece.lineStarts = new PrefixSumComputer(oldLineLengthsVal.slice(0, splitPos.index + 1));
				startNode.piece.lineStarts.changeValue(splitPos.index, splitPos.remainder);
				
				if (startHitCRLF) {
					startNode.piece.lineFeedCnt += 1;
					lf_delta += 1;
					startNode.piece.lineStarts.insertValues(startNode.piece.lineStarts.values.length, new Uint32Array(1) /*[0]*/);
				}
				
				updateMetadata(this, startNode, -(startNodeOffsetInDocument + length - offset), lf_delta);

				let newPieceLength = startNodeOffsetInDocument + length - offset - cnt;
				if (newPieceLength <= 0) {
					return;
				}

				let newPiece: Piece = new Piece(
					startNode.piece.isOriginalBuffer,
					offset + cnt - startNodeOffsetInDocument + startNode.piece.offset,
					newPieceLength,
					oldLineLengthsVal.length - endSplitPos.index - 1,
					oldLineLengthsVal.slice(endSplitPos.index)
				);
				newPiece.lineStarts.changeValue(0, newPiece.lineStarts.values[0] - endSplitPos.remainder);

				rbInsertRight(this, startNode, newPiece);
				this.fixCRLF(startNode);
				// this.validate();
				return;
			}

			// unluckily, we need to delete/modify more than one node.
			// perform read operations before any write operation.
			let endNodeOffsetInDocument = this.offsetOfNode(endNode);

			// update firstTouchedNode
			let hitCRLF = this.CRLFTest(startNode, offset - startNodeOffsetInDocument);
			startNode.piece.length = offset - startNodeOffsetInDocument;
			let lf_delta = splitPos.index - startNode.piece.lineFeedCnt;
			startNode.piece.lineFeedCnt = splitPos.index;
			this.sliceRightPrefixSumComputer(startNode.piece.lineStarts, splitPos);
			if (hitCRLF) {
				startNode.piece.lineFeedCnt++;
				lf_delta++;
				startNode.piece.lineStarts.insertValues(startNode.piece.lineStarts.values.length, new Uint32Array(1) /*[0]*/);
			}
			updateMetadata(this, startNode, -(startNodeOffsetInDocument + length - offset), lf_delta);
			let nodesToDel = [];
			if (startNode.piece.length === 0) {
				nodesToDel.push(startNode);
			}
			
			// update lastTouchedNode
			endNode.piece.length -= offset + cnt - endNodeOffsetInDocument;
			endNode.piece.offset += offset + cnt - endNodeOffsetInDocument;
			let endSplitPos = endNode.piece.lineStarts.getIndexOf(offset - endNodeOffsetInDocument + cnt);
			endNode.piece.lineFeedCnt -= endSplitPos.index;
			this.sliceLeftPrefixSumComputer(endNode.piece.lineStarts, endSplitPos);
			updateMetadata(this, endNode, -(offset + cnt - endNodeOffsetInDocument), -endSplitPos.index);

			if (endNode.piece.length === 0) {
				nodesToDel.push(endNode);
			}

			let secondNode = startNode.next();
			if (secondNode !== endNode) {
				for (let node = secondNode; node !== SENTINEL && node !== endNode; node = node.next()) {
					nodesToDel.push(node);
				}
			}

			let prev = startNode.piece.length === 0 ? startNode.prev() : startNode;
			
			for (let i = 0; i < nodesToDel.length; i++) {
				rbDelete(this, nodesToDel[i]);
			}
			
			if (prev !== SENTINEL) {
				this.fixCRLF(prev);
			}
		}
	}
	
	CRLFTest(node: TreeNode, offset: number) {
		if (node.piece.length === offset) {
			return false;
		}
		return this.nodeCharCodeAt(node, offset - 1) === 13/* \r */ && this.nodeCharCodeAt(node, offset) === 10 /* \n */;
	}
	
	/**
	 * If node ends with \r and node's next ends with \n, we need to fix the line feed.
	 * @param node 
	 */
	fixCRLF(node: TreeNode) {
		if (node === SENTINEL) {
			return;
		}
		
		if (this.nodeCharCodeAt(node, node.piece.length - 1) === 13 /* \r */) {
			let nextNode = node.next();
			if (nextNode !== SENTINEL && this.nodeCharCodeAt(nextNode, 0) === 10 /* \n */) {
				let nodesToDel = [];
				// update node
				node.piece.length -= 1;
				node.piece.lineFeedCnt -= 1;
				let lineStarts = node.piece.lineStarts;
				// lineStarts.values.length >= 2 due to a `\r`
				lineStarts.removeValues(lineStarts.values.length - 1, 1)
				lineStarts.changeValue(lineStarts.values.length - 1, lineStarts.values[lineStarts.values.length - 1] - 1);
				updateMetadata(this, node, - 1, -1);
				
				if (node.piece.length === 0) {
					nodesToDel.push(node);
				}
				
				// update nextNode
				nextNode.piece.length -= 1;
				nextNode.piece.offset += 1;
				nextNode.piece.lineFeedCnt -= 1;
				lineStarts = nextNode.piece.lineStarts;
				lineStarts.removeValues(0, 1);
				updateMetadata(this, nextNode, - 1, -1);
				if (nextNode.piece.length === 0) {
					nodesToDel.push(nextNode);
				}
				
				// create new piece which contains \r\n
				let startOffset = this._changeBuffer.length;
				this._changeBuffer += '\r\n';
				const { lineFeedCount, lineLengths } = this.udpateLFCount('\r\n');
				let piece = new Piece(false, startOffset, 2, lineFeedCount, lineLengths);
				rbInsertRight(this, node, piece);
				// delete empty nodes
				
				for (let i = 0; i < nodesToDel.length; i++) {
					rbDelete(this, nodesToDel[i]);
				}
			}
		}
	}
	
	sliceRightPrefixSumComputer(prefixSum: PrefixSumComputer, position: PrefixSumIndexOfResult): void {
		prefixSum.removeValues(position.index + 1, prefixSum.values.length - position.index - 1);
		prefixSum.changeValue(position.index, position.remainder);
	}
	
	sliceLeftPrefixSumComputer(prefixSum: PrefixSumComputer, position: PrefixSumIndexOfResult): void {
		prefixSum.changeValue(position.index, prefixSum.values[position.index] - position.remainder);
		if (position.index > 0) {
			prefixSum.removeValues(0, position.index);
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
						rbDelete(this, nextNode);
					} else {
						nextNode.piece.offset += 1;
						nextNode.piece.length -= 1;
						nextNode.piece.lineFeedCnt -= 1;
						nextNode.piece.lineStarts.removeValues(0, 1); // remove the first line, which is empty.
						updateMetadata(this, nextNode, -1, -1);
					}
					return true;
				}
			}
		}
		
		return false;
	}
	
	adjustCarriageReturn(value: string, node: TreeNode): boolean {
		if (value.charCodeAt(value.length -1) === 13) {
			// inserted content ends with \r
			if (node !== SENTINEL) {
				if (this.nodeCharCodeAt(node, 0) === 10) {
					// move `\n` forward
					value += '\n';
					
					// if (node.piece.length === 1) {
					// 	rbDelete(this, node);	
					// } else {
						node.piece.offset += 1;
						node.piece.length -= 1;
						node.piece.lineFeedCnt -= 1;
						node.piece.lineStarts.removeValues(0, 1); // remove the first line, which is empty.
						updateMetadata(this, node, -1, -1);
					// }
					
					return true;
				}
			}
		}
		return false;
	}

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
		while(x !== SENTINEL) {
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

	getOffsetAt(position: Position | IPosition ): number {
		let leftLen = 0; // inorder
		let lineNumber = position.lineNumber;

		let x = this.root;

		while(x !== SENTINEL) {
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

		while(x !== SENTINEL) {
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

	print() {
		if (this.root) {
			this.root.print(this);
		}
	}

	validate() {
		this.root.validate();
	}


	/**
	 *
	 * @param tree
	 * @param offset 0 based.
	 * TODO: return BufferCursor
	 */
	nodeAt(offset: number): BufferCursor {
		let x = this.root;

		while(x !== SENTINEL) {
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

		while(x !== SENTINEL) {
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

		// if (x === SENTINEL) {
		// 	throw('not possible');
		// }

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
		while(node !== this.root) {
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
	
	nodeCharCodeAt(node: TreeNode, offset: number): number {
		let buffer = node.piece.isOriginalBuffer ? this._originalBuffer : this._changeBuffer;
		
		return buffer.charCodeAt(node.piece.offset + offset);
	}

	private getContentOfSubTree(node: TreeNode): string {
		if (node === SENTINEL) {
			return '';
		}

		let buffer = node.piece.isOriginalBuffer ? this._originalBuffer : this._changeBuffer;
		let currentContent = buffer.substr(node.piece.offset, node.piece.length);

		return this.getContentOfSubTree(node.left) + currentContent + this.getContentOfSubTree(node.right);
	}

	private udpateLFCount(chunk: string): { lineFeedCount: number, lineLengths: Uint32Array } {
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
		for(let i = 1; i < lineStarts.length; i++) {
			lineLengths[i - 1] = lineStarts[i] - lineStarts[i - 1];
		}
		
		lineLengths[lineStarts.length - 1] = chunk.length - lineStarts[lineStarts.length - 1];

		return {
			lineFeedCount: lineLengths.length - 1,
			lineLengths: lineLengths
		};
	}
}
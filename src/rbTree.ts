import { IModel, IRange } from './piece-table';
import { IPosition, Position } from './position';

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
function leftRotate(tree: RBTree, x: TreeNode) {
	let y = x.right;
	
	// fix size_left
	y.size_left += x.size_left + (x.item ? x.item.length : 0);
	
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
function rightRotate(tree: RBTree, y: TreeNode) {
	let x = y.left;
	y.left = x.right;
	if (x.right !== SENTINEL) {
		x.right.parent = y;
	}
	x.parent = y.parent;
	
	// fix size_left
	y.size_left -= x.size_left + (x.item ? x.item.length : 0);
	
	if (y.parent === SENTINEL) {
		tree.root = x;
	} else if (y == y.parent.right) {
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
export function rbInsertRight(tree: RBTree, node: TreeNode, p: Piece) {
	let z = new TreeNode(p, NodeColor.Red);
	z.left = SENTINEL;
	z.right = SENTINEL;
	z.parent = SENTINEL;
	z.size_left = 0;
	
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
export function rbInsertLeft(tree: RBTree, node: TreeNode, p: Piece) {
	let z = new TreeNode(p, NodeColor.Red);
	z.left = SENTINEL;
	z.right = SENTINEL;
	z.parent = SENTINEL;
	z.size_left = 0;
	
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

export function fixInsert(tree: RBTree, x: TreeNode) {
	fixSize(tree, x);
	
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

export function fixSizeWhenLengthChange(tree: RBTree, x: TreeNode, delta: number): void {
	// node length change, we need to update the roots of all subtrees containing this node.
	while (x !== tree.root && x !== SENTINEL) {
		if (x.parent.left === x) {
			x.parent.size_left += delta;
		}
		
		x = x.parent;
	}
}

export function fixSize(tree: RBTree, x: TreeNode) {
	let delta = 0;
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
		x.size_left += delta;
	}
	
	// go upwards till root. O(logN)
	while (x !== tree.root && delta !== 0) {
		let item = x.item;
		
		if (x.parent.left === x) {
			x.parent.size_left += delta;
		}
		
		x = x.parent;
	}
}

function calculateSize(node: TreeNode): number {
	if (node === SENTINEL) {
		return 0;
	}
	
	return node.size_left + node.item.length + calculateSize(node.right);
}

export function rbDelete(tree: RBTree, z: TreeNode) {
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
		fixSize(tree, x);
	} else {
		if (y.parent === z) {
			x.parent = y;
		} else {
			x.parent = y.parent;
		}
		
		// as we make changes to x's hierarchy, update size_left of subtree first
		fixSize(tree, x);

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
		// update size left
		// we replace z with y, so in this sub tree, the length change is z.item.length
		y.size_left = z.size_left;
		fixSize(tree, y);
	}
	
	z.detach();
	
	if (x.parent.left === x) {
		let newSizeLeft = calculateSize(x);
		if (newSizeLeft !== x.parent.size_left) {
			let delta = newSizeLeft - x.parent.size_left;
			x.parent.size_left = newSizeLeft;
			fixSizeWhenLengthChange(tree, x.parent, delta);
		}
	}
	
	fixSize(tree, x.parent);
	
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
	item: Piece;
	size_left: number; // size of the left subtree (not inorder)

	constructor(piece: Piece, color: NodeColor) {
		this.item = piece;
		this.color = color;
		this.size_left = 0;
		this.parent = null;
		this.left = null;
		this.right = null;
	}
	
	public next(): TreeNode {
		if (this.right !== SENTINEL) {
			if (this.right === null) {
				console.log('');
			}
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
			if (node.right === SENTINEL) {
				return SENTINEL;
			}
			return leftest(node.right);
		} else {
			return node.parent;
		}
	}
	
	public size(): number {
		if (this === SENTINEL) {
			return 0;
		}
		this.size_left = this.left.size();
		return this.size_left + this.item.length + this.right.size();
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
	
	public print(indent: number = 0) {
		if (!this.item) {
			return;
		}
		
		debug(`${this.color === NodeColor.Red ? 'R' : 'B'} (${this.item.isOriginalBuffer ? 'Original' : 'Changed'}, left: ${this.size_left}, offsetInBuf: ${this.item.offset}, len: ${this.item.length})`, indent);
		if (this.left && this.left.item)
		{
			debug("--- left tree:", indent);
			++indent;
			this.left.print(indent);
			--indent;
		}

		if (this.right && this.right.item)
		{
			debug("--- right tree:", indent);
			++indent;
			this.right.print(indent);
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

export class Piece {
	isOriginalBuffer: boolean;
	offset: number;
	length: number; // size of current piece
	
	constructor(isOriginalBuffer: boolean, offset: number, length: number) {
		this.isOriginalBuffer = isOriginalBuffer;
		this.offset = offset;
		this.length = length;
	}
}

export class RBTree implements IModel {
	private _originalBuffer: string;
	private _changeBuffer: string;
	root: TreeNode;
	
	constructor(originalBuffer: string, size?: number) {
		this._originalBuffer = originalBuffer;
		this._changeBuffer = '';
		this.root = SENTINEL;
		
		let piece = new Piece(true, 0, originalBuffer.length);
		if (piece.length > 0) {
			rbInsertLeft(this, null, piece);
		}
	}
	
	insert(value: string, offset: number): void {
		if (this.root !== SENTINEL) {
			let node = this.nodeAt(offset);
		
			if (!node) {
				this.nodeAt(offset);
				throw('we are in trouble');
			}
			
			let nodeOffsetInDocument = this.offsetOfNode(node);
			const startOffset = this._changeBuffer.length;
			this._changeBuffer += value;
			
			if (!node.item.isOriginalBuffer && (node.item.offset + node.item.length === this._changeBuffer.length - value.length) && (nodeOffsetInDocument + node.item.length === offset) ) {
				// append content to this node
				// we don't want to keep adding node when users simply type in sequence.
				node.item.length += value.length;
				fixSizeWhenLengthChange(this, node, value.length); // damn
			} else {
				let newPiece: Piece = new Piece(false, startOffset, value.length);
				
				if (nodeOffsetInDocument === offset) {
					// we are inserting content to the beginning of node
					// insert to its left
					rbInsertLeft(this, node, newPiece);
				} else if (nodeOffsetInDocument + node.item.length > offset) {
					// we need to split node.
					let newRightPiece = new Piece(node.item.isOriginalBuffer, node.item.offset + offset - nodeOffsetInDocument, nodeOffsetInDocument + node.item.length - offset);
					
					node.item.length -= newRightPiece.length;
					fixSizeWhenLengthChange(this, node, -newRightPiece.length);
					
					rbInsertRight(this, node, newRightPiece);
					rbInsertRight(this, node, newPiece);
				} else {
					rbInsertRight(this, node, newPiece);
				}
			}
		} else {
			// insert new node
			const startOffset = this._changeBuffer.length;
			this._changeBuffer += value;
			let piece = new Piece(false, startOffset, value.length);
			
			rbInsertLeft(this, null, piece);
		}
		// this.validate();
		// this.print();
	}
	
	delete(offset: number, cnt: number): void {
		if (this.root !== SENTINEL) {
			let firstTouchedNode = this.nodeAt(offset);
			let lastTouchedNode = this.nodeAt(offset + cnt);
			
			let length = firstTouchedNode.item.length;
			let nodeOffsetInDocument = this.offsetOfNode(firstTouchedNode);
			
			if (firstTouchedNode === lastTouchedNode) {
				// deletion falls into one node.
				if (nodeOffsetInDocument === offset) {
					if (cnt === length) {
						rbDelete(this, firstTouchedNode);
						return;
					}
					
					if (cnt > length) {
						throw('not possible, it is crazy');
					}
					
					// delete head
					firstTouchedNode.item.length -= cnt;
					firstTouchedNode.item.offset += cnt;
					fixSizeWhenLengthChange(this, firstTouchedNode, -cnt);
					return;
				}
				
				if (nodeOffsetInDocument + length === offset + cnt) {
					// delete tail
					firstTouchedNode.item.length -= cnt;
					fixSizeWhenLengthChange(this, firstTouchedNode, -cnt);
					return;
				}
				
				// delete content in the middle
				// this node will be splitted to nodes
				firstTouchedNode.item.length = offset - nodeOffsetInDocument;
				fixSizeWhenLengthChange(this, firstTouchedNode, -(nodeOffsetInDocument + length - offset));
				
				let newPieceLength = nodeOffsetInDocument + length - offset - cnt;
				if (newPieceLength <= 0) {
					return;
				}
				let newPiece: Piece = new Piece(firstTouchedNode.item.isOriginalBuffer, offset + cnt - nodeOffsetInDocument + firstTouchedNode.item.offset, newPieceLength);
				
				rbInsertRight(this, firstTouchedNode, newPiece);
				// this.validate();
				return;
			}
			
			// unluckily, we need to delete/modify more than one node.
			// perform read operations before any write operation.
			let lastNodeOffsetInDocument = this.offsetOfNode(lastTouchedNode);

			// update firstTouchedNode
			firstTouchedNode.item.length = offset - nodeOffsetInDocument;
			fixSizeWhenLengthChange(this, firstTouchedNode, -(nodeOffsetInDocument + length - offset));

			// update lastTouchedNode
			lastTouchedNode.item.length -= offset + cnt - lastNodeOffsetInDocument;
			lastTouchedNode.item.offset += offset + cnt - lastNodeOffsetInDocument;
			
			let nodesToDel = [];
			if (lastTouchedNode.item.length === 0) {
				nodesToDel.push(lastTouchedNode);
			}
			
			fixSizeWhenLengthChange(this, lastTouchedNode, -(offset + cnt - lastNodeOffsetInDocument));
			
			let secondNode = firstTouchedNode.next();
			if (secondNode !== lastTouchedNode) {
				for (let node = secondNode; node !== SENTINEL && node !== lastTouchedNode; node = node.next()) {
					nodesToDel.push(node);
				}
			}
			
			for (let i = 0; i < nodesToDel.length; i++) {
				rbDelete(this, nodesToDel[i]);
			}
		}
		
		// this.validate();
	}
	substr(offset: number, cnt: number): string {
		throw new Error("Method not implemented.");
	}
	getLinesContent() {
		return this.getContentOfSubTree(this.root);
	}
	getLineCount(): number {
		throw new Error("Method not implemented.");
	}
	getValueInRange(range: IRange): string {
		throw new Error("Method not implemented.");
	}
	getLineContent(lineNumber: number): string {
		throw new Error("Method not implemented.");
	}
	getOffsetAt(position: IPosition): number {
		throw new Error("Method not implemented.");
	}
	getPositionAt(offset: number): Position {
		throw new Error("Method not implemented.");
	}
	print() {
		if (this.root) {
			this.root.print();
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
	nodeAt(offset: number): TreeNode {
		let x = this.root;
		
		while(x !== SENTINEL) {
			if (x.size_left > offset) {
				x = x.left;
			} else if (x.size_left + x.item.length >= offset) {
				return x;
			} else {
				offset -= x.size_left + x.item.length;
				x = x.right;
			}
		}
		
		return null;
	}
	
	offsetOfNode(node: TreeNode): number {
		if (!node) {
			return 0;
		}
		let pos = node.size_left;
		while(node !== this.root) {
			if (node.parent.right === node) {
				pos += node.parent.size_left + node.parent.item.length;
			}
			
			node = node.parent;
		}
		
		return pos;
	}
	
	private getContentOfSubTree(node: TreeNode): string {
		if (node === SENTINEL) {
			return '';
		}
		
		let buffer = node.item.isOriginalBuffer ? this._originalBuffer : this._changeBuffer;
		let currentContent = buffer.substr(node.item.offset, node.item.length);

		return this.getContentOfSubTree(node.left) + currentContent + this.getContentOfSubTree(node.right);
	}
}
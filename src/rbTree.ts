import { IModel, IRange } from './piece-table';
import { IPosition, Position } from './position';

export const enum NodeColor {
	Black = 0,
	Red = 1,
}

function getNodeColor(node: TreeNode) {
	if (node) {
		return node.color;
	} else {
		return NodeColor.Black;
	}
}

function setNodeColor(node: TreeNode, color: NodeColor) {
	node.color = color;
}

function grandParent(treeNode: TreeNode) {
	let parent = treeNode.parent;
	
	if (parent) {
		return parent.parent;
	} else {
		return null;
	}
}

function sibling(treeNode: TreeNode) {
	let parent = treeNode.parent;
	
	if(parent) {
		if (treeNode === treeNode.left) {
			return treeNode.right;
		} else {
			return treeNode.left;
		}
	} else {
		return null;
	}
}

function uncle(treeNode: TreeNode) {
	let parent = treeNode.parent;
	let gP = grandParent(treeNode);
	
	if (gP) {
		return sibling(parent);
	}
	return null;
}

function leftest(node: TreeNode): TreeNode {
	while (node.left !== null) {
		node = node.left;
	}
	return node;
}

function righttest(node: TreeNode): TreeNode {
	while (node.right !== null) {
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
	y.size_left += x.size_left + x.item.length;
	
	x.right = y.left;
	
	if (y.left) {
		y.left.parent = x;
	}
	y.parent = x.parent;
	if (x.parent === null) {
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
	if (x.right !== null) {
		x.right.parent = y;
	}
	x.parent = y.parent;
	
	// fix size_left
	y.size_left -= x.size_left + x.item.length;
	
	if (x.parent === null) {
		tree.root = x;
	} else if (y == y.parent.right) {
		y.parent.right = x;
	} else {
		y.parent.left = x;
	}
	
	x.right = y;
	y.parent = x;
}

function treeInsert(tree: RBTree, z: TreeNode) {
	let x = tree.root;
	let y: TreeNode = null;
	while(x !== null) {
		y = x;
		if (z.size_left < x.size_left) {
			x = x.left;
		} else {
			x = x.right;
		}
	}
	
	z.parent = y;
	
	if (y === null) {
		tree.root = z;
	} else {
		if (z.size_left < y.size_left) {
			y.left = z;
		} else {
			y.right = z;
		}
	}
}

export function rbInsert(tree: RBTree, x: TreeNode) {
	treeInsert(tree, x);
	x.color = NodeColor.Red;
	
	fixInsert(tree, x);
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
	z.size_left = 0;
	
	let x = tree.root;
	if (x === null) {
		tree.root = z;
		setNodeColor(z, NodeColor.Black);
	} else if (node.right === null) {
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
	z.size_left = 0;
	
	let x = tree.root;
	if (x === null) {
		tree.root = z;
		setNodeColor(z, NodeColor.Black);
	} else if (node.left === null) {
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
		if (x.parent === grandParent(x).left) {
			const y = grandParent(x).right;
			
			if (getNodeColor(y) === NodeColor.Red) {
				setNodeColor(x.parent, NodeColor.Black);
				setNodeColor(y, NodeColor.Black);
				setNodeColor(grandParent(x), NodeColor.Red);
				x = grandParent(x);
			} else {
				if (x === x.parent.right) {
					x = x.parent;
					leftRotate(tree, x);
				}
				
				setNodeColor(x.parent, NodeColor.Black);
				setNodeColor(grandParent(x), NodeColor.Red);
				rightRotate(tree, grandParent(x));
			}
		} else {
			const y = grandParent(x).left;
			
			if (getNodeColor(y) === NodeColor.Red) {
				setNodeColor(x.parent, NodeColor.Black);
				setNodeColor(y, NodeColor.Black);
				setNodeColor(grandParent(x), NodeColor.Red);
				x =grandParent(x);
			} else {
				if (x === x.parent.left) {
					x = x.parent;
					rightRotate(tree, x);
				}
				setNodeColor(x.parent, NodeColor.Black);
				setNodeColor(grandParent(x), NodeColor.Red);
				leftRotate(tree, grandParent(x));
			}
		}
	}
	
	setNodeColor(tree.root, NodeColor.Black);
}
export function fixSizeWhenLengthChange(tree: RBTree, x: TreeNode, delta: number): void {
	// node length change, we need to update the roots of all subtrees containing this node.
	while (x !== tree.root) {
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
	
	/**
	 * todo, can this even happen?
	 */
	if (x.parent.left === x.parent.right && x.parent.item) {
		x = x.parent;
		delta = - x.size_left;
		x.size_left = 0;
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
	if (node === null) {
		return 0;
	}
	
	return node.size_left + node.item.length + calculateSize(node.right);
}

export function rbDelete(tree: RBTree, z: TreeNode) {
	let x: TreeNode;
	let y: TreeNode;
	
	if (z.left === null) {
		y = z;
		x = y.right;
	} else if (z.right === null) {
		y = z;
		x = y.left;
	} else {
		y = leftest(z.right);
		x = y.right;
	}
	
	if (y === tree.root) {
		tree.root = x;
		
		// if x is null, we are removing the only node
		if (x !== null) {
			setNodeColor(x, NodeColor.Black);
	
			z.detach();
			// resetSentinel();
			// recomputeMaxEnd(x);
			tree.root.parent = null;
		}
		return;
	}
		
	if (y === y.parent.left) {
		y.parent.left = x;
	} else {
		y.parent.right = x;
	}
	
	if (y === z) {
		x.parent = y.parent;
	} else {
		if (y.parent === z) {
			x.parent = y;
		} else {
			x.parent = y.parent;
		}

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

		if (y.left !== null) {
			y.left.parent = y;
		}
		if (y.right !== null) {
			y.right.parent = y;
		}
	}
	
	z.detach();
	
	fixSize(tree, x.parent);
	if (y !== z) {
		fixSize(tree, y);
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
}

/**
 * 
 * @param tree 
 * @param offset 0 based.
 * TODO: return BufferCursor
 */
export function find(tree: RBTree, offset: number): TreeNode {
	let x = tree.root;
	
	while(x !== null) {
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

export function docOffset(tree: RBTree, node: TreeNode) {
	if (!node) {
		return 0;
	}
	let pos = node.size_left;
	while(node !== tree.root) {
		if (node.parent.right === node) {
			pos += node.parent.size_left + node.parent.item.length;
		}
		
		node = node.parent;
	}
	
	return pos;
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
		if (this.right !== null) {
			return leftest(this.right);
		}
		
		let node: TreeNode = this;
		
		while(node.parent !== null) {
			if (node.parent.left === node) {
				break;
			}
			
			node = node.parent;
		}
		
		if (node.parent === null) {
			// root
			if (node.right === null) {
				return null;
			}
			return leftest(node.right);
		} else {
			return node.parent;
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
		this.root = null;
		
		let piece = new Piece(true, 0, originalBuffer.length);
		rbInsertLeft(this, null, piece);
	}
	
	insert(value: string, offset: number): void {
		if (this.root !== null) {
			let node = find(this, offset);
		
			if (!node) {
				find(this, offset);
				throw('we are in trouble');
			}
			
			let nodeOffsetInDocument = docOffset(this, node);
			const startOffset = this._changeBuffer.length;
			this._changeBuffer += value;
			
			if (!node.item.isOriginalBuffer && (node.item.offset + node.item.length === this._changeBuffer.length - value.length) && (nodeOffsetInDocument + node.item.length === offset) ) {
				// update this node.
				// we don't want to keep adding node when users simply type in sequence.
				node.item.length += value.length;
				fixSizeWhenLengthChange(this, node, value.length); // damn
			} else {
				let newPiece: Piece = new Piece(false, startOffset, value.length);
				
				if (nodeOffsetInDocument === offset) {
					// we are inserting content to the beginning of node, so make it the prevNode of node.
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
		
		// this.print();
	}
	
	delete(offset: number, cnt: number): void {
		if (this.root !== null) {
			let firstTouchedNode = find(this, offset);
			let lastTouchedNode = find(this, offset + cnt);
			
			let length = firstTouchedNode.item.length;
			let nodeOffsetInDocument = docOffset(this, firstTouchedNode);
			
			if (firstTouchedNode === lastTouchedNode) {
				firstTouchedNode.item.length -= nodeOffsetInDocument + length - offset;
				if (firstTouchedNode.item.length <= 0) {
					rbDelete(this, firstTouchedNode);
				} else {
					fixSizeWhenLengthChange(this, firstTouchedNode, -(nodeOffsetInDocument + length - offset));
				}
				
				let newPieceLength = nodeOffsetInDocument + length - offset - cnt;
				if (newPieceLength <= 0) {
					return;
				}
				let newPiece: Piece = new Piece(firstTouchedNode.item.isOriginalBuffer, offset + cnt - nodeOffsetInDocument + firstTouchedNode.item.offset, newPieceLength);
				rbInsertRight(this, firstTouchedNode, newPiece);
				return;
			}
			
			// update firstTouchedNode
			firstTouchedNode.item.length -= nodeOffsetInDocument + length - offset;
			fixSizeWhenLengthChange(this, firstTouchedNode, -(nodeOffsetInDocument + length - offset));

			// update lastTouchedNode
			let lastNodeOffsetInDocument = docOffset(this, lastTouchedNode);
			lastTouchedNode.item.length -= offset + cnt - lastNodeOffsetInDocument;
			lastTouchedNode.item.offset += offset + cnt - lastNodeOffsetInDocument;
			fixSizeWhenLengthChange(this, lastTouchedNode, -(offset + cnt - lastNodeOffsetInDocument));
			
			let secondNode = firstTouchedNode.next();
			
			if (secondNode !== lastTouchedNode) {
				for (let node = secondNode; node !== null && node !== lastTouchedNode; node = node.next()) {
					rbDelete(this, node);
				}
			}
		}
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
	
	private getContentOfSubTree(node: TreeNode): string {
		if (node === null) {
			return '';
		}
		
		let buffer = node.item.isOriginalBuffer ? this._originalBuffer : this._changeBuffer;
		let currentContent = buffer.substr(node.item.offset, node.item.length);

		return this.getContentOfSubTree(node.left) + currentContent + this.getContentOfSubTree(node.right);
	}
}
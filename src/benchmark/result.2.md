Since I now use Red Black tree to manage the nodes of Piece Table and use PrefixSum to cache line feed offsets, the time complexity of basic operations in theory are sane now. Let's do benchmark against this new buffer implementation, edcore (C++) and the original line array.

# Edits

## push 10000 inserts to empty file
- piece table with rbtree 	x 4.56 ops/sec
- edcore 					x 0.07 ops/sec

## push 10000 inserts to empty file
- piece table with rbtree 	x 4.62 ops/sec
- edcore 					x 0.14 ops/sec
# model builder
Data:
- checker.ts
- heapfile

Result:

- model lines - 'checker.ts'  x 50.57 ops/sec ±4.17% (20 runs sampled)
- model lines - 'heapsnapshot.txt'  x 0.47 ops/sec ±2.16% (20 runs sampled)
- piece table - 'checker.ts'  x 149 ops/sec ±3.67% (20 runs sampled)
- piece table - 'heapsnapshot.txt'  x 1.96 ops/sec ±6.63% (20 runs sampled)
- edcore - 'checker.ts'  x 150 ops/sec ±1.74% (20 runs sampled)
- edcore - 'heapsnapshot.txt'  x 2.86 ops/sec ±0.76% (20 runs sampled)

edcore is the fastest without any doubt as it doesn't do any string concatenation, nor line splits.

# getLineContent

## Wrong metrics
- Checker.ts 25000 lines

- piece-table getLineContent x 132 ops/sec ±3.61% (20 runs sampled)
- lines-model getLineContent x 4,788 ops/sec ±2.22% (20 runs sampled)
- edcore getLineContent x 41.10 ops/sec ±8.22% (20 runs sampled)

lines-model is the fatest as each query is just acessing a pointer. Piece table is faster than edcore as it's a single string, we fully rely on the performance of substring. edcore is 3 or 4 times slower than piece table as it has around 20 nodes (1.3M file, default 64kb chunk size) and a line query is O(logN) in average.

## get line content
- checker.ts

we tried to get char code of every character, this is how we build the view line. This is the real time of fetching the text of a line and generating text for HTML.

- piece-table getLineContent x 75.71 ops/sec ±2.46% (20 runs sampled)
- lines-model getLineContent x 242 ops/sec ±3.36% (20 runs sampled)
- edcore getLineContent x 36.00 ops/sec ±6.86% (20 runs sampled)

## getLineContent after 1000 edits
Data:
- Checker.ts 25000 lines
- Piece table is using a simple array. (which means find a line is almost O(n), n is the size of the array).
- edcore is a tree (it uses an array to store the tree)

Result:
- piece-table with 1000 edits getLineContent x 10.02 ops/sec ±2.43% (20 runs sampled)
- edcore with 1000 edits getLineContent x 46.70 ops/sec ±12.40% (20 runs sampled)

If I do the math correctly, with balanced tree, pt can be 390 ops/sec

## new file, getLineContent after 1000 edits
Data:
- empty.ts 1 line

- piece-table with 1000 edits getLineContent x 10.42 ops/sec ±2.32% (20 runs sampled)
- edcore with 1000 edits getLineContent x 940 ops/sec ±13.57% (20 runs sampled)

I guess if the content change is small, it's always tweaking string in the same node.

## getLineContent after 10000 edits

- piece-table with 10000 edits getLineContent x 0.09 ops/sec ±31.65% (2 runs sampled)
- edcore with 10000 edits getLineContent x 45.06 ops/sec ±90.02% (2 runs sampled)

Funny thing is, as edcore only holds limited nodes (fileSize/chunkSize), the performance of getLineContent doesn't really change. Let's how we can optimize piece table to match with edcore.

piece table adds 2 nodes when insert, 1 node when delete in average. So 10000 edits may lead to 15000 nodes in total. Current getLineContent is O(N), a optimized balanced tree can be O(logN), we can improve the speed by 15000/log(15000) ~= 122 times. the piece table getLineContent can be 11 opts/sec.


# Edit

## push 1000 edits to empty file

- pt push edits x 22.23 ops/sec
- edcore push edits x 13.13 ops/sec

## push 1000 edits (10 times) to empty file

- pt push edits x 6.85 ops/sec ±25.31%
- edcore push edits x 0.83 ops/sec ±31.49%

## push 1000 edits (10 times) to empty file, with PieceTable+RBTree

- piece table  				x 10.67 ops/sec
- piece table with rbtree	x 354 ops/sec
- edcore					x 1.08 ops/sec

## push 1000 inserts to empty file
- piece table				x 24.81 ops/sec
- piece table with rbtree 	x 309 ops/sec
- edcore					x 8.32 ops/sec

## push 10000 inserts to empty file
- piece table				x 0.39 ops/sec
- piece table with rbtree 	x 30.39 ops/sec
- edcore					x 0.07 ops/sec

## push 1000 edits to empty file
- piece table 				x 29.31 ops/sec
- piece table with rbtree 	x 353 ops/sec
- edcore 					x 15.74 ops/sec

## push 10000 edits to empty file
- piece table 				x 0.43 ops/sec
- piece table with rbtree 	x 48.16 ops/sec
- edcore 					x 0.16 ops/sec

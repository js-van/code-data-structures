import { PieceTable } from '../piece-table';
import { IPosition, Position } from '../position';

const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ \n';

function randomChar() {
	return alphabet[randomInt(alphabet.length)];
};

function randomInt(bound: number) {
	return Math.floor(Math.random() * bound);
};

function randomStr(len: number) {
	if (len == null) {
		len = 10;
	}
	return ((function () {
		var j, ref, results;
		results = [];
		for (j = 1, ref = len; 1 <= ref ? j < ref : j > ref; 1 <= ref ? j++ : j--) {
			results.push(randomChar());
		}
		return results;
	})()).join('') + ' ';
};

describe('random is unsupervised', () => {
	it('random insert delete', () => {
		let str = '';
		let pt = new PieceTable(str);
		
		for (let i = 0; i < 1000; i++) {
			if (Math.random() < 0.9) {
				// insert
				let text = randomStr(100);
				let pos = randomInt(str.length + 1);
				pt.insert(text, pos);
				
				str = str.substring(0, pos) + text + str.substring(pos);
			} else {
				// delete
				let pos = randomInt(str.length);
				let length = Math.min(str.length - pos, Math.floor(Math.random() * 10))
				let deletedText = str.substr(pos, length);
				pt.delete(pos, length);
				
				str = str.substring(0, pos) + str.substring(pos + length);
			}
		}
		expect(pt.getContent()).toBe(str);

		let lineFeedIndex = -1;
		let lastLineFeedIndex = -1;
		let lineCnt = 1;
		
		while ((lineFeedIndex = str.indexOf('\r', lineFeedIndex + 1)) !== -1) {
			if (lineFeedIndex + 1 === str.length) {
				// last line feed
				break;
			}
			
			lineCnt += 1;
			expect(pt.getPositionAt(lineFeedIndex + 1)).toBe(new Position(lineCnt + 1, 1));
			expect(pt.getOffsetAt(new Position(lineCnt + 1, 1))).toBe(lineFeedIndex + 1);
		}
		
		// expect(pt.getLineCount()).toBe(str.split('\n').length);
	});
});

describe('inserts and deletes', () => {
	it('basic insert/delete', () => {
		let pieceTable = new PieceTable('This is a document with some text.');

		pieceTable.insert('This is some more text to insert at offset 34.', 34);
		expect(pieceTable.getContent()).toBe('This is a document with some text.This is some more text to insert at offset 34.')
		pieceTable.delete(42, 5);
		expect(pieceTable.getContent()).toBe('This is a document with some text.This is more text to insert at offset 34.')
	});

	it('more inserts', () => {
		let pt = new PieceTable('');

		pt.insert('AAA', 0);
		expect(pt.getContent()).toBe('AAA');

		pt.insert('BBB', 0);
		expect(pt.getContent()).toBe('BBBAAA');

		pt.insert('CCC', 6);
		expect(pt.getContent()).toBe('BBBAAACCC');

		pt.insert('DDD', 5);
		expect(pt.getContent()).toBe('BBBAADDDACCC');
	});

	it('more deletes', () => {
		let pt = new PieceTable('012345678');

		pt.delete(8, 1);
		expect(pt.getContent()).toBe('01234567');

		pt.delete(0, 1);
		expect(pt.getContent()).toBe('1234567');

		pt.delete(5, 1);
		expect(pt.getContent()).toBe('123457');

		pt.delete(5, 1);
		expect(pt.getContent()).toBe('12345');

		pt.delete(0, 5);
		expect(pt.getContent()).toBe('');
	});
});

describe('prefix sum for line feed', () => {
	it('basic', () => {
		let pieceTable = new PieceTable('1\n2\n3\n4');
		
		expect(pieceTable.getLineCount()).toBe(4);
		expect(pieceTable.getPositionAt(0)).toEqual(new Position(1, 1));
		expect(pieceTable.getPositionAt(1)).toEqual(new Position(1, 2));
		expect(pieceTable.getPositionAt(2)).toEqual(new Position(2, 1));
		expect(pieceTable.getPositionAt(3)).toEqual(new Position(2, 2));
		expect(pieceTable.getPositionAt(4)).toEqual(new Position(3, 1));
		expect(pieceTable.getPositionAt(5)).toEqual(new Position(3, 2));
		expect(pieceTable.getPositionAt(6)).toEqual(new Position(4, 1));
		
		expect(pieceTable.getOffsetAt({ lineNumber: 1, column: 1 })).toBe(0);
		expect(pieceTable.getOffsetAt({ lineNumber: 1, column: 2 })).toBe(1);
		expect(pieceTable.getOffsetAt({ lineNumber: 2, column: 1 })).toBe(2);
		expect(pieceTable.getOffsetAt({ lineNumber: 2, column: 2 })).toBe(3);
		expect(pieceTable.getOffsetAt({ lineNumber: 3, column: 1 })).toBe(4);
		expect(pieceTable.getOffsetAt({ lineNumber: 3, column: 2 })).toBe(5);
		expect(pieceTable.getOffsetAt({ lineNumber: 4, column: 1 })).toBe(6);
	});
	
	it('append', () => {
		let pieceTable = new PieceTable('a\nb\nc\nde');
		pieceTable.insert('fh\ni\njk', 8);
		
		expect(pieceTable.getLineCount()).toBe(6);
		expect(pieceTable.getPositionAt(9)).toEqual(new Position(4, 4));
		
		expect(pieceTable.getOffsetAt({ lineNumber: 1, column: 1 })).toBe(0);
	});
	
	it('insert', () => {
		let pieceTable = new PieceTable('a\nb\nc\nde');
		pieceTable.insert('fh\ni\njk', 7);
		
		expect(pieceTable.getLineCount()).toBe(6);
		expect(pieceTable.getPositionAt(6)).toEqual(new Position(4, 1));
		expect(pieceTable.getPositionAt(7)).toEqual(new Position(4, 2));
		expect(pieceTable.getPositionAt(8)).toEqual(new Position(4, 3));
		expect(pieceTable.getPositionAt(9)).toEqual(new Position(4, 4));
		expect(pieceTable.getPositionAt(12)).toEqual(new Position(6, 1));
		expect(pieceTable.getPositionAt(13)).toEqual(new Position(6, 2));
		expect(pieceTable.getPositionAt(14)).toEqual(new Position(6, 3));
		
		expect(pieceTable.getOffsetAt({ lineNumber: 4, column: 1 })).toBe(6);
		expect(pieceTable.getOffsetAt({ lineNumber: 4, column: 2 })).toBe(7);
		expect(pieceTable.getOffsetAt({ lineNumber: 4, column: 3 })).toBe(8);
		expect(pieceTable.getOffsetAt({ lineNumber: 4, column: 4 })).toBe(9);
		expect(pieceTable.getOffsetAt({ lineNumber: 6, column: 1 })).toBe(12);
		expect(pieceTable.getOffsetAt({ lineNumber: 6, column: 2 })).toBe(13);
		expect(pieceTable.getOffsetAt({ lineNumber: 6, column: 3 })).toBe(14);
	});
	
	it('delete', () => {
		let pieceTable = new PieceTable('a\nb\nc\ndefh\ni\njk');
		pieceTable.delete(7, 2);
		
		expect(pieceTable.getContent()).toBe('a\nb\nc\ndh\ni\njk')
		expect(pieceTable.getLineCount()).toBe(6);
		expect(pieceTable.getPositionAt(6)).toEqual(new Position(4, 1));
		expect(pieceTable.getPositionAt(7)).toEqual(new Position(4, 2));
		expect(pieceTable.getPositionAt(8)).toEqual(new Position(4, 3));
		expect(pieceTable.getPositionAt(9)).toEqual(new Position(5, 1));
		expect(pieceTable.getPositionAt(11)).toEqual(new Position(6, 1));
		expect(pieceTable.getPositionAt(12)).toEqual(new Position(6, 2));
		expect(pieceTable.getPositionAt(13)).toEqual(new Position(6, 3));
		
		expect(pieceTable.getOffsetAt({ lineNumber: 4, column: 1 })).toBe(6);
		expect(pieceTable.getOffsetAt({ lineNumber: 4, column: 2 })).toBe(7);
		expect(pieceTable.getOffsetAt({ lineNumber: 4, column: 3 })).toBe(8);
		expect(pieceTable.getOffsetAt({ lineNumber: 5, column: 1 })).toBe(9);
		expect(pieceTable.getOffsetAt({ lineNumber: 6, column: 1 })).toBe(11);
		expect(pieceTable.getOffsetAt({ lineNumber: 6, column: 2 })).toBe(12);
		expect(pieceTable.getOffsetAt({ lineNumber: 6, column: 3 })).toBe(13);
	});
	
	it('add+delete 1', () => {
		let pieceTable = new PieceTable('a\nb\nc\nde');
		pieceTable.insert('fh\ni\njk', 8);
		pieceTable.delete(7, 2);
		
		expect(pieceTable.getContent()).toBe('a\nb\nc\ndh\ni\njk')
		expect(pieceTable.getLineCount()).toBe(6);
		expect(pieceTable.getPositionAt(6)).toEqual(new Position(4, 1));
		expect(pieceTable.getPositionAt(7)).toEqual(new Position(4, 2));
		expect(pieceTable.getPositionAt(8)).toEqual(new Position(4, 3));
		expect(pieceTable.getPositionAt(9)).toEqual(new Position(5, 1));
		expect(pieceTable.getPositionAt(11)).toEqual(new Position(6, 1));
		expect(pieceTable.getPositionAt(12)).toEqual(new Position(6, 2));
		expect(pieceTable.getPositionAt(13)).toEqual(new Position(6, 3));
		
		expect(pieceTable.getOffsetAt({ lineNumber: 4, column: 1 })).toBe(6);
		expect(pieceTable.getOffsetAt({ lineNumber: 4, column: 2 })).toBe(7);
		expect(pieceTable.getOffsetAt({ lineNumber: 4, column: 3 })).toBe(8);
		expect(pieceTable.getOffsetAt({ lineNumber: 5, column: 1 })).toBe(9);
		expect(pieceTable.getOffsetAt({ lineNumber: 6, column: 1 })).toBe(11);
		expect(pieceTable.getOffsetAt({ lineNumber: 6, column: 2 })).toBe(12);
		expect(pieceTable.getOffsetAt({ lineNumber: 6, column: 3 })).toBe(13);
	});
	
	it('insert random bug 1: prefixSumComputer.removeValues(start, cnt) cnt is 1 based.', () => {
		let str = '';
		let pieceTable = new PieceTable('');
		pieceTable.insert(' ZX \n Z\nZ\n YZ\nY\nZXX ', 0);
		str = str.substring(0, 0) + ' ZX \n Z\nZ\n YZ\nY\nZXX ' + str.substring(0);
		pieceTable.insert('X ZZ\nYZZYZXXY Y XY\n ', 14);
		str = str.substring(0, 14) + 'X ZZ\nYZZYZXXY Y XY\n ' + str.substring(14);
		
		expect(pieceTable.getContent()).toEqual(str);
		
		let lineFeedIndex = -1;
		let lastLineFeedIndex = -1;
		let lineCnt = 1;
		while ((lineFeedIndex = str.indexOf('\n', lineFeedIndex + 1)) !== -1) {
			if (lineFeedIndex + 1 === str.length) {
				// last line feed
				break;
			}
			
			lineCnt += 1;
			expect(pieceTable.getPositionAt(lineFeedIndex + 1)).toEqual(new Position(lineCnt, 1));
			expect(pieceTable.getOffsetAt(new Position(lineCnt, 1))).toEqual(lineFeedIndex + 1);
		}
	});
	
	it('insert random bug 2: prefixSumComputer initialize does not do deep copy of UInt32Array.', () => {
		let str = '';
		let pieceTable = new PieceTable('');
		pieceTable.insert('ZYZ\nYY XY\nX \nZ Y \nZ ', 0);
		str = str.substring(0, 0) + 'ZYZ\nYY XY\nX \nZ Y \nZ ' + str.substring(0);
		pieceTable.insert('XXY \n\nY Y YYY  ZYXY ', 3);
		str = str.substring(0, 3) + 'XXY \n\nY Y YYY  ZYXY ' + str.substring(3);
		
		expect(pieceTable.getContent()).toEqual(str);
		
		let lineFeedIndex = -1;
		let lastLineFeedIndex = -1;
		let lineCnt = 1;
		while ((lineFeedIndex = str.indexOf('\n', lineFeedIndex + 1)) !== -1) {
			if (lineFeedIndex + 1 === str.length) {
				// last line feed
				break;
			}
			
			lineCnt += 1;
			expect(pieceTable.getPositionAt(lineFeedIndex + 1)).toEqual(new Position(lineCnt, 1));
			expect(pieceTable.getOffsetAt(new Position(lineCnt, 1))).toEqual(lineFeedIndex + 1);
		}
	});
	
});

describe('getTextInRange', () => {
	it('reads substrings from the buffer', () => {
		let pieceTable = new PieceTable('a\nb\nc\nde');
		pieceTable.insert('fh\ni\njk', 8);
		pieceTable.delete(7, 2);
		
		// a\nb\nc\ndh\ni\njk

		expect(pieceTable.substr(0, 1)).toBe('a');
		expect(pieceTable.substr(0, 2)).toBe('a\n');
		expect(pieceTable.substr(0, 3)).toBe('a\nb');
		expect(pieceTable.substr(0, 4)).toBe('a\nb\n');
		expect(pieceTable.substr(0, 5)).toBe('a\nb\nc');
		expect(pieceTable.substr(0, 6)).toBe('a\nb\nc\n');
		expect(pieceTable.substr(0, 7)).toBe('a\nb\nc\nd');
		expect(pieceTable.substr(0, 8)).toBe('a\nb\nc\ndh');
		expect(pieceTable.substr(0, 9)).toBe('a\nb\nc\ndh\n');
		expect(pieceTable.substr(0, 10)).toBe('a\nb\nc\ndh\ni');
		expect(pieceTable.substr(0, 11)).toBe('a\nb\nc\ndh\ni\n');
		expect(pieceTable.substr(0, 12)).toBe('a\nb\nc\ndh\ni\nj');
		expect(pieceTable.substr(0, 13)).toBe('a\nb\nc\ndh\ni\njk');
	});
});

describe('line operations', () => {
	it('line content, length', () => {
		let pieceTable = new PieceTable('abc\ndef\nghi');
	});
});


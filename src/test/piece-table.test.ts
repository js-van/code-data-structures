import { PieceTable } from '../piece-table';
import { IPosition, Position } from '../position';
import { randomInt, randomStr } from '../util';

describe('random is unsupervised', () => {
	it('random insert delete', () => {
		let str = '';
		let pt = new PieceTable(str);
		
		let output = '';
		for (let i = 0; i < 1000; i++) {
			if (Math.random() < .6) {
				// insert
				let text = randomStr(100);
				let pos = randomInt(str.length + 1);
				pt.insert(text, pos);
				
				output += `pieceTable.insert('${text.replace(/\n/g, '\\n')}', ${pos})\n`;
				output += `str = str.substring(0, ${pos}) + '${text.replace(/\n/g, '\\n')}' + str.substring(${pos})\n`;
				
				str = str.substring(0, pos) + text + str.substring(pos);
			} else {
				// delete
				let pos = randomInt(str.length);
				let length = Math.min(str.length - pos, Math.floor(Math.random() * 10))
				let deletedText = str.substr(pos, length);
				pt.delete(pos, length);
				
				output += `pieceTable.delete(${pos}, ${length})\n`;
				output += `str = str.substring(0, ${pos}) + str.substring(${pos} + ${length});\n`
				
				str = str.substring(0, pos) + str.substring(pos + length);
			}
		}
		
		// console.log(output);
		
		expect(pt.getLinesContent()).toBe(str);

		let lineFeedIndex = -1;
		let lastLineFeedIndex = -1;
		let lineCnt = 1;
		
		while ((lineFeedIndex = str.indexOf('\n', lineFeedIndex + 1)) !== -1) {
			if (lineFeedIndex + 1 === str.length) {
				// last line feed
				break;
			}
			
			lineCnt += 1;
			expect(pt.getPositionAt(lineFeedIndex + 1)).toEqual(new Position(lineCnt, 1));
			expect(pt.getOffsetAt(new Position(lineCnt, 1))).toEqual(lineFeedIndex + 1);
		}
		
		let lines = str.split('\n');
		expect(pt.getLineCount()).toBe(lines.length);
		for (let i = 0; i < lines.length; i++) {
			expect(pt.getLineContent(i + 1)).toEqual(lines[i] + (i === lines.length - 1 ? '' : '\n'));
			expect(pt.getValueInRange({startLineNumber: i + 1, startColumn: 1, endLineNumber: i + 1, endColumn: lines[i].length + (i === lines.length - 1 ? 1 : 2)})).toEqual(lines[i] + (i === lines.length - 1 ? '' : '\n'));
		}
	});
});

describe('inserts and deletes', () => {
	it('basic insert/delete', () => {
		let pieceTable = new PieceTable('This is a document with some text.');

		pieceTable.insert('This is some more text to insert at offset 34.', 34);
		expect(pieceTable.getLinesContent()).toBe('This is a document with some text.This is some more text to insert at offset 34.')
		pieceTable.delete(42, 5);
		expect(pieceTable.getLinesContent()).toBe('This is a document with some text.This is more text to insert at offset 34.')
	});

	it('more inserts', () => {
		let pt = new PieceTable('');

		pt.insert('AAA', 0);
		expect(pt.getLinesContent()).toBe('AAA');

		pt.insert('BBB', 0);
		expect(pt.getLinesContent()).toBe('BBBAAA');

		pt.insert('CCC', 6);
		expect(pt.getLinesContent()).toBe('BBBAAACCC');

		pt.insert('DDD', 5);
		expect(pt.getLinesContent()).toBe('BBBAADDDACCC');
	});

	it('more deletes', () => {
		let pt = new PieceTable('012345678');

		pt.delete(8, 1);
		expect(pt.getLinesContent()).toBe('01234567');

		pt.delete(0, 1);
		expect(pt.getLinesContent()).toBe('1234567');

		pt.delete(5, 1);
		expect(pt.getLinesContent()).toBe('123457');

		pt.delete(5, 1);
		expect(pt.getLinesContent()).toBe('12345');

		pt.delete(0, 5);
		expect(pt.getLinesContent()).toBe('');
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
		
		expect(pieceTable.getLinesContent()).toBe('a\nb\nc\ndh\ni\njk')
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
		
		expect(pieceTable.getLinesContent()).toBe('a\nb\nc\ndh\ni\njk')
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
		
		expect(pieceTable.getLinesContent()).toEqual(str);
		
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
		
		expect(pieceTable.getLinesContent()).toEqual(str);
		
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
	
	it('delete random bug 1: I forgot to update the lineFeedCnt when deletion is on one single piece.', () => {
		let pt = new PieceTable('');
		pt.insert('ba\na\nca\nba\ncbab\ncaa ', 0);
		pt.insert('cca\naabb\ncac\nccc\nab ', 13);
		pt.delete(5, 8);
		pt.delete(30, 2);
		pt.insert('cbbacccbac\nbaaab\n\nc ', 24);
		pt.delete(29, 3);
		pt.delete(23, 9);
		pt.delete(21, 5);
		pt.delete(30, 3);
		pt.insert('cb\nac\nc\n\nacc\nbb\nb\nc ', 3);
		pt.delete(19, 5);
		pt.insert('\nbb\n\nacbc\ncbb\nc\nbb\n ', 18);
		pt.insert('cbccbac\nbc\n\nccabba\n ', 65);
		pt.insert('a\ncacb\n\nac\n\n\n\n\nabab ', 77);
		pt.delete(30, 9);
		pt.insert('b\n\nc\nba\n\nbbbba\n\naa\n ', 45);
		pt.insert('ab\nbb\ncabacab\ncbc\na ', 82);
		pt.delete(123, 9);
		pt.delete(71, 2);
		pt.insert('acaa\nacb\n\naa\n\nc\n\n\n\n ', 33);
		
		let str = pt.getLinesContent();
		let lineFeedIndex = -1;
		let lastLineFeedIndex = -1;
		let lineCnt = 1;
		
		while ((lineFeedIndex = str.indexOf('\n', lineFeedIndex + 1)) !== -1) {
			if (lineFeedIndex + 1 === str.length) {
				// last line feed
				break;
			}
			
			lineCnt += 1;
			expect(pt.getPositionAt(lineFeedIndex + 1)).toEqual(new Position(lineCnt, 1));
			expect(pt.getOffsetAt(new Position(lineCnt, 1))).toEqual(lineFeedIndex + 1);
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
	
	it('get line content', () => {
		let pieceTable = new PieceTable('1');
		
		expect(pieceTable.getLineContent(1)).toBe('1');
		pieceTable.insert('2', 1);
		expect(pieceTable.getLineContent(1)).toBe('12');
	});
	
	it('get line content basic', () => {
		let pieceTable = new PieceTable('1\n2\n3\n4');
		
		expect(pieceTable.getLineContent(1)).toBe('1\n');
		expect(pieceTable.getLineContent(2)).toBe('2\n');
		expect(pieceTable.getLineContent(3)).toBe('3\n');
		expect(pieceTable.getLineContent(4)).toBe('4');
	});
	
	it('get line content after inserts/deletes', () => {
		let pieceTable = new PieceTable('a\nb\nc\nde');
		pieceTable.insert('fh\ni\njk', 8);
		pieceTable.delete(7, 2);
		// 'a\nb\nc\ndh\ni\njk'
		
		expect(pieceTable.getLineContent(1)).toBe('a\n');
		expect(pieceTable.getLineContent(2)).toBe('b\n');
		expect(pieceTable.getLineContent(3)).toBe('c\n');
		expect(pieceTable.getLineContent(4)).toBe('dh\n');
		expect(pieceTable.getLineContent(5)).toBe('i\n');
		expect(pieceTable.getLineContent(6)).toBe('jk');
	});
	
	it('random 1', () => {
		let str = '';
		let pieceTable = new PieceTable('');
				
		pieceTable.insert('J eNnDzQpnlWyjmUu\ny ', 0)
		str = str.substring(0, 0) + 'J eNnDzQpnlWyjmUu\ny ' + str.substring(0)
		pieceTable.insert('QPEeRAQmRwlJqtZSWhQ ', 0)
		str = str.substring(0, 0) + 'QPEeRAQmRwlJqtZSWhQ ' + str.substring(0)
		pieceTable.delete(5, 1)
		str = str.substring(0, 5) + str.substring(5 + 1);
		
		let lines = str.split('\n');
		expect(pieceTable.getLineCount()).toBe(lines.length);
		for (let i = 0; i < lines.length; i++) {
			expect(pieceTable.getLineContent(i + 1)).toEqual(lines[i] + (i === lines.length - 1 ? '' : '\n'));
		}
	});
	
	it('random 2', () => {
		let str = '';
		let pieceTable = new PieceTable('');
		pieceTable.insert('DZoQ tglPCRHMltejRI ', 0)
		str = str.substring(0, 0) + 'DZoQ tglPCRHMltejRI ' + str.substring(0)
		pieceTable.insert('JRXiyYqJ qqdcmbfkKX ', 10)
		str = str.substring(0, 10) + 'JRXiyYqJ qqdcmbfkKX ' + str.substring(10)
		pieceTable.delete(16, 3)
		str = str.substring(0, 16) + str.substring(16 + 3);
		pieceTable.delete(25, 1)
		str = str.substring(0, 25) + str.substring(25 + 1);
		pieceTable.insert('vH\nNlvfqQJPm\nSFkhMc ', 18)
		str = str.substring(0, 18) + 'vH\nNlvfqQJPm\nSFkhMc ' + str.substring(18);
		
		let lines = str.split('\n');
		expect(pieceTable.getLineCount()).toBe(lines.length);
		for (let i = 0; i < lines.length; i++) {
			expect(pieceTable.getLineContent(i + 1)).toEqual(lines[i] + (i === lines.length - 1 ? '' : '\n'));
		}
	})
	
	it('getContentInRange', () => {
		let pieceTable = new PieceTable('a\nb\nc\nde');
		pieceTable.insert('fh\ni\njk', 8);
		pieceTable.delete(7, 2);
		// 'a\nb\nc\ndh\ni\njk'
		
		expect(pieceTable.getValueInRange({ startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 3})).toBe('a\n');
		expect(pieceTable.getValueInRange({ startLineNumber: 2, startColumn: 1, endLineNumber: 2, endColumn: 3})).toBe('b\n');
		expect(pieceTable.getValueInRange({ startLineNumber: 3, startColumn: 1, endLineNumber: 3, endColumn: 3})).toBe('c\n');
		expect(pieceTable.getValueInRange({ startLineNumber: 4, startColumn: 1, endLineNumber: 4, endColumn: 4})).toBe('dh\n');
		expect(pieceTable.getValueInRange({ startLineNumber: 5, startColumn: 1, endLineNumber: 5, endColumn: 3})).toBe('i\n');
		expect(pieceTable.getValueInRange({ startLineNumber: 6, startColumn: 1, endLineNumber: 6, endColumn: 3})).toBe('jk');
	});
	
	it('random tests bug 1', () => {
		let str = '';
		let pieceTable = new PieceTable('');
		pieceTable.insert('huuyYzUfKOENwGgZLqn ', 0)
		str = str.substring(0, 0) + 'huuyYzUfKOENwGgZLqn ' + str.substring(0)
		pieceTable.delete(18, 2)
		str = str.substring(0, 18) + str.substring(18 + 2);
		pieceTable.delete(3, 1)
		str = str.substring(0, 3) + str.substring(3 + 1);
		pieceTable.delete(12, 4)
		str = str.substring(0, 12) + str.substring(12 + 4);
		pieceTable.insert('hMbnVEdTSdhLlPevXKF ', 3)
		str = str.substring(0, 3) + 'hMbnVEdTSdhLlPevXKF ' + str.substring(3)
		pieceTable.delete(22, 8)
		str = str.substring(0, 22) + str.substring(22 + 8);
		pieceTable.insert('S umSnYrqOmOAV\nEbZJ ', 4)
		str = str.substring(0, 4) + 'S umSnYrqOmOAV\nEbZJ ' + str.substring(4)
		
		let lines = str.split('\n');
		for (let i = 0; i < lines.length; i++) {
			expect(pieceTable.getValueInRange({startLineNumber: i + 1, startColumn: 1, endLineNumber: i + 1, endColumn: lines[i].length + (i === lines.length - 1 ? 1 : 2)})).toEqual(lines[i] + (i === lines.length - 1 ? '' : '\n'));
		}
	});
	
	it('random tests bug 2', () => {
		let str = '';
		let pieceTable = new PieceTable('');
		pieceTable.insert('xfouRDZwdAHjVXJAMV\n ', 0)
		str = str.substring(0, 0) + 'xfouRDZwdAHjVXJAMV\n ' + str.substring(0)
		pieceTable.insert('dBGndxpFZBEAIKykYYx ', 16)
		str = str.substring(0, 16) + 'dBGndxpFZBEAIKykYYx ' + str.substring(16)
		pieceTable.delete(7, 6)
		str = str.substring(0, 7) + str.substring(7 + 6);
		pieceTable.delete(9, 7)
		str = str.substring(0, 9) + str.substring(9 + 7);
		pieceTable.delete(17, 6)
		str = str.substring(0, 17) + str.substring(17 + 6);
		pieceTable.delete(0, 4)
		str = str.substring(0, 0) + str.substring(0 + 4);
		pieceTable.insert('qvEFXCNvVkWgvykahYt ', 9)
		str = str.substring(0, 9) + 'qvEFXCNvVkWgvykahYt ' + str.substring(9)
		pieceTable.delete(4, 6)
		str = str.substring(0, 4) + str.substring(4 + 6);
		pieceTable.insert('OcSChUYT\nzPEBOpsGmR ', 11)
		str = str.substring(0, 11) + 'OcSChUYT\nzPEBOpsGmR ' + str.substring(11)
		pieceTable.insert('KJCozaXTvkE\nxnqAeTz ', 15)
		str = str.substring(0, 15) + 'KJCozaXTvkE\nxnqAeTz ' + str.substring(15)
		
		let lines = str.split('\n');
		for (let i = 0; i < lines.length; i++) {
			expect(pieceTable.getValueInRange({startLineNumber: i + 1, startColumn: 1, endLineNumber: i + 1, endColumn: lines[i].length + (i === lines.length - 1 ? 1 : 2)})).toEqual(lines[i] + (i === lines.length - 1 ? '' : '\n'));
		}
	});
});

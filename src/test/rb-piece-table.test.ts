import { RBTree as PieceTable, SENTINEL, error } from '../rbTree';
import { IPosition, Position } from '../position';
import { randomInt, randomStr } from '../util';

describe('inserts and deletes', () => {
	it('basic insert/delete', () => {
		let pieceTable = new PieceTable('This is a document with some text.');

		pieceTable.insert('This is some more text to insert at offset 34.', 34);
		expect(pieceTable.getLinesContent()).toBe('This is a document with some text.This is some more text to insert at offset 34.')
		pieceTable.delete(42, 5);
		expect(pieceTable.getLinesContent()).toBe('This is a document with some text.This is more text to insert at offset 34.');
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

	it('random test 1', () => {
		let str = '';
		let pieceTable = new PieceTable('');
		pieceTable.insert('ceLPHmFzvCtFeHkCBej ', 0)
		str = str.substring(0, 0) + 'ceLPHmFzvCtFeHkCBej ' + str.substring(0)
		expect(pieceTable.getLinesContent()).toEqual(str);
		pieceTable.insert('gDCEfNYiBUNkSwtvB K ', 8)
		str = str.substring(0, 8) + 'gDCEfNYiBUNkSwtvB K ' + str.substring(8)
		expect(pieceTable.getLinesContent()).toEqual(str);
		pieceTable.insert('cyNcHxjNPPoehBJldLS ', 38)
		str = str.substring(0, 38) + 'cyNcHxjNPPoehBJldLS ' + str.substring(38)
		expect(pieceTable.getLinesContent()).toEqual(str);
		pieceTable.insert('ejMx\nOTgWlbpeDExjOk ', 59)
		str = str.substring(0, 59) + 'ejMx\nOTgWlbpeDExjOk ' + str.substring(59)

		expect(pieceTable.getLinesContent()).toEqual(str);
	})

	it('random test 2', () => {
		let str = ''
		let pieceTable = new PieceTable('')
		pieceTable.insert('VgPG ', 0)
		str = str.substring(0, 0) + 'VgPG ' + str.substring(0)
		pieceTable.insert('DdWF ', 2)
		str = str.substring(0, 2) + 'DdWF ' + str.substring(2)
		pieceTable.insert('hUJc ', 0)
		str = str.substring(0, 0) + 'hUJc ' + str.substring(0)
		pieceTable.insert('lQEq ', 8)
		str = str.substring(0, 8) + 'lQEq ' + str.substring(8)
		pieceTable.insert('Gbtp ', 10)
		str = str.substring(0, 10) + 'Gbtp ' + str.substring(10);


		expect(pieceTable.getLinesContent()).toEqual(str);
	})

	it('random test 3', () => {
		let str = ''
		let pieceTable = new PieceTable('')
		pieceTable.insert('gYSz', 0)
		str = str.substring(0, 0) + 'gYSz' + str.substring(0)
		pieceTable.insert('mDQe', 1)
		str = str.substring(0, 1) + 'mDQe' + str.substring(1)
		pieceTable.insert('DTMQ', 1)
		str = str.substring(0, 1) + 'DTMQ' + str.substring(1)
		pieceTable.insert('GGZB', 2)
		str = str.substring(0, 2) + 'GGZB' + str.substring(2)
		pieceTable.insert('wXpq', 12)
		str = str.substring(0, 12) + 'wXpq' + str.substring(12)

	})

	it('random delete 1', () => {
		let str = ''
		let pieceTable = new PieceTable('')

		pieceTable.insert('vfb', 0)
		str = str.substring(0, 0) + 'vfb' + str.substring(0)
		expect(pieceTable.getLinesContent()).toEqual(str);
		pieceTable.insert('zRq', 0)
		str = str.substring(0, 0) + 'zRq' + str.substring(0)
		expect(pieceTable.getLinesContent()).toEqual(str);

		pieceTable.delete(5, 1)
		str = str.substring(0, 5) + str.substring(5 + 1);
		expect(pieceTable.getLinesContent()).toEqual(str);

		pieceTable.insert('UNw', 1)
		str = str.substring(0, 1) + 'UNw' + str.substring(1)
		expect(pieceTable.getLinesContent()).toEqual(str);

		pieceTable.delete(4, 3)
		str = str.substring(0, 4) + str.substring(4 + 3);
		expect(pieceTable.getLinesContent()).toEqual(str);

		pieceTable.delete(1, 4)
		str = str.substring(0, 1) + str.substring(1 + 4);
		expect(pieceTable.getLinesContent()).toEqual(str);

		pieceTable.delete(0, 1)
		str = str.substring(0, 0) + str.substring(0 + 1);
		expect(pieceTable.getLinesContent()).toEqual(str);
	})

	it('random delete 2', () => {
		let str = ''
		let pieceTable = new PieceTable('')

		pieceTable.insert('IDT', 0)
		str = str.substring(0, 0) + 'IDT' + str.substring(0)
		pieceTable.insert('wwA', 3)
		str = str.substring(0, 3) + 'wwA' + str.substring(3)
		pieceTable.insert('Gnr', 3)
		str = str.substring(0, 3) + 'Gnr' + str.substring(3)
		pieceTable.delete(6, 3)
		str = str.substring(0, 6) + str.substring(6 + 3)
		pieceTable.insert('eHp', 4)
		str = str.substring(0, 4) + 'eHp' + str.substring(4)
		pieceTable.insert('UAi', 1)
		str = str.substring(0, 1) + 'UAi' + str.substring(1)
		pieceTable.insert('FrR', 2)
		str = str.substring(0, 2) + 'FrR' + str.substring(2)
		pieceTable.delete(6, 7)
		str = str.substring(0, 6) + str.substring(6 + 7)
		pieceTable.delete(3, 5)
		str = str.substring(0, 3) + str.substring(3 + 5)
	})

	it('random delete 3', () => {
		let str = ''
		let pieceTable = new PieceTable('')
		pieceTable.insert('PqM', 0)
		str = str.substring(0, 0) + 'PqM' + str.substring(0)
		pieceTable.delete(1, 2)
		str = str.substring(0, 1) + str.substring(1 + 2);
		pieceTable.insert('zLc', 1)
		str = str.substring(0, 1) + 'zLc' + str.substring(1)
		pieceTable.insert('MEX', 0)
		str = str.substring(0, 0) + 'MEX' + str.substring(0)
		pieceTable.insert('jZh', 0)
		str = str.substring(0, 0) + 'jZh' + str.substring(0)
		pieceTable.insert('GwQ', 8)
		str = str.substring(0, 8) + 'GwQ' + str.substring(8)
		pieceTable.delete(5, 6)
		str = str.substring(0, 5) + str.substring(5 + 6);
		pieceTable.insert('ktw', 4)
		str = str.substring(0, 4) + 'ktw' + str.substring(4)
		pieceTable.insert('GVu', 5)
		str = str.substring(0, 5) + 'GVu' + str.substring(5)
		pieceTable.insert('jdm', 9)
		str = str.substring(0, 9) + 'jdm' + str.substring(9)
		pieceTable.insert('na\n', 15)
		str = str.substring(0, 15) + 'na\n' + str.substring(15)
		pieceTable.delete(5, 8)
		str = str.substring(0, 5) + str.substring(5 + 8);
		pieceTable.delete(3, 4)
		str = str.substring(0, 3) + str.substring(3 + 4);
	});

	it('random delete 4', () => {
		let str = ''
		let pieceTable = new PieceTable('')
		pieceTable.insert('CbB', 0)
		str = str.substring(0, 0) + 'CbB' + str.substring(0)
		pieceTable.insert('GEQ', 3)
		str = str.substring(0, 3) + 'GEQ' + str.substring(3)
		pieceTable.delete(1, 1)
		str = str.substring(0, 1) + str.substring(1 + 1);
		pieceTable.delete(1, 4)
		str = str.substring(0, 1) + str.substring(1 + 4);
		pieceTable.delete(0, 1)
		str = str.substring(0, 0) + str.substring(0 + 1);
		pieceTable.insert('qwt', 0)
		str = str.substring(0, 0) + 'qwt' + str.substring(0)
		pieceTable.insert('hnM', 0)
		str = str.substring(0, 0) + 'hnM' + str.substring(0)
		pieceTable.delete(5, 1)
		str = str.substring(0, 5) + str.substring(5 + 1);
		pieceTable.insert('PiR', 1)
		str = str.substring(0, 1) + 'PiR' + str.substring(1)
		pieceTable.insert('RJe', 6)
		str = str.substring(0, 6) + 'RJe' + str.substring(6)
		pieceTable.insert('pnx', 8)
		str = str.substring(0, 8) + 'pnx' + str.substring(8)
		pieceTable.insert('HDn', 7)
		str = str.substring(0, 7) + 'HDn' + str.substring(7)
		pieceTable.delete(7, 6)
		str = str.substring(0, 7) + str.substring(7 + 6);
	});

	it('random delete 5', () => {
		let str = ''
		let pieceTable = new PieceTable('')
		pieceTable.insert('BZW', 0)
		str = str.substring(0, 0) + 'BZW' + str.substring(0)
		pieceTable.insert('Vsm', 0)
		str = str.substring(0, 0) + 'Vsm' + str.substring(0)
		pieceTable.insert('Jjv', 6)
		str = str.substring(0, 6) + 'Jjv' + str.substring(6)
		pieceTable.delete(6, 3)
		str = str.substring(0, 6) + str.substring(6 + 3);
	})

	it('random delete 6', () => {
		let str = ''
		let pieceTable = new PieceTable('')
		pieceTable.insert('YXa', 0)
		str = str.substring(0, 0) + 'YXa' + str.substring(0)
		pieceTable.insert('\nJo', 1)
		str = str.substring(0, 1) + '\nJo' + str.substring(1)
		pieceTable.delete(0, 6)
		str = str.substring(0, 0) + str.substring(0 + 6);
		pieceTable.insert('nSq', 0)
		str = str.substring(0, 0) + 'nSq' + str.substring(0)
		pieceTable.insert('pjG', 2)
		str = str.substring(0, 2) + 'pjG' + str.substring(2)
		pieceTable.delete(3, 3)
		str = str.substring(0, 3) + str.substring(3 + 3);
		pieceTable.insert('EgW', 0)
		str = str.substring(0, 0) + 'EgW' + str.substring(0)
		pieceTable.delete(2, 2)
		str = str.substring(0, 2) + str.substring(2 + 2);
	})

	it('random delete 7', () => {
		let str = 'a'
		let pieceTable = new PieceTable('a')
		pieceTable.delete(0, 1)
		str = str.substring(0, 0) + str.substring(0 + 1);
		pieceTable.insert('BjR', 0)
		str = str.substring(0, 0) + 'BjR' + str.substring(0)
		pieceTable.insert('faE', 0)
		str = str.substring(0, 0) + 'faE' + str.substring(0)
		pieceTable.insert('nle', 2)
		str = str.substring(0, 2) + 'nle' + str.substring(2)
		pieceTable.delete(2, 2)
		str = str.substring(0, 2) + str.substring(2 + 2);
		pieceTable.delete(2, 1)
		str = str.substring(0, 2) + str.substring(2 + 1);
		pieceTable.insert('KpP', 1)
		str = str.substring(0, 1) + 'KpP' + str.substring(1)
		pieceTable.insert('TnV', 1)
		str = str.substring(0, 1) + 'TnV' + str.substring(1)
		pieceTable.insert('omQ', 0)
		str = str.substring(0, 0) + 'omQ' + str.substring(0)
		pieceTable.delete(1, 8)
		str = str.substring(0, 1) + str.substring(1 + 8);
		pieceTable.insert('QLx', 6)
		str = str.substring(0, 6) + 'QLx' + str.substring(6)
		pieceTable.delete(6, 4)
		str = str.substring(0, 6) + str.substring(6 + 4);
		pieceTable.delete(2, 1)
		str = str.substring(0, 2) + str.substring(2 + 1);
		pieceTable.delete(0, 3)
		str = str.substring(0, 0) + str.substring(0 + 3);
	})

	it('random delete 8', () => {
		let str = 'a'
		let pieceTable = new PieceTable('a')
		pieceTable.insert('VaSE', 0)
		str = str.substring(0, 0) + 'VaSE' + str.substring(0)
		pieceTable.insert('FLnv', 4)
		str = str.substring(0, 4) + 'FLnv' + str.substring(4)
		pieceTable.insert('S\nhI', 0)
		str = str.substring(0, 0) + 'S\nhI' + str.substring(0)
		pieceTable.insert('KEsg', 13)
		str = str.substring(0, 13) + 'KEsg' + str.substring(13)
		pieceTable.delete(14, 3)
		str = str.substring(0, 14) + str.substring(14 + 3);
		pieceTable.insert('lnwj', 4)
		str = str.substring(0, 4) + 'lnwj' + str.substring(4)
		pieceTable.insert('AzBm', 13)
		str = str.substring(0, 13) + 'AzBm' + str.substring(13)
		pieceTable.insert('ZXwY', 1)
		str = str.substring(0, 1) + 'ZXwY' + str.substring(1)
		pieceTable.insert('JEA\n', 11)
		str = str.substring(0, 11) + 'JEA\n' + str.substring(11)
		pieceTable.insert('BmjS', 19)
		str = str.substring(0, 19) + 'BmjS' + str.substring(19)
		pieceTable.insert('jMLD', 6)
		str = str.substring(0, 6) + 'jMLD' + str.substring(6)
		pieceTable.insert('WMyJ', 0)
		str = str.substring(0, 0) + 'WMyJ' + str.substring(0)
		pieceTable.insert('YdPZ', 26)
		str = str.substring(0, 26) + 'YdPZ' + str.substring(26)
		pieceTable.insert('QcUZ', 45)
		str = str.substring(0, 45) + 'QcUZ' + str.substring(45)
		pieceTable.delete(7, 8)
		str = str.substring(0, 7) + str.substring(7 + 8);
		pieceTable.delete(13, 3)
		str = str.substring(0, 13) + str.substring(13 + 3);
	})
	
	it('random delete', () => {
		let str = 'a';
		let pieceTable = new PieceTable(str);
		
		pieceTable.insert('uxqA', 1)
		str = str.substring(0, 1) + 'uxqA' + str.substring(1)
		pieceTable.insert('SObT', 3)
		str = str.substring(0, 3) + 'SObT' + str.substring(3)
		pieceTable.insert('qLRd', 8)
		str = str.substring(0, 8) + 'qLRd' + str.substring(8)
		pieceTable.insert('AzGb', 13)
		str = str.substring(0, 13) + 'AzGb' + str.substring(13)
		pieceTable.insert('bcbR', 3)
		str = str.substring(0, 3) + 'bcbR' + str.substring(3)
		pieceTable.insert('mBlL', 19)
		str = str.substring(0, 19) + 'mBlL' + str.substring(19)
		pieceTable.insert('pyLf', 4)
		str = str.substring(0, 4) + 'pyLf' + str.substring(4)
		pieceTable.insert('PzCo', 3)
		str = str.substring(0, 3) + 'PzCo' + str.substring(3)
		pieceTable.delete(30, 3)
		str = str.substring(0, 30) + str.substring(30 + 3);
		pieceTable.insert('ZbJZ', 21)
		str = str.substring(0, 21) + 'ZbJZ' + str.substring(21)
		pieceTable.insert('UCHX', 9)
		str = str.substring(0, 9) + 'UCHX' + str.substring(9)
		pieceTable.delete(6, 2)
		str = str.substring(0, 6) + str.substring(6 + 2);
	})
	it('random insert/delete', () => {
		let str = 'a';
		let pt = new PieceTable(str);

		let output = '';
		for (let i = 0; i < 10000; i++) {
			if (Math.random() < .5) {
				// insert
				let text = randomStr(100);
				let pos = randomInt(str.length + 1);
				output += `pieceTable.insert('${text.replace(/\n/g, '\\n')}', ${pos})\n`;
				output += `str = str.substring(0, ${pos}) + '${text.replace(/\n/g, '\\n')}' + str.substring(${pos})\n`;

				pt.insert(text, pos);
				str = str.substring(0, pos) + text + str.substring(pos);
			} else {
				// delete
				let pos = randomInt(str.length);
				let length = Math.min(str.length - pos, Math.floor(Math.random() * 10))
				if (length === 0) {
					continue;
				}
				let deletedText = str.substr(pos, length);
				output += `pieceTable.delete(${pos}, ${length})\n`;
				output += `str = str.substring(0, ${pos}) + str.substring(${pos} + ${length});\n`

				pt.delete(pos, length);
				str = str.substring(0, pos) + str.substring(pos + length);
			}
		}


		if (error.sizeLeft) {
			console.log(output);
		}
		expect(pt.getLinesContent()).toBe(str);
	});
});

describe('prefix sum for line feed', () => {
	it('basic', () => {
		let pieceTable = new PieceTable('1\n2\n3\n4');
		
		// expect(pieceTable.getLineCount()).toBe(4);
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
		
		// expect(pieceTable.getLineCount()).toBe(6);
		expect(pieceTable.getPositionAt(9)).toEqual(new Position(4, 4));
		
		expect(pieceTable.getOffsetAt({ lineNumber: 1, column: 1 })).toBe(0);
	});
	
	it('insert', () => {
		let pieceTable = new PieceTable('a\nb\nc\nde');
		pieceTable.insert('fh\ni\njk', 7);
		
		// expect(pieceTable.getLineCount()).toBe(6);
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
		// expect(pieceTable.getLineCount()).toBe(6);
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
		// expect(pieceTable.getLineCount()).toBe(6);
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
	
	
	it('delete random bug rb tree 1', () => {
		let str = '';
		let pieceTable = new PieceTable(str);
		pieceTable.insert('YXXZ\n\nYY\n', 0)
		str = str.substring(0, 0) + 'YXXZ\n\nYY\n' + str.substring(0)
		pieceTable.delete(0, 5)
		str = str.substring(0, 0) + str.substring(0 + 5);
		pieceTable.insert('ZXYY\nX\nZ\n', 0)
		str = str.substring(0, 0) + 'ZXYY\nX\nZ\n' + str.substring(0)
		pieceTable.insert('\nXY\nYXYXY', 10)
		str = str.substring(0, 10) + '\nXY\nYXYXY' + str.substring(10)
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
	
	it('delete random bug rb tree 2', () => {
		let str = '';
		let pieceTable = new PieceTable(str);
		pieceTable.insert('YXXZ\n\nYY\n', 0)
		str = str.substring(0, 0) + 'YXXZ\n\nYY\n' + str.substring(0)
		// pieceTable.delete(7, 2)
		// str = str.substring(0, 7) + str.substring(7 + 2);
		// pieceTable.delete(6, 1)
		// str = str.substring(0, 6) + str.substring(6 + 1);
		// pieceTable.delete(0, 5)
		// str = str.substring(0, 0) + str.substring(0 + 5);
		pieceTable.insert('ZXYY\nX\nZ\n', 0)
		str = str.substring(0, 0) + 'ZXYY\nX\nZ\n' + str.substring(0)
		pieceTable.insert('\nXY\nYXYXY', 10)
		str = str.substring(0, 10) + '\nXY\nYXYXY' + str.substring(10)
		pieceTable.insert('YZXY\nZ\nYX', 8)
		str = str.substring(0, 8) + 'YZXY\nZ\nYX' + str.substring(8)
		pieceTable.insert('XX\nXXYXYZ', 12)
		str = str.substring(0, 12) + 'XX\nXXYXYZ' + str.substring(12)
		pieceTable.delete(0, 4)
		str = str.substring(0, 0) + str.substring(0 + 4);
		// pieceTable.delete(30, 3)
		// str = str.substring(0, 30) + str.substring(30 + 3);
		
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
	
	it('delete random bug rb tree 3', () => {
		let str = '';
		let pieceTable = new PieceTable(str);
		pieceTable.insert('YXXZ\n\nYY\n', 0)
		str = str.substring(0, 0) + 'YXXZ\n\nYY\n' + str.substring(0)
		pieceTable.delete(7, 2)
		str = str.substring(0, 7) + str.substring(7 + 2);
		pieceTable.delete(6, 1)
		str = str.substring(0, 6) + str.substring(6 + 1);
		pieceTable.delete(0, 5)
		str = str.substring(0, 0) + str.substring(0 + 5);
		pieceTable.insert('ZXYY\nX\nZ\n', 0)
		str = str.substring(0, 0) + 'ZXYY\nX\nZ\n' + str.substring(0)
		pieceTable.insert('\nXY\nYXYXY', 10)
		str = str.substring(0, 10) + '\nXY\nYXYXY' + str.substring(10)
		pieceTable.insert('YZXY\nZ\nYX', 8)
		str = str.substring(0, 8) + 'YZXY\nZ\nYX' + str.substring(8)
		pieceTable.insert('XX\nXXYXYZ', 12)
		str = str.substring(0, 12) + 'XX\nXXYXYZ' + str.substring(12)
		pieceTable.delete(0, 4)
		str = str.substring(0, 0) + str.substring(0 + 4);
		pieceTable.delete(30, 3)
		str = str.substring(0, 30) + str.substring(30 + 3);
		
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

describe('random is unsupervised', () => {
	it('random insert delete', () => {
		let str = '';
		let pt = new PieceTable(str);
		
		let output = '';
		for (let i = 0; i < 1000; i++) {
			if (Math.random() < .5) {
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
		
		// let lines = str.split('\n');
		// expect(pt.getLineCount()).toBe(lines.length);
		// for (let i = 0; i < lines.length; i++) {
		// 	expect(pt.getLineContent(i + 1)).toEqual(lines[i] + (i === lines.length - 1 ? '' : '\n'));
		// 	expect(pt.getValueInRange({startLineNumber: i + 1, startColumn: 1, endLineNumber: i + 1, endColumn: lines[i].length + (i === lines.length - 1 ? 1 : 2)})).toEqual(lines[i] + (i === lines.length - 1 ? '' : '\n'));
		// }
	});
});
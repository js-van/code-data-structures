import { RBTree as PieceTable } from '../rbTree';
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
	
	it('random insert/delete', () => {
		let str = '';
		let pt = new PieceTable(str);
		
		let output = '';
		for (let i = 0; i < 1000; i++) {
			if (Math.random() < 0.5) {
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
});
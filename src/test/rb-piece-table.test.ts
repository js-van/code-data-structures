import { TextBuffer as PieceTable, SENTINEL, error } from '../rbTree';
import { IPosition, Position } from '../position';
import { randomInt, randomStr } from '../util';

function trimLineFeed(text: string): string {
	if (text.length === 0) {
		return text;
	}
	
	if (text.length === 1) {
		if (text.charCodeAt(text.length - 1) === 10 || text.charCodeAt(text.length - 1) === 13) {
			return '';
		}
		return text;
	}
	
	if (text.charCodeAt(text.length - 1) === 10) {
		if (text.charCodeAt(text.length - 2) === 13) {
			return text.slice(0, -2);
		}
		return text.slice(0, -1);
	}
	
	if (text.charCodeAt(text.length - 1) === 13) {
		return text.slice(0, -1);
	}
	
	return text;
}

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
	
	it('random insert/delete \\r bug 1', () => {
		let str = 'a'
		let pieceTable = new PieceTable('a')
		pieceTable.delete(0, 1)
		str = str.substring(0, 0) + str.substring(0 + 1);
		pieceTable.insert('\r\r\n\n', 0)
		str = str.substring(0, 0) + '\r\r\n\n' + str.substring(0)
		pieceTable.delete(3, 1)
		str = str.substring(0, 3) + str.substring(3 + 1);
		pieceTable.insert('\n\n\ra', 2)
		str = str.substring(0, 2) + '\n\n\ra' + str.substring(2)
		pieceTable.delete(4, 3)
		str = str.substring(0, 4) + str.substring(4 + 3);
		pieceTable.insert('\na\r\r', 2)
		str = str.substring(0, 2) + '\na\r\r' + str.substring(2)
		pieceTable.insert('\ra\n\n', 6)
		str = str.substring(0, 6) + '\ra\n\n' + str.substring(6)
		pieceTable.insert('aa\n\n', 0)
		str = str.substring(0, 0) + 'aa\n\n' + str.substring(0)
		pieceTable.insert('\n\na\r', 5)
		str = str.substring(0, 5) + '\n\na\r' + str.substring(5)
		
		expect(pieceTable.getLinesContent()).toBe(str);
	})
	
	it('random insert/delete \\r bug 2', () => {
		let str = 'a'
		let pieceTable = new PieceTable('a')
		pieceTable.insert('\naa\r', 1)
		str = str.substring(0, 1) + '\naa\r' + str.substring(1)
		pieceTable.delete(0, 4)
		str = str.substring(0, 0) + str.substring(0 + 4);
		pieceTable.insert('\r\r\na', 1)
		str = str.substring(0, 1) + '\r\r\na' + str.substring(1)
		pieceTable.insert('\n\r\ra', 2)
		str = str.substring(0, 2) + '\n\r\ra' + str.substring(2)
		pieceTable.delete(4, 1)
		str = str.substring(0, 4) + str.substring(4 + 1);

		pieceTable.insert('\r\n\r\r', 8)
		str = str.substring(0, 8) + '\r\n\r\r' + str.substring(8)

		pieceTable.insert('\n\n\na', 7)
		str = str.substring(0, 7) + '\n\n\na' + str.substring(7)
		expect(pieceTable.getLinesContent()).toBe(str);

		pieceTable.insert('a\n\na', 13)
		str = str.substring(0, 13) + 'a\n\na' + str.substring(13)

		pieceTable.delete(17, 3)
		str = str.substring(0, 17) + str.substring(17 + 3);
		pieceTable.insert('a\ra\n', 2)
		str = str.substring(0, 2) + 'a\ra\n' + str.substring(2)
		
		// pieceTable.print();
		expect(pieceTable.getLinesContent()).toBe(str);
	})
	
	
	it('random insert/delete \\r bug 3', () => {
		let str = 'a'
		let pieceTable = new PieceTable('a')
		pieceTable.insert('\r\na\r', 0)
		str = str.substring(0, 0) + '\r\na\r' + str.substring(0)
		pieceTable.delete(2, 3)
		str = str.substring(0, 2) + str.substring(2 + 3);
		pieceTable.insert('a\r\n\r', 2)
		str = str.substring(0, 2) + 'a\r\n\r' + str.substring(2)
		pieceTable.delete(4, 2)
		str = str.substring(0, 4) + str.substring(4 + 2);
		
		pieceTable.insert('a\n\r\n', 4)
		str = str.substring(0, 4) + 'a\n\r\n' + str.substring(4)
		pieceTable.insert('aa\n\r', 1)
		str = str.substring(0, 1) + 'aa\n\r' + str.substring(1)
		pieceTable.insert('\na\r\n', 7)
		str = str.substring(0, 7) + '\na\r\n' + str.substring(7)
		pieceTable.insert('\n\na\r', 5)
		str = str.substring(0, 5) + '\n\na\r' + str.substring(5)
		pieceTable.insert('\r\r\n\r', 10)
		str = str.substring(0, 10) + '\r\r\n\r' + str.substring(10)
		expect(pieceTable.getLinesContent()).toBe(str);
		pieceTable.delete(21, 3)
		str = str.substring(0, 21) + str.substring(21 + 3);
		
		// pieceTable.print();
		expect(pieceTable.getLinesContent()).toBe(str);
	})
	it('random insert/delete \\r bug 4s', () => {
		let str = 'a'
		let pieceTable = new PieceTable('a')
		pieceTable.delete(0, 1)
		str = str.substring(0, 0) + str.substring(0 + 1);
		pieceTable.insert('\naaa', 0)
		str = str.substring(0, 0) + '\naaa' + str.substring(0)
		pieceTable.insert('\n\naa', 2)
		str = str.substring(0, 2) + '\n\naa' + str.substring(2)
		pieceTable.delete(1, 4)
		str = str.substring(0, 1) + str.substring(1 + 4);
		pieceTable.delete(3, 1)
		str = str.substring(0, 3) + str.substring(3 + 1);
		pieceTable.delete(1, 2)
		str = str.substring(0, 1) + str.substring(1 + 2);
		pieceTable.delete(0, 1)
		str = str.substring(0, 0) + str.substring(0 + 1);
		pieceTable.insert('a\n\n\r', 0)
		str = str.substring(0, 0) + 'a\n\n\r' + str.substring(0)
		pieceTable.insert('aa\r\n', 2)
		str = str.substring(0, 2) + 'aa\r\n' + str.substring(2)
		pieceTable.insert('a\naa', 3)
		str = str.substring(0, 3) + 'a\naa' + str.substring(3)
		
		// pieceTable.print();
		expect(pieceTable.getLinesContent()).toBe(str);
	})
	it('random insert/delete \\r bug 5', () => {
		let str = '';
		let pieceTable = new PieceTable('')
		pieceTable.insert('\n\n\n\r', 0)
		str = str.substring(0, 0) + '\n\n\n\r' + str.substring(0)
		pieceTable.insert('\n\n\n\r', 1)
		str = str.substring(0, 1) + '\n\n\n\r' + str.substring(1)
		pieceTable.insert('\n\r\r\r', 2)
		str = str.substring(0, 2) + '\n\r\r\r' + str.substring(2)
		pieceTable.insert('\n\r\n\r', 8)
		str = str.substring(0, 8) + '\n\r\n\r' + str.substring(8)
		pieceTable.delete(5, 2)
		str = str.substring(0, 5) + str.substring(5 + 2);
		
		
		pieceTable.insert('\n\r\r\r', 4)
		str = str.substring(0, 4) + '\n\r\r\r' + str.substring(4)
		pieceTable.insert('\n\n\n\r', 8)
		str = str.substring(0, 8) + '\n\n\n\r' + str.substring(8)
		pieceTable.delete(0, 7)
		str = str.substring(0, 0) + str.substring(0 + 7);
		pieceTable.insert('\r\n\r\r', 1)
		str = str.substring(0, 1) + '\r\n\r\r' + str.substring(1)
		pieceTable.insert('\n\r\r\r', 15)
		str = str.substring(0, 15) + '\n\r\r\r' + str.substring(15)
		
		expect(pieceTable.getLinesContent()).toBe(str);
	})
	
	it('random insert/delete', () => {
		let str = 'a';
		let pt = new PieceTable(str);

		let output = '';
		for (let i = 0; i < 1000; i++) {
			if (Math.random() < .5) {
				// insert
				let text = randomStr(100);
				let pos = randomInt(str.length + 1);
				output += `pieceTable.insert('${text.replace(/\n/g, '\\n').replace(/\r/g, '\\r')}', ${pos})\n`;
				output += `str = str.substring(0, ${pos}) + '${text.replace(/\n/g, '\\n').replace(/\r/g, '\\r')}' + str.substring(${pos})\n`;

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

		// console.log(output);

		expect(pt.getLinesContent()).toBe(str);
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

describe('offset 2 position', () => {
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
		
		let lineFeedIndex = -1;
		let lastLineFeedIndex = -1;
		let lineCnt = 1;
		
		expect(pieceTable.getPositionAt(0)).toEqual(new Position(1, 1));
		expect(pieceTable.getOffsetAt(new Position(1, 1))).toEqual(0);
		
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

describe('get text in range', () => {
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
	
	it('random test value in range', () => {
		let str = '';
		let pieceTable = new PieceTable(str);
		
		pieceTable.insert('ZXXY', 0)
		str = str.substring(0, 0) + 'ZXXY' + str.substring(0)
		pieceTable.insert('XZZY', 1)
		str = str.substring(0, 1) + 'XZZY' + str.substring(1)
		pieceTable.insert('\nX\n\n', 5)
		str = str.substring(0, 5) + '\nX\n\n' + str.substring(5)
		pieceTable.insert('\nXX\n', 3)
		str = str.substring(0, 3) + '\nXX\n' + str.substring(3)
		pieceTable.insert('YYYX', 12)
		str = str.substring(0, 12) + 'YYYX' + str.substring(12)

		let lines = str.split('\n');
		for (let i = 0; i < lines.length; i++) {
			expect(pieceTable.getValueInRange({startLineNumber: i + 1, startColumn: 1, endLineNumber: i + 1, endColumn: lines[i].length + (i === lines.length - 1 ? 1 : 2)})).toEqual(lines[i] + (i === lines.length - 1 ? '' : '\n'));
		}
	});
	it('random test value in range exception', () => {
		let str = '';
		let pieceTable = new PieceTable(str);
		
		pieceTable.insert('XZ\nZ', 0)
		str = str.substring(0, 0) + 'XZ\nZ' + str.substring(0)
		pieceTable.delete(0, 3)
		str = str.substring(0, 0) + str.substring(0 + 3);
		pieceTable.delete(0, 1)
		str = str.substring(0, 0) + str.substring(0 + 1);
		pieceTable.insert('ZYX\n', 0)
		str = str.substring(0, 0) + 'ZYX\n' + str.substring(0)
		pieceTable.delete(0, 4)
		str = str.substring(0, 0) + str.substring(0 + 4);

		pieceTable.getValueInRange({startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1});
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
});

describe('CRLF', () => {
	it('delete CR in CRLF', () => {
		let str = '';
		let pieceTable = new PieceTable('');
		pieceTable.insert('a\r\nb', 0)
		pieceTable.delete(0, 2);
		
		expect(pieceTable.getLineCount()).toBe(2);
	});
	
	it('delete CR in CRLF', () => {
		let str = '';
		let pieceTable = new PieceTable('');
		pieceTable.insert('a\r\nb', 0)
		pieceTable.delete(2, 2);
		
		expect(pieceTable.getLineCount()).toBe(2);
	});
	
	it('random bug 1', () => {
		let str = '';
		let pieceTable = new PieceTable('');
		pieceTable.insert('\n\n\r\r', 0)
		str = str.substring(0, 0) + '\n\n\r\r' + str.substring(0)
		pieceTable.insert('\r\n\r\n', 1)
		str = str.substring(0, 1) + '\r\n\r\n' + str.substring(1)
		pieceTable.delete(5, 3)
		str = str.substring(0, 5) + str.substring(5 + 3);
		pieceTable.delete(2, 3)
		str = str.substring(0, 2) + str.substring(2 + 3);
		
		let lines = str.split(/\r\n|\r|\n/);
		expect(pieceTable.getLineCount()).toBe(lines.length);
	});
	
	it('random bug 2', () => {
		let str = '';
		let pieceTable = new PieceTable('');
		
		pieceTable.insert('\n\r\n\r', 0)
		str = str.substring(0, 0) + '\n\r\n\r' + str.substring(0)
		pieceTable.insert('\n\r\r\r', 2)
		str = str.substring(0, 2) + '\n\r\r\r' + str.substring(2)
		pieceTable.delete(4, 1)
		str = str.substring(0, 4) + str.substring(4 + 1);
		
		let lines = str.split(/\r\n|\r|\n/);
		expect(pieceTable.getLineCount()).toBe(lines.length);
	});
	it('random bug 3', () => {
		let str = '';
		let pieceTable = new PieceTable('');
		
		pieceTable.insert('\n\n\n\r', 0)
		str = str.substring(0, 0) + '\n\n\n\r' + str.substring(0)
		pieceTable.delete(2, 2)
		str = str.substring(0, 2) + str.substring(2 + 2);
		pieceTable.delete(0, 2)
		str = str.substring(0, 0) + str.substring(0 + 2);
		pieceTable.insert('\r\r\r\r', 0)
		str = str.substring(0, 0) + '\r\r\r\r' + str.substring(0)
		pieceTable.insert('\r\n\r\r', 2)
		str = str.substring(0, 2) + '\r\n\r\r' + str.substring(2)
		pieceTable.insert('\r\r\r\n', 3)
		str = str.substring(0, 3) + '\r\r\r\n' + str.substring(3)
		
		let lines = str.split(/\r\n|\r|\n/);
		expect(pieceTable.getLineCount()).toBe(lines.length);
	});
	it('random bug 4', () => {
		let str = '';
		let pieceTable = new PieceTable('');
		
		pieceTable.insert('\n\n\n\n', 0)
		str = str.substring(0, 0) + '\n\n\n\n' + str.substring(0)
		pieceTable.delete(3, 1)
		str = str.substring(0, 3) + str.substring(3 + 1);
		pieceTable.insert('\r\r\r\r', 1)
		str = str.substring(0, 1) + '\r\r\r\r' + str.substring(1)
		pieceTable.insert('\r\n\n\r', 6)
		str = str.substring(0, 6) + '\r\n\n\r' + str.substring(6)
		pieceTable.delete(5, 3)
		str = str.substring(0, 5) + str.substring(5 + 3);
		
		let lines = str.split(/\r\n|\r|\n/);
		expect(pieceTable.getLineCount()).toBe(lines.length);
		expect(pieceTable.getLinesContent()).toBe(str);
		for (let i = 0; i < lines.length; i++) {
			expect(trimLineFeed(pieceTable.getLineContent(i + 1))).toEqual(lines[i]);
			expect(trimLineFeed(pieceTable.getValueInRange({startLineNumber: i + 1, startColumn: 1, endLineNumber: i + 1, endColumn: lines[i].length + (i === lines.length - 1 ? 1 : 2)}))).toEqual(lines[i]);
		}
	});
	it('random bug 5', () => {
		let str = '';
		let pieceTable = new PieceTable('');
		
		pieceTable.insert('\n\n\n\n', 0)
		str = str.substring(0, 0) + '\n\n\n\n' + str.substring(0)
		pieceTable.delete(3, 1)
		str = str.substring(0, 3) + str.substring(3 + 1);
		pieceTable.insert('\n\r\r\n', 0)
		str = str.substring(0, 0) + '\n\r\r\n' + str.substring(0)
		pieceTable.insert('\n\r\r\n', 4)
		str = str.substring(0, 4) + '\n\r\r\n' + str.substring(4)
		pieceTable.delete(4, 3)
		str = str.substring(0, 4) + str.substring(4 + 3);
		pieceTable.insert('\r\r\n\r', 5)
		str = str.substring(0, 5) + '\r\r\n\r' + str.substring(5)
		pieceTable.insert('\n\n\n\r', 12)
		str = str.substring(0, 12) + '\n\n\n\r' + str.substring(12)
		pieceTable.insert('\r\r\r\n', 5)
		str = str.substring(0, 5) + '\r\r\r\n' + str.substring(5)
		pieceTable.insert('\n\n\r\n', 20)
		str = str.substring(0, 20) + '\n\n\r\n' + str.substring(20)
		
		let lines = str.split(/\r\n|\r|\n/);
		expect(pieceTable.getLineCount()).toBe(lines.length);
		expect(pieceTable.getLinesContent()).toBe(str);
		for (let i = 0; i < lines.length; i++) {
			expect(trimLineFeed(pieceTable.getLineContent(i + 1))).toEqual(lines[i]);
			expect(trimLineFeed(pieceTable.getValueInRange({startLineNumber: i + 1, startColumn: 1, endLineNumber: i + 1, endColumn: lines[i].length + (i === lines.length - 1 ? 1 : 2)}))).toEqual(lines[i]);
		}
	});
	it('random bug 6', () => {
		let str = '';
		let pieceTable = new PieceTable('');
		
		pieceTable.insert('\n\r\r\n', 0)
		str = str.substring(0, 0) + '\n\r\r\n' + str.substring(0)
		pieceTable.insert('\r\n\n\r', 4)
		str = str.substring(0, 4) + '\r\n\n\r' + str.substring(4)
		pieceTable.insert('\r\n\n\n', 3)
		str = str.substring(0, 3) + '\r\n\n\n' + str.substring(3)
		pieceTable.delete(4, 8)
		str = str.substring(0, 4) + str.substring(4 + 8);
		pieceTable.insert('\r\n\n\r', 4)
		str = str.substring(0, 4) + '\r\n\n\r' + str.substring(4)
		pieceTable.insert('\r\n\n\r', 0)
		str = str.substring(0, 0) + '\r\n\n\r' + str.substring(0)
		pieceTable.delete(4, 0)
		str = str.substring(0, 4) + str.substring(4 + 0);
		pieceTable.delete(8, 4)
		str = str.substring(0, 8) + str.substring(8 + 4);
		
		let lines = str.split(/\r\n|\r|\n/);
		expect(pieceTable.getLineCount()).toBe(lines.length);
		expect(pieceTable.getLinesContent()).toBe(str);
		for (let i = 0; i < lines.length; i++) {
			expect(trimLineFeed(pieceTable.getLineContent(i + 1))).toEqual(lines[i]);
			expect(trimLineFeed(pieceTable.getValueInRange({startLineNumber: i + 1, startColumn: 1, endLineNumber: i + 1, endColumn: lines[i].length + (i === lines.length - 1 ? 1 : 2)}))).toEqual(lines[i]);
		}
	});
	it('random bug 8', () => {
		let str = '';
		let pieceTable = new PieceTable('');
		
		pieceTable.insert('\r\n\n\r', 0)
		str = str.substring(0, 0) + '\r\n\n\r' + str.substring(0)
		pieceTable.delete(1, 0)
		str = str.substring(0, 1) + str.substring(1 + 0);
		pieceTable.insert('\n\n\n\r', 3)
		str = str.substring(0, 3) + '\n\n\n\r' + str.substring(3)
		pieceTable.insert('\n\n\r\n', 7)
		str = str.substring(0, 7) + '\n\n\r\n' + str.substring(7)
				
		let lines = str.split(/\r\n|\r|\n/);
		expect(pieceTable.getLineCount()).toBe(lines.length);
		expect(pieceTable.getLinesContent()).toBe(str);
		for (let i = 0; i < lines.length; i++) {
			expect(trimLineFeed(pieceTable.getLineContent(i + 1))).toEqual(lines[i]);
			expect(trimLineFeed(pieceTable.getValueInRange({startLineNumber: i + 1, startColumn: 1, endLineNumber: i + 1, endColumn: lines[i].length + (i === lines.length - 1 ? 1 : 2)}))).toEqual(lines[i]);
		}
	});
	it('random bug 7', () => {
		let str = '';
		let pieceTable = new PieceTable('');
		
		pieceTable.insert('\r\r\n\n', 0)
		str = str.substring(0, 0) + '\r\r\n\n' + str.substring(0)
		pieceTable.insert('\r\n\n\r', 4)
		str = str.substring(0, 4) + '\r\n\n\r' + str.substring(4)
		pieceTable.insert('\n\r\r\r', 7)
		str = str.substring(0, 7) + '\n\r\r\r' + str.substring(7)
		pieceTable.insert('\n\n\r\n', 11)
		str = str.substring(0, 11) + '\n\n\r\n' + str.substring(11)
		let lines = str.split(/\r\n|\r|\n/);
		expect(pieceTable.getLineCount()).toBe(lines.length);
		expect(pieceTable.getLinesContent()).toBe(str);
		for (let i = 0; i < lines.length; i++) {
			expect(trimLineFeed(pieceTable.getLineContent(i + 1))).toEqual(lines[i]);
			expect(trimLineFeed(pieceTable.getValueInRange({startLineNumber: i + 1, startColumn: 1, endLineNumber: i + 1, endColumn: lines[i].length + (i === lines.length - 1 ? 1 : 2)}))).toEqual(lines[i]);
		}
	});
	it('random bug 10', () => {
		let str = '';
		let pieceTable = new PieceTable('');
		
		pieceTable.insert('qneW', 0)
		str = str.substring(0, 0) + 'qneW' + str.substring(0)
		pieceTable.insert('YhIl', 0)
		str = str.substring(0, 0) + 'YhIl' + str.substring(0)
		pieceTable.insert('qdsm', 0)
		str = str.substring(0, 0) + 'qdsm' + str.substring(0)
		pieceTable.delete(7, 0)
		str = str.substring(0, 7) + str.substring(7 + 0);
		pieceTable.insert('iiPv', 12)
		str = str.substring(0, 12) + 'iiPv' + str.substring(12)
		pieceTable.insert('V\rSA', 9)
		str = str.substring(0, 9) + 'V\rSA' + str.substring(9)
		
		let lines = str.split(/\r\n|\r|\n/);
		expect(pieceTable.getLineCount()).toBe(lines.length);
		expect(pieceTable.getLinesContent()).toBe(str);
		for (let i = 0; i < lines.length; i++) {
			expect(trimLineFeed(pieceTable.getLineContent(i + 1))).toEqual(lines[i]);
			expect(trimLineFeed(pieceTable.getValueInRange({startLineNumber: i + 1, startColumn: 1, endLineNumber: i + 1, endColumn: lines[i].length + (i === lines.length - 1 ? 1 : 2)}))).toEqual(lines[i]);
		}
	});
	it('random bug 9', () => {
		let str = '';
		let pieceTable = new PieceTable('');
		
		pieceTable.insert('\n\n\n\n', 0)
		str = str.substring(0, 0) + '\n\n\n\n' + str.substring(0)
		pieceTable.insert('\n\r\n\r', 3)
		str = str.substring(0, 3) + '\n\r\n\r' + str.substring(3)
		pieceTable.insert('\n\r\n\n', 2)
		str = str.substring(0, 2) + '\n\r\n\n' + str.substring(2)
		pieceTable.insert('\n\n\r\r', 0)
		str = str.substring(0, 0) + '\n\n\r\r' + str.substring(0)
		pieceTable.insert('\r\r\r\r', 3)
		str = str.substring(0, 3) + '\r\r\r\r' + str.substring(3)
		pieceTable.insert('\n\n\r\r', 3)
		str = str.substring(0, 3) + '\n\n\r\r' + str.substring(3)
		
		let lines = str.split(/\r\n|\r|\n/);
		expect(pieceTable.getLineCount()).toBe(lines.length);
		expect(pieceTable.getLinesContent()).toBe(str);
		for (let i = 0; i < lines.length; i++) {
			expect(trimLineFeed(pieceTable.getLineContent(i + 1))).toEqual(lines[i]);
			expect(trimLineFeed(pieceTable.getValueInRange({startLineNumber: i + 1, startColumn: 1, endLineNumber: i + 1, endColumn: lines[i].length + (i === lines.length - 1 ? 1 : 2)}))).toEqual(lines[i]);
		}
	});

});

describe('random is unsupervised', () => {
	it('random insert delete', () => {
		let str = '';
		let pt = new PieceTable(str);
		
		let output = '';
		for (let i = 0; i < 10000; i++) {
			if (Math.random() < .6) {
				// insert
				let text = randomStr(100);
				let pos = randomInt(str.length + 1);
				pt.insert(text, pos);
				
				output += `pieceTable.insert('${text.replace(/\n/g, '\\n').replace(/\r/g, '\\r')}', ${pos})\n`;
				output += `str = str.substring(0, ${pos}) + '${text.replace(/\n/g, '\\n').replace(/\r/g, '\\r')}' + str.substring(${pos})\n`;
				
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
		
		let lineStarts = [0];
		
		// Reset regex to search from the beginning
		let _regex = new RegExp(/\r\n|\r|\n/g);
		_regex.lastIndex = 0;
		let prevMatchStartIndex = -1;
		let prevMatchLength = 0;
		
		let m: RegExpExecArray;
		do {
			if (prevMatchStartIndex + prevMatchLength === str.length) {
				// Reached the end of the line
				break;
			}
			
			m = _regex.exec(str);
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
		
		for (let i = 0; i < lineStarts.length; i++) {
			expect(pt.getPositionAt(lineStarts[i])).toEqual(new Position(i + 1, 1));
			expect(pt.getOffsetAt(new Position(i + 1, 1))).toEqual(lineStarts[i]);
		}
		
		let lines = str.split(/\r\n|\r|\n/);
		expect(pt.getLineCount()).toBe(lines.length);
		for (let i = 0; i < lines.length; i++) {
			expect(trimLineFeed(pt.getLineContent(i + 1))).toEqual(lines[i]);
			expect(trimLineFeed(pt.getValueInRange({startLineNumber: i + 1, startColumn: 1, endLineNumber: i + 1, endColumn: lines[i].length + (i === lines.length - 1 ? 1 : 2)}))).toEqual(lines[i]);
		}
	});
});
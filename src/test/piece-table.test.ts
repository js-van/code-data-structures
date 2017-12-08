import { PieceTable } from '../piece-table';


const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ ';

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

describe('inserts and deletes', () => {
	it('basic insert/delete', () => {
		let pieceTable = new PieceTable('This is a document with some text.');

		pieceTable.insert('This is some more text to insert at offset 34.', 34);
		expect(pieceTable.getSequence()).toBe('This is a document with some text.This is some more text to insert at offset 34.')
		pieceTable.delete(42, 5);
		expect(pieceTable.getSequence()).toBe('This is a document with some text.This is more text to insert at offset 34.')
	});

	it('basic inserts', () => {
		let pt = new PieceTable('');

		pt.insert('AAA', 0);
		expect(pt.getSequence()).toBe('AAA');

		pt.insert('BBB', 0);
		expect(pt.getSequence()).toBe('BBBAAA');

		pt.insert('CCC', 6);
		expect(pt.getSequence()).toBe('BBBAAACCC');

		pt.insert('DDD', 5);
		expect(pt.getSequence()).toBe('BBBAADDDACCC');
	});

	it('basic deletes', () => {
		let pt = new PieceTable('012345678');

		pt.delete(8, 1);
		expect(pt.getSequence()).toBe('01234567');

		pt.delete(0, 1);
		expect(pt.getSequence()).toBe('1234567');

		pt.delete(5, 1);
		expect(pt.getSequence()).toBe('123457');

		pt.delete(5, 1);
		expect(pt.getSequence()).toBe('12345');

		pt.delete(0, 5);
		expect(pt.getSequence()).toBe('');
	});

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
		
		expect(pt.getSequence()).toBe(str);
	})
});
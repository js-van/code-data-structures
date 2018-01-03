import { randomInt, randomStr } from '../util';

function randomOperations (str: string) {
	let ops = [];
	
	for (let i = 0; i < 1000; i++) {
		if (Math.random() < .5) {
			// insert
			let text = randomStr(100);
			let pos = randomInt(str.length + 1);
			ops.push({
				insert: true,
				text: text,
				pos: pos
			});
			str = str.substring(0, pos) + text + str.substring(pos);
		} else {
			// delete
			let pos = randomInt(str.length);
			let length = Math.min(str.length - pos, Math.floor(Math.random() * 10))
			let deletedText = str.substr(pos, length);
			ops.push({
				insert: false,
				length: length,
				pos: pos
			});
			str = str.substring(0, pos) + str.substring(pos + length);
		}
	}
	
	return ops;
}

module.exports.randomOperations = randomOperations;
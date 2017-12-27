import Benchmark = require('benchmark');
import fs = require("fs");
import { PieceTable } from '../piece-table';
import { LinesModel } from '../lines-model';
import { randomInt, randomStr } from '../util';
import { EdBuffer, EdBufferBuilder } from 'edcore';

const suite = new Benchmark.Suite('getLineContent', {
	onCycle: function (event) {
		console.log(String(event.target));
	}
});

const defaultOptions = {
	maxTime: 0,
	minSamples: 20
};

function fn(model) {
	return {
		name: "getLineContent",
		fn() {
			if (model.GetLineCount) {
				for (let i = 0; i < model.GetLineCount(); i++) {
					// re-create the string.
					var str = model.GetLineContent(i + 1) + ' ';
					for(let j = 0; j < str.length; j++) {
						let t = str.charCodeAt(j);
					}
					// var str = Buffer.from(model.getLineContent(i + 1)).toString();
				}
			} else {
				for (let i = 0; i < model.getLineCount(); i++) {
					// re-create the string.
					var str = model.getLineContent(i + 1) + ' ';
					for(let j = 0; j < str.length; j++) {
						let t = str.charCodeAt(j);
					}
					// var str = Buffer.from(model.getLineContent(i + 1)).toString();
				}
			}
			
		}
	}
}

async function readFileAsync(input: string): Promise<EdBuffer> {
	return new Promise<EdBuffer>((resolve, reject) => {
		let fileName = `samples/${input}`;
		const stream = fs.createReadStream(fileName, { encoding: 'utf8' });
		let done = false;
		let builder = new EdBufferBuilder();

		stream.on('data', (chunk) => {
			builder.AcceptChunk(chunk);
		});

		stream.on('error', (error) => {
			if (!done) {
				done = true;
				reject();
			}
		});

		stream.on('end', () => {
			if (!done) {
				done = true;
				builder.Finish();
				resolve(builder.Build());
			}
		});
	});
}

readFileAsync('checker.ts').then((edBuffer) => {
	var input = fs.readFileSync('samples/checker.ts', { encoding: 'utf8' });
	var pt = new PieceTable(input);
	var opts = fn(pt);
	opts.name = `piece-table ${opts.name}`

	suite.add(Object.assign({}, opts, defaultOptions));

	var linesModel = new LinesModel(input);
	var lmOpts = fn(linesModel);
	lmOpts.name = `lines-model ${lmOpts.name}`
	suite.add(Object.assign({}, lmOpts, defaultOptions));
	
	var edOpts = fn(edBuffer);
	edOpts.name = `edcore ${edOpts.name}`;
	suite.add(Object.assign({}, edOpts, defaultOptions));

	let str = 'a';
	pt = new PieceTable('a');
	for (let i = 0; i < 1000; i++) {
		if (Math.random() < .6) {
			// insert
			let text = randomStr(100);
			let pos = randomInt(str.length + 1);
			pt.insert(text, pos);
			edBuffer.ReplaceOffsetLen([{offset: pos, length: 0, text: text}]);
			str = str.substring(0, pos) + text + str.substring(pos);
		} else {
			// delete
			let pos = randomInt(str.length);
			let length = Math.min(str.length - pos, Math.floor(Math.random() * 10))
			let deletedText = str.substr(pos, length);
			pt.delete(pos, length);
			edBuffer.ReplaceOffsetLen([{offset: pos, length: length, text: ''}]);
			str = str.substring(0, pos) + str.substring(pos + length);
		}
	}

	var dirtyPTOpts = fn(pt);
	dirtyPTOpts.name = `piece-table with 10000 edits ${dirtyPTOpts.name}`
	suite.add(Object.assign({}, dirtyPTOpts, defaultOptions));
	
	var dirtyEdCoreOpts = fn(edBuffer);
	dirtyEdCoreOpts.name = `edcore with 10000 edits ${dirtyEdCoreOpts.name}`;
	suite.add(Object.assign({}, dirtyEdCoreOpts, defaultOptions));
	suite.run();
});


import fs = require("fs");
import stream = require('stream');
import { ModelBuilder } from '../../modelBuilder/linesModelBuilder';
import { EdBufferBuilder } from 'edcore';

module.exports = function (input) {
	return {
		name: "edcore",
		defer: true,
		fn(deferred) {
			let fileName = `samples/${input}`;
			const stream = fs.createReadStream(fileName, { encoding: 'utf8'});
			let done = false;
			let builder = new EdBufferBuilder();
			
			stream.on('data', (chunk) => {
				builder.AcceptChunk(chunk);
			});
			
			stream.on('error', (error) => {
				if (!done) {
					done = true;
					deferred.reject();
				}
			});

			stream.on('end', () => {
				if (!done) {
					done = true;
					builder.Finish();
					builder.Build();
					deferred.resolve();
				}
			});
		}
	};
};

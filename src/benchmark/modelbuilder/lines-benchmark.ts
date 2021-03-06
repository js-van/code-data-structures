import fs = require("fs");
import stream = require('stream');
import { ModelBuilder } from '../../modelBuilder/linesModelBuilder';

const inputs = [
	// "checker.ts",
	"heapsnapshot.txt"
];

module.exports = function (input) {
	return {
		name: "model lines",
		defer: true,
		fn(deferred) {
			let fileName = `samples/${input}`;
			const stream = fs.createReadStream(fileName, { encoding: 'utf8'});
			let done = false;
			let builder = new ModelBuilder(false);
			
			stream.on('data', (chunk) => {
				builder.acceptChunk(chunk);
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
					builder.finish();
					deferred.resolve();
				}
			});
		}
	};
};

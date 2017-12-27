const fs = require("fs");
const stream = require('stream');
import { ModelBuilder } from '../../modelBuilder/ptModelBuilder';

module.exports = function (input) {
	return {
		name: "piece table",
		defer: true,
		fn(deferred) {
			let fileName = `samples/${input}`;
			const stream = fs.createReadStream(fileName, { encoding: 'utf8'});
			let done = false;
			let builder = new ModelBuilder(false);
			
			stream.on('data', (chunk) => {
				builder.acceptChunk2(chunk);
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
					builder.finish2();
					deferred.resolve();
				}
			});
		}
	};
};

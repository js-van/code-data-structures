const fs = require("fs");
const stream = require('stream');
import { RBTree } from '../../rbTree'
import * as strings from '../../modelbuilder/strings';

module.exports = function (input) {
	return {
		name: "piece table rb",
		defer: true,
		fn(deferred) {
			let fileName = `samples/${input}`;
			const stream = fs.createReadStream(fileName, { encoding: 'utf8'});
			let done = false;
			let builder = new RBTree('');
			let len = 0;
			let containsRTL = false;
			let isBasicASCII = true;
			
			stream.on('data', (chunk) => {
				builder.insert(chunk, len);
				let lastLineFeed = -1;
				let lineStarts = []
				while ((lastLineFeed = chunk.indexOf('\n', lastLineFeed + 1)) !== -1) {
					lineStarts.push(lastLineFeed + 1);
				}
				if (!containsRTL) {
					containsRTL = strings.containsRTL(chunk);
				}
				if (isBasicASCII) {
					isBasicASCII = strings.isBasicASCII(chunk);
				}
		
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
					deferred.resolve();
				}
			});
		}
	};
};

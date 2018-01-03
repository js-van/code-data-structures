const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ\r\n';

export function randomChar() {
	return alphabet[randomInt(alphabet.length)];
};

export function randomInt(bound: number) {
	return Math.floor(Math.random() * bound);
};

export function randomStr(len: number) {
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
	})()).join('');
};
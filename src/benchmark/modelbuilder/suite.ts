import Benchmark = require('benchmark');

const suite = new Benchmark.Suite('loading', {
	onCycle: function (event) {
		console.log(String(event.target));
	}
});

const defaultOptions = {
	maxTime: 0,
	minSamples: 20
};

const inputs = [
	"checker.ts",
	"heapsnapshot.txt"
];

[
	require('./lines-benchmark'),
	require('./pt-benchmark'),
	require('./pt-rb-benchmark'),
	require('./edcore')
].forEach(fn => {
	inputs.forEach(input => {
		let opts = fn(input);
		opts.name = `${opts.name} - '${input}' `;
		suite.add(Object.assign({}, opts, defaultOptions));
	})
});

suite.run({ async: true });
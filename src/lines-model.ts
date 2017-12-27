export class LinesModel {
	_lines: string[];
	constructor(rawTextSource: string) {
		this._lines = rawTextSource.split('\n');
	}
	
	public getLineCount(): number {
		return this._lines.length;
	}
	
	public getLineContent(lineNumber: number): string {
		if (lineNumber < 1 || lineNumber > this.getLineCount()) {
			throw new Error('Illegal value ' + lineNumber + ' for `lineNumber`');
		}

		return this._lines[lineNumber - 1];
	}
}
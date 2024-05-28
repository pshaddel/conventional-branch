import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { extractFields, extractOptions, getFieldType } from '../../extension';
// import * as myExtension from '../../extension';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Sample test', () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	});
});

suite('extractFileds', () => {
	test('Should return an array based on {} variables', () => {
		assert.deepStrictEqual(extractFields('{Type}/{Branch}-{Description}'), ['Type', 'Branch', 'Description']);
		assert.deepStrictEqual(extractFields('Type/Branch-Description'), []);
		assert.deepStrictEqual(extractFields('{Type}/{Branch}'), ['Type', 'Branch']);
		assert.deepStrictEqual(extractFields('FEAT/{Type}'), ['Type']);
	});

	test('Should also support selector fields', () => {
		assert.deepStrictEqual(extractFields('{Type}/{Branch}-{Author[Poorshad,John]}'), ['Type', 'Branch', 'Author[Poorshad,John]']);
		assert.deepStrictEqual(extractFields('{Type}/{Branch}-{Author[Poorshad,John,Smith]}'), ['Type', 'Branch', 'Author[Poorshad,John,Smith]']);
	});

});

suite('fieldType', () => {
	test('Should get error on wrong format selector fields', () => {
		assert.throws(() => getFieldType('Author[Poorshad,John'), Error);
		assert.throws(() => getFieldType('AuthorPoorshad,John]'), Error);
	});

	test('Should return selector for selector fields', () => {
		assert.strictEqual(getFieldType('Author[Poorshad,John]'), 'selector');
		assert.strictEqual(getFieldType('Author[Poorshad,John,Smith]'), 'selector');
		assert.strictEqual(getFieldType('Author'), 'string');
	});
});

suite('extractOptions', () => {
	test('Should return an array of options based on the input', () => {
		assert.deepStrictEqual(extractOptions('Author[Poorshad,John]'), ['Poorshad', 'John']);
		assert.deepStrictEqual(extractOptions('Author[Poorshad,John,Smith]'), ['Poorshad', 'John', 'Smith']);
		assert.deepStrictEqual(extractOptions('Author[Poorshad]'), ['Poorshad']);
		assert.deepStrictEqual(extractOptions('Author[Poorshad Shaddel,John]'), ['Poorshad Shaddel', 'John']);
	});
});
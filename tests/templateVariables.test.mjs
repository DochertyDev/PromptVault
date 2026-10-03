import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import ts from 'typescript';

const source = await fs.readFile(new URL('../utils/templateVariables.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
const { extractVariables, renderTemplate } = await import(
  'data:text/javascript;base64,' + Buffer.from(outputText).toString('base64')
);

test('replacement values preserve dollar syntax literally', () => {
  for (const value of ['$&', '$`', "$'", '$$', '$1', '$& $$ {other}']) {
    assert.equal(renderTemplate('before {value} after', { value }), `before ${value} after`);
  }
});

test('substitution is a single pass, including repeated variables', () => {
  assert.equal(renderTemplate('{a} {b} {a}', { a: '{b}', b: 'done' }), '{b} done {b}');
});

test('variable names support punctuation and normalized whitespace', () => {
  assert.deepEqual(extractVariables('{ Topic (optional) } {Topic (optional)} { }'), ['Topic (optional)']);
  assert.equal(renderTemplate('{ Topic (optional) }', { 'Topic (optional)': 'literal' }), 'literal');
});

test('missing values preserve exact placeholders, including inherited names', () => {
  assert.equal(renderTemplate('{ constructor } {toString} {__proto__}', {}), '{ constructor } {toString} {__proto__}');
  assert.equal(renderTemplate('{constructor}', { constructor: 'entered' }), 'entered');
  assert.equal(renderTemplate('{blank}', { blank: '' }), '');
});

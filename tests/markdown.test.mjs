import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Compile ESM into an isolated ignored folder that can resolve project packages.
const cache = path.resolve('node_modules/.cache');
await fs.mkdir(cache, { recursive: true });
const directory = await fs.mkdtemp(path.join(cache, 'promptvault-tests-'));
let MarkdownRenderer;
let hasMarkdownSyntaxCached;
try {
  for (const source of ['components/MarkdownRenderer.tsx', 'utils/markdownDetection.ts']) {
    const output = ts.transpileModule(await fs.readFile(source, 'utf8'), {
      fileName: source,
      compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
    }).outputText;
    const filename = path.join(directory, path.basename(source) + '.mjs');
    await fs.writeFile(filename, output);
    const module = await import(pathToFileURL(filename));
    MarkdownRenderer ??= module.MarkdownRenderer;
    hasMarkdownSyntaxCached ??= module.hasMarkdownSyntaxCached;
  }
} finally {
  await fs.rm(directory, { recursive: true, force: true });
}

const render = content => renderToStaticMarkup(React.createElement(MarkdownRenderer, { content }));

test('inline code keeps styling and template highlighting', () => {
  const html = render('Use `hello {name}`.');
  assert.match(html, /<code class="bg-black-300 text-cyan-300/);
  assert.match(html, /<span[^>]+>\{name\}<\/span>/);
  assert.doesNotMatch(html, /<pre/);
});

test('unlabeled fenced code keeps indentation and literal variables', () => {
  const html = render('```\n  hello {name}\n```');
  assert.match(html, /<pre[^>]*><code class="hljs">  hello \{name\}\n<\/code><\/pre>/);
  assert.doesNotMatch(html, /text-cyan-300|bg-yellow-500/);
});

test('labeled fenced code retains syntax highlighting', () => {
  const html = render('```js\nconst name = "{name}";\n```');
  assert.match(html, /<code class="hljs language-js">/);
  assert.match(html, /hljs-keyword/);
  assert.doesNotMatch(html, /bg-yellow-500/);
});

test('markdown cache remains correct across eviction', () => {
  for (let index = 0; index < 1100; index++) {
    assert.equal(hasMarkdownSyntaxCached(`plain ${index}`), false);
  }
  assert.equal(hasMarkdownSyntaxCached('**bold**'), true);
  assert.equal(hasMarkdownSyntaxCached('plain 0'), false);
});

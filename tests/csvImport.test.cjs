const { test } = require('node:test');
const assert = require('node:assert/strict');
const { parseCSV, importPromptsFromCSV } = require('../utils/csvImport.ts');
const { exportPromptsToCSV } = require('../utils/csvExport.ts');
const { importWorkflowsFromCSV } = require('../utils/workflowImport.ts');

test('CSV handles empty quoted fields, escaped quotes and trailing cells', () => {
  assert.deepEqual(parseCSV('a,b,c,d\r\n"",",""quoted""",text,\r\n'), [
    ['a', 'b', 'c', 'd'], ['', ',"quoted"', 'text', ''],
  ]);
});

test('CSV preserves quoted whitespace and CRLF content, skipping blank rows', () => {
  assert.deepEqual(parseCSV('\r\na,b\r\nA,"  code\r\n\tline\r\n"\r\n\r\n'), [
    ['a', 'b'], ['A', '  code\r\n\tline\r\n'],
  ]);
});

test('prompt backup round-trips exact content and empty tags', () => {
  const prompt = {
    id: 'p', title: 'Quoted "title"', content: '\n  code, "value"\r\n\tend\n',
    categoryId: '', tags: [], isFavorite: true, isTemplate: true,
    createdAt: 1, updatedAt: 2,
  };
  const imported = importPromptsFromCSV(exportPromptsToCSV([prompt], []), []);
  assert.equal(imported.result.success, true);
  const copy = imported.prompts[0];
  for (const key of ['title', 'content', 'tags', 'isFavorite', 'isTemplate', 'categoryId']) {
    assert.deepEqual(copy[key], prompt[key]);
  }
});

test('workflow import preserves prompt content', () => {
  const content = '\n  code, "value"\n';
  const csv = 'workflow_name,prompt_title,prompt_content\nFlow,Prompt,"' + content.replaceAll('"', '""') + '"';
  const imported = importWorkflowsFromCSV(csv, [], [], [], []);
  assert.equal(imported.result.success, true);
  assert.equal(imported.prompts[0].content, content);
});

test('unterminated quotes fail both import flows before creating partial data', () => {
  assert.throws(() => parseCSV('a,b\n"broken'), /Unterminated/);
  const prompts = importPromptsFromCSV('Title,Content\nGood,ok\nBad,"broken', []);
  assert.equal(prompts.result.success, false);
  assert.deepEqual(prompts.prompts, []);
  const workflows = importWorkflowsFromCSV('workflow_name,prompt_title,prompt_content\nGood,P,ok\nBad,P,"broken', [], [], [], []);
  assert.equal(workflows.result.success, false);
  assert.deepEqual(workflows.workflows, []);
});

test('whitespace-only prompt content remains invalid', () => {
  const prompts = importPromptsFromCSV('Title,Content\nA,"  \n "', []);
  assert.equal(prompts.result.promptsImported, 0);
  const workflows = importWorkflowsFromCSV('workflow_name,prompt_title,prompt_content\nFlow,A,"  \n "', [], [], [], []);
  assert.equal(workflows.result.promptsCreated, 0);
});

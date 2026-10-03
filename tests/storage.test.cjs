const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const { IDBFactory } = require('fake-indexeddb');
const React = require('react');
const { create, act } = require('react-test-renderer');

const compiled = ts.transpileModule(fs.readFileSync('hooks/useIndexedDB.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const exportsObject = {};
new Function('require', 'exports', compiled)(require, exportsObject);
const useIndexedDB = exportsObject.default;
global.IS_REACT_ACT_ENVIRONMENT = true;

const tick = () => new Promise(resolve => setImmediate(resolve));
async function until(condition) {
  for (let i = 0; i < 100 && !condition(); i++) await act(tick);
  assert.ok(condition(), 'asynchronous storage operation did not finish');
}

function setup() {
  global.indexedDB = new IDBFactory();
  const backup = new Map();
  global.window = { localStorage: {
    getItem: key => backup.get(key) ?? null,
    setItem: (key, value) => backup.set(key, value),
  } };
  return backup;
}

async function databaseValue(key, value, write = false) {
  const db = await new Promise((resolve, reject) => {
    const request = indexedDB.open('PromptVaultDB', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('promptvault_store');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction('promptvault_store', write ? 'readwrite' : 'readonly');
      const store = tx.objectStore('promptvault_store');
      const request = write ? store.put(value, key) : store.get(key);
      tx.oncomplete = () => resolve(request.result);
      tx.onabort = () => reject(tx.error);
    });
  } finally { db.close(); }
}

async function mount(key, initialValue, onInitial) {
  let result;
  function Probe() {
    result = useIndexedDB(key, initialValue);
    React.useEffect(() => { onInitial?.(result); }, []);
    return React.createElement('div', null, result[2] ? 'ready' : 'loading');
  }
  let root;
  await act(() => { root = create(React.createElement(Probe)); });
  return { root, latest: () => result };
}

test('hydration blocks premature writes and preserves an existing vault', async () => {
  const backup = setup();
  await databaseValue('vault', ['existing'], true);
  let initialReady;
  const probe = await mount('vault', ['sample'], result => {
    initialReady = result[2];
    result[1](['overwrite']);
  });
  assert.equal(initialReady, false);
  await until(() => probe.latest()[2]);
  assert.deepEqual(probe.latest()[0], ['existing']);
  assert.deepEqual(await databaseValue('vault'), ['existing']);
  assert.equal(backup.has('vault'), false);
  await act(() => probe.root.unmount());
});

test('batched functional updates retain both changes and persist the latest value', async () => {
  const backup = setup();
  const probe = await mount('vault', []);
  await until(() => probe.latest()[2]);
  await act(() => {
    const setValue = probe.latest()[1];
    setValue(current => [...current, 'one']);
    setValue(current => [...current, 'two']);
  });
  assert.deepEqual(probe.latest()[0], ['one', 'two']);
  assert.deepEqual(JSON.parse(backup.get('vault')), ['one', 'two']);
  for (let i = 0; i < 100; i++) {
    if (JSON.stringify(await databaseValue('vault')) === '["one","two"]') break;
    await tick();
  }
  assert.deepEqual(await databaseValue('vault'), ['one', 'two']);
  await act(() => probe.root.unmount());
});

test('open failure loads the backup and settles readiness', async () => {
  const backup = setup();
  backup.set('vault', JSON.stringify(['backup']));
  indexedDB.open = () => { throw new Error('storage unavailable'); };
  const probe = await mount('vault', []);
  await until(() => probe.latest()[2]);
  assert.deepEqual(probe.latest()[0], ['backup']);
  await act(() => probe.root.unmount());
});

test('failed write transactions preserve the backup and do not poison later writes', async () => {
  const backup = setup();
  const probe = await mount('vault', []);
  await until(() => probe.latest()[2]);
  const originalOpen = indexedDB.open.bind(indexedDB);
  let aborted = false;
  indexedDB.open = (...args) => {
    const request = originalOpen(...args);
    request.addEventListener('success', () => {
      const transaction = request.result.transaction.bind(request.result);
      request.result.transaction = (...txArgs) => {
        const tx = transaction(...txArgs);
        if (txArgs[1] === 'readwrite' && !aborted) {
          aborted = true;
          queueMicrotask(() => tx.abort());
        }
        return tx;
      };
    });
    return request;
  };
  await act(() => probe.latest()[1](['one']));
  for (let i = 0; i < 100 && !aborted; i++) await tick();
  assert.equal(aborted, true);
  assert.deepEqual(JSON.parse(backup.get('vault')), ['one']);
  await act(() => probe.latest()[1](current => [...current, 'two']));
  for (let i = 0; i < 100; i++) {
    if (JSON.stringify(await databaseValue('vault')) === '["one","two"]') break;
    await tick();
  }
  assert.deepEqual(await databaseValue('vault'), ['one', 'two']);
  await act(() => probe.root.unmount());
});

test('cancelled hydration closes the connection without publishing loaded state', async () => {
  setup();
  const originalOpen = indexedDB.open.bind(indexedDB);
  let closes = 0;
  let resume;
  const gate = new Promise(resolve => { resume = resolve; });
  indexedDB.open = (...args) => {
    const actual = originalOpen(...args);
    const request = {};
    actual.onupgradeneeded = () => {
      request.result = actual.result;
      request.onupgradeneeded?.();
    };
    actual.onsuccess = async () => {
      request.result = actual.result;
      const close = actual.result.close.bind(actual.result);
      actual.result.close = () => { closes++; close(); };
      await gate;
      request.onsuccess?.();
    };
    return request;
  };
  const probe = await mount('vault', []);
  assert.equal(probe.latest()[2], false);
  await act(() => probe.root.unmount());
  resume();
  for (let i = 0; i < 100 && closes === 0; i++) await tick();
  assert.equal(closes, 1);
  assert.equal(probe.latest()[2], false);
});

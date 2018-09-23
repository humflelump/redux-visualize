import graph from '../src/index';

test('graph is object', () => {
  expect(typeof graph === 'object').toBe(true);
});

test('add is a function', () => {
  expect(typeof graph.add === 'function').toBe(true);
});

import { createSelector } from 'reselect';
import createAsyncSelector from 'async-selector';
import graph from '../vis2/pkg'

const text1 = state => state.Component.text1;
const text2 = state => state.Component.text2;

function concat_(text1, text2) {
    return text1 + text2;
}
const concat = graph.add(concat_);
export const concatination = graph.add(createSelector, 'concat sel')(text1, text2, concat);

function convertConcatToNumber(concatination) {
    return +concatination;
}
export const concatAsNumber = graph.add(createSelector, null, __filename)(concatination, convertConcatToNumber);

function add5(concatAsNumber) {
    return concatAsNumber + 5;
}
export const added5 = graph.add(createSelector, null, __filename)([concatAsNumber], add5);

async function getComputation(num) {
    await setTimeout(() => {}, 1000);
    return num * 1000;
}

export const computation = graph.add(createAsyncSelector, null, __filename)({
    sync: (num) => null,
    async: getComputation,
    onResolve: (employees, searchText) => console.log(employees),
    onReject: (error, searchText) => console.log(error),
    onCancel: (promise, searchText) => console.log(promise),
  }, added5);





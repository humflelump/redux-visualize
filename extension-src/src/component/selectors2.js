import { createSelector } from 'reselect';
import createAsyncSelector from 'async-selector';
import graph from '../vis2/pkg'

import * as selectors from './selectors'

function add10(n) {
    return n + 10;
}
export const added10 = graph.add(createSelector, null, __filename)([selectors.added5], add10);
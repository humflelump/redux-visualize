import * as constants from './constants';

export function getType(f) {
    try {
        if (f().name === 'wrapWithConnect') {
            return constants.CONNECT;
        }
    } catch (e) {}

    try {
        if ('resultFunc' in f()) {
            return constants.RESELECT_SELECTOR;
        }
    } catch (e) {}

    try {
        const sel = f({async: () => null, sync: () => null});

        if ('forceUpdate' in sel) {
            return constants.ASYNC_SELECTOR;
        }
    } catch (e) {}

    return constants.UNKNOWN;
}

export function getFunctionType(f) {
    try {
        if (f.name === 'wrapWithConnect') {
            return constants.CONNECT;
        }
    } catch (e) {}

    try {
        if ('resultFunc' in f) {
            return constants.RESELECT_SELECTOR;
        }
    } catch (e) {}

    try {
        if ('forceUpdate' in f) {
            return constants.ASYNC_SELECTOR;
        }
    } catch (e) {}

    return constants.UNKNOWN;
}

export function isSelector(f) {
    const type = getFunctionType(f);
    return type === constants.RESELECT_SELECTOR || type === constants.ASYNC_SELECTOR;
}

export function id() {
    id.counter = (id.counter || 0) + 1;
    return id.counter;
}

export function getPathsToVariable(state, variable, maxDepth = 4) {
    const solutions = [];
    helper(state, variable, maxDepth, solutions);
    return solutions;
}

export function pathToString(solution) {
    return ['state', ...solution].join('.');
}

function helper(state, variable, maxDepth, solutions, depth=0, history=[]) {
    if (state === variable) {
        return solutions.push([...history]);
    } else if (depth > maxDepth) {
        return;
    } else if (state === null || typeof state !== 'object') {
        return;
    } else {
        const keys = Object.keys(state);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            history.push(key);
            helper(state[key], variable, maxDepth, solutions, depth+1, history);
            history.pop();
        }
    }
}

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

    if (isReactComponent(f)) {
        return constants.REACT_COMPONENT;
    }

    if (typeof f === 'function') {
        return constants.FUNCTION;
    }

    return constants.UNKNOWN;
}

export function convert(obj) {
    const newObj = {};
    const keys = Object.keys(obj);
    for (const key of keys) {
        const child = (typeof obj[key] === 'object' && obj[key] !== null)
            ? convert(obj[key])
            : obj[key];
        Object.defineProperty(newObj, key, {
            get: () => {
                return child;
            },
            enumerable: true,
        });
    }
    return newObj;
}

export function make_id(name) {
    make_id[name] = (make_id[name] || 0) + 1;
    return `${name}_${make_id[name].toString()}`;
}


export function getFunctionName(func, defaultName=null) {
    if (typeof defaultName === 'string') return defaultName;
    console.log(func, func.name);
    if (func && func.name && func.name !== '') return func.name;
    return constants.DEFAULT_NAME;
}

export function getNameFromComponent(comp, defaultName=null) {
    if (typeof defaultName === 'string') return defaultName;
    if (comp && comp.constructor && comp.constructor.name !== 'Function') return comp.constructor.name;
    if (comp && comp.name !== '') return comp.name;
    return constants.DEFAULT_NAME;
}

export function getStateVariableName(keys) {
    return `state.${keys.join('.')}`;
}

export function getStateVariableValue(state, keys) {
    let value = state;
    for (const key of keys) {
        value = value[key];
    }
    return value;
}

function isClassComponent(component) {
    return (
        typeof component === 'function' && 
        !!component.prototype.isReactComponent
    ) ? true : false
}

function isFunctionComponent(component) {

    return (
        typeof component === 'function' && 
        String(component).includes('createElement')
    ) ? true : false;
}

function isReactComponent(component) {
    return (
        isClassComponent(component) || 
        isFunctionComponent(component)
    ) ? true : false;
}
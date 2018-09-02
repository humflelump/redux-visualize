import * as functions from './functions';
import * as constants from './constants';
import store from './store';
import * as extension from './extension-interface';
import Node from './node';

function vis(f, name=null) {
    const type = functions.getType(f);
    switch(type) {
        case constants.RESELECT_SELECTOR:
            return newReselect(f, name);
        case constants.CONNECT:
            return newConnect(f, name);
        case constants.ASYNC_SELECTOR:
            return newAsyncSelector(f, name);
        default:
            return f;
    }
}

function getFunctionName(func, defaultName=null) {
    if (typeof defaultName === 'string') return defaultName;
    if (func && func.name && func.name !== '') return func.name;
    return constants.DEFAULT_NAME;
}

function getNameFromComponent(comp, defaultName=null) {
    if (typeof defaultName === 'string') return defaultName;
    if (comp && comp.constructor && comp.constructor.name !== 'Function') return comp.constructor.name;
    if (comp && comp.name !== '') return comp.name;
    return constants.DEFAULT_NAME;
}

function handleDependency(currentNode, func) {
    if (constants.FUNC_KEY in func) {
        currentNode.addDependency(func[constants.FUNC_KEY]);
    } else {
        const leafType = functions.getFunctionType(func);
        const id = func[constants.FUNC_KEY] || functions.id();
        func[constants.FUNC_KEY] = id;
        if (leafType === constants.RESELECT_SELECTOR) {
            const node = new Node(constants.DEFAULT_NAME, id, constants.RESELECT_SELECTOR, func);
            currentNode.addDependency(node.id);
            store.addNode(node);
        } 
        else if (leafType === constants.ASYNC_SELECTOR) {
            const node = new Node(constants.DEFAULT_NAME, id, constants.ASYNC_SELECTOR, func);
            currentNode.addDependency(node.id);
            store.addNode(node);
        }
        else {
            const node = new Node(constants.DEFAULT_NAME, id, constants.STATE_VARIABLE, func);
            currentNode.addDependency(node.id);
            store.addNode(node);
        }
    }
    return currentNode;
}

function getDependencies(funcs) {
    const dependencies = Array.isArray(funcs[0]) ? funcs[0] : funcs;
    return dependencies
  }

function newReselect(create, defaultName=null) {
    const id = functions.id();
    const result = (...f) => {
        const selector = create(...f);
        selector[constants.FUNC_KEY] = id;
        const func = f.pop();
        const dependencies = getDependencies(f);
        const registeredDependencies = dependencies.filter((f) => {
            return f[constants.FUNC_TYPE] === constants.SELECTOR;
        });
        const name = getFunctionName(func, defaultName);
        const node = new Node(name, id, constants.RESELECT_SELECTOR, selector);
        store.addNode(node);
        for (const f of dependencies) {
            handleDependency(node, f);
        }
        const newSelector = (state, props) => {
            store.logId(id);
            const result = selector(state, props);
            //store.popIds(registeredDependencies.length);
            return result
        };
        newSelector[constants.FUNC_KEY] = id;
        newSelector[constants.FUNC_TYPE] = constants.SELECTOR;
        return newSelector
    };
    result[constants.FUNC_KEY] = id;
    return result;
}

function newConnect(connect, defaultName=null) {
    const id = functions.id();
    return (mapState, mapDispatch) => (Component) => {
        const name = getNameFromComponent(Component, defaultName);
        setTimeout(() => {
            const state = window.store.getState();
            store.beginLogging();
            mapState(state);
            store.stopLogging();
            const node = new Node(name, id, constants.CONNECT, mapState);
            store.loggedIds.forEach(id => node.addDependency(id));
            store.addNode(node);
        });
        return connect(mapState, mapDispatch)(Component);
    }
}

function newAsyncSelector(create, defaultName=null) {
    const id = functions.id();
    const result = (obj, ...f) => {
        const selector = create(obj, ...f);
        selector[constants.FUNC_KEY] = id;
        const func = obj.async;
        const dependencies = getDependencies(f);
        const registeredDependencies = dependencies.filter((f) => {
            return f[constants.FUNC_TYPE] === constants.SELECTOR;
        });
        const name = getFunctionName(func, defaultName);
        const node = new Node(name, id, constants.ASYNC_SELECTOR, selector);
        store.addNode(node);
        for (const f of dependencies) {
            handleDependency(node, f);
        }
        const newSelector = (state, props) => {
            store.logId(id);
            const result = selector(state, props);
            //store.popIds(registeredDependencies.length);
            return result
        };
        newSelector[constants.FUNC_KEY] = id;
        newSelector[constants.FUNC_TYPE] = constants.SELECTOR;
        return newSelector
    };
    result[constants.FUNC_KEY] = id;
    return result;
}

export default vis;

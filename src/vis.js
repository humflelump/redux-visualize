import * as functions from './functions';
import * as constants from './constants';
import React from 'react';
import PropTypes from 'prop-types';

const time = () => performance.now();

class Node {
    constructor(id, name, type) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.indexedDependencies = {};
        this.dispatchId = -1;
        this.value = undefined;
        this.description = null;
        this.duration = null;
    }

    addDependency(node) {
        if (!(node.id in this.indexedDependencies)) {
            this.indexedDependencies[node.id] = node;
        }
    }

    setDuration(time) {
        this.duration = time;
    }

    setDescription(str) {
        this.description = str;
    }

    setValue(value) {
        this.value = value;
    }

    setDispatchId(id) {
        this.dispatchId = id;
    }

    serialize() {
        const result = {...this};
        delete result.indexedDependencies;
        result.dependencies = Object.keys(this.indexedDependencies);
        try {
            JSON.stringify(result.value, undefined, 2);
        } catch (e) {
            result.value = 'Failed to Serialize';
        }
        try {
            result.stringifiedResult = JSON.stringify(result.value, undefined, 2);
        } catch (e) {
            result.stringifiedResult = 'Failed to Serialize';
        }
        return result;
    }
}

const ctxKey = '__VIS_PARENT_ID__'

class Graph {
    constructor() {
        this.stack = [];
        this.indexedNodes = {};
        this.store = null;
        this.dispatchId = 0;
        this.ctx = React.createContext(null);

        window.addEventListener('message', (event) => {
            if (event.data === 'GRAPH_REQUESTED') {
                this.displayGraphInExtension();
            }
            return true;
        });
    }

    getNodeById(id) {
        return this.indexedNodes[id];
    }

    displayGraphInExtension() {
        const message = {
            type: 'GRAPH_SENT',
            graph: this.serializeGraph(),
        };
        window.postMessage(message, '*')
    }

    serializeGraph() {
        const result = Object.keys(this.indexedNodes)
            .map(key => this.indexedNodes[key])
            .map((node) => node.serialize());

        return {
            graph: result,
            dispatchId: this.dispatchId,
        };
    }

    addNode(node) {
        this.indexedNodes[node.id] = node;
    }

    makeStateWatchableMemoized(obj) {
        if (this.cachedState === obj) return this.cachedWatchableState;
        const result = this.makeStateWatchable(obj);
        this.cachedState = obj;
        this.cachedWatchableState = result;
        return result;
    }

    makeStateWatchable(obj) {
        return this.makeStateWatchableHelper(obj, 0, [])
    }

    makeStateWatchableHelper(obj, depth, historyKeys) {
        const newObj = {};
        const keys = Object.keys(obj);
        const stack = this.stack;
        
        for (const key of keys) {
            const newKeys = [...historyKeys, key];
            const name = functions.getStateVariableName(newKeys);
            const type = constants.STATE_VARIABLE;
            const node = new Node(name, name, type);
            

            const child = (typeof obj[key] === 'object' && obj[key] !== null)
                ? this.makeStateWatchableHelper(obj[key], depth + 1, newKeys)
                : obj[key];

            const getterFunc = () => child;

            Object.defineProperty(newObj, key, {
                get: () => {
                    this.addNode(node);
                    stack.push(node);
                    const result = getterFunc();
                    node.setValue(result);
                    node.setDispatchId(this.dispatchId);
                    const currNode = stack.pop();
                    if (stack.length > 0) {
                        stack[stack.length - 1].addDependency(currNode);
                    }
                    return result;
                },
                enumerable: true,
            });
        }
        return newObj;
    }

    watchReduxStore(store) {
        const get = store.getState;
        store.getState = (...params) => {
            const state = get(...params);
            //const watchable = this.makeStateWatchableMemoized(state)
            return state;
        }
        const disp = store.dispatch;
        store.dispatch = (...params) => {
            this.dispatchId += 1;
            const result = disp(...params);
            return result;
        }
        this.store = store;
        return store;
    }

    inject(f, name, type, description, ref={}) {
        const stack = this.stack;
        const id = functions.make_id(name);
        const node = new Node(id, name, type);
        node.setDescription(description)
        ref.node = node;
        this.addNode(node);
        return (...d) => {
            stack.push(node)
            const result = f(...d);
            node.setValue(result);
            const currNode = stack.pop();
            if (stack.length > 0) {
                stack[stack.length - 1].addDependency(currNode);
            }
            return result;
        }
    }

    add(f, defaultName=null, description=null) {
        const type = functions.getType(f);
        if (type === constants.RESELECT_SELECTOR) {
            return (...funcs) => {
                let node = null;
                const mainFunction = funcs.pop();
                const newMainFunction = (...params) => {
                    const now = time();
                    const result = mainFunction(...params);
                    const duration = time() - now;
                    if (node !== null) {
                        node.setDispatchId(this.dispatchId);
                        node.setDuration(duration);
                    }
                    return result;
                }
                funcs.push(newMainFunction);
                const selector = f(...funcs);
                const name = functions.getFunctionName(mainFunction, defaultName);
                const ref = {};
                const newFunc = this.inject(selector, name, type, description, ref);
                node = ref.node;
                return newFunc;
            };
        } else if (type === constants.ASYNC_SELECTOR) {
            return (obj, ...funcs) => {
                let node;
                const mainFunction = obj.async;
                const newAsync = (...params) => {
                    const promise = mainFunction(...params);
                    return new Promise((resolve, reject) => {
                        const now = time();
                        return promise.then((...d) => {
                            const duration = time() - now;
                            node.setDispatchId(this.dispatchId);
                            node.setDuration(duration);
                            resolve(...d);
                        }).catch((...e) => {
                            const duration = time() - now;
                            node.setDispatchId(this.dispatchId);
                            node.setDuration(duration);
                            reject(...e);
                        });
                    });
                }
                obj.async = newAsync;
                const selector = f(obj, ...funcs);
                const name = functions.getFunctionName(mainFunction, defaultName);
                const ref = {};
                const newFunc = this.inject(selector, name, type, description, ref);
                node = ref.node;
                return newFunc;
            }
        } else if (type === constants.CONNECT) {
            const ctxKey = '__VIS_PARENT_ID__'
            return (mapState_, mapDispatch) => (Component) => {
                const mapState = mapState_ || (() => ({}));
                const self = this;
                const stack = this.stack;
                const name = functions.getNameFromComponent(Component, defaultName);
                const id = functions.make_id(name);
                const node = new Node(id, name, type);
                node.setDescription(description);
                self.addNode(node);

                class Parent extends React.Component {
                    getChildContext() {
                        return {[ctxKey]: id};
                    }

                    render() {
                        const state_ = self.store.getState();
                        const state = self.makeStateWatchableMemoized(state_);
                        stack.push(node)
                        const now = time();
                        node.setValue(mapState(state, this.props))
                        node.setDuration(time() - now);
                        node.setDispatchId(self.dispatchId);
                        const currNode = stack.pop();
                        if (stack.length > 0) {
                            stack[stack.length - 1].addDependency(currNode);
                        }

                        if (this.context[ctxKey]) {
                            const parentNode = self.getNodeById(this.context[ctxKey]);
                            parentNode.addDependency(node);
                        }
                        return <Component {...this.props} />
                    }
                }

                Parent.childContextTypes = {
                    [ctxKey]: PropTypes.string
                };
                Parent.contextTypes = {
                    [ctxKey]: PropTypes.string
                };

                return f(mapState_, mapDispatch)(Parent);
            }
        } else if (type === constants.REACT_COMPONENT) {
            const Component = f;
            const self = this;
            const name = functions.getNameFromComponent(Component, defaultName);
            const id = functions.make_id(name);
            const node = new Node(id, name, type);
            node.setDescription(description);
            self.addNode(node);
            class Parent extends React.Component {
                getChildContext() {
                    return {[ctxKey]: id};
                }

                render() {
                    if (this.context[ctxKey]) {
                        const parentNode = self.getNodeById(this.context[ctxKey]);
                        parentNode.addDependency(node);
                    }
                    return <Component {...this.props} />
                }
            }

            Parent.childContextTypes = {
                [ctxKey]: PropTypes.string
            };
            Parent.contextTypes = {
                [ctxKey]: PropTypes.string
            };

            return Parent;
        } else if (type === constants.FUNCTION) {
            let node;
            const name = functions.getFunctionName(f, defaultName);
            const newFunc = (...params) => {
                const now = time();
                const result = f(...params);
                if (node) {
                    node.setDuration(time() - now);
                    node.setDispatchId(this.dispatchId);
                }
                return result;
            }
            const ref = {};
            const returnFunc = this.inject(newFunc, name, type, description, ref);
            node = ref.node;
            return returnFunc;
        }
    }
}


/*
return (
    <ParentContext.Consumer>
        {
            (parentId) => {
                if (parentId !== null) {
                    const parentNode = self.getNodeById(parentId);
                    parentNode.addDependency(node);
                }
                return <ParentContext.Provider value={node.id}>
                    <Component {...props} />
                </ParentContext.Provider>
            }
        }
    </ParentContext.Consumer>
);*/

const graph = new Graph();
//setInterval(() => console.log(graph), 2000);

export default graph;
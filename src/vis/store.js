import Node from './node';

class Store {
    constructor() {
        this.nodes = [];
        this.indexedNodes = {};
        this.loggedIds = [];
        this.isLoggingOn = false;
        this.getState = () => {
            throw 'Add state getter function';
        };
        this.should
    }

    getSerializableNodes(state) {
        return this.nodes.map(n => n.serializeWithDerivedState(state));
    }

    addNode(node) {
        if (!(node.id in this.indexedNodes)) {
            this.nodes.push(node);
            this.indexedNodes[node.id] = node;
        }
    }

    beginLogging() {
        this.isLoggingOn = true;
        this.loggedIds = [];
    }

    stopLogging() {
        this.isLoggingOn = false;
    }

    logId(id) {
        if (!this.isLoggingOn) return;
        this.loggedIds.push(id);
    }

    popIds(count) {
        if (!this.isLoggingOn) return;
        for (let i = 0; i < count; i++) {
            this.loggedIds.pop();
        }
    }

    setStateGetter(f) {
        this.getState = f;
    }
}
const store = new Store();
export default store;

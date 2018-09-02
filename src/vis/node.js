import * as functions from './functions';

export default class Node {
    constructor(name, id, type, selector) {
        this.name = name;
        this.id = id;
        this.type = type;
        this.selector = selector;
        this.dependencies = [];
        
    }

    addDependency(id) {
        if (this.dependencies.indexOf(id) < 0) {
            this.dependencies.push(id);
        }
    }

    serializeWithDerivedState(state) {
        const self = { ...this };
        delete self.selector
        try {
            self.value = this.selector(state);
            self.pathsToState = functions
                .getPathsToVariable(state, self.value)
                .map(functions.pathToString);
        } catch (e) {
            self.value = 'ERROR: ' + e.toString();
        }
        try {
            self.stringifiedResult = JSON.stringify(self.value);
        } catch (e) {
            self.stringifiedResult = 'Failed to Serialize';
        }
        return self;
    }
}
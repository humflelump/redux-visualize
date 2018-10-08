import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import reducer from './reducers';
import graph from './vis2/pkg';


let stack = []

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;


const store = createStore(
        reducer,
        // window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
        undefined,
        composeEnhancers(s => graph.enhanceCreateStore(s)),
    );
console.log('state', store.getState());
window.store = store;




window.store.subscribe(() => {
    setTimeout(() => {
        graph.displayGraphInExtension();
    });
});

const unsubscribe = store.subscribe(() => {
    console.log('STATE:', store.getState());
});

const x = ReactDOM.render;
ReactDOM.render = (...params) => {
    console.log('render:', params);
    x(...params);
}

ReactDOM.render(<Provider store={store}>
    <App />
</Provider>, document.getElementById('root'));
registerServiceWorker();





import store from './store';

window.addEventListener('message', function(event) {
    if (event.data === 'GRAPH_REQUESTED') {
        update();
    }
    return true;
});


export function update() {
    const state = store.getState();
    const message = {
        type: 'GRAPH_SENT',
        graph: store.getSerializableNodes(state)
    };
    window.postMessage(message, '*')
}
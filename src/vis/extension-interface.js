import store from './store';

window.addEventListener('message', function(event) {
    console.log(event)
    if (event.data === 'GRAPH_REQUESTED') {
        graphWasRequested();
    }
    return 'yay';

});

setTimeout(() => {
    window.store.subscribe(() => {
        graphWasRequested();
    });
});


function graphWasRequested() {
    console.log('store requested', store);
    const state = window.store.getState();
    console.log('state', state);
    const message = {
        type: 'GRAPH_SENT',
        graph: store.getSerializableNodes(state)
    };
    console.log('sss', store.getSerializableNodes(state))
    window.postMessage(message, '*')
}
const initialState = {
    text1: '',
    text2: '',
};
const Component = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_TEXT1':
            return { ...state, text1: action.text};
        case 'SET_TEXT2':
            return { ...state, text2: action.text};
        default:
            return state
    }
};


export default Component;
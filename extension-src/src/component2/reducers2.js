const initialState = {
    page: 0,
};
const Page = (state = initialState, action) => {
    switch (action.type) {
        case 'TOGGLE_PAGE':
            return { ...state, page: state.page ? 0 : 1};
        default:
            return state
    }
};


export default Page;
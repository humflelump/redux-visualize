import { combineReducers } from 'redux'
import Component from './component/reducers';
import Page from './component/reducers2';

export default combineReducers({
    Component,
    Page,
    e: (state, action) => ({...state}),
});

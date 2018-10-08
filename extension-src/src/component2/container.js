import React from 'react';
import { connect } from 'react-redux'
import * as selectors from './selectors';
import graph from '../vis2/pkg'
import Blah3 from './container3';

function getStyles() {
    return {
        container: {
            width: 300,
            height: 300,
            backgroundColor: 'red',
        },
    };
}

const Blah = (props) => {
    const styles = getStyles();
    return <div style={styles.container} >
        <input 
            value={props.text1}
            onChange={(e) => props.setText1(e.target.value)} 
        />
        <input 
            value={props.text2}
            onChange={(e) => props.setText2(e.target.value)} 
        />
        <p>{props.concatination}</p>
        <p>{props.added5}</p>
        <p>{props.computation}</p>
        <Blah3 />
    </div>
}

const mapStateToProps = (state, ownProps) => {
  return {
    text1: state.Component.text1,
    text2: state.Component.text2,
    concatination: selectors.concatination(state),
    added5: selectors.added5(state),
    computation: selectors.computation(state).value,
  };
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    setText1: (text) => {
        dispatch({
            type: 'SET_TEXT1',
            text,
        });
    },
    setText2: (text) => {
        dispatch({
            type: 'SET_TEXT2',
            text,
        });
    },
  }
}

export default graph.add(connect, null, __filename)(
  mapStateToProps,
  mapDispatchToProps
)(Blah);
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

const MyPlainComponent = () => <p>yay</p>
const Q = graph.add(MyPlainComponent, 'wow');

const Ugh = () => <div><Q /></div>
const G = graph.add(Ugh);

const Blah = (props) => {
    const styles = getStyles();
    return <div style={styles.container} >
        <G />
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
    f: () => null,
    a: {
        wow: {
            wowoow: 'hi',
            a: [1,1,1,1,1,1,1,1,1,1,1,1,1],
        }
    }
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
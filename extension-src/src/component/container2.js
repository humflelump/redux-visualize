import React from 'react';
import { connect } from 'react-redux'
import * as selectors from './selectors2';
import graph from '../vis2/pkg'

function getStyles() {
    return {
        container: {
            width: 10,
            height: 10,
            backgroundColor: 'green',
        },
    };
}

const Blah2 = (props) => {
    const styles = getStyles();
    return <div style={styles.container} >

    </div>
}

const mapStateToProps = (state, ownProps) => {
  return {
    added10: selectors.added10(state),
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
)(Blah2);
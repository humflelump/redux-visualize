import React from 'react';
import { connect } from 'react-redux'
import * as selectors from './selectors2';
import graph from '../vis2/pkg'
import Page from './component4';

function getStyles() {
    return {
        container: {
            width: 100,
            height: 100,
            backgroundColor: 'orange',
        },
    };
}

const Blah3 = (props) => {
    const styles = getStyles();
    return <div onClick={props.toggle} style={styles.container} >
        {
            props.page ? <Page/> : null
        }
    </div>
}

const mapStateToProps = (state, ownProps) => {
  return {
    added10: selectors.added10(state),
    page: state.Page.page,
  };
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    toggle: () => {
        dispatch({
            type: 'TOGGLE_PAGE',
        });
    },
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

export default graph.add(connect)(
  mapStateToProps,
  mapDispatchToProps
)(Blah3);
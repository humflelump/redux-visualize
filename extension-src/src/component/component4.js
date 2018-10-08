import React from 'react';
import { connect } from 'react-redux'
import * as selectors from './selectors2';
import graph from '../vis2/pkg'

function getStyles() {
    return {
        container: {
            width: 10,
            height: 10,
            backgroundColor: 'red',
        },
    };
}

const Page = (props) => {
    const styles = getStyles(props.page);
    return <div style={styles.container} >

    </div>
}

const mapStateToProps = (state, ownProps) => {
  return {
    page: state.Page.page,
  };
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {

  }
}

export default graph.add(connect, null, __filename)(
  mapStateToProps,
  mapDispatchToProps
)(Page);
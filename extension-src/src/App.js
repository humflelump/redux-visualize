import React from 'react';
import MyComponent from './component/container';
import MyComponent2 from './component/container2';
import MyComponent3 from './component2/container';
import MyComponent4 from './component2/container2';
import MyComponent5 from './component3/container';
import MyComponent6 from './component3/container2';
import MyComponent7 from './component4/container';
import MyComponent8 from './component4/container2';
import graph from './vis2/pkg'
import { connect } from 'react-redux'

class App extends React.Component {
  render() {
    return (
      <div>
        <MyComponent />
        <MyComponent2 />
        <MyComponent3 />
        <MyComponent4 />
        <MyComponent5 />
        <MyComponent6 />
        <MyComponent7 />
        <MyComponent8 />
      </div>
    );
  }
}

export default graph.add(connect)(null, null)(App);

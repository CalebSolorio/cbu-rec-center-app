import React, { Component } from 'react';
import { AppRegistry, Navigator } from 'react-native';
import Home from './src/pages/Home';

class CBURecCenterApp extends Component {
  render() {
    return (
      <Home />
    )
  }
}

AppRegistry.registerComponent('CBURecCenterApp', () => CBURecCenterApp);
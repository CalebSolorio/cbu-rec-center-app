import React, { Component, PropTypes } from 'react';
import { View, Text, TouchableHighlight } from 'react-native';

export default class Header extends Component {
  render() {
    return (
        <View style={{flex: 1}}>
            <View style={{flex: 1, backgroundColor: 'blue'}}>
                <Text style={{color: 'white'}}> Im just a header </Text>
            </View>
        </View>
    )
  }
}
import React, { Component, PropTypes } from 'react';
import { View, Text, StyleSheet, TouchableHighlight } from 'react-native';
import Header from '../Components/Header'

export default class ErrorPage extends Component {
  render() {
    return (
        <View>
        <Header pageName="Error" navigator={this.props.navigator} id={this.props.id} token={this.props.token}/>
        <Text style= {{flex: 9}}> Something unholy has happened within the app to pring you here </Text>
        </View>
    )
  }
}
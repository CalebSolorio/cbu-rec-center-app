import React, { Component, PropTypes } from 'react';
import { View, Text, StyleSheet, TouchableHighlight } from 'react-native';
import Header from '../Components/Header'

export default class CalendarPage extends Component {
  render() {
    return (
        <View style= {{flex:1, flexDirection: 'column'}}>
            <Header pageName="Calendar" navigator={this.props.navigator}/>
            <Text style= {{flex: 9}}> Hi im the Calendar Page </Text>
        </View>
    )
  }
}
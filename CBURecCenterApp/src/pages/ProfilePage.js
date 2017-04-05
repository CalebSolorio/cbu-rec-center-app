import React, { Component, PropTypes } from 'react';
import { View, Text, StyleSheet, TouchableHighlight } from 'react-native';
import Header from '../Components/Header'

export default class ProfilePage extends Component {
  constructor(props){
    super(props);
  }

  render() {
  console.log(this.props.id +" id");
  console.log(this.props.token +" id");
    return (
        <View style= {{flex:1, flexDirection: 'column'}}>
            <Header pageName="Profile" navigator={this.props.navigator}/>
            <View style= {{flex: 9}}>

            </View>
        </View>
    )
  }
}
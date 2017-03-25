import React, { Component, PropTypes } from 'react';
import { View, Text, StyleSheet, TouchableHighlight } from 'react-native';
import Header from '../Components/Header'
import HomeBox from '../Components/HomeBox'
import styles from '../Utility/styles'

export default class HomePage extends Component {

  render() {
    return (
      <View style= {{flex:1, flexDirection: 'column'}}>
        <Header pageName="Home" navigator={this.props.navigator}/>
        <View style={styles.Rows}>
            <HomeBox title="Calendar" navigator={this.props.navigator} token={this.props.token}/>
            <HomeBox title="Profile" navigator={this.props.navigator} token={this.props.token}/>
        </View>
        <View style={styles.Rows}>
            <HomeBox title="Info" navigator={this.props.navigator} token={this.props.token}/>
            <HomeBox title="Marked" navigator={this.props.navigator} token={this.props.token}/>
        </View>
      <View style={styles.Rows}>
            <Text> "Hello I am the placeholder for the discovery stuff" </Text>
      </View>
    </View>
    )
  }
}
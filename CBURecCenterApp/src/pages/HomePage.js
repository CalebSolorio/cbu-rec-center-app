import React, { Component, PropTypes } from 'react';
import { View, Text, StyleSheet, TouchableHighlight } from 'react-native';
import Header from '../Components/Header'
import HomeBox from '../Components/HomeBox'

export default class HomePage extends Component {

  render() {
    return (
      <View style= {{flex:1, flexDirection: 'column'}}>
        <Header pageName="Home" navigator={this.props.navigator}/>
        <View style={styles.Rows}>
            <HomeBox title="Calendar" navigator={this.props.navigator}/>
            <HomeBox title="Events" navigator={this.props.navigator}/>
        </View>
        <View style={styles.Rows}>
            <HomeBox title="Info" navigator={this.props.navigator}/>
            <HomeBox title="Discover" navigator={this.props.navigator}/>
        </View>
        <View style={styles.Rows}>
            <HomeBox title="Profile" navigator={this.props.navigator}/>
            <HomeBox title="Settings" navigator={this.props.navigator}/>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
    Rows: {
        flex: 3,
        flexDirection: 'row'
    }
});
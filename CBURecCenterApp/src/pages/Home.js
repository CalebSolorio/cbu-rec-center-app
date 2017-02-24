import React, { Component, PropTypes } from 'react';
import { View, Text, StyleSheet, TouchableHighlight } from 'react-native';
import Header from '../src/Components/Header'

export default class Home extends Component {
  render() {
    return (
      <View style= {{flex:1, flexDirection: 'column'}}>
        <Header />
        <View style={styles.Rows}>
            <View style={styles.Box}>
                <Text> Calendar </Text>
            </View>
            <View style={styles.Box}>
                <Text>Events </Text>
            </View>
        </View>
        <View style={styles.Rows}>
            <View style={styles.Box}>
                <Text>Info </Text>
            </View>
            <View style={styles.Box}>
                <Text>Explore! </Text>
            </View>
        </View>
        <View style={styles.Rows}>
            <View style={styles.Box}>
                <Text>Profile </Text>
            </View>
            <View style={styles.Box}>
                <Text>Settings </Text>
            </View>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
    Box: {
        backgroundColor: 'beige',
        borderColor: 'black',
        borderWidth: 1,
        flex: 1
    },
    Rows: {
        flex: 3,
        flexDirection: 'row'
    }
});
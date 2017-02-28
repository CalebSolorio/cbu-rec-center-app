import React, { Component, PropTypes } from 'react';
import { View, Text, StyleSheet, TouchableHighlight } from 'react-native';

export default class Header extends Component {

  render() {
    return (
        <View style={styles.bar}>
            <TouchableHighlight onPress={() => this.props.navigator.pop()} style={styles.back}>
                <Text> back </Text>
            </TouchableHighlight>
            <View style={{flex: 10}}>
                <Text style={styles.title}>{this.props.pageName}</Text>
            </View>
        </View>
    )
  }
}

const styles = StyleSheet.create({
    title: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        justifyContent: 'center',
        fontSize: 36,
    },
    back: {
        backgroundColor: 'white',
        flex: 1,
    },
    bar: {
        flex: 1,
        flexDirection: 'row',
        height: 50,
        backgroundColor: 'blue'
    }
});
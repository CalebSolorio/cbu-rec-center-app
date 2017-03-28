import React, { Component, PropTypes } from 'react';
import { View, Text,  StyleSheet, TouchableHighlight } from 'react-native';

export default class HomeBox extends Component {

  constructor(){
      super()
      this.navigate = this.navigate.bind(this)
    }

    navigate(name){
        this.props.navigator.push({
            name: name,
            token: this.props.token
        })
    }

  render() {
    return (
        <TouchableHighlight onPress={() => this.navigate(this.props.title)} style={styles.Box}>
            <Text style={styles.Text}> {this.props.title}</Text>
        </TouchableHighlight>

    )
  }
}

const styles = StyleSheet.create({
    Box: {
        backgroundColor: 'green',
        borderColor: 'black',
        borderWidth: 1,
        flex: 1
    },
    Text: {
        color: 'white',
        fontSize:36
    }
});
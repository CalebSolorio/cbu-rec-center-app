import React, { Component, PropTypes } from 'react';
import { View, Text,  StyleSheet, TouchableHighlight } from 'react-native';
import styles from '../Utility/styles'

export default class HomeBox extends Component {

  constructor(){
      super()
      this.navigate = this.navigate.bind(this)
    }

    navigate(name){
        this.props.navigator.push({
            name: name,
            token: this.props.token,
            id: this.props.id
        })
    }

  render() {
    return (
        <TouchableHighlight onPress={() => this.navigate(this.props.title)} style={styles.HomeBox}>
            <Text style={styles.HomeBox_Txt}> {this.props.title}</Text>
        </TouchableHighlight>

    )
  }
}
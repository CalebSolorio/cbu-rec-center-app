import React, { Component, PropTypes } from 'react';
import { BackAndroid, View, Text, StyleSheet, TouchableHighlight } from 'react-native';

export default class Header extends Component {

    constructor(){
        super()
            this.handleBack = (() => {
              if (this.props.navigator && this.props.navigator.getCurrentRoutes().length > 1){
                this.props.navigator.pop();
                return true; //avoid closing the app
              }

              return false; //close the app
            }).bind(this) //don't forget bind this, you will remenber anyway.

    }

      componentDidMount() {
        BackAndroid.addEventListener('hardwareBackPress', this.handleBack);
      }

      componentWillUnmount() {
        BackAndroid.removeEventListener('hardwareBackPress', this.handleBack);
      }

  render() {
    if(this.props.pageName !== 'Home'){
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
    return (
        <View style={styles.bar}>
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
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

      navigate(name){
          this.props.navigator.push({
              name: name,
              token: this.props.token,
              id: this.props.id
          })
      }

      componentDidMount() {
        BackAndroid.addEventListener('hardwareBackPress', this.handleBack);
      }

      componentWillUnmount() {
        BackAndroid.removeEventListener('hardwareBackPress', this.handleBack);
      }

      async logout(){
        this.navigate("Logout");
      }

  render() {
    if(this.props.pageName !== 'Home'){
        return (
            <View style={styles.bar}>
                <TouchableHighlight onPress={() => this.navigate("Home")} style={styles.back}>
                    <Text> Home </Text>
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
            <TouchableHighlight onPress={() => this.logout()} style={styles.back}>
                <Text> Log out </Text>
            </TouchableHighlight>
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
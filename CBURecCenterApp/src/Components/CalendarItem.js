import React, { Component, PropTypes } from 'react';
import { View, Text,  Alert, Dimensions, StyleSheet,
  TouchableHighlight } from 'react-native';

import moment from 'moment';
import { Card } from 'react-native-material-design';

import Api from '../Utility/Api';

const window = Dimensions.get('window');

export default class CalendarItem extends Component {

    constructor(props) {
        super(props);
        this.state = {
              date: null,
              startTime: null,
              endTime: null,
            }
    }

    componentWillMount(){
        const startDate = new Date(this.props.startTime);
        this.setState({
            date: moment(this.props.startTime).format("dddd") + ", " +
              moment(this.props.startTime).format("MMMM Do"),
            startTime: moment(this.props.startTime).format("hh:mm A")
        })
    }

    markEvent(){
        Api.markEvent(this.props.id, this.props.token).then((value) => {
            if(value.status === 200){
                Alert.alert(this.props.title + " has been marked")
            }
            else{
                 Alert.alert("failed to mark event", value.message)
            }
          })
    }

// For later
// <Card style={{ flex: .5 }}>

    render(){
      const styles = StyleSheet.create({
          card: {
            marginVertical: 4,
            backgroundColor: this.props.type == "class" ?
              "#C1CD23" : "#FF6C00",
          },
          title: {
              color: 'white',
              fontSize: 30,
          },
          bottomRow: {
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
          },
          text: {
              color: 'white',
              fontSize: 18,
          },
      });

      return(
          <Card style={ styles.card }>
            <Text style={ styles.title }> {this.props.title} </Text>
            <View style={ styles.bottomRow }>
              <Text style={ styles.text }> {this.state.date} </Text>
              <Text style={ styles.text }> {this.state.startTime}</Text>
            </View>
          </Card>
      );
    }
}

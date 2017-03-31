import React, { Component, PropTypes } from 'react';
import { View, Text, ListView, StyleSheet, TouchableHighlight, ActivityIndicator} from 'react-native';
import Header from '../Components/Header';
import Api from '../Utility/Api';
import styles from '../Utility/styles';


export default class CalendarPage extends Component {

constructor(props) {
    super(props);
    this.state = {
          data: null,
          date: JSON.stringify(new Date())
        }
}

    async componentWillMount() { this.setState(
        {data: await Api.getDate(new Date(), this.props.token)});
    }

    //increment day by 1 and update state
    async nextDay(){
        newDate = new Date(JSON.parse(this.state.date));
        newDate.setDate(newDate.getDate() + 1);
        console.log(newDate);
        this.setState({
            date: JSON.stringify(newDate),
            data: await Api.getDate(newDate, this.props.token)
            });
    }
    //decrement day by 1 and update state
    async previousDay(){
        if(new Date(JSON.parse(this.state.date)) > new Date()){
            newDate = new Date(JSON.parse(this.state.date));
            newDate.setDate(newDate.getDate() - 1);
            console.log(newDate);
            this.setState({
                date: JSON.stringify(newDate),
                data: await Api.getDate(newDate, this.props.token)
                });
            //console.log(this.state.date + " " + this.props.token);
        }
    }

    render() {
        //until data is finished loading
        if (!this.state.data) {
          return (
            <ActivityIndicator
              animating={true}
              style={styles.indicator}
              size="large"
            />
          );
        }
        //once data has finished loading
        return (
          <View style={{flex: 1}}>
            <Header pageName="Calendar" navigator={this.props.navigator} style={{flex: 1}}/>
            <View style={{flex: 7}}>
                <Text> {this.state.data.date} </Text>
              { this.state.data.items.map((item) => (
                <View>
                  <Text>{item.details.title}</Text>
                  <Text>{item.details.start.dateTime} </Text>
                  <Text></Text>
                </View>
              ))}
            </View>
            <View style={{flex: 2, flexDirection: 'row'}}>
                <TouchableHighlight onPress={() => this.previousDay()} style={{flex: 2}}>
                    <Text> Previous Day </Text>
                </TouchableHighlight>
                <TouchableHighlight onPress={() => this.nextDay()} style={{flex: 2}}>
                    <Text> Next Day </Text>
                </TouchableHighlight>

            </View>
          </View>
        );
      }
    }
import React, { Component, PropTypes } from 'react';
import { View, Text, ListView, StyleSheet, TouchableHighlight, ActivityIndicator} from 'react-native';
import Header from '../Components/Header';
import Api from '../Utility/Api';


export default class CalendarPage extends Component {

constructor(props) {
    super(props);
    this.state = {
          data: null,
          dateIndex: 0
        }
}

    async componentWillMount() { this.setState(
        {data: await Api.getDates()},

        )
    }

    nextDay(){
        this.setState({dateIndex: this.state.dateIndex + 1});
    }

    previousDay(){
        if(this.state.dateIndex !== 0){
            this.setState({dateIndex: this.state.dateIndex - 1});
        }
    }

    render() {
        if (!this.state.data) {
          return (
            <ActivityIndicator
              animating={true}
              style={styles.indicator}
              size="large"
            />
          );
        }

        return (
          <View style={{flex: 1}}>
            <Header pageName="Calendar" navigator={this.props.navigator} style={{flex: 1}}/>
            <View style={{flex: 7}}>
              { this.state.data.days[this.state.dateIndex].items.map((item) => (
                <View>
                  <Text>{item.summary}</Text>
                  <Text>{item.start.dateTime}</Text>
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

const styles = StyleSheet.create({
  indicator: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 80
  }
});
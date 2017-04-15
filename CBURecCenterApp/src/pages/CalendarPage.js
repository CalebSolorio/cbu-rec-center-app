import React, { Component, PropTypes } from 'react';
import { View, Image, Text, ListView, ScrollView, StyleSheet, TouchableHighlight, ActivityIndicator} from 'react-native';
import Header from '../Components/Header';
import Api from '../Utility/Api';
import CalendarItem from '../Components/CalendarItem'
import styles from '../Utility/styles';
import moment from 'moment';


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
            <Header pageName={moment(this.state.data.date).format("dddd, MMMM Do")} navigator={this.props.navigator} style={{flex: 1}} id={this.props.id} token={this.props.token}/>
            <View style={{flex: 9}}>
                <View style={styles.Calendar_Col}>
                    <TouchableHighlight onPress={() => this.previousDay()} style={styles.Calendar_Nav}>
                         <Image source={{uri:"https://cdn4.iconfinder.com/data/icons/ionicons/512/icon-ios7-arrow-left-128.png"}} style={styles.Calendar_Img}/>
                    </TouchableHighlight>
                    <View style={styles.Calendar_Obj} >
                        <ScrollView>
                          { this.state.data.items.map((item) => (
                            <CalendarItem title={item.details.title} startTime={item.details.start.dateTime} endTime={item.details.end.dateTime}
                                type={item.details.type} id={item.details.id} token={this.props.token}/>
                          ))}
                        </ScrollView>
                    </View>
                    <TouchableHighlight onPress={() => this.nextDay()} style={styles.Calendar_Nav}>
                        <Image source={{uri:"https://cdn4.iconfinder.com/data/icons/ionicons/512/icon-ios7-arrow-right-128.png"}}  style={styles.Calendar_Img}/>
                    </TouchableHighlight>
                </View>
            </View>
          </View>
        );
      }
    }
import React, { Component, PropTypes } from 'react';
import { View, Text,  Alert, ScrollView, ActivityIndicator, StyleSheet, TouchableHighlight } from 'react-native';
import Api from '../Utility/Api';
import styles from '../Utility/styles';
import CalendarItem from '../Components/CalendarItem'


export default class markedPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
              data: null,
              date: JSON.stringify(new Date())
       }
    }

    async componentWillMount() { this.setState(
            {data: await Api.getMarks(this.props.token)});
    }

    render(){
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
        return(
            <View>
                <ScrollView>
                  { this.state.data.map((item) => (
                    <CalendarItem title={item.title} startTime={item.start.dateTime} endTime={item.end.dateTime}
                        type={item.type} id={item.id} token={this.props.token}/>
                  ))}
                </ScrollView>
            </View>
        )
    }
}
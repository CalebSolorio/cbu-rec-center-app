import React, { Component, PropTypes } from 'react';
import { View, Text, ListView, StyleSheet, TouchableHighlight } from 'react-native';
import Header from '../Components/Header';
import schedule from '../schedule.json';

export default class CalendarPage extends Component {
    constructor(props) {
        super(props);
        const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state = {
          dataSource: ds.cloneWithRows([
              schedule.days[0].date, schedule.days[0].hours.open, schedule.days[0].items[0].summary,
              schedule.days[1].date, schedule.days[1].hours.open, schedule.days[1].items[0].summary
          ])
        };
      }
      render() {
        return (
          <View style={{flex: 1}}>
            <Header pageName="Calendar" navigator={this.props.navigator}/>
            <View style = {{flex:9}}>
                <ListView
                  dataSource={this.state.dataSource}
                  renderRow={(rowData) => <Text>{rowData}</Text>}
                />
             </View>
          </View>
        );
      }
    }

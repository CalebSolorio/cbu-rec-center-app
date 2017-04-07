import React, { Component, PropTypes } from 'react';
import { View, Text, Image, StyleSheet, TouchableHighlight } from 'react-native';
import Header from '../Components/Header'
import styles from '../Utility/styles';

export default class InfoPage extends Component {
  render() {
    return (
        <View style= {{flex:1, flexDirection: 'column'}}>
            <Header pageName="Info" navigator={this.props.navigator} id={this.props.id} token={this.props.token}/>
            <View style= {{flex: 9}}>
                <Image
                    style={{flex:4}}
                    source={{uri : 'http://www.kaylainthecity.com/wp-content/uploads/gym.jpg'}}
                />
                <View style={{flex:2}}>
                    <Text style={styles.HOP}>Rec Center Hours of Operation </Text>
                    <Text> Mon–Thurs: 6 a.m.–12 a.m. </Text>
                    <Text> Friday: 6 a.m.–10 p.m. </Text>
                    <Text> Saturday: 10 a.m.–6 p.m. </Text>
                    <Text> Sunday: 5 p.m.–10 p.m. </Text>
                </View>
                <View style={{flex:2}}>
                    <Text style={styles.HOP}>Climbing Wall Hours of Operation </Text>
                    <Text> Mon–Fri: 6 a.m.–10 a.m. and 4 p.m.–close </Text>
                    <Text> Sat–Sun: open during hours of operation </Text>
                </View>
                <Text style={{flex:1}}> California Baptist University
                                        3536 Adams Street
                                        Riverside, CA 92504
                </Text>
            </View>
        </View>
    )
  }
}
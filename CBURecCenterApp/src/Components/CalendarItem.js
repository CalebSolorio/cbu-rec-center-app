import React, { Component, PropTypes } from 'react';
import { View, ScrollView, Text,  Alert, Animated, Button, Dimensions,
  StyleSheet, TouchableHighlight } from 'react-native';

import moment from 'moment';
import { Card, Ripple } from 'react-native-material-design';

import Api from '../Utility/Api';

const window = Dimensions.get('window');

const COMPACT_HEIGHT = window.height / 8;
const EXPANDED_HEIGHT = window.height / 2;

export default class CalendarItem extends Component {

    constructor(props) {
        super(props);

        this.state = {
          date: null,
          startTime: null,
          endTime: null,
          marked: props.marked,
          child: props.child ? props.child : false,
          expand: props.expand ? props.expand : false,
          height: new Animated.Value(COMPACT_HEIGHT),
          // opacity: new Animated.Value(0),
        };
    }

    componentWillMount(){
      this.update();
    }

    componentWillReceiveProps(nextProps) {
      if(nextProps != this.props) {
        this.update(nextProps);
      }
    }

    update(newProps) {
      const props = newProps ? newProps :  this.props;
      this.setState(props);

      const startDate = new Date(props.startTime);
      this.setState({
          date: moment(props.startTime).format("dddd") + ", " +
            moment(props.startTime).format("MMMM Do"),
          startTime: moment(props.startTime).format("hh:mm A"),
          endTime: moment(props.endTime).format("hh:mm A")
      });

      if(props.marked == null) {
        Api.getMarks(props.token).then((events) => {
            for(event in events){
              if(event.id == props.id) {
                this.setState({ marked: true });
              }
            }
        });
      }

      Animated.timing(this.state.height, {
        duration: 200,
        toValue: props.expand ? EXPANDED_HEIGHT : COMPACT_HEIGHT,
      }).start();
    }

    expand() {
      if(this.state.child) {
        this.props.handleClick(this.props.id);
      } else {
        const expand = !this.state.expand;
        this.setState({ expand: expand });
        this.animate(expand);
      }
    }

    animate(expand) {
      Animated.timing(this.state.height, {
        duration: 200,
        toValue: expand ? EXPANDED_HEIGHT : COMPACT_HEIGHT,
      }).start();
    }

    markEvent(){
      if(this.state.marked) {
        Alert.alert(
          'Are you sure you want to unmark ' + this.props.title + '?',
          'Senpai pls...',
          [
            { text: 'Cancel' },
            { text: "Yes", onPress: () => {
                Api.unmarkEvent(this.props.id, this.props.token).then((value) => {
                    if(value.status === 200){
                        this.setState({ marked: false });
                        if(this.props.handleMark) {
                          this.props.handleMark();
                        }
                    }
                    else{
                      Alert.alert("Error " + value.status + ":", value.message);
                    }
                });
              }
            },
          ],
        );
      } else {
        Api.markEvent(this.props.id, this.props.token).then((value) => {
            if(value.status === 200){
              this.setState({ marked:true });
              if(this.props.handleMark) {
                this.props.handleMark();
              }
            }
            else{
                 Alert.alert("Error " + value.status + ":", value.message);
            }
          });
      }
    }

    render(){
      const styles = StyleSheet.create({
          card: {
            marginVertical: 4,
            backgroundColor: this.props.type == "class" ?
              "#A37400" : "#AC451E",
            flex: 1,
            justifyContent: 'space-between',
          },
          title: {
              color: 'white',
              fontSize: 30,
          },
          bottomRow: {
            // flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
          },
          text: {
              color: 'white',
              fontSize: 18,
              marginBottom: 5,
          },
      });

      const details = this.state.expand ?
        <Text style={{color:'white', fontSize: 18 }}>
          { this.props.description }
        </Text> : null;

      const bottomRight = this.state.expand ?
          <View>
            <Text style={ styles.text }>{this.state.date}</Text>
            <Text style={ styles.text }>{this.state.startTime} - {this.state.endTime}</Text>
          </View>
        :
          <Text style={ styles.text }>
            {this.state.date}
          </Text>;

      const bottomLeft = this.state.expand ?
          <View style={{
            flex: 1,
            flexDirection:"row",
            alignItems:"center",
          }}>
            <View style={{
              flex: 1,
              flexDirection:"column",
              alignItems:"flex-end",
            }}>
              <Button
                title={this.state.marked ? "Unmark" : "Mark"}
                onPress={ () => this.markEvent() }
                color="#002554"
              />
            </View>
          </View>
        :
          <Text style={ styles.text }>
            {this.state.startTime}
          </Text>;

      return(
          <Ripple>
            <Card style={ styles.card } onPress={() => {this.expand()}}>
              <Animated.View
                style={{ flexDirection:'column',
                  justifyContent: 'space-between',
                  height: this.state.height
              }}>
                <Text style={ styles.title }>{ this.props.title }</Text>
                {details}
                <View style={ styles.bottomRow }>
                  { bottomRight }
                  { bottomLeft }
                </View>
              </Animated.View>
            </Card>
          </Ripple>
      );
    }
}

import React, { Component, PropTypes } from 'react';
import { View, ScrollView, Text, ActivityIndicator, Alert, Animated, Button, Dimensions,
  StyleSheet, TouchableHighlight, Image } from 'react-native';

import moment from 'moment';
import { Card, Ripple } from 'react-native-material-design';

import Api from '../Utility/Api';

const window = Dimensions.get('window');

const COMPACT_HEIGHT = window.height / 10;
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
          loading: false,
          color: this.props.type == "class" ?
            'rgba(163, 116, 0, 1)' : 'rgba(172, 69, 30, 1)',
          rgba: new Animated.Value(0),
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
      const props = newProps ?
        Object.assign({}, newProps, { loading:false }) :
        Object.assign({}, this.props, { loading:false });
      this.setState(props);

      this.setState({
          date: moment(props.startTime).format("dddd") + ", " +
            moment(props.startTime).format("MMMM Do"),
          startTime: moment(props.startTime).format("h:mm A"),
          endTime: moment(props.endTime).format("h:mm A")
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

      this.animate(props.expand);
    }

    expand() {
      if(this.state.child) {
        this.props.handleClick(this.props.id);
      } else {
        const expand = !this.state.expand;
        this.setState({ expand });
        this.animate(expand);
      }
    }

    animate(expand) {
      console.log("animate", expand);

      console.log(expand ? this.state.color[0] : 255);
      console.log(expand ? this.state.color[1] : 255);
      console.log(expand ? this.state.color[2] : 255);

      Animated.timing(this.state.height, {
        duration: 200,
        toValue: expand ? EXPANDED_HEIGHT : COMPACT_HEIGHT,
      }).start();

      Animated.timing(this.state.rgba, {
        toValue: expand ? 1 : 0,
          duration: 200,
        }
      ).start();
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
                        if(this.props.handleMark) {
                          this.setState({ loading: true });
                          this.props.handleMark();
                        } else {
                          this.setState({ marked: false });
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
              if(this.props.handleMark) {
                this.setState({ loading: true });
                this.props.handleMark();
              } else {
                this.setState({ marked: true });
              }
            }
            else{
                 Alert.alert("Error " + value.status + ":", value.message);
            }
          });
      }
    }

    render(){
      var color = this.state.rgba.interpolate({
        inputRange: [0, 1],
        outputRange: ['rgba(255, 255, 255, 1)', this.state.color]
      });

      const styles = StyleSheet.create({
          card: {
            marginHorizontal:0,
            marginVertical: 5,
            flex: 1,
            justifyContent: 'space-between',
          },
          indicator: {
              flex: 1,
              height: 80,
          },
          title: {
              fontSize: 30,
          },
          bottomRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
          },
          text: {
            fontSize: 18,
            marginBottom: 5,
          },
      });

      const title = this.state.expand ?
        <Text style={[styles.title, {color: 'white'}]}>{ this.props.title }</Text> :
        <Text style={ styles.title }>{ this.props.title }</Text>;

      const details = this.state.expand ?
        <View>
          <Text style={{color:'white', fontSize: 18 }}>
            { this.props.description }
          </Text>
        </View> : null;

      const bottomLeft = this.state.expand ?
          <View>
            <Text style={[styles.text, {color: 'white'}]}>{this.state.date}</Text>
            <Text style={[styles.text, {color: 'white'}]}>{this.state.startTime} - {this.state.endTime}</Text>
          </View>
        :
          <Text style={ styles.text }>
            {this.state.date}
          </Text>;

      const loadingInticator = this.state.loading ?
        <ActivityIndicator
          animating={true}
          style={styles.indicator}
          size="large"
          color="#002554"
        />
      : null;

      const bottomRight = this.state.expand ?
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
              { loadingInticator }
            </View>
            <View style={{
              flex: 1,
              flexDirection:"column",
              alignItems:"flex-end",
            }}>
              <Button
                style={{width: 150}}
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
            <Card style={ styles.card } elevation={ this.state.expand ? 4 : 0 }
                onPress={() => {this.expand()}}>
              <Animated.View style={{
                position:'absolute',
                top: 0,
                left: 0,
                height: window.height /2,
                width: window.width,
                backgroundColor: color,
              }}>
              </Animated.View>
              <Animated.View style={{
                position:'absolute',
                top: 0,
                left: 0,
                backgroundColor: this.state.color,
                height: this.state.height,
                width: 7
              }}>
              </Animated.View>

              <Animated.View
                style={{
                  flexDirection:'column',
                  justifyContent: 'space-between',
                  height: this.state.height
              }}>
                { title }
                { details }
                <View style={ styles.bottomRow }>
                  { bottomLeft }
                  { bottomRight }
                </View>
              </Animated.View>
            </Card>
          </Ripple>
      );
    }
}

import React, { Component, PropTypes } from 'react';
import { View, Keyboard, AsyncStorage, Text, ActivityIndicator, Alert,
  TextInput, StyleSheet, ScrollView, TouchableHighlight, Button,
  Dimensions, Animated, Image } from 'react-native';

import { Card, Divider, Ripple } from 'react-native-material-design';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { MKTextField } from 'react-native-material-kit';

import Api from '../Utility/Api';
import logo from '../Utility/logo.png';
import CalendarItem from '../Components/CalendarItem';

const window = Dimensions.get('window');

export default class PopularPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: "Lancer",
      data: null,
      marks: null,
      events: null,
      expandId: null,
      gatheringData: false,
    };

    this.loadData = this.loadData.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
  }

  async componentWillMount() {
    await this.loadData();
  }

  loadData = () => {
    Api.getUser(this.props.id, this.props.token).then((user) => {
      this.setState({name: user.name.split(" ")[0]});
    });

    this.getMarks();
    this.getViral();
  }

  getMarks = () => {
    Api.getMarks(this.props.token).then((marks) => {
      this.setState({marks});
    });
  }

  getViral = () => {
    if(!this.state.gatheringData && !this.state.noMoreData) {
      this.setState({ gatheringData: true });
      Api.getViral(this.state.events != null ? this.state.events.length : 0,
          this.props.token).then((events) => {
        this.setState({ gatheringData: false });
        if(events.status == 200 && this.state.events) {
          this.setState({ events:
            this.state.events.concat(events.data.items) });
        } else if(events.status == 200) {
          this.setState({ events: events.data.items });
        } else {
          this.setState({ noMoreData: true });
        }
      });
    }
  }

  handleScroll = (e) => {
    if(e.nativeEvent.contentOffset.y > e.nativeEvent.contentSize.height
        - window.height * 2) {
      this.getViral();
    }
  }

  render() {
    const styles = StyleSheet.create({
      container: {
        backgroundColor: '#002554',
        flex: 1,
        flexDirection: 'column',
      },
      indicator: {
          flex: 1,
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: 80,
          marginBottom: 15,
      },
      text: {
        color: "white",
        fontSize: 20,
        width: window.width - 30,
        paddingBottom: 5,
        textAlign: "center",
        alignSelf:'center',
      },
      logo: {
        height: window.width / 8,
        resizeMode: 'contain',
        margin: 15,
        alignSelf:'center',
      },
      icon: {
        padding: 10,
        alignSelf:'center',
        zIndex: 5,
      },
    });

    let items = <View></View>;

    if(this.state.events == null) {
      items=
        <ActivityIndicator
          animating={true}
          style={styles.indicator}
          size="large"
          color="#A37400"
        />;
    } else {
      let count = 0;
      items =
      this.state.events.map((event) => {
        count++;
        if(count < this.state.events.length) {
          for(mark in this.state.marks) {
            if(mark.id == event.id) {
              return(
                <CalendarItem key={event.id}
                  handleMark={() => this.getMarks()}
                  marked={true} title={event.title}
                  startTime={event.start.dateTime} endTime={event.end.dateTime}
                  description={event.description} type={event.type} id={event.id}
                  child={true} expand={ event.id == this.state.expandId }
                  handleClick={(id) => this.setState({ expandId:
                    (id == this.state.expandId ? null : id) })} />
              );
            }
            return (
              <CalendarItem key={event.id}
                handleMark={() => this.getMarks()}
                marked={false} title={event.title}
                startTime={event.start.dateTime} endTime={event.end.dateTime}
                description={event.description} type={event.type} id={event.id}
                child={true} expand={ event.id == this.state.expandId }
                handleClick={(id) => this.setState({ expandId:
                  (id == this.state.expandId ? null : id) })} />
            );
          }
        } else {
          return null;
        }
      });
    }

    return (
      <View
        style={styles.container}
        behavior="padding"
      >
        <ScrollView onScroll={(e) => this.handleScroll(e)}>
          <Ripple>
            <View style={{
              flexDirection: 'row',
              justifyContent:'space-between',
            }} onPress={() => console.log("aaayy")}>

            <Icon name="account-circle" size={35} color="white"
              style={ styles.icon } onPress={() => this.props.onPress(-1)}/>

              <View style={{
                flex:1,
              }}>
                <Image source={logo} style={styles.logo} />
              </View>
              <Icon name="info-outline" size={35} color="white"
                style={ styles.icon } onPress={() => this.props.onPress(1)} />
            </View>
          </Ripple>
            <Card style={{
              marginHorizontal: 0,
              width: window.width,
            }}>
              <Text style={{
                fontSize: 35,
                marginVertical: 5,
                alignSelf:'center',
              }}>Welcome Back, {this.state.name}!</Text>
              <View style={{
                flex: 1,
              }}>
                <Text style={{
                  fontSize: 20,
                  marginBottom: 10,
                  alignSelf:'center',
                }}>Here's what's going on at the Rec Center:</Text>
              </View>
              <Divider style={{
                marginBottom: 15,
              }} />
              {items}
            </Card>
          <Text>{"\n"}</Text>
        </ScrollView>
      </View>
    );
  }
}

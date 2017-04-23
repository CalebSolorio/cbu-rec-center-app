import React, { Component, PropTypes } from 'react';
import { View, Keyboard, AsyncStorage, Text, Alert,
  TextInput, StyleSheet, ScrollView, Button,
  Dimensions, Animated, Image } from 'react-native';

import Swiper from 'react-native-swiper';

import PopularPage from '../pages/PopularPage';
import InfoPage from '../pages/InfoPage';
import ProfilePage from '../pages/ProfilePage';

import Api from '../Utility/Api';
import logo from '../Utility/logo.png';

const window = Dimensions.get('window');

export default class HomePage extends Component {
  constructor(props){
   super(props);

   this.state = {
     marks: null,
   }

   this.onPress = this.onPress.bind(this);
   this.getMarks = this.getMarks.bind(this);
  }

  navigate(name){
      this.props.navigator.push({
          name: name,
          token: this.props.token,
          id: this.props.id,
      })
  }

  async componentWillMount() {
    await this.getMarks();
  }

  onPress = (x) => {
    this.refs.slider.scrollBy(x);
  }

  getMarks = () => {
    Api.getMarks(this.props.token).then((marks) => {
        this.setState({ marks });
    });
  }

  render() {
    return(<View>
        <Swiper ref="slider" height={window.height}
          paginationStyle={{
            bottom: -23, left: null, right: 10
          }} index={1} loop>
            <ProfilePage navigator={this.props.navigator}
              token={this.props.token}
              id={this.props.id}
              marks={this.state.marks}
              onPress={this.onPress}
              getMarks={() => this.getMarks()} />
            <PopularPage navigator={this.props.navigator}
              token={this.props.token}
              id={this.props.id}
              marks={this.state.marks}
              onPress={this.onPress}
              getMarks={() => this.getMarks()}/>
            <InfoPage navigator={this.props.navigator}
              onPress={this.onPress}/>
        </Swiper>
      </View>
    );
  }
}

import React, {Component, PropTypes} from 'react';
import {
  Alert,
  Animated,
  AsyncStorage,
  BackAndroid,
  Button,
  Dimensions,
  Image,
  Keyboard,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

import Swiper from 'react-native-swiper';

import DiscoveryPage from '../pages/DiscoveryPage';
import InfoPage from '../pages/InfoPage';
import ProfilePage from '../pages/ProfilePage';

import Api from '../utility/Api';
import logo from '../utility/logo.png';

const window = Dimensions.get('window');

/*
  Controls the 3 main view of the app.
*/
export default class HomePage extends Component {
  /**
   * Initializes the component.
  */
  constructor(props) {
    super(props);

    this.state = {
      index: 1,
      scrollBy: 0,
      marks: null
    }

    this.onBack = this.onBack.bind(this);
    this.getMarks = this.getMarks.bind(this);
    this.addEventListeners = this.addEventListeners.bind(this);
  }

  /**
   * Navigates to a new page.
   *
   * @param {Object} name The keyword of the desired page.
  */
  navigate(name) {
    this.props.navigator.push({name: name, token: this.props.token, id: this.props.id})
  }

  /**
   * Gets the users marked events and adds listeners for the
   * Android back button on mounting.
  */
  async componentWillMount() {
    await this.getMarks();
    this.addEventListeners();
  }

  /**
   * Adds an listener for the Android back button.
  */
  addEventListeners = () => {
    BackAndroid.addEventListener('hardwareBackPress', () => this.onBack());
  }

  /**
   * Initializes the component.
  */
  onBack = () => {
    if (this.state.index == 1) {
      return false;
    } else {
      this.refs.slider.scrollBy(this.state.scrollBy);
      return true;
    }
  }

  /**
   * get's the user's marked events.
  */
  getMarks = () => {
    console.log("hey there");
    Api.getMarks(this.props.token).then((marks) => {
      this.setState({marks});
    });
  }

  /**
   * Renders the component.
  */
  render() {
    return (
      <View>
        <StatusBar backgroundColor="#001e44" barStyle="light-content"/>
        <Swiper ref="slider" height={window.height} onMomentumScrollEnd={(e, state, context) => {
          this.setState({
            index: state.index,
            scrollBy: this.state.index - state.index
          });
        }} paginationStyle={{
          bottom: -23,
          left: null,
          right: 10
        }} index={this.state.index} loop>
          <ProfilePage navigator={this.props.navigator} token={this.props.token} id={this.props.id} marks={this.state.marks} onPress={(x) => this.refs.slider.scrollBy(x)} getMarks={() => this.getMarks()} addEventListeners={() => this.addEventListeners()}/>
          <DiscoveryPage navigator={this.props.navigator} token={this.props.token} id={this.props.id} marks={this.state.marks} onPress={(x) => this.refs.slider.scrollBy(x)} getMarks={() => this.getMarks()}/>
          <InfoPage navigator={this.props.navigator} onPress={(x) => this.refs.slider.scrollBy(x)}/>
        </Swiper>
      </View>
    );
  }
}

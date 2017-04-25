import React, {Component} from 'react';
import {
  ActivityIndicator,
  AppRegistry,
  AsyncStorage,
  BackAndroid,
  Navigator,
  StyleSheet,
  StatusBar,
  View
} from 'react-native';
import EditProfile from './src/pages/EditProfile';
import HomePage from './src/pages/HomePage';
import LoginPage from './src/pages/LoginPage';
import RegisterProfile from './src/pages/RegisterProfile';
import RegisterCode from './src/pages/RegisterCode';

/*
  Functions as the core of the Android version of the app.
*/
export default class CBURecCenterApp extends Component {
  /**
   * Initializes the component.
  */
  constructor() {
    super()
    this.renderScene = this.renderScene.bind(this)
    this.state = {
      Token: null,
      id: null,
      check1: false,
      check2: false
    };
  }

  /**
   * Determines which scene to render.
   *
   * @param {Object} route Contains information on the destination.
   * @param {Object} navigator The Android navigator.
  */
  renderScene(route, navigator) {
    switch (route.name) {
      case 'Home':
        return <HomePage navigator={navigator} token={route.token} id={route.id}/>
        break;
      case 'EditProfile':
        return <EditProfile navigator={navigator} route={route} token={route.token} id={route.id}/>
        break;
      case 'RegisterCode':
        return <RegisterCode navigator={navigator} id={route.id}/>
        break;
      case 'RegisterProfile':
        return <RegisterProfile navigator={navigator} email={route.email} code={route.code} id={route.id}/>
        break;
      default:
        return <LoginPage navigator={navigator} id={route.id}/>
        break;
    }
  }

  /**
   * Loads the authToken and id values from storage on mounting.
  */
  async componentWillMount() {
    await AsyncStorage.getItem("authToken").then((value) => {
      this.setState({Token: value});
    }).then(res => {
      this.setState({check1: true});
    });

    await AsyncStorage.getItem("id").then((value2) => {
      this.setState({id: value2});
    }).then(res => {
      this.setState({check2: true});
    });
  }

  /**
   * Renders the component.
  */
  render() {
    if (this.state.check1 === false || this.state.check2 === false) {
      const styles = StyleSheet.create({
        container: {
          backgroundColor: '#002554',
          flex: 1
        },
        indicator: {
          flex: 1,
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: 80
        }
      });

      return (
        <View style={styles.container} behavior="padding">
          <StatusBar backgroundColor="#002554" barStyle="light-content"/>
          <ActivityIndicator animating={true} style={styles.indicator} size="large" color="#A37400"/>
        </View>
      );
    }
    if (this.state.Token === null || this.state.id === null) {
      return (<Navigator initialRoute={{
        name: 'Login'
      }} renderScene={this.renderScene}/>);
    }
    return (<Navigator initialRoute={{
      name: 'Home',
      token: this.state.Token,
      id: this.state.id
    }} renderScene={this.renderScene}/>);
  }
}

AppRegistry.registerComponent('CBURecCenterApp', () => CBURecCenterApp);

import React, {Component, PropTypes} from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  AsyncStorage,
  Button,
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Text,
  TextInput,
  StyleSheet,
  StatusBar,
  View,
} from 'react-native';

import {MKTextField} from 'react-native-material-kit';
import async from 'async';

import Api from '../utility/Api';
import logo from '../utility/logo.png';

const window = Dimensions.get('window');
const IMAGE_HEIGHT = window.height / 6;
const IMAGE_HEIGHT_SMALL = window.height / 10;

/*
  Assists with logging the user in.
*/
export default class LoginPage extends Component {
  /**
   * Initializes the component.
  */
  constructor(props) {
    super(props);

    const quotes = [
      "'saaaaah dud'",
      "muscle milk",
      "protein shakes",
      "yoga pants",
      "six-packs",
      "reps",
      "active wear",
      "squats",
      "fist bumps",
      "leg days"
    ];

    this.state = {
      response: null,
      userName: null,
      password: null,
      id: null,
      quote: quotes[Math.floor(Math.random() * quotes.length)],
      loggingIn: false
    };

    this.imageHeight = new Animated.Value(IMAGE_HEIGHT);
    this.submitLogin = this.submitLogin.bind(this);

    AsyncStorage.multiRemove(["token", "id"]);
  }

  /**
   * Animates the logo on keyboard show.
  */
  keyboardWillShow() {
    this.setState({text: "show"});
    Animated.timing(this.imageHeight, {
      duration: 200,
      toValue: IMAGE_HEIGHT_SMALL
    }).start();
  };

  /**
   * Animates the logo on keyboard hide.
  */
  keyboardWillHide() {
    this.setState({text: "hide"});
    Animated.timing(this.imageHeight, {
      duration: 200,
      toValue: IMAGE_HEIGHT
    }).start();
  };

  /**
   * Navigates the user to the registration page.
  */
  register() {
    Keyboard.dismiss();
    this.props.navigator.push({name: "RegisterCode"});
  }

  /**
   * Navigates the user to specified page.
  */
  navigate(name) {
    this.props.navigator.push({name: name, token: this.state.token, id: this.state.id});
  }

  /**
   * Logs the user in then navigates them to the home page.
  */
  submitLogin() {
    Keyboard.dismiss();
    if (!this.props.loggingIn) {
      this.setState({loggingIn: true});
      Api.login(this.state.userName, this.state.password).then((res) => {
        this.setState({loggingIn: false});
        if (res.status === 200) {
          let count = 0;

          AsyncStorage.setItem("authToken", res.authorizationToken).then(() => {
            this.setState({token: res.authorizationToken});
            count++;
            if (count == 2) {
              this.navigate("Home");
            }
          }).catch(() => {
            Alert.alert("Dang it! (╯°□°）╯︵ ┻━┻", "We couldn't save your credentials to your device. Try again.");
          });;

          AsyncStorage.setItem("id", res.id).then(() => {
            this.setState({id: res.id});
            count++;
            if (count == 2) {
              this.navigate("Home");
            }
          }).catch(() => {
            Alert.alert("Dang it! (╯°□°）╯︵ ┻━┻", "We couldn't save your credentials to your device. Try again.");
          });
        } else {
          Alert.alert("Invalid username/password combo ¯\\_(ツ)_/¯", "Don't worry, it happens to the best of us. Try again.");
        }
      });
    }
  }

  /**
   * Renders the component.
  */
  render() {
    const styles = StyleSheet.create({
      container: {
        backgroundColor: '#002554',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
      },
      text: {
        color: "white",
        fontSize: 24,
        width: window.width - 30,
        paddingBottom: 5,
        textAlign: "center"
      },
      input: {
        height: 70,
        borderRadius: 2,
        marginHorizontal: 10,
        marginVertical: 5,
        paddingVertical: 5,
        width: window.width - 30
      },
      logo: {
        resizeMode: 'contain',
        marginBottom: 15
      },
      button: {
        margin: 5
      },
      indicator: {
        paddingHorizontal: 5
      }
    });

    const activityIndicator = this.state.loggingIn
      ? <ActivityIndicator animating={true} style={styles.indicator} size="large" color="#A37400"/>
      : null;

    return (
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        <StatusBar backgroundColor="#002554" barStyle="light-content"/>
        <Animated.Image source={logo} style={[
          styles.logo, {
            height: this.imageHeight
          }
        ]}/>

        <Text style={styles.text}>{"(now with more " + this.state.quote + ")"}</Text>

        <MKTextField ref="email" onFocus= {() => this.keyboardWillShow()} onChangeText={(userName) => this.setState({userName})} onSubmitEditing={(event) => {
          this.refs.password.focus();
        }} value={this.state.userName} keyboardType={'email-address'} highlightColor={"#A37400"} tintColor={"#5B6770"} textInputStyle={{
          color: "#fff"
        }} placeholder={"Lancermail"} placeholderTextColor={"#5B6770"} floatingLabelEnabled={true} style={styles.input}/>
        <MKTextField ref="password" onFocus= {() => this.keyboardWillShow()} onChangeText={(password) => this.setState({password})} onSubmitEditing={() => this.keyboardWillHide()} value={this.state.password} highlightColor={"#A37400"} tintColor={"#5B6770"} textInputStyle={{
          color: "#fff"
        }} placeholder={"Password"} placeholderTextColor={"#5B6770"} floatingLabelEnabled={true} password={true} style={styles.input}/>

        <View style={{
          flexDirection: 'row',
          marginVertical: 5
        }}>
          { activityIndicator }
          <View style={styles.button}>
            <Button title="Log In" onPress={() => this.submitLogin()} color="#A37400"/>
          </View>
          <View style={styles.button}>
            <Button title="Register" onPress={() => this.register()} color="#A37400"/>
          </View>
        </View>
      </KeyboardAvoidingView>

    );
  }
}

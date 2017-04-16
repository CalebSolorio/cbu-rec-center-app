import React, { Component, PropTypes } from 'react';
import { View, Keyboard, AsyncStorage, Text, Alert,
  TextInput, StyleSheet, KeyboardAvoidingView, Button,
  Dimensions, Animated, Image } from 'react-native';

import { MKTextField, MKButton, MKColor, mdl } from 'react-native-material-kit';
import async from 'async';

import Api from '../Utility/Api';
import logo from '../Utility/logo.png';

const window = Dimensions.get('window');
const IMAGE_HEIGHT = window.height / 5 ;
const IMAGE_HEIGHT_SMALL = window.height / 8;


export default class LoginPage extends Component {
  constructor(props) {
    super(props);

    const quotes = ["'saaaaah dud'", "muscle milk", "protein shakes",
      "yoga pants", "six-packs", "reps", "active wear", "squats",
      "fist bumps", "pylons constructed", "leg days"];

    this.state = {
        response: null,
        userName: null,
        password: null,
        id: null,
        quote: quotes[Math.floor(Math.random() * quotes.length)],

      };

      this.imageHeight = new Animated.Value(IMAGE_HEIGHT);
      this.submitLogin = this.submitLogin.bind(this);
  }

  keyboardWillShow(event) {
    this.setState({text: "show"});
    Animated.timing(this.imageHeight, {
      duration: 200,
      toValue: IMAGE_HEIGHT_SMALL,
    }).start();
  };

  keyboardWillHide(event) {
    this.setState({ text: "hide"});
    Animated.timing(this.imageHeight, {
      duration: 200,
      toValue: IMAGE_HEIGHT,
    }).start();
  };

  navigate(name){
      this.props.navigator.push({
          name: name,
          token: this.state.token,
          id: this.state.id
      })
  }

  RegisterFunction(){
    Keyboard.dismiss();
    this.navigate("RegisterEmail")
  }

  submitLogin() {
    Keyboard.dismiss();
    Api.login(this.state.userName, this.state.password).then((res) => {
      if(res.status === 200){
          var count = 0;

          AsyncStorage.setItem("authToken", res.authorizationToken)
          .then(() => {
              this.setState({ token: res.authorizationToken });
              count++;
              if(count == 2) {
                this.navigate("Home");
              }
          }).catch(() => {
            Alert.alert("Dang it! (╯°□°）╯︵ ┻━┻",
                  "We couldn't save your credentials to your device. Try again.");
          });;

          AsyncStorage.setItem("id", res.id)
          .then(() => {
              this.setState({ id: res.id });
              count++;
              if(count == 2) {
                this.navigate("Home");
              }
          }).catch(() => {
            Alert.alert("Dang it! (╯°□°）╯︵ ┻━┻",
                  "We couldn't save your credentials to your device. Try again.");
          });
      }
        else{
            Alert.alert("Invalid username/password combo ¯\\_(ツ)_/¯",
              "Don't worry, it happens to the best of us. Try again.");
        }
    });
  }

  render() {
    const styles = StyleSheet.create({
      container: {
        backgroundColor: '#002554',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      },
      text: {
        color: "white",
        fontSize: 24,
        width: window.width - 30,
        paddingBottom: 5,
        textAlign: "center",
      },
      input: {
        height: 70,
        borderRadius: 2,
        marginHorizontal: 10,
        marginVertical: 5,
        paddingVertical: 5,
        width: window.width - 30,
      },
      logo: {
        resizeMode: 'contain',
        marginBottom: 15,
      },
      button: {
        margin: 5,
      },
    });

    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior="padding"
      >
          <Animated.Image source={logo} style={[styles.logo, { height: this.imageHeight }]} />

          <Text style={styles.text}>{"(now with more " +
            this.state.quote + ")"}</Text>

          <MKTextField
            ref="email"
            onFocus = {(e) => this.keyboardWillShow({e})}
            onChangeText={(userName) => this.setState({userName})}
            onSubmitEditing={(event) => {
              this.refs.password.focus();
            }}
            value={this.state.userName}
            keyboardType = {'email-address'}
            highlightColor={"#A37400"}
            tintColor={"#5B6770"}
            textInputStyle={{color: "#fff"}}
            placeholder={"Lancermail"}
            placeholderTextColor={"#5B6770"}
            floatingLabelEnabled={true}
            style={styles.input}
          />
          <MKTextField
            ref="password"
            onFocus = {(e) => this.keyboardWillShow({e})}
            onChangeText={(password) => this.setState({password})}
            onSubmitEditing={(e) => this.keyboardWillHide({e})}
            value={this.state.password}
            highlightColor={"#A37400"}
            tintColor={"#5B6770"}
            textInputStyle={{color: "#fff"}}
            placeholder={"Password"}
            placeholderTextColor={"#5B6770"}
            floatingLabelEnabled={true}
            password={true}
            style={styles.input}
          />

          <View style={{flexDirection:'row'}}>
            <View style={styles.button} >
              <Button
                title="Log In"
                onPress={ () => this.submitLogin() }
                color="#A37400"
              />
            </View>
            <View style={styles.button} >
              <Button
                title="Register"
                onPress={() => this.RegisterFunction()}
                color="#A37400"
              />
            </View>
          </View>
      </KeyboardAvoidingView>

    );
  }
}

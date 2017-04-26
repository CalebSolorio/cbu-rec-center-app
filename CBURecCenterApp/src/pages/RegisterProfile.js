import React, {Component, PropTypes} from 'react';
import {
  ActivityIndicator,
  Alert,
  BackAndroid,
  Button,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {MKTextField} from 'react-native-material-kit';

import Api from '../utility/Api';

const window = Dimensions.get('window');

/*
  Assists with creating a profile.
*/
export default class RegisterProfile extends Component {
  /**
   * Initializes the component.
   */
  constructor(props) {
    super(props);
    this.state = {
      password: null,
      cPassword: null,
      name: null,
      registering: false
    };
  }

  /**
   * Establishes a listener for the Android back button uppon mounting.
   */
  componentWillMount() {
    BackAndroid.addEventListener('hardwareBackPress', () => {
      this.props.navigator.pop();
      return true;
    });
  }

  /**
   * Registers the user with the database, then takes then to the login screen.
   */
  submitRegister() {
    if (!this.state.registering) {
      Keyboard.dismiss();
      if (this.state.password === this.state.cPassword) {
        this.setState({registering: true});
        Api.register( //register
            this.props.code, this.props.email, this.state.password, this.state.name).then((rRes) => {
          this.setState({registering: false});
          if (rRes.status === 200) {
            Alert.alert("Registration Successful!", "Now you just need to sign in once more and you'll be all set!");
            this.props.navigator.resetTo('Login');
          } else {
            Alert.alert("Error " + rRes.status + ":", rRes.message);
          }
        });
      } else {
        Alert.alert("Registration unsuccessful", "The two passwords given " + "do not match.");
      }
    }
  }

  /*
    Renders the component.
  */
  render() {
    const styles = StyleSheet.create({
      container: {
        backgroundColor: '#002554',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
      },
      input: {
        height: 70,
        borderRadius: 2,
        marginHorizontal: 10,
        marginVertical: 5,
        paddingVertical: 5,
        width: window.width - 30
      },
      text: {
        color: "white",
        fontSize: 30,
        width: window.width - 30,
        paddingBottom: 5
      },
      button: {
        margin: 10
      },
      indicator: {
        paddingHorizontal: 5
      }
    });

    const activityIndicator = this.state.registering
      ? <ActivityIndicator animating={true} style={styles.indicator} size="large" color="#A37400"/>
      : null;

    return (
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        <Text style={styles.text}>Almost there!</Text>

        <MKTextField ref="name" onChangeText={(name) => this.setState({name})} onSubmitEditing={(event) => {
          this.refs.password.focus();
        }} value={this.state.code} highlightColor={"#A37400"} tintColor={"#5B6770"} textInputStyle={{
          color: "#fff"
        }} autoCorrect={false} placeholder={"Name"} placeholderTextColor={"#5B6770"} floatingLabelEnabled={true} style={styles.input}/>

        <MKTextField ref="password" onChangeText={(password) => this.setState({password})} onSubmitEditing={(event) => {
          this.refs.cPassword.focus();
        }} value={this.state.password} highlightColor={"#A37400"} tintColor={"#5B6770"} textInputStyle={{
          color: "#fff"
        }} autoCorrect={false} placeholder={"Password"} placeholderTextColor={"#5B6770"} floatingLabelEnabled={true} password={true} style={styles.input}/>

        <MKTextField ref="cPassword" onChangeText={(cPassword) => this.setState({cPassword})} value={this.state.cPassword} highlightColor={"#A37400"} tintColor={"#5B6770"} textInputStyle={{
          color: "#fff"
        }} autoCorrect={false} placeholder={"Confirm Password"} placeholderTextColor={"#5B6770"} floatingLabelEnabled={true} password={true} style={styles.input}/>

        <View style={{
          flexDirection: 'row'
        }}>
          {activityIndicator}
          <View style={styles.button}>
            <Button title="Register" onPress={() => this.submitRegister()} color="#A37400"/>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }
}

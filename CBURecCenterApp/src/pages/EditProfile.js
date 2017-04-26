import React, {Component, PropTypes} from 'react';
import {
  ActivityIndicator,
  Alert,
  BackAndroid,
  Button,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

import {MKTextField} from 'react-native-material-kit';
import Icon from 'react-native-vector-icons/MaterialIcons';

import Api from '../utility/Api';

const window = Dimensions.get('window');

/*
  Assists the user with updating their profile.
*/
export default class EditProfile extends Component {
  /**
   * Initializes the component.
  */
  constructor(props) {
    super(props);
    this.state = {
      userName: null,
      password: null,
      newPassword: null,
      Name: null,
      Description: null,
      tempToken: null,
      updating: false
    };
  }

  /**
   * Adds a listener for the Android back button on mounting.
  */
  componentWillMount() {
    BackAndroid.addEventListener('hardwareBackPress', () => {
      this.props.route.callback();
      this.props.navigator.pop();
      return true;
    });
  }

  /**
   * Retrieves the most up-to-date user info.
  */
  updateUser() {
    if (!this.state.updating) {
      Keyboard.dismiss();
      this.setState({updating: true});
      Api.login(this.state.userName, this.state.password).then((res) => {
        this.setState({updating: false});
        if (res.status === 200) {
          this.setState({tempToken: res.authorizationToken});
          Api.updateUser(this.state.tempToken, this.state.newPassword, this.state.name, this.state.description).then((res2) => {
            if (res2.status === 200) {
              this.props.route.callback();
              this.props.navigator.pop();
            } else {
              Alert.alert("Error " + res2.status + ":", res2.message);
            }
          });
        } else {
          Alert.alert("Invalid Credentials -_-", "The email and old password you provided are invalid.");
        }
      })
    }
  }

  /**
   * Renders the component.
  */
  render() {
    const styles = StyleSheet.create({
      container: {
        backgroundColor: '#002554',
        flex: 1
      },
      form: {
        alignItems: 'center',
        justifyContent: 'center'
      },
      text: {
        color: "white",
        fontSize: 30,
        width: window.width - 30,
        paddingBottom: 5
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

    const activityIndicator = this.state.updating
      ? <ActivityIndicator animating={true} style={styles.indicator} size="large" color="#A37400"/>
      : null;

    return (
      <KeyboardAvoidingView style={styles.container}>
        <StatusBar backgroundColor="#002554" barStyle="light-content"/>

        <View style={{
          margin: 10,
          flexDirection: 'row',
          justifyContent: 'flex-start'
        }}>
          <Icon name="arrow-back" size={25} color="white" style={{
            marginTop: 5,
            marginRight: 5
          }} onPress={() => this.props.navigator.pop()}/>
          <Text style={{
            color: 'white',
            fontSize: 25
          }} onPress={() => this.props.navigator.pop()}>Go Back</Text>
        </View>

        <View style={[styles.container, styles.form]}>
          <Text style={styles.text}>Update your profile</Text>
          <MKTextField ref="email" onChangeText={(userName) => this.setState({userName})} onSubmitEditing={(event) => {
            this.refs.password.focus();
          }} value={this.state.userName} keyboardType={'email-address'} highlightColor={"#A37400"} tintColor={"#5B6770"} textInputStyle={{
            color: "#fff"
          }} placeholder={"Verify Lancermail"} placeholderTextColor={"#5B6770"} floatingLabelEnabled={true} style={styles.input}/>
          <MKTextField ref="password" onChangeText={(password) => this.setState({password})} onSubmitEditing={(event) => {
            this.refs.newPassword.focus();
          }} value={this.state.password} highlightColor={"#A37400"} tintColor={"#5B6770"} textInputStyle={{
            color: "#fff"
          }} placeholder={"Current Password"} placeholderTextColor={"#5B6770"} floatingLabelEnabled={true} password={true} style={styles.input}/>
          <MKTextField ref="newPassword" onChangeText={(newPassword) => this.setState({newPassword})} onSubmitEditing={(event) => {
            this.refs.name.focus();
          }} value={this.state.newPassword} highlightColor={"#A37400"} tintColor={"#5B6770"} textInputStyle={{
            color: "#fff"
          }} placeholder={"New Password (optional)"} placeholderTextColor={"#5B6770"} floatingLabelEnabled={true} password={true} style={styles.input}/>
          <MKTextField ref="name" onChangeText={(name) => this.setState({name})} onSubmitEditing={(event) => {
            this.refs.description.focus();
          }} value={this.state.name} keyboardType={'email-address'} highlightColor={"#A37400"} tintColor={"#5B6770"} textInputStyle={{
            color: "#fff"
          }} placeholder={"Name (optional)"} placeholderTextColor={"#5B6770"} floatingLabelEnabled={true} style={styles.input}/>
          <MKTextField ref="description" onChangeText={(description) => this.setState({description})} value={this.state.description} keyboardType={'email-address'} highlightColor={"#A37400"} tintColor={"#5B6770"} textInputStyle={{
            color: "#fff"
          }} placeholder={"Description (optional)"} placeholderTextColor={"#5B6770"} floatingLabelEnabled={true} style={styles.input}/>

          <View style={{
            flexDirection: 'row'
          }}>
            {activityIndicator}
            <View style={styles.button}>
              <Button title="Submit" onPress={() => this.updateUser()} color="#A37400"/>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

    );
  }
}

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
  Assists with verification codes.
*/
export default class RegisterCode extends Component {
  /**
   * Initializes the component.
   */
  constructor(props) {
    super(props);
    this.state = {
      email: null,
      code: null,
      sent: false,
      requesting: false
    };
  }

  /**
   * Establishes a listener for the Android back button uppon mounting.
   */
  componentDidMount() {
    BackAndroid.addEventListener('hardwareBackPress', () => {
      this.props.navigator.pop();
      return true;
    });
  }

  /**
   * Navigates to the sepcified page.
   *
   * @param {Object} name The keyword of the desired page.
   */
  navigate(name) {
    this.props.navigator.push({name: name, email: this.state.email, code: this.state.code});
  }

  /**
   * Creates and sends a new verification code to the user's Lancermail.
   */
  sendEmail() {
    if (!this.state.requesting) {
      Keyboard.dismiss();
      this.setState({requesting: true});
      Api.sendEmail(this.state.email).then((res) => {
        this.setState({requesting: false});
        if (res.status === 200) {
          this.setState({sent: true});
        } else {
          Alert.alert("Error " + res.status + ":", res.message);
        }
      });
    }
  }

  /**
   * Verifies the user's verification code.
   */
  verifyCode() {
    if (!this.state.requesting) {
      Keyboard.dismiss();
      this.setState({requesting: true});
      Api.verifyEmail(this.state.email, this.state.code).then((res) => {
        this.setState({requesting: false});
        if (res.matches) {
          this.navigate('RegisterProfile');
        } else {
          Alert.alert("Dang it.", "Either John Montgomery's been messing around " + "with the verification codes (again), or the verification code " + "you provided doesn't match we've got. Try again.");
        }
      });
    }
  }

  /**
   * Sends a new verification code to the user's Lancermail.
   */
  resendEmail() {
    if (!this.state.requesting) {
      Keyboard.dismiss();
      this.setState({requesting: true});
      Api.resendEmail(this.state.email).then((res) => {
        this.setState({requesting: false});
        if (res.status === 200) {
          this.setState({sent: true});
          Alert.alert("Success!", res.message);
        } else {
          Alert.alert("Error " + res.status + ":", res.message);
        }
      });
    }
  }

  /*
    Renders the component.
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
      input: {
        height: 75,
        borderRadius: 2,
        marginHorizontal: 10,
        marginVertical: 5,
        paddingVertical: 5,
        width: window.width - 30
      },
      text: {
        color: "white",
        fontSize: 24,
        width: window.width - 30,
        paddingBottom: 30
      },
      button: {
        margin: 5
      },
      indicator: {
        paddingHorizontal: 5
      }
    });

    const activityIndicator = this.state.requesting
      ? <ActivityIndicator animating={true} style={styles.indicator} size="large" color="#A37400"/>
      : null;

    const text = this.state.sent
      ? "Awesome, now just enter the six digit code you recieve in your inbox!"
      : "Enter in your 'calbaptist.edu' email address so we can send you a " + "super secret verification code!";

    const input = this.state.sent
      ? <MKTextField ref="code" onChangeText={(code) => this.setState({code})} value={this.state.code} highlightColor={"#A37400"} tintColor={"#5B6770"} textInputStyle={{
          color: "#fff"
        }} keyboardType={"numeric"} autoCorrect={false} placeholder={"Verification Code"} placeholderTextColor={"#5B6770"} floatingLabelEnabled={true} style={styles.input}/>
      : <MKTextField ref="email" onChangeText={(email) => this.setState({email})} value={this.state.email} highlightColor={"#A37400"} tintColor={"#5B6770"} textInputStyle={{
        color: "#fff"
      }} keyboardType='email-address' autoCorrect={false} placeholder={"Lancermail"} placeholderTextColor={"#5B6770"} floatingLabelEnabled={true} style={styles.input}/>;

    const buttonView = this.state.sent
      ? <View style={{
          flexDirection: 'row',
          marginVertical: 5
        }}>
          {activityIndicator}
          <View style={styles.button}>
            <Button title="Verify Code" onPress={() => this.verifyCode()} color="#A37400"/>
          </View>
          <View style={styles.button}>
            <Button title="I didn't get a code" onPress={() => this.resendEmail()} color="#A37400"/>
          </View>
        </View>
      : <View style={{
        flexDirection: 'row',
        marginVertical: 5
      }}>
        {activityIndicator}
        <View style={styles.button}>
          <Button title="Send Code" onPress={() => this.sendEmail()} color="#A37400"/>
        </View>
        <View style={styles.button}>
          <Button title="Resend Code" onPress={() => this.resendEmail()} color="#A37400"/>
        </View>
      </View>

    return (
      <KeyboardAvoidingView style={styles.container} behavior="padding">
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
          <Text style={styles.text}>{text}</Text>
          {input}
          {buttonView}
        </View>
      </KeyboardAvoidingView>
    );
  }

}

import React, { Component, PropTypes } from 'react';
import { View, Alert, Keyboard, KeyboardAvoidingView,
  Text, TextInput, Dimensions, StyleSheet, Button} from 'react-native';

import { MKTextField} from 'react-native-material-kit';

import Api from '../Utility/Api';

const window = Dimensions.get('window');

export default class RegisterPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
          email: null,
          code: null,
          sent: false
        };
    }

      navigate(name){
          this.props.navigator.push({
              name: name,
              email: this.state.email,
              code: this.state.code,
          });
      }

    sendEmail(){
      Keyboard.dismiss();
      Api.sendEmail(this.state.email).then((res) => {
          if(res.status === 200){
            this.setState({sent: true});
          }
          else{
              Alert.alert("Error " + res.status + ":", res.message);
          }
      });
    }

    verifyCode() {
      Keyboard.dismiss();
      Api.verifyEmail(this.state.email, this.state.code).then((res) => {
        if(res.matches){
          this.navigate('Register');
        }
        else{
          Alert.alert("Dang it.", "Either John Montgomery's been messing around " +
            "with the verification codes (again), or the verification code " +
            "you provided doesn't match we've got. Try again.");
        }
      });
    }

    resendEmail() {
      Keyboard.dismiss();
      Api.resendEmail(this.state.email).then((res) => {
        if(res.status === 200){
          this.setState({sent: true});
          Alert.alert("Success!", res.message);
        }
        else{
          Alert.alert("Error " + res.status + ":", res.message);
        }
      });
    }

    render(){
      const styles = StyleSheet.create({
        container: {
          backgroundColor: '#002554',
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        },
        input: {
          height: 75,
          borderRadius: 2,
          marginHorizontal: 10,
          marginVertical: 5,
          paddingVertical: 5,
          width: window.width - 30,
        },
        text: {
          color: "white",
          fontSize: 24,
          width: window.width - 30,
          paddingBottom: 30,
        },
        button: {
          margin: 5,
        }
      });

      const text = this.state.sent ?
        "Awesome, now just enter the six digit code you recieve in your inbox!" :
        "Enter in your 'calbaptist.edu' email address so we can send you a " +
        "super secret verification code!";

      const input = this.state.sent ?
        <MKTextField
          ref="code"
          onChangeText={(code) => this.setState({code})}
          value={this.state.code}
          highlightColor={"#A37400"}
          tintColor={"#5B6770"}
          textInputStyle={{color: "#fff"}}
          keyboardType = {"numeric"}
          autoCorrect = {false}
          placeholder={"Verification Code"}
          placeholderTextColor={"#5B6770"}
          floatingLabelEnabled={true}
          style={styles.input}
        />
        :
        <MKTextField
          ref="email"
          onChangeText={(email) => this.setState({email})}
          value={this.state.email}
          highlightColor={"#A37400"}
          tintColor={"#5B6770"}
          textInputStyle={{color: "#fff"}}
          keyboardType = 'email-address'
          autoCorrect = {false}
          placeholder={"Lancermail"}
          placeholderTextColor={"#5B6770"}
          floatingLabelEnabled={true}
          style={styles.input}
        />;

      const buttonView = this.state.sent ?
        <View style={{flexDirection:'row'}}>
          <View style={styles.button} >
            <Button
              title="Verify Code"
              onPress={() => this.verifyCode()}
              color="#A37400"
            />
          </View>
          <View style={styles.button} >
            <Button
              title="I didn't get a code"
              onPress={() => this.resendEmail()}
              color="#A37400"
            />
          </View>
        </View>
       :
         <View style={{flexDirection:'row'}}>
           <View style={styles.button} >
             <Button
               title="Send Code"
               onPress={() => this.sendEmail()}
               color="#A37400"
             />
           </View>
           <View style={styles.button} >
             <Button
               title="Resend Code"
               onPress={() => this.resendEmail()}
               color="#A37400"
             />
           </View>
         </View>


      return (
        <KeyboardAvoidingView
          style={styles.container}
          behavior="padding"
        >
          <Text style={styles.text}>{text}</Text>

          {input}

          {buttonView}
        </KeyboardAvoidingView>
      );
    }


}

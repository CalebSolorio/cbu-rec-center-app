import React, { Component, PropTypes } from 'react';
import { View, Keyboard, KeyboardAvoidingView, Text, Alert,
  TextInput, StyleSheet, Button, Dimensions } from 'react-native';

import { MKTextField} from 'react-native-material-kit';

import Api from '../Utility/Api';

const window = Dimensions.get('window');

export default class RegisterPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            password: null,
            cPassword: null,
            name: null
          };
      }

        navigate(name){
            this.props.navigator.push({
                  name: name
            })
        }

      //Verifies code/email match, registers the user.
      submitRegister(){
        Keyboard.dismiss();
        if(this.state.password === this.state.cPassword) {
           Api.register(    //register
            this.props.code,
            this.props.email,
            this.state.password,
            this.state.name
          ).then((rRes) => {
            if(rRes.status === 200){
              Alert.alert("Registration Successful!",
                "Now you just need to sign in and you'll be all set!");
              this.navigate('Login');
            }
            else{
                Alert.alert("Error " + rRes.status + ":", rRes.message);
            }
          });
        } else {
          Alert.alert("Registration unsuccessful", "The two passwords given " +
            "do not match.");
        }
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
          height: 70,
          borderRadius: 2,
          marginHorizontal: 10,
          marginVertical: 5,
          paddingVertical: 5,
          width: window.width - 30,
        },
        text: {
          color: "white",
          fontSize: 30,
          width: window.width - 30,
          paddingBottom: 5,
        },
        button: {
          margin: 10,
        }
      });

      return (
        <KeyboardAvoidingView
          style={styles.container}
          behavior="padding"
        >
          <Text style={styles.text}>Almost there!</Text>

          <MKTextField
            ref="name"
            onChangeText={(name) => this.setState({name})}
            onSubmitEditing={(event) => {
              this.refs.password.focus();
            }}
            value={this.state.code}
            highlightColor={"#A37400"}
            tintColor={"#5B6770"}
            textInputStyle={{color: "#fff"}}
            autoCorrect = {false}
            placeholder={"Name"}
            placeholderTextColor={"#5B6770"}
            floatingLabelEnabled={true}
            style={styles.input}
          />

          <MKTextField
            ref="password"
            onChangeText={(password) => this.setState({password})}
            onSubmitEditing={(event) => {
              this.refs.cPassword.focus();
            }}
            value={this.state.password}
            highlightColor={"#A37400"}
            tintColor={"#5B6770"}
            textInputStyle={{color: "#fff"}}
            autoCorrect = {false}
            placeholder={"Password"}
            placeholderTextColor={"#5B6770"}
            floatingLabelEnabled={true}
            password={true}
            style={styles.input}
          />

          <MKTextField
            ref="cPassword"
            onChangeText={(cPassword) => this.setState({cPassword})}
            value={this.state.cPassword}
            highlightColor={"#A37400"}
            tintColor={"#5B6770"}
            textInputStyle={{color: "#fff"}}
            autoCorrect = {false}
            placeholder={"Confirm Password"}
            placeholderTextColor={"#5B6770"}
            floatingLabelEnabled={true}
            password={true}
            style={styles.input}
          />

          <View style={{flexDirection:'row'}}>
            <View style={styles.button} >
              <Button
                title="Register"
                onPress={() => this.submitRegister()}
                color="#A37400"
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      );

        // return (
        //     <View>
        //         <TextInput
        //             style={styles.textField}
        //             onChangeText={(name) => this.setState({name})}
        //             value={this.state.name}
        //             autoCorrect = {false}
        //             placeholder = {'Name'}
        //         />
        //         <TextInput
        //             style={styles.textField}
        //             onChangeText={(password) => this.setState({password})}
        //             value={this.state.password}
        //             autoCorrect = {false}
        //             placeholder = {'password'}
        //             secureTextEntry={ true }
        //         />
        //         <TextInput
        //             style={styles.textField}
        //             onChangeText={(cPassword) => this.setState({cPassword})}
        //             value={this.state.cPassword}
        //             autoCorrect = {false}
        //             placeholder = {'Confirm Password'}
        //             secureTextEntry={ true }
        //         />
        //         <Button
        //             onPress={() => this.submitRegister()}
        //             title="Register"
        //         />
        //
        //     </View>
        // )
    }
}

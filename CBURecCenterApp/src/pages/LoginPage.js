import React, { Component, PropTypes } from 'react';
import { View, Keyboard, AsyncStorage, Text, Alert, TextInput, Button} from 'react-native';
import Api from '../Utility/Api';
import styles from '../Utility/styles'


export default class LoginPage extends Component {

    constructor(props) {
        super(props);
        this.submitLogin = this.submitLogin.bind(this),
        this.state = {
            response: null,
            userName: null,
            password: null,
            id: null
          };
      }

      navigate(name){
          this.props.navigator.push({
              name: name,
              token: this.state.response,
              id: this.state.id
          })
      }

      RegisterFunction(){
        Keyboard.dismiss();
        this.navigate("RegisterEmail")
      }



      submitLogin(){
        Api.login(this.state.userName, this.state.password).then((res) => {
            console.log(res.status)
            if(res.status === 200){
                Keyboard.dismiss();
                this.setState({response: res.authorizationToken, id: res.id});
                console.log(this.state.id + " id")
                this.navigate('LoadingScreen');
            }
            else{
                Keyboard.dismiss();
                Alert.alert("Invalid username/password combo", " ");
            }
        })
      }

      devLogin(){
        Api.login("AustinT.Brinegar@calbaptist.edu", "password").then((res) => {
                if(res.status === 200){
                    Keyboard.dismiss()
                    this.setState({response: res.authorizationToken, id: res.id});
                    console.log(this.state.id + " id")
                    this.navigate('LoadingScreen');
                }
        })
      }

    render(){
        return (
            <View>
                <TextInput
                    style={styles.textField}
                    onChangeText={(userName) => this.setState({userName})}
                    value={this.state.userName}
                    keyboardType = {'email-address'}
                    autoCorrect = {false}
                    placeholder = {'CBU Email'}
                    onSubmitEditing={Keyboard.dismiss}
                />
                <TextInput
                    style={styles.textField}
                    onChangeText={(password) => this.setState({password})}
                    value={this.state.password}
                    autoCorrect = {false}
                    placeholder = {'password'}
                    secureTextEntry={ true }
                    onSubmitEditing={Keyboard.dismiss}
                />
                <View style={styles.loginButton} >
                    <Button
                        onPress={() => this.submitLogin()}
                        title="log in"
                    />
                </View>
                <View style={styles.loginButton} >
                    <Button style={styles.loginButton}
                        onPress={() => this.RegisterFunction()}
                        title="Register"
                    />
                </View>
                <View style={styles.loginButton} >
                    <Button style={styles.loginButton}
                        onPress={() => this.devLogin()}
                        title="DEV BUTTON"
                    />
                </View>

            </View>
        )
    }
}
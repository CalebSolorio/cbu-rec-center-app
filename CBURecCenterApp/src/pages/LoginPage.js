import React, { Component, PropTypes } from 'react';
import { View, Text, Alert, TextInput, Button} from 'react-native';
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

      submitLogin(){
        Api.login(this.state.userName, this.state.password).then((res) => {
            console.log(res.status)
            if(res.status === 200){
                this.setState({response: res.authorizationToken, id: res.id});
                this.navigate('Home');
            }
            else{
                Alert.alert("Invalid username/password combo", " ");
            }
        })
      }

      devLogin(){
        Api.login("AustinT.Brinegar@calbaptist.edu", "password").then((res) => {
                if(res.status === 200){
                    this.setState({response: res.authorizationToken, id: res.id});
                    this.navigate('Home');
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
                />
                <TextInput
                    style={styles.textField}
                    onChangeText={(password) => this.setState({password})}
                    value={this.state.password}
                    autoCorrect = {false}
                    placeholder = {'password'}
                    secureTextEntry={ true }
                />
                <View style={styles.loginButton} >
                    <Button
                        onPress={() => this.submitLogin()}
                        title="log in"
                    />
                </View>
                <View style={styles.loginButton} >
                    <Button style={styles.loginButton}
                        onPress={() => this.navigate("RegisterEmail")}
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
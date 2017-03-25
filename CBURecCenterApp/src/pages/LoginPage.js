import React, { Component, PropTypes } from 'react';
import { View, Text, TextInput, Button} from 'react-native';
import Api from '../Utility/Api';
import styles from '../Utility/styles'


export default class LoginPage extends Component {

    constructor(props) {
        super(props);
        this.submitLogin = this.submitLogin.bind(this),
        this.state = {
            response: null,
            userName: null,
            password: null
          };
      }

      navigate(name){
          this.props.navigator.push({
              name: name,
              token: this.state.response
          })
      }

      submitLogin(){
        Api.login(this.state.userName, this.state.password).then((res) => {
            console.log(res.status)
            if(res.status === 200){
                this.setState({response: res.authorizationToken});
                this.navigate('Home');
            }
            else{
                return(
                    <Text>"Invalid username/password combo"</Text>
                )
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
                <Button
                    onPress={() => this.submitLogin()}
                    title="log in"
                />
                <Button
                    onPress={() => this.navigate("RegisterEmail")}
                    title="Register"
                />

            </View>
        )
    }
}
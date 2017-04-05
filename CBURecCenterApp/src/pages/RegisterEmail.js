import React, { Component, PropTypes } from 'react';
import { View, Alert, Keyboard, Text, TextInput, StyleSheet, Button} from 'react-native';
import Api from '../Utility/Api';
import styles from '../Utility/styles'


export default class RegisterPage extends Component {

    constructor(props) {
        super(props);
        this.state = { email: null };
    }

      navigate(name){
          this.props.navigator.push({
              name: name,
              email: this.state.email
          })
      }

    sendEmail(){
        Api.sendEmail(this.state.email).then((res) => {
            console.log(res.status + " " + this.state.email)
            if(res.status === 200){
                Keyboard.dismiss();
                this.navigate('Register');
            }
            else{
                Keyboard.dismiss();
                Alert.alert("Must be a valid @calbaptist.edu email ")
            }
        })
    }

    render(){
        return (
            <View>
                <TextInput
                    style={styles.textField}
                    onChangeText={(email) => this.setState({email})}
                    value={this.state.email}
                    keyboardType = {'email-address'}
                    autoCorrect = {false}
                    placeholder = {'CBU Email'}
                />
            <Button
                onPress={() => this.sendEmail()}
                title="Send Verification Email"
            />
            <Button
                onPress={() => this.navigate("Register")}
                title="Re send <DEV ONLY>"
            />
            </View>
        )
    }


}
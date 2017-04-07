import React, { Component, PropTypes } from 'react';
import { View, Keyboard, Text, Alert,TextInput, StyleSheet, Button} from 'react-native';
import Api from '../Utility/Api';
import styles from '../Utility/styles'


export default class RegisterPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            response:null,
            password: null,
            Cpassword: null,
            Vcode: null,
            name: null
          };
      }

        navigate(name){
            this.props.navigator.push({
                  name: name,
                  token: this.state.response
            })
        }

      //Verifies code/email match, registers the user, and logs them in
      submitRegister(){
        Keyboard.dismiss();
        Api.verifyEmail(this.props.email, this.state.Vcode).then((Vres) => { //verify email
            if(Vres.matches === true){
                console.log("Verified")
                if(this.state.password === this.state.Cpassword) {
                     Api.register(    //register
                        this.state.Vcode,
                        this.props.email,
                        this.state.password,
                        this.state.name
                        ).then((Rres) => {
                        console.log(Rres.status + " " +Rres.message)
                        if(Rres.status === 200){  //if registration is successful, log in
                             Api.login(this.state.name, this.state.password).then((Lres) => {
                                console.log(Lres.status + " " + Lres.message)
                                if(Lres.status === 200){   //if log in is succesful, navigate home
                                    this.setState({response: Lres.authorizationToken});
                                    this.navigate('Home');
                                }
                                else{
                                    Alert.alert("Invalid username/password combo", " ");
                                }
                            })
                        }
                        else{
                            Alert.alert("Registration unsuccessful", "please ensure all information is correct is correct");
                        }
                    })
                }
                else{
                    Alert.alert("Passwords do not match", " ");
                }
            }
            else{
                Alert.alert("Registration unsuccessful", "please ensure validation code is correct");
            }
        })
      }

    render(){
        return (
            <View>
                <TextInput
                    style={styles.textField}
                    onChangeText={(Vcode) => this.setState({Vcode})}
                    value={this.state.Vcode}
                    autoCorrect = {false}
                    placeholder = {'Verification Code'}
                />
                <TextInput
                    style={styles.textField}
                    onChangeText={(name) => this.setState({name})}
                    value={this.state.name}
                    autoCorrect = {false}
                    placeholder = {'Name'}
                />
                <TextInput
                    style={styles.textField}
                    onChangeText={(password) => this.setState({password})}
                    value={this.state.password}
                    autoCorrect = {false}
                    placeholder = {'password'}
                    secureTextEntry={ true }
                />
                <TextInput
                    style={styles.textField}
                    onChangeText={(Cpassword) => this.setState({Cpassword})}
                    value={this.state.Cpassword}
                    autoCorrect = {false}
                    placeholder = {'Confirm Password'}
                    secureTextEntry={ true }
                />
                <Button
                    onPress={() => this.submitRegister()}
                    title="Register"
                />

            </View>
        )
    }
}
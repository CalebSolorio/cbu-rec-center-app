import React, { Component, PropTypes } from 'react';
import { View, Text, TextInput, StyleSheet, Button} from 'react-native';
import Api from '../Utility/Api';
import styles from '../Utility/styles'


export default class RegisterPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            response:null,
            password: null,
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
        Api.verifyEmail(this.props.email, this.state.Vcode).then((Vres) => {
            if(Vres.matches === true){
                console.log("Verified")
                 Api.register(
                    this.state.Vcode,
                    this.props.email,
                    this.state.password,
                    this.state.name
                    ).then((Rres) => {
                    console.log(Rres.status + " " +Rres.message)
                    if(Rres.status === 200){
                         Api.login(name, this.state.password).then((Lres) => {
                            console.log(Lres.status + " " + Lres.message)
                            if(Lres.status === 200){
                                this.setState({response: Lres.authorizationToken});
                                this.navigate('Home');
                            }
                            else{
                                return(
                                    <Text>"Invalid username/password combo"</Text>
                                )
                            }
                        })
                    }
                    else{
                        return(
                            <Text>"Error"</Text>
                        )
                    }
                })
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
                <Button
                    onPress={() => this.submitRegister("Home")}
                    title="Register"
                />

            </View>
        )
    }
}
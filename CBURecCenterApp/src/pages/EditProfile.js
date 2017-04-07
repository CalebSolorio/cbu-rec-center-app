import React, { Component, PropTypes } from 'react';
import { View, Alert, Text, Image, StyleSheet, ActivityIndicator, TextInput, Keyboard, Button } from 'react-native';
import Header from '../Components/Header'
import Api from '../Utility/Api'
import styles from '../Utility/styles'

export default class EditProfile extends Component {

    constructor(props) {
            super(props);
            this.state = {
                userName: null,
                password: null,
                newPassword: null,
                Name: null,
                Description: null,
                tempToken: null,
              };
          }

          navigate(name){
              this.props.navigator.push({
                    name: name,
                    token: this.props.token
              })
          }

    updateUser(){
        Keyboard.dismiss();
        Api.login(this.state.userName, this.state.password).then((res) => {
            if(res.status === 200){
                this.setState({tempToken: res.authorizationToken});
                Api.updateUser(this.state.tempToken, this.state.newPassword,
                    this.state.Name, this.state.Description).then((res2) => {
                        if(res2.status === 200){
                            this.navigate("ProfilePage");
                        }
                        else{
                            Alert.alert("Invalid new password... most likely");
                            console.log(res2.message + " message")
                            console.log(this.state.Description)
                        }
                })
            }
            else{
                Alert.alert("Email and old password do not match");
                console.log(res.message)
            }
        })
    }


    render(){
        return(
            <View style= {{flex:1, flexDirection: 'column'}}>
                <View style= {{flex:1, flexDirection: 'column'}}>
                    <Header pageName="Edit Profile" navigator={this.props.navigator}/>
                </View>
                <View style={{flex:9}}>
                    <TextInput
                        style={styles.textField}
                        onChangeText={(userName) => this.setState({userName})}
                        value={this.state.userName}
                        keyboardType = {'email-address'}
                        autoCorrect = {false}
                        placeholder = {'verify Email'}
                        onSubmitEditing={Keyboard.dismiss}
                    />
                    <TextInput
                        style={styles.textField}
                        onChangeText={(password) => this.setState({password})}
                        value={this.state.password}
                        autoCorrect = {false}
                        placeholder = {'current password'}
                        secureTextEntry={ true }
                        onSubmitEditing={Keyboard.dismiss}
                    />
                    <TextInput
                        style={styles.textField}
                        onChangeText={(newPassword) => this.setState({newPassword})}
                        value={this.state.newPassword}
                        autoCorrect = {false}
                        placeholder = {'new password (can be the same if you want)'}
                        secureTextEntry={ true }
                        onSubmitEditing={Keyboard.dismiss}
                    />
                    <TextInput
                        style={styles.textField}
                        onChangeText={(name) => this.setState({name})}
                        value={this.state.name}
                        autoCorrect = {false}
                        placeholder = {'Name'}
                        maxLength = {180}
                    />
                    <TextInput
                        style={styles.textField}
                        onChangeText={(Description) => this.setState({Description})}
                        value={this.state.Description}
                        autoCorrect = {true}
                        placeholder = {'Description'}
                        maxLength = {250}
                        multiline = {true}
                    />
                    <Button
                        onPress={() => this.updateUser()}
                        title="Confirm Changes"
                    />
                </View>
            </View>
        )
    }
}
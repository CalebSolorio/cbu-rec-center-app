import React, { Component, PropTypes } from 'react';
import { View, Alert, Text, StyleSheet, ActivityIndicator, Dimensions,
  TextInput, Keyboard, KeyboardAvoidingView, Button } from 'react-native';

  import { MKTextField } from 'react-native-material-kit';

import Header from '../Components/Header'
import Api from '../Utility/Api'
// import styles from '../Utility/styles'

const window = Dimensions.get('window');

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
              token: this.props.token,
              id: this.props.id
        })
    }

    updateUser(){
        Keyboard.dismiss();
        Api.login(this.state.userName, this.state.password).then((res) => {
            if(res.status === 200){
                this.setState({tempToken: res.authorizationToken});
                console.log(this.state.description)
                Api.updateUser(this.state.tempToken, this.state.newPassword,
                    this.state.name, this.state.description).then((res2) => {
                        if(res2.status === 200){
                            this.navigate("Profile");
                        }
                        else{
                            Alert.alert("Error " + res2.status + ":",
                              res2.message);
                        }
                })
            }
            else{
                Alert.alert("Invalid Credentials -_-",
                  "The email and old password you provided are invalid.");
            }
        })
    }

    render() {
      const styles = StyleSheet.create({
        container: {
          backgroundColor: '#002554',
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        },
        text: {
          color: "white",
          fontSize: 30,
          width: window.width - 30,
          paddingBottom: 5,
        },
        input: {
          height: 70,
          borderRadius: 2,
          marginHorizontal: 10,
          marginVertical: 5,
          paddingVertical: 5,
          width: window.width - 30,
        },
        logo: {
          resizeMode: 'contain',
          marginBottom: 15,
        },
        button: {
          margin: 5,
        },
      });

      return (
        <KeyboardAvoidingView
          style={styles.container}
          behavior="padding"
        >
          <Text style={styles.text}>Update your profile</Text>
          <MKTextField
            ref="email"
            onChangeText={(userName) => this.setState({userName})}
            onSubmitEditing={(event) => {
              this.refs.password.focus();
            }}
            value={this.state.userName}
            keyboardType = {'email-address'}
            highlightColor={"#A37400"}
            tintColor={"#5B6770"}
            textInputStyle={{color: "#fff"}}
            placeholder={"Verify Lancermail"}
            placeholderTextColor={"#5B6770"}
            floatingLabelEnabled={true}
            style={styles.input}
          />
          <MKTextField
            ref="password"
            onChangeText={(password) => this.setState({password})}
            onSubmitEditing={(event) => {
              this.refs.newPassword.focus();
            }}
            value={this.state.password}
            highlightColor={"#A37400"}
            tintColor={"#5B6770"}
            textInputStyle={{color: "#fff"}}
            placeholder={"Current Password"}
            placeholderTextColor={"#5B6770"}
            floatingLabelEnabled={true}
            password={true}
            style={styles.input}
          />
          <MKTextField
            ref="newPassword"
            onChangeText={(newPassword) => this.setState({newPassword})}
            onSubmitEditing={(event) => {
              this.refs.name.focus();
            }}
            value={this.state.newPassword}
            highlightColor={"#A37400"}
            tintColor={"#5B6770"}
            textInputStyle={{color: "#fff"}}
            placeholder={"New Password (optional)"}
            placeholderTextColor={"#5B6770"}
            floatingLabelEnabled={true}
            password={true}
            style={styles.input}
          />
          <MKTextField
            ref="name"
            onChangeText={(name) => this.setState({name})}
            onSubmitEditing={(event) => {
              this.refs.description.focus();
            }}
            value={this.state.name}
            keyboardType = {'email-address'}
            highlightColor={"#A37400"}
            tintColor={"#5B6770"}
            textInputStyle={{color: "#fff"}}
            placeholder={"Name (optional)"}
            placeholderTextColor={"#5B6770"}
            floatingLabelEnabled={true}
            style={styles.input}
          />
          <MKTextField
            ref="description"
            onChangeText={(description) => this.setState({description})}
            value={this.state.description}
            keyboardType = {'email-address'}
            highlightColor={"#A37400"}
            tintColor={"#5B6770"}
            textInputStyle={{color: "#fff"}}
            placeholder={"Description (optional)"}
            placeholderTextColor={"#5B6770"}
            floatingLabelEnabled={true}
            style={styles.input}
          />

          <View style={{flexDirection:'row'}}>
            <View style={styles.button} >
              <Button
                title="Submit"
                onPress={ () => this.updateUser() }
                color="#A37400"
              />
            </View>
          </View>
        </KeyboardAvoidingView>

      );
    }

    // render(){
    //     return(
    //         <View style= {{flex:1, flexDirection: 'column'}}>
    //             <View style= {{flex:1, flexDirection: 'column'}}>
    //                 <Header pageName="Edit Profile" navigator={this.props.navigator} id={this.props.id} token={this.props.token}/>
    //             </View>
    //             <View style={{flex:9}}>
    //                 <TextInput
    //                     style={styles.textField}
    //                     onChangeText={(userName) => this.setState({userName})}
    //                     value={this.state.userName}
    //                     keyboardType = {'email-address'}
    //                     autoCorrect = {false}
    //                     placeholder = {'verify Email'}
    //                     onSubmitEditing={Keyboard.dismiss}
    //                 />
    //                 <TextInput
    //                     style={styles.textField}
    //                     onChangeText={(password) => this.setState({password})}
    //                     value={this.state.password}
    //                     autoCorrect = {false}
    //                     placeholder = {'current password'}
    //                     secureTextEntry={ true }
    //                     onSubmitEditing={Keyboard.dismiss}
    //                 />
    //                 <TextInput
    //                     style={styles.textField}
    //                     onChangeText={(newPassword) => this.setState({newPassword})}
    //                     value={this.state.newPassword}
    //                     autoCorrect = {false}
    //                     placeholder = {'new password (can be the same if you want)'}
    //                     secureTextEntry={ true }
    //                     onSubmitEditing={Keyboard.dismiss}
    //                 />
    //                 <TextInput
    //                     style={styles.textField}
    //                     onChangeText={(Name) => this.setState({Name})}
    //                     value={this.state.Name}
    //                     autoCorrect = {false}
    //                     placeholder = {'Name'}
    //                     maxLength = {180}
    //                 />
    //                 <TextInput
    //                     style={styles.textField}
    //                     onChangeText={(Description) => this.setState({Description})}
    //                     value={this.state.Description}
    //                     autoCorrect = {true}
    //                     placeholder = {'Description'}
    //                     maxLength = {250}
    //                     multiline = {true}
    //                 />
    //                 <Button
    //                     onPress={() => this.updateUser()}
    //                     title="Confirm Changes"
    //                 />
    //                 <Button
    //                     onPress={() => this.autoFill()}
    //                     title="auto Fill"
    //                 />
    //             </View>
    //         </View>
    //     )
    // }
}

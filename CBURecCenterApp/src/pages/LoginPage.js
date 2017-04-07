import React, { Component, PropTypes } from 'react';
import { View, Keyboard, AsyncStorage, Text, Alert, TextInput, Button, StyleSheet, KeyboardAvoidingView, Dimensions, Animated, Image } from 'react-native';
import { MKTextField, MKButton, MKColor, mdl } from 'react-native-material-kit';
import Api from '../Utility/Api';
import logo from '../Utility/logo.png';

const window = Dimensions.get('window');
const IMAGE_HEIGHT = window.width / 2;
const IMAGE_HEIGHT_SMALL = window.width / 5;


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

    this.imageHeight = new Animated.Value(IMAGE_HEIGHT);
  }

  componentWillMount () {
    this.keyboardWillShowSub = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow);
    this.keyboardWillHideSub = Keyboard.addListener('keyboardWillHide', this.keyboardWillHide);
  }

  componentWillUnmount() {
    this.keyboardWillShowSub.remove();
    this.keyboardWillHideSub.remove();
  }

  keyboardWillShow = (event) => {
    Animated.timing(this.imageHeight, {
      duration: event.duration,
      toValue: IMAGE_HEIGHT_SMALL,
    }).start();
  };

  keyboardWillHide = (event) => {
    Animated.timing(this.imageHeight, {
      duration: event.duration,
      toValue: IMAGE_HEIGHT,
    }).start();
  };

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

  render() {
    const styles = StyleSheet.create({
      container: {
        backgroundColor: '#002554',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      },
      input: {
        height: 75,
        // fontSize: 16,
        borderRadius: 2,
        // backgroundColor: '#fff',
        marginHorizontal: 10,
        marginVertical: 5,
        paddingVertical: 5,
        // paddingHorizontal: 15,
        width: window.width - 30,
      },
      logo: {
        height: IMAGE_HEIGHT,
        maxWidth: window.width * .9,
        resizeMode: 'contain',
        marginBottom: 30,
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
          <Animated.Image source={logo} style={[styles.logo, { height: this.imageHeight }]} />
          <MKTextField
            onChangeText={(userName) => this.setState({userName})}
            value={this.state.userName}
            highlightColor={"#A37400"}
            tintColor={"#5B6770"}
            textInputStyle={{color: "#fff"}}
            placeholder={"Lancermail"}
            placeholderTextColor={"#5B6770"}
            floatingLabelEnabled={true}
            style={styles.input}
          />
          <MKTextField
            onChangeText={(password) => this.setState({password})}
            value={this.state.password}
            highlightColor={"#A37400"}
            tintColor={"#5B6770"}
            textInputStyle={{color: "#fff"}}
            placeholder={"Password"}
            placeholderTextColor={"#5B6770"}
            floatingLabelEnabled={true}
            password={true}
            style={styles.input}
          />

          <View style={{flexDirection:'row'}}>
            <View style={styles.button} >
              <Button
                onPress={() => this.submitLogin()}
                title="log in"
                color="#A37400"
              />
            </View>
            <View style={styles.button} >
              <Button style={styles.button}
                onPress={() => this.RegisterFunction()}
                title="Register"
                color="#A37400"
              />
            </View>
            <View style={styles.button} >
              <Button style={styles.button}
                onPress={() => this.devLogin()}
                title="DEV BUTTON"
                color="#A37400"
              />
            </View>
          </View>
      </KeyboardAvoidingView>
    );
  }
}


  //   constructor(props) {
  //       super(props);
  //       this.submitLogin = this.submitLogin.bind(this),
  //       this.state = {
  //           response: null,
  //           userName: null,
  //           password: null,
  //           id: null
  //         };
  //
  //       this.imageHeight = new Animated.Value(IMAGE_HEIGHT);
  //     }
  //
  //     componentWillMount () {
  //       this.keyboardWillShowSub = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow);
  //       this.keyboardWillHideSub = Keyboard.addListener('keyboardWillHide', this.keyboardWillHide);
  //     }
  //
  //     componentWillUnmount() {
  //       this.keyboardWillShowSub.remove();
  //       this.keyboardWillHideSub.remove();
  //     }
  //
  //     keyboardWillShow = (event) => {
  //       Animated.timing(this.imageHeight, {
  //         duration: event.duration,
  //         toValue: IMAGE_HEIGHT_SMALL,
  //       }).start();
  //     };
  //
  //     keyboardWillHide = (event) => {
  //       Animated.timing(this.imageHeight, {
  //         duration: event.duration,
  //         toValue: IMAGE_HEIGHT,
  //       }).start();
  //     };
  //
      // navigate(name){
      //     this.props.navigator.push({
      //         name: name,
      //         token: this.state.response,
      //         id: this.state.id
      //     })
      // }
      //
      // RegisterFunction(){
      //   Keyboard.dismiss();
      //   this.navigate("RegisterEmail")
      // }
      //
      // submitLogin(){
      //   Api.login(this.state.userName, this.state.password).then((res) => {
      //       console.log(res.status)
      //       if(res.status === 200){
      //           Keyboard.dismiss();
      //           this.setState({response: res.authorizationToken, id: res.id});
      //           console.log(this.state.id + " id")
      //           this.navigate('LoadingScreen');
      //       }
      //       else{
      //           Keyboard.dismiss();
      //           Alert.alert("Invalid username/password combo", " ");
      //       }
      //   })
      // }
      //
      // devLogin(){
      //   Api.login("AustinT.Brinegar@calbaptist.edu", "password").then((res) => {
      //           if(res.status === 200){
      //               Keyboard.dismiss()
      //               this.setState({response: res.authorizationToken, id: res.id});
      //               console.log(this.state.id + " id")
      //               this.navigate('LoadingScreen');
      //           }
      //   })
      // }
  //
  //   render(){
  //     const styles = StyleSheet.create({
  //       // view: {
  //       //   flex: 1,
  //       //   backgroundColor: 'blue',
  //       //   justifyContent: 'center',
  //       //   alignItems: 'center',
  //       //   flexDirection:'column',
  //       // },
  //       // textField: {
  //       //   margin:10,
  //       //   height: 40,
  //       //   // alignItems: stretch,
  //       //   flex:.8,
  //       //   // flexDirection:"row",
  //       //   borderColor: 'gray',
  //       //   borderWidth: 1,
  //       //   // flex: .8
  //       // },
  //       // loginButton: {
  //       //     margin: 5,
  //       // },
  //       container: {
  //   backgroundColor: '#4c69a5',
  //   flex: 1,
  //   alignItems: 'center',
  //   justifyContent: 'center',
  // },
  // input: {
  //   height: 50,
  //   borderRadius: 2,
  //   backgroundColor: '#fff',
  //   marginHorizontal: 10,
  //   marginVertical: 5,
  //   paddingVertical: 5,
  //   // paddingHorizontal: 15,
  //   width: window.width - 30,
  // },
  // logo: {
  //   height: IMAGE_HEIGHT,
  //   // width: IMAGE_HEIGHT,
  //   resizeMode: 'contain',
  //   marginBottom: 30,
  // },
  //     });
  //
  //     return (
  //       <KeyboardAvoidingView
  //     style={styles.container}
  //     behavior="padding"
  //   >
  //     <Animated.Image source={logo} style={[styles.logo, { height: this.imageHeight }]} />
  //     <TextInput
  //       placeholder="Email"
  //       style={styles.input}
  //     />
  //     <TextInput
  //       placeholder="Username"
  //       style={styles.input}
  //     />
  //     <TextInput
  //       placeholder="Password"
  //       style={styles.input}
  //     />
  //     <TextInput
  //       placeholder="Confirm Password"
  //       style={styles.input}
  //     />
  //     <View style={{ height: 60 }} />
  //   </KeyboardAvoidingView>
  //     );
  //
  //       // return (
  //       //     <View style={styles.view}>
  //       //       <View style={{flexDirection:'row'}}>
  //       //         <TextInput
  //       //             style={styles.textField}
  //       //             onChangeText={(userName) => this.setState({userName})}
  //       //             value={this.state.userName}
  //       //             keyboardType = {'email-address'}
  //       //             autoCorrect = {false}
  //       //             placeholder = {'CBU Email'}
  //       //             onSubmitEditing={Keyboard.dismiss}
  //       //
  //       //         />
  //       //       </View>
  //       //       <View style={{flexDirection:'row'}}>
  //       //         <TextInput
  //       //             style={styles.textField}
  //       //             onChangeText={(password) => this.setState({password})}
  //       //             value={this.state.password}
  //       //             autoCorrect = {false}
  //       //             placeholder = {'password'}
  //       //             secureTextEntry={ true }
  //       //             onSubmitEditing={Keyboard.dismiss}
  //       //         />
  //       //       </View>
  //       //       <View style={{flexDirection:'row'}}>
  //       //         <View style={styles.loginButton} >
  //       //             <Button
  //       //                 onPress={() => this.submitLogin()}
  //       //                 title="log in"
  //       //             />
  //       //         </View>
  //       //         <View style={styles.loginButton} >
  //       //             <Button style={styles.loginButton}
  //       //                 onPress={() => this.RegisterFunction()}
  //       //                 title="Register"
  //       //             />
  //       //         </View>
  //       //         <View style={styles.loginButton} >
  //       //             <Button style={styles.loginButton}
  //       //                 onPress={() => this.devLogin()}
  //       //                 title="DEV BUTTON"
  //       //             />
  //       //         </View>
  //       //       </View>
  //       //
  //       //
  //       //     </View>
  //       // );
  //   }

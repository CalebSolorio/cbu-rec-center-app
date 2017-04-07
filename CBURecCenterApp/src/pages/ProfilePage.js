import React, { Component, PropTypes } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, TouchableHighlight, Button } from 'react-native';
import Header from '../Components/Header'
import Api from '../Utility/Api'
import styles from '../Utility/styles'

export default class ProfilePage extends Component {
  constructor(props){
    super(props);
    this.state = {
        Name: null,
        Description: null
    }
  }

    navigate(name){
        this.props.navigator.push({
            name: name,
            token: this.state.response,
            id: this.state.id
        })
    }

  async componentWillMount() {
    await Api.getUser(this.props.id, this.props.token).then((value) => {
        this.setState({
            Name: value.name,
            Description: value.description
        });
    })
  }

  render() {
          console.log(this.props.id + " id");
          console.log(this.props.token + " token");
      //until data is finished loading
      if (!this.state.Name || !this.state.Description) {
        return (
          <ActivityIndicator
            animating={true}
            style={styles.indicator}
            size="large"
          />
        );
      }
    return (
        <View style= {{flex:1, flexDirection: 'column'}}>
            <Header pageName="Profile" navigator={this.props.navigator}/>
            <View style= {{flex: 9}}>
                <View style = {styles.Profile}>
                    <Image style={styles.Profile_Img}
                        source={{uri : 'https://s3.amazonaws.com/cbu-rec-center-app/app/images/users/' + this.props.id + '/100px.jpg' }}
                    />
                    <View style = {styles.Profile_Info}>
                        <Text style={styles.HOP}> {this.state.Name} </Text>
                        <Text> {this.state.Description} </Text>
                    </View>
                </View>
                <View style={{flex:5}}>
                    <Button style={styles.loginButton}
                        onPress={() => this.navigate("EditProfile")}
                        title="Edit Profile"
                    />
                </View>
            </View>
        </View>
    )
  }
}
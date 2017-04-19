import React, { Component, PropTypes } from 'react';
import { ScrollView, View, Text, Image, Picker, StyleSheet, ActivityIndicator,
    AsyncStorage, TouchableHighlight, Button, Alert } from 'react-native';

import { Card, Divider } from 'react-native-material-design';
import Icon from 'react-native-vector-icons/MaterialIcons';

import Header from '../Components/Header';
import Api from '../Utility/Api';
import CalendarItem from '../Components/CalendarItem';

export default class ProfilePage extends Component {
  constructor(props){
    super(props);
    this.state = {
        name: null,
        description: null,
        data: null,
    }
  }

  navigate(name){
      this.props.navigator.push({
          name: name,
          token: this.props.token,
          id: this.props.id
      });
  }

  async componentWillMount() {
    await this.loadUser();
    await this.loadMarks();
  }

  loadUser = () => {
    Api.getUser(this.props.id, this.props.token).then((value) => {
      this.setState({
          name: value.name,
          description: value.description
      });
    });
  }

  loadMarks = () => {
    Api.getMarks(this.props.token).then((value) => {
        this.setState({ data: value });
    });
  }

  async logout(){
    Alert.alert(
      'Are you sure you want to logout?',
      'I thought we had something special...',
      [
        { text: 'Cancel' },
        { text: "Yes", onPress: () => {
            AsyncStorage.multiRemove(["token", "id"]).then(() => {
              this.navigate("Login");
            });
          }
        },
      ],
    )
  }

  render() {
      const styles = StyleSheet.create({
        container: {
          backgroundColor: '#002554',
          flex: 1,
        },
        indicator: {
            flex: 1,
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: 80,
        },
        name: {
          fontSize: 30,
          paddingBottom: 5,
          textAlign: "center",
        },
        text: {
          fontSize: 18,
          paddingBottom: 5,
          textAlign: 'center',
        },
        input: {
          height: 70,
          borderRadius: 2,
          marginHorizontal: 10,
          marginVertical: 5,
          paddingVertical: 5,
          width: window.width - 30,
        },
        picture: {
          alignSelf: 'center',
          height: 150,
          width: 150,
          marginVertical: 4,
          borderRadius: 80,
        },
        pictureCard: {
          alignSelf: 'center',
          height: 160,
          width: 160,
          borderRadius: 80,
          transform: [
            { translateY: 80 },
          ],
          zIndex:1,
        },
        buttonView: {
          flexDirection:'row',
          justifyContent:'space-between',
          marginVertical: 10,
        },
        iconButton: {
          marginVertical: 10,
        },
        markedTitle: {
          fontSize: 15,
          marginTop: 10,
        },
        proTip: {
          fontSize: 15,
          marginTop: 5,
          textAlign: "center",
        },
        divider: {
          marginTop: 5,
          marginBottom: 10,
        }
      });

      //until data is finished loading
      if (!this.state.name || !this.state.description) {
        return (
          <View
            style={styles.container}
            behavior="padding"
          >
            <ActivityIndicator
              animating={true}
              style={styles.indicator}
              size="large"
              color="#A37400"
            />
          </View>
        );
      }

      var markedItems =
        <View>
          <Divider style={ styles.divider } />
          <Text style={ styles.proTip }>Pro Tip: try marking some events
            you're interested in to keep track of them for later!</Text>
        </View>;

      if(this.state.data != null) {
        markedItems =
        <View>
          <Text style={ styles.markedTitle }>Marked</Text>
          <Divider style={ styles.divider }/>
          {this.state.data.map((item) => (
            <CalendarItem key={item.id}
              handleMark={() =>{
                this.loadUser();
                this.loadMarks();
              }}
              marked={true} title={item.title}
              startTime={item.start.dateTime} endTime={item.end.dateTime}
              description={item.description.replace(/\r?\n|\r/g, " ")}
              type={item.type} id={item.id} token={this.props.token}/>
          ))}
        </View>;
      }

      return (
        <ScrollView
            style={styles.container}
            behavior="padding"
          >
          <Card
            elevation={4}
            style={ styles.pictureCard }>
            <Image source={{uri : 'https://s3.amazonaws.com/cbu-rec-center-app/app/images/users/' +
              this.props.id + '/uncompressed.jpg' }}
              style={ styles.picture } resizeMode="cover" />
          </Card>
          <Card>
            <View style={ styles.buttonView }>
                <Icon name="settings" size={30}
                  onPress={() => this.navigate("EditProfile")} />
                <Icon name="exit-to-app" size={30}
                  onPress={() => this.logout()} />
            </View>
            <Card.Body>
                <Text style={[styles.name, {marginTop: 5 }]}>{ this.state.name }</Text>
                <Text style={styles.text}>{ this.state.description }</Text>
                { markedItems }
            </Card.Body>
          </Card>
          <Text>{"\n"}</Text>
        </ScrollView>
    );
  }
}

import React, { Component, PropTypes } from 'react';
import { Dimensions, ScrollView, View, Text, Image, Picker, StyleSheet, ActivityIndicator,
    AsyncStorage, TouchableHighlight, Button, Alert, StatusBar } from 'react-native';

import { Card, Divider } from 'react-native-material-design';
import Icon from 'react-native-vector-icons/MaterialIcons';

import Api from '../utility/Api';
import CalendarItem from '../components/CalendarItem';

const window = Dimensions.get('window');

/*
  Presents info on the user.
*/
export default class ProfilePage extends Component {
  /**
   * Initializes the component.
  */
  constructor(props){
    super(props);
    this.state = {
        name: null,
        description: null,
        data: null,
    }

    this.loadUser = this.loadUser.bind(this);
  }

  /**
   * Navigates to the sepcified page.
   *
   * @param {Object} name The keyword of the desired page.
  */
  navigate(name){
      this.props.navigator.push({
          name: name,
          token: this.props.token,
          id: this.props.id,
          callback: () => {
            this.loadUser();
            this.props.addEventListeners();
          },
      });
  }

  /*
    Loads the user's info upon mounting.
  */
  async componentWillMount() {
    await this.loadUser();
  }

  /*
    Gathers the most up-to-date user info.
  */
  loadUser = () => {
    Api.getUser(this.props.id, this.props.token).then((value) => {
      this.setState({
          name: value.name,
          description: value.description
      });
    });
  }

  /*
    Assists with logging the user out.
  */
  async logout(){
    Alert.alert(
      'Are you sure you want to logout?',
      'I thought we had something special...',
      [
        { text: 'Cancel' },
        { text: "Yes", onPress: () => {
            AsyncStorage.multiRemove(["token", "id"]).then(() => {
              this.props.navigator.resetTo({ name: "Login" });
            });
          }
        },
      ],
    )
  }

  /*
    Renders the component.
  */
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
        circleCard: {
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
          <Text style={ styles.proTip }>Pro Tip: Mark some events
            you're interested in to keep track of them for later!</Text>
        </View>;

      if(this.props.marks && this.props.marks.length > 0) {
        markedItems =
          <View>
            <Text style={ styles.markedTitle }>Marked</Text>
            <Divider style={ styles.divider }/>
            {this.props.marks.map((item) => (
              <CalendarItem key={item.details.id}
                handleMark={() => this.props.getMarks()}
                marked={true} title={item.details.title}
                startTime={item.details.start.dateTime}
                endTime={item.details.end.dateTime}
                description={item.details.description ?
                  item.details.description.replace(/\r?\n|\r/g, " ") : null}
                type={item.details.type} id={item.details.id} token={this.props.token}/>
            ))}
          </View>;
      }

      return (
        <View
          style={styles.container}
        >
          <View style={{ flex: 1, alignItems: 'stretch' }}>
            <Image source={{
              uri: 'https://calbaptist.edu/_resources/images/cbu-recreation-center-entrance-dusk-original-5000px.jpg'
            }} style={{
              height: window.height,
              width: window.width,
              position: 'absolute',
              top:0,
              left:0,
            }}/>
          </View>

          <ScrollView behavior="padding"
            style={{
              position:'absolute',
              flex: 1,
              height: window.height,
            }}>
            <Card
              elevation={4}
              style={ styles.circleCard }>
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
        </View>
    );
  }
}

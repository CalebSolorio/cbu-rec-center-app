import React, {Component, PropTypes} from 'react';
import {
  Dimensions,
  Image,
  Linking,
  Picker,
  ScrollView,
  StyleSheet,
  Text,
  TouchableHighlight,
  View
} from 'react-native';

import {Card, Divider, Ripple} from 'react-native-material-design';
import Icon from 'react-native-vector-icons/FontAwesome';

const window = Dimensions.get('window');

/*
  Presents static info on the Rec Center.
*/
export default class InfoPage extends Component {
  /**
   * Initializes the component.
  */
  constructor(props) {
    super(props);

    this.state = {
      hours: 0
    };
  }

  /**
   * Renders the component.
  */
  render() {
    const styles = StyleSheet.create({
      container: {
        backgroundColor: '#002554',
        flex: 1
      },
      title: {
        fontSize: 22,
        paddingBottom: 5,
        // textAlign: "center",
      },
      name: {
        fontSize: 30,
        paddingBottom: 5,
        textAlign: "center"
      },
      titleText: {
        fontSize: 18,
        paddingBottom: 5
      },
      text: {
        fontSize: 16,
        paddingBottom: 5
      },
      image: {
        width: window.width,
        height: window.height / 3,
        resizeMode: 'cover'
      },
      content: {
        transform: [
          {
            translateY: -50
          }
        ]
      },
      buttonView: {
        alignSelf: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 10
      },
      icon: {
        marginHorizontal: 10
      },
      divider: {
        marginVertical: 10
      }
    });

    const hours = this.state.hours == 0
      ? <View style={{
          marginHorizontal: 10,
          marginBottom: 10
        }}>
          <Text style={styles.text}>Mon–Thurs: 6 a.m.–12 a.m.
          </Text>
          <Text style={styles.text}>Friday: 6 a.m.–10 p.m.
          </Text>
          <Text style={styles.text}>Saturday: 10 a.m.–6 p.m.
          </Text>
          <Text style={styles.text}>Sunday: 5 p.m.–10 p.m.
          </Text>
        </View>
      : <View style={{
        marginHorizontal: 10,
        marginBottom: 10
      }}>
        <Text style={styles.text}>Mon–Fri: 6 a.m.–10 a.m. and 4 p.m.–close
        </Text>
        <Text style={styles.text}>Sat–Sun: open during hours of operation
        </Text>
      </View>;

    return (
      <ScrollView style={styles.container} behavior="padding">
        <Image source={{
          uri: 'https://calbaptist.edu/files/cache/0ab75713d2522ff38fb42fd416cef4b5_f648.jpg'
        }} resizeMode='contain' style={styles.image}/>

        <View style={styles.content}>
          <Card>
            <Picker selectedValue={this.state.hours} mode="dropdown" onValueChange={(hours) => this.setState({hours})}>
              <Picker.Item label="Rec Center Hours of Operation" value={0}/>
              <Picker.Item label="Climbing Wall Hours of Operation" value={1}/>
            </Picker>

            {hours}

          </Card>
          <View style={styles.buttonView}>
            <Icon name="instagram" size={50} color="white" style={styles.icon} onPress={() => Linking.openURL('https://www.instagram.com/_u/cbureccenter/')}/>
            <Icon name="facebook-square" size={50} style={{
              alignSelf: "right"
            }} color="white" style={styles.icon} onPress={() => Linking.openURL('https://www.facebook.com/CBU-Recreation-Center-391198987617096/')}/>
            <Icon name="snapchat-ghost" size={50} style={{
              alignSelf: "right"
            }} color="white" style={styles.icon} onPress={() => Linking.openURL('https://www.snapchat.com/add/CBURecCenter/')}/>
            <Icon name="twitter" size={50} style={{
              alignSelf: "right"
            }} color="white" style={styles.icon} onPress={() => Linking.openURL('https://twitter.com/cbu_reccenter')}/>
          </View>
          <Card>
            <Card.Body>
              <Text style={styles.title}>About the Rec Center</Text>
              <Text style={styles.titleText}>The CBU Recreation Center is committed to providing a safe facility and quality recreational programming to encourage and equip the CBU community to honor the Lord with their bodies (1 Corinthians 6:19–20).
              </Text>
              <Divider style={styles.divider}/>

              <Ripple>
                <Text style={styles.text} onPress={() => Linking.openURL('https://calbaptist.edu/community-life/campus-recreation/recreation-center/')}>
                  To visit the Rec Center's website, press here.</Text>
              </Ripple>
            </Card.Body>
          </Card>
        </View>
      </ScrollView>
    );
  }
}

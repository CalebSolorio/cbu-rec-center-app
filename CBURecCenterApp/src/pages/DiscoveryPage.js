import React, {Component, PropTypes} from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  AsyncStorage,
  Button,
  DatePickerAndroid,
  Dimensions,
  Image,
  Keyboard,
  Text,
  TextInput,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableHighlight,
  View
} from 'react-native';

import {Card, Divider, Ripple} from 'react-native-material-design';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {MKTextField} from 'react-native-material-kit';
import moment from 'moment';

import CalendarItem from '../Components/CalendarItem';

import Api from '../Utility/Api';
import logo from '../Utility/logo.png';

const window = Dimensions.get('window');

/*
  Displays upcoming classes and events.
*/
export default class DiscoveryPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: "Lancer",
      data: null,
      marks: null,
      events: null,
      expandId: null,
      gatheringData: false,
      date: null,
      hours: {
        open: "00:00",
        close: "23:59"
      }
    };

    this.loadData = this.loadData.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.showPicker = this.showPicker.bind(this);
  }

  /*
   * Load the appropriate data upon mounting.
   */
  async componentWillMount() {
    await this.loadData();
  }

  /*
   * Get the user's name and most viral events.
   */
  loadData = () => {
    Api.getUser(this.props.id, this.props.token).then((user) => {
      if (user.name != undefined) {
        this.setState({
          name: user.name.split(" ")[0]
        });
      }
    });

    this.getViral();
  }

  /*
   * Get the most viral events.
   */
  getViral = () => {
    if (!this.state.gatheringData && !this.state.noMoreData) {
      this.setState({gatheringData: true});
      Api.getViral(this.state.events != null
        ? this.state.events.length
        : 0, this.props.token).then((events) => {
        this.setState({gatheringData: false});
        if (events.status == 200 && this.state.events) {
          this.setState({
            events: this.state.events.concat(events.data.items)
          });
        } else if (events.status == 200) {
          this.setState({events: events.data.items});
        } else {
          this.setState({noMoreData: true});
        }
      });
    }
  }

  /*
   * Get more viral events if the user scrolls down enough.
   */
  handleScroll = (e) => {
    if (e.nativeEvent.contentOffset.y > e.nativeEvent.contentSize.height - window.height * 2) {
      this.getViral();
    }
  }

  showPicker = async(options) => {
    try {
      const {action, year, month, day} = await DatePickerAndroid.open(options);

      if (action != DatePickerAndroid.dismissedAction) {
        const date = new Date(year, month, day);
        this.setState({date});
        this.getByDate(date);
      }
    } catch ({code, message}) {
      Alert.alert("Uh oh, we lost track of time!", "An error occured when getting selected date :( Please try again." + message);
    }
  };

  /*
   * Get events on the specified date.
   */
  getByDate = (date) => {
    if (!this.state.gatheringData) {
      this.setState({gatheringData: true, events: null});
      Api.getDate(moment(date).format("M-D-YYYY"), this.props.token).then((events) => {
        console.log("EVENTS", events)

        this.setState({gatheringData: false});
        if (!events.status) {
          let items = [];
          for (i in events.items) {
            items.push(events.items[i].details);
          }

          this.setState({events: items, hours: events.hours});
        } else {
          this.setState({date: null});
          Alert.alert("We're closed ¯\\_(ツ)_/¯", "Nothing's happening on that day.");
        }
      });
    }
  }

  /*
   * Render the component.
   */
  render() {
    const styles = StyleSheet.create({
      container: {
        backgroundColor: '#5B6770',
        flex: 1,
        flexDirection: 'column'
      },
      indicator: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: 80,
        marginBottom: 15
      },
      text: {
        color: "white",
        fontSize: 20,
        width: window.width - 30,
        paddingBottom: 5,
        textAlign: "center",
        alignSelf: 'center'
      },
      logo: {
        height: 40,
        resizeMode: 'contain',
        alignSelf: 'center'
      },
      icon: {
        paddingRight: 15,
        marginTop: 5,
        alignSelf: 'center',
        zIndex: 5
      }
    });

    const prompt = this.state.date
      ? <View style={{
          flex: 1,
          flexDirection: "row",
          justifyContent: "space-between",
          marginVertical: 10
        }}>
          <Text style={{
            fontSize: 25
          }}>
            {moment(this.state.date).format("dddd") + ", " + moment(this.state.date).format("MMMM Do")}:
          </Text>
          <View style={{
            flex: 1,
            flexDirection: "column",
            alignItems: "flex-end"
          }}>
            <Button style={{
              width: 150
            }} title={"What\'s Popular?"} onPress={() => {
              this.setState({date: null, events: null});
              this.getViral();
            }} color="#002554"/>
          </View>
        </View>
      : <View style={{
        flex: 1
      }}>
        <Text style={{
          fontSize: 20,
          marginBottom: 10,
          textAlign: 'center'
        }}>Here's what's going on at the Rec Center:</Text>
      </View>;

    var items = <ActivityIndicator animating={true} style={styles.indicator} size="large" color="#A37400"/>

    if (this.state.events != null && this.state.events.length == 0) {
      items = <Text style={{
        fontSize: 25,
        textAlign: 'center',
        marginBottom: 15
      }}>
        Couldn't find any events happening today{"\n"}{"\n"}(╯°□°）╯︵ ┻━┻
      </Text>;
    } else if(this.state.events != null) {
      items = null;
      let count = 0;
      items = this.state.events.map((event) => {
        if (this.props.marks && this.props.marks.length > 0) {
          for (mark in this.props.marks) {
            if (this.props.marks[mark].id == event.id) {
              return (<CalendarItem key={event.id} token={this.props.token} handleMark={() => this.props.getMarks()} marked={true} title={event.title} startTime={event.start.dateTime} endTime={event.end.dateTime} description={event.description
                ? event.description.replace(/\r?\n|\r/g, " ")
                : null} type={event.type} id={event.id} child={true} expand={event.id == this.state.expandId} handleClick={(id) => this.setState({
                expandId: (id == this.state.expandId
                  ? null
                  : id)
              })}/>);
            }
          }
        }

        return (<CalendarItem key={event.id} token={this.props.token} handleMark={() => this.props.getMarks()} marked={false} title={event.title} startTime={event.start.dateTime} endTime={event.end.dateTime} description={event.description
          ? event.description.replace(/\r?\n|\r/g, " ")
          : null} type={event.type} id={event.id} child={true} expand={event.id == this.state.expandId} handleClick={(id) => this.setState({
          expandId: (id == this.state.expandId
            ? null
            : id)
        })}/>);

      });
    }

    return (
      <View style={styles.container} behavior="padding">
        <Ripple>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginVertical: 10
          }}>
            <View style={{
              flex: .5,
              flexDirection: 'row',
              justifyContent: 'center'
            }}>
              <Image source={logo} style={styles.logo}/>
            </View>

            <View style={{
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'flex-end'
            }}>
              <Icon name="account-circle" size={35} color="white" style={styles.icon} onPress={() => this.props.onPress(-1)}/>
              <Icon name="event-note" size={35} color="white" style={styles.icon} onPress={() => this.showPicker({date: new Date(), minDate: new Date(), mode: 'spinner'})}/>
              <Icon name="info-outline" size={35} color="white" style={styles.icon} onPress={() => this.props.onPress(1)}/>
            </View>

          </View>
        </Ripple>
        <ScrollView onScroll={(e) => this.handleScroll(e)}>
          <Card style={{
            margin: 0,
            paddingVertical: 5,
            width: window.width
          }}>
            <Text style={{
              fontSize: 30,
              marginBottom: 5,
              textAlign: 'center'
            }}>Welcome Back, {this.state.name}!</Text>

            {prompt}

            <Divider style={{
              marginBottom: 15
            }}/>

            { items }

          </Card>
          <Text>{"\n"}</Text>
        </ScrollView>
      </View>
    );
  }
}

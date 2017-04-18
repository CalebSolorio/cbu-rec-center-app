import React, { Component } from 'react';
import { BackAndroid, ActivityIndicator, AsyncStorage, AppRegistry,
  Navigator, StyleSheet, View } from 'react-native';
import HomePage from './src/pages/HomePage';
import CalendarPage from './src/pages/CalendarPage';
import DiscoverPage from './src/pages/DiscoverPage';
import ErrorPage from './src/pages/ErrorPage';
import InfoPage from './src/pages/InfoPage';
import ProfilePage from './src/pages/ProfilePage';
import LoginPage from './src/pages/LoginPage';
import RegisterPage from './src/pages/RegisterPage';
import RegisterEmail from './src/pages/RegisterEmail';
import styles from './src/Utility/styles'
import EditProfile from './src/pages/EditProfile';
import MarkedPage from './src/pages/MarkedPage';

export default class CBURecCenterApp extends Component {

    constructor(){
        super()
        this.renderScene = this.renderScene.bind(this)
        this.state=  {
            Token: null,
            id: null,
            check1: false,
            check2: false
        };
    }

    renderScene(route, navigator){
        switch(route.name){
            case 'Home':
                return <HomePage navigator={navigator} token={route.token} id={route.id}/>
                break;
            case 'Calendar':
                return <CalendarPage navigator={navigator} token={route.token} id={route.id}/>
                break;
            case 'Discover':
                return <DiscoverPage navigator={navigator} token={route.token} id={route.id}/>
                break;
            case 'Profile':
                return <ProfilePage navigator={navigator} token={route.token} id={route.id}/>
                break;
            case 'Info':
                return <InfoPage navigator={navigator} token={route.token} id={route.id}/>
                break;
            case 'Login':
                return <LoginPage navigator={navigator} id={route.id}/>
                break;
            case 'Register':
                return <RegisterPage navigator={navigator} email={route.email} code={route.code} id={route.id}/>
                break;
            case 'RegisterEmail':
                return <RegisterEmail navigator={navigator} id={route.id}/>
                break;
            case 'EditProfile':
                return <EditProfile navigator={navigator} token={route.token} id={route.id}/>
                break;
            case 'Marked':
                return <MarkedPage navigator={navigator} token={route.token} id={route.id}/>
                break;
            default:
                return <ErrorPage navigator={navigator} token={route.token} id={route.id}/>
        }
    }

    async componentWillMount(){
        try {
            //get auth Token
            await AsyncStorage.getItem("authToken").then((value) => {
                this.setState({Token: value});
            })
            .then(res => {
                this.setState({check1: true});
            });
            //get ID
            await AsyncStorage.getItem("id").then((value2) => {
                this.setState({id: value2});
            })
            .then(res => {
                this.setState({check2: true});
            });

        } catch (error) {
          // Error retrieving data
        }

    }

    render() {
        //until data is finished loading
        if (this.state.check1 === false || this.state.check2 === false) {
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
          });

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
          if (this.state.Token === null || this.state.id === null){
            return (
              <Navigator
                initialRoute={{name: 'Login'}}
                renderScene={this.renderScene}
              />
            );
          }
          return (
            <Navigator
              initialRoute={{name: 'Home', token: this.state.Token, id: this.state.id}}
              renderScene={this.renderScene}
            />
          );
    }
}

AppRegistry.registerComponent('CBURecCenterApp', () => CBURecCenterApp);

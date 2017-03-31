import React, { Component } from 'react';
import { AppRegistry, Navigator } from 'react-native';
import HomePage from './src/pages/HomePage';
import CalendarPage from './src/pages/CalendarPage';
import DiscoverPage from './src/pages/DiscoverPage';
import ErrorPage from './src/pages/ErrorPage';
import InfoPage from './src/pages/InfoPage';
import ProfilePage from './src/pages/ProfilePage';
import LoginPage from './src/pages/LoginPage';
import RegisterPage from './src/pages/RegisterPage';
import RegisterEmail from './src/pages/RegisterEmail';

export default class CBURecCenterApp extends Component {

    constructor(){
        super()
        this.renderScene = this.renderScene.bind(this)
    }

    renderScene(route, navigator){
        switch(route.name){
            case 'Home':
                return <HomePage navigator={navigator} token={route.token} id={route.id}/>
                break;
            case 'Calendar':
                return <CalendarPage navigator={navigator} token={route.token}/>
                break;
            case 'Discover':
                return <DiscoverPage navigator={navigator} token={route.token}/>
                break;
            case 'Profile':
                return <ProfilePage navigator={navigator} token={route.token} id={route.id}/>
                break;
            case 'Info':
                return <InfoPage navigator={navigator} token={route.token}/>
                break;
            case 'Login':
                return <LoginPage navigator={navigator} />
                break;
            case 'Register':
                return <RegisterPage navigator={navigator} email={route.email}/>
                break;
            case 'RegisterEmail':
                return <RegisterEmail navigator={navigator} />
                break;
            default:
                return <ErrorPage navigator={navigator} token={route.token}/>
        }
    }
    render() {
        return (
          <Navigator
            initialRoute={{name: 'Login'}}
            renderScene={this.renderScene}
          />
        );
    }
}

AppRegistry.registerComponent('CBURecCenterApp', () => CBURecCenterApp);
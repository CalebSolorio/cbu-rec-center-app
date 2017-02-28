import React, { Component } from 'react';
import { AppRegistry, Navigator } from 'react-native';
import HomePage from './src/pages/HomePage';
import CalendarPage from './src/pages/CalendarPage';
import DiscoverPage from './src/pages/DiscoverPage';
import ErrorPage from './src/pages/ErrorPage';
import EventsPage from './src/pages/EventsPage';
import InfoPage from './src/pages/InfoPage';
import ProfilePage from './src/pages/ProfilePage';
import SettingsPage from './src/pages/SettingsPage';

export default class CBURecCenterApp extends Component {

    constructor(){
        super()
        this.renderScene = this.renderScene.bind(this)
    }

    renderScene(route, navigator){
        switch(route.name){
            case 'Home':
                return <HomePage navigator={navigator} />
                break;
            case 'Calendar':
                return <CalendarPage navigator={navigator} />
                break;
            case 'Events':
                return <EventsPage navigator={navigator} />
                break;
            case 'Discover':
                return <DiscoverPage navigator={navigator} />
                break;
            case 'Profile':
                return <ProfilePage navigator={navigator} />
                break;
            case 'Settings':
                return <SettingsPage navigator={navigator} />
                break;
            case 'Info':
                return <InfoPage navigator={navigator} />
                break;
            default:
                return <ErrorPage navigator={navigator} />
        }
    }
    render() {
        return (
          <Navigator
            initialRoute={{name: 'Home'}}
            renderScene={this.renderScene}
          />
        );
    }
}

AppRegistry.registerComponent('CBURecCenterApp', () => CBURecCenterApp);
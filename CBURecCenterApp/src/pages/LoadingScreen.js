import React, { Component, PropTypes } from 'react';
import { View, ActivityIndicator, AsyncStorage,  Button} from 'react-native';
import styles from '../Utility/styles';


export default class LoadingScreen extends Component {
    constructor(props) {
            super(props);
            this.state = {
                check1: false,
                check2: false
              }
          }

      navigate(name){
          this.props.navigator.push({
              name: name,
              token: this.props.token,
              id: this.props.id
          })
      }

    async componentWillMount(){
        try {
            //get auth Token
            await AsyncStorage.setItem("authToken", this.props.token)
            .then(res => {
                this.setState({check1: true});
            });
            //get ID
            await AsyncStorage.setItem("id", this.props.id)
            .then(res => {
                this.setState({check2: true});
            });

        } catch (error) {
          // Error retrieving data
        }
    }

      render(){
      console.log(this.props.token + "LS token");
      console.log(this.props.id + "LS id");
        if (this.state.check1 === false && this.state.check2 === false) {
          return (
            <ActivityIndicator
              animating={true}
              style={styles.indicator}
              size="large"
            />
          );
        }
        return(
            <View>
                <Button style={styles.loginButton}
                    onPress={() => this.navigate("Home")}
                    title="LETS GET FIT"
                />
            </View>
        )
      }
}
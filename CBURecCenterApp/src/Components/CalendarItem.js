import React, { Component, PropTypes } from 'react';
import { View, Text,  Alert, StyleSheet, TouchableHighlight } from 'react-native';
import moment from 'moment';
import Api from '../Utility/Api';


export default class CalendarItem extends Component {

    constructor(props) {
        super(props);
        this.state = {
              date: null,
              startTime: null,
              endTime: null,
            }
    }

    componentWillMount(){
        this.setState({
            startTime: moment(this.props.startTime).format("hh:mm A"),
            endTime:  moment(this.props.endTime).format("hh:mm A")
        })
    }

    markEvent(){
        Api.markEvent(this.props.id, this.props.token).then((value) => {
            if(value.status === 200){
                Alert.alert(this.props.title + " has been marked")
            }
            else{
                 Alert.alert("failed to mark event", value.message)
            }
          })
    }

    render(){
        return(
            <View style={styles.container}>
                <Text> {this.props.title} </Text>
                <View style={styles.lowRow}>
                    <Text style={styles.time}> {this.state.startTime} - {this.state.endTime} </Text>
                    <TouchableHighlight onPress={() => this.markEvent()} style={styles.mark}>
                        <Text> Mark {this.props.type} </Text>
                    </TouchableHighlight>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        borderWidth: 1
    },
    title: {
        color: 'black',
        textAlign: 'center'
    },
    lowRow: {
        flex:1,
        flexDirection: 'row'
    },
    time: {
        alignSelf: 'flex-start',
    },
    mark: {
        alignSelf: 'flex-end'
    }
});
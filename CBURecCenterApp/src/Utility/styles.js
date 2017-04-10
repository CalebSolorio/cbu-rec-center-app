import { StyleSheet } from 'react-native';

var styles = StyleSheet.create({
    HomeBox: {
        backgroundColor: 'green',
        borderColor: 'black',
        borderWidth: 1,
        flex: 1
    },
    HomeBox_Txt: {
        color: 'white',
        fontSize:36
    },
    Rows: {
        flex: 3,
        flexDirection: 'row'
    },
    textField: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1
    },
    indicator: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: 80
      },
    loginButton: {
        marginVertical: 5,
    },
    HOP: { //hours of operation
        fontWeight: "bold",
        fontSize: 20,
        color: 'black'
    },
    Calendar_Col: {
        flex: 1,
        flexDirection: 'row',
    },
    Calendar_Obj: {
        alignSelf: 'stretch',
        flex: 7,
    },
    Calendar_Nav: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1
    },
    Calendar_Img: {
        width: 50,
        height: 50
    },
    Profile: {
        flexDirection: 'row',
        flex: 1
    },
    Profile_Img: {
        flex:5
    },
    Profile_Info: {
        flex:5,
        flexDirection: 'column',
    }


});

module.exports = styles;
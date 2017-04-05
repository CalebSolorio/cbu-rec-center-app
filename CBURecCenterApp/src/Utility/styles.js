import { StyleSheet } from 'react-native';

var styles = StyleSheet.create({
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
    HOP: {
        fontWeight: "bold",
        fontSize: 20,
        color: 'black'
    },
    Calendar_Col: {
        flex: 1,
        flexDirection: 'row',

    },
    Calendar_Obj: {
        alignItems: 'center',
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
    }


});

module.exports = styles;
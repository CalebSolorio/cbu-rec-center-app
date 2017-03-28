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
      }
});

module.exports = styles;
import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, AsyncStorage } from "react-native";
import * as SQLite from 'expo-sqlite';

const admin_db = SQLite.openDatabase("adminlist_2.db");


export default class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            adminlist: [],
            username: '',
            password: '',
            currentUser: '',
            hidePassword: true
        }

        // read adminlist database
        admin_db.transaction(tx => {
            tx.executeSql('select * from tbl_admin', [], (_, { rows }) => {
                var temp = [];
                for (let i = 0; i < rows.length; ++i) {
                    temp.push(rows.item(i));
                }
                this.setState({
                    adminlist: temp
                });
            });
        });
    }

    // username
    handleUsername = (text) => {
        this.setState({ username: text })
    }
    // password
    handlePassword = (text) => {
        this.setState({ password: text })
    }

    // Login button
    async goLogin() {
        const { adminlist } = this.state;
        console.log(adminlist);

        inputuser = this.state.username;
        inputpass = this.state.password;

        checkuser = (adminlist.map(x => x.username));
        checkemail = (adminlist.map(x => x.email));
        checkpass = (adminlist.map(x => x.password));

        indexuser = adminlist.findIndex(item => (item.email === inputuser) || (item.username === inputuser));
        

        if ((inputuser == checkemail[indexuser] && inputpass == checkpass[indexuser]) || (inputuser == checkuser[indexuser] && inputpass == checkpass[indexuser])) {
            this.props.navigation.navigate('Home');
            console.log(checkemail);
        } else {
            Alert.alert('Error','Username or Password is not correct')
        }

        AsyncStorage.setItem('currentUser', this.state.username);
        console.log('Username is GOOD');

        this.setState({username:''})
        this.setState({password:''})
    }

    render() {
        return (
            <View style={styles.container}>
                <TextInput
                    placeholder="Email or Username"
                    style={{ margin: 10, height: 30, borderColor: 'gray', borderWidth: 1 }}
                    onChangeText={this.handleUsername}
                    value={this.state.username}
                    autoCapitalize="none"
                />
                <TextInput
                    placeholder="Password"
                    secureTextEntry={this.state.hidePassword}
                    style={{ margin: 10, height: 30, borderColor: 'gray', borderWidth: 1 }}
                    onChangeText={this.handlePassword}
                    value={this.state.password}
                    autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => this.goLogin()} style={styles.loginButton}>
                    <Text style={styles.textLogin}>
                        Login
                    </Text>
                </TouchableOpacity>
                <View style={styles.infoView}>
                    <Text style={styles.infoText}> Doesn't have account? </Text>
                    <TouchableOpacity onPress={() => this.props.navigation.navigate('Register')}>
                        <Text style={styles.registerText}> Register </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 30
    },
    loginButton: {
        margin: 10,
        backgroundColor: '#1ABC9C',
    },
    textLogin: {
        textAlign: 'center',
        padding: 10
    },
    infoView: {
        flexDirection: 'row',
        justifyContent: 'center'
    },
    infoText: {
        textAlign: 'center',
        color: 'lightgray'
    },
    registerText: {
        color: 'blue'
    }
});
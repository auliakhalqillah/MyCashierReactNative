import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from "react-native";
import * as SQLite from 'expo-sqlite';

const admin_db = SQLite.openDatabase("adminlist_2.db");

export default class Register extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            adminlist:[],
            email:'',
            username:'',
            password:'',
            repassword:'',
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

    // email
    handleEmail = (text) => {
        this.setState({ email: text })
    }

    // username
    handleUsername = (text) => {
        this.setState({ username: text })
    }
    // password
    handlePassword = (text) => {
        this.setState({ password: text})
    }

    // repassword
    handleRepassword = (text) => {
        this.setState({ repassword: text })
    }

    async componentDidMount(){
        admin_db.transaction(tx => {
            tx.executeSql('create table if not exists tbl_admin (id integer primary key not null, email text, username text, password text, repassword text);');
        });
    }

    register(email, username, password, repassword) {
        var query = 'insert into tbl_admin (id, email, username, password, repassword) VALUES (null,?,?,?,?)';
        var params = [email, username, password, repassword];
        admin_db.transaction((tx) => {
            tx.executeSql(query, params, (tx, results) => {
                Alert.alert("Register Successful","Back to Login Page",[
                    {text: 'OK', onPress:() => this.props.navigation.navigate("Login")}
                ]);
            }, function(tx, err) {
                Alert.alert("Register Failed","Data was not saved");
                console.log(err);
                return;
            });
            tx.executeSql("select * from tbl_admin", [], (_, { rows }) =>
                console.log(JSON.stringify(rows))
            );
        });
    }

    saveAdmin(){
        const { adminlist } = this.state;
        const { email } = this.state;
        const { username } = this.state;
        const { password } = this.state;
        const { repassword } = this.state;

        var num = /[\d+]/g;
        let lowercase = /[a-z]/g;
        let uppercase = /[A-Z]/g;
        var lengthpassword = password.length;
        var min = 8;
        
        checkpassnum = password.match(num);
        checkpasslower = password.match(lowercase);
        checkpassupper = password.match(uppercase);

        let existemail = adminlist.find(v => v.email === email);
        let existuser = adminlist.find(v => v.username === username);

        if (lengthpassword < min){
            Alert.alert("Error","Password is to weak. At least has minimum 8 characters");
        } else if (checkpassnum == null || checkpassnum.length < 3) {
            Alert.alert("Error","Password at least has 3 digits number");
        } else if (checkpassupper == null) {
            Alert.alert("Error","Password at least has 1 uppercase");
        } else if (password != repassword) {
            Alert.alert("Error","Confirmation password is not match");
        } else {
            if (existemail || existuser){
                Alert.alert("Account","The email or username account already exist")
            } else {
                if (email !='' && username !='' && password !='' && repassword !='') {
                    this.register(email, username, password, repassword);
                } else {
                    Alert.alert("Error","You have to input for each required data");
                }
            }
        }
    }

    render(){
        return (
            <View style={styles.container}>
                <TextInput
                    placeholder = "Email"
                    style={styles.textInput}
                    onChangeText={this.handleEmail}
                    value={this.state.email}
                    autoCapitalize="none"
                />
                <TextInput
                    placeholder = "Username"
                    style={styles.textInput}
                    onChangeText={this.handleUsername}
                    value={this.state.username}
                    autoCapitalize="none"
                />
                <TextInput
                    placeholder = "Password"
                    style={styles.textInput}
                    secureTextEntry={this.state.hidePassword}
                    onChangeText={this.handlePassword}
                    value={this.state.password}
                    autoCapitalize="none"
                />
                <TextInput
                    placeholder = "Confirm Password"
                    style={styles.textInput}
                    secureTextEntry={this.state.hidePassword}
                    onChangeText={this.handleRepassword}
                    value={this.state.repassword}
                    autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => this.saveAdmin()} style={styles.registerButton}>
                    <Text style={styles.textRegister}>
                        Regitser
                    </Text>
                </TouchableOpacity>
            </View>
          );
        }
    }

const styles = StyleSheet.create({
    container: {
        flex:1,
        marginTop:30
    },
    textInput: {
        margin: 10,
        height: 30,
        borderColor: 'gray',
        borderWidth: 1
    },
    registerButton: {
        margin:10,
        backgroundColor: '#1ABC9C',
    },
    textRegister:{
        textAlign:'center',
        padding:10
    },
    infoText: {
        textAlign:'center',
        color:'lightgray'
    }
});
import React, { Component } from "react";
import { SafeAreaView, Modal, View, ScrollView, Text, TextInput, TouchableOpacity, StyleSheet, AsyncStorage } from "react-native";
import RNPickerSelect, { defaultStyles } from 'react-native-picker-select';
import { AntDesign } from '@expo/vector-icons';
import data from "./defaultSettings";
import * as SQLite from 'expo-sqlite';

const admin_db = SQLite.openDatabase("adminlist_2.db");

export default class Settingscreen extends Component {
  constructor(props){
    super(props);
    this.state={
      adminlist:[],
      hidePassword: true,
      modalVisible: false,
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
  state = {'currentUser':''}
  state = {currency:''}
  state = {current:''}
  state = {'currentCurrency':''}
  state = {tax:''}
  state = {currenttax:''}
  state = {'currentTax':''}
  state = {username:''}
  state = {password:''}

   

  // username
  handleUsername = (text) => {
    this.setState({ username: text })
  }
  // password
  handlePassword = (text) => {
    this.setState({ password: text})
  }

  toggleModalClose(visible) {
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
        alert('Username or Password is not correct')
    }
  }

  toggleModalOpen(visible) {
    if (this.state.currentCurrency == 'None'){
      alert('Please select type of currency')
    } else {
      this.setState({ modalVisible: visible});
    }
  }

  handleCurrency = (value) => {
    AsyncStorage.setItem('currentCurrency', value);    
    this.setState({'currentCurrency': value});
  }

  handleTax = (value) => {
    AsyncStorage.setItem('currentTax', value);
    this.setState({'currentTax': value});
  }

  componentDidMount = () => {
    AsyncStorage.getItem('currentUser').then(value =>
      this.setState({'currentUser': value})
    )
    AsyncStorage.getItem('currentCurrency').then(value =>
      this.setState({'currentCurrency': value})
    )
    AsyncStorage.getItem('currentTax').then(value =>
      this.setState({'currentTax': value})
    )
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <SafeAreaView style={styles.settingsTextCont}>
          <Text style={styles.textSettings}>Settings</Text>
        </SafeAreaView>
        
        <ScrollView>
          <View style={{flexDirection:'row'}}>
            <View style={{flexDirection:'column'}}>
              <Text style={styles.textCashier}>Cashier Name</Text>
              <Text style={styles.textcurrency}>Current Currency</Text>
              <Text style={styles.textcurrency}>Tax</Text>
            </View>

            <View style={{flexDirection:'column'}}>
              <Text style={styles.textCashier}>: {this.state.currentUser}</Text>
              <Text style={styles.textcurrency}>: {this.state.currentCurrency}</Text>
              <Text style={styles.textcurrency}>: {this.state.currentTax}%</Text>
            </View>
          </View>
          <RNPickerSelect
            placeholder={{
              label:'Select Currency',
              value:'None'
            }}
            onValueChange={this.handleCurrency}
            items={data.currencyOpt}
            style={styles}
            value = {this.state.currency}
          />
          <TextInput
            placeholder='Tax in %'
            value={this.state.tax}
            style={styles.textInputPercent}
            onChangeText={this.handleTax}
          />
        </ScrollView>

        <Modal animationType={"slide"} transparent={false} visible = {this.state.modalVisible}>
          <View style={styles.modalContainer}>
            <TextInput
              placeholder = "Email or Username"
              style={styles.textInputLogin}
              onChangeText={this.handleUsername}
              value={this.state.username}
              autoCapitalize="none"
            />
            <TextInput
              placeholder = "Password"
              secureTextEntry = {this.state.hidePassword}
              style={styles.textInputLogin}
              onChangeText={this.handlePassword}
              value={this.state.password}
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.saveContainer} onPress={() => {this.toggleModalClose(!this.state.modalVisible)}}>
              <Text style={styles.textSave}>Save</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        <View style={{flex:0.2}}>
          <TouchableOpacity style={styles.checkButton} onPress={() => { this.toggleModalOpen(true) }}>
            <AntDesign name="checkcircle" size={40} color="#1ABC9C" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex:1
  },
  settingsTextCont: {
    flex:0.15,
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:'#1ABC9C'
  },
  textSettings: {
    fontSize:20
  },
  inputIOS: {
    fontSize: 16,
    margin:10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    fontSize: 16,
    margin:10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  iconContainer: {
     top: 20,
     right: 30,
   },
   textcurrency:{
     marginLeft:10,
     fontSize:15,
     margin:5
   },
   textCashier:{
     marginLeft:10,
     fontSize:15,
     margin:5
   },
   textInputPercent: {
     margin: 10,
     paddingLeft:18,
     height: 30,
     borderColor: 'gray',
     borderWidth: 1
    },
    modalContainer: {
      flex:1,
      margin: 40,
      flexDirection:'column'
    },
    textInputLogin: {
      margin: 10,
      height: 30,
      borderColor: 'gray',
      borderWidth: 1
    },
    saveContainer: {
      marginLeft:10,
      marginRight:10,
      backgroundColor: '#1ABC9C'
    },
    textSave: {
      textAlign:'center',
      padding:5
    },
    checkButton: {
      justifyContent:'center',
      alignItems:'center'
    }

});

import React, { Component } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";

export default function Homescreen({navigation}) {
  const AlertConfirm = 'Do you want to Logout?';
  const AlertCancel = 'Logout canceled';
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.buttonStyle} onPress={() => navigation.navigate("AddMenu")}>
        <Text style={styles.text}> ADD NEW MENU </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonStyle} onPress={() => navigation.navigate("MenuItem")}>
        <Text style={styles.text}> MENU ITEM </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonStyle} onPress={() => navigation.navigate("OrderList")}>
        <Text style={styles.text}> ORDER LIST </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonStyle} onPress={() => navigation.navigate("Repport")}>
        <Text style={styles.text}> VIEW REPPORT </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonStyle} onPress={() => 
        Alert.alert('Please Confirm',AlertConfirm, [
          {text: 'Cancel', onPress:() => Alert.alert(AlertCancel)},
          {text: 'OK', onPress:() => {
            navigation.navigate("Login")
          }},
        ])
        }>
        <Text style={styles.text}> LOGOUT </Text>
      </TouchableOpacity>
    </View>
  )
}


const styles=StyleSheet.create({
  container:{
    flex: 1,
    flexDirection: 'column'
  },
  buttonStyle:{
    padding: 10,
    margin: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1ABC9C'
  },
  text:{
    color:'#fff',
    fontSize: 15,
    fontWeight: 'bold'
  }
})

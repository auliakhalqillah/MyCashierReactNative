import React, { Component } from "react";
import { View, Text, StyleSheet } from "react-native";


export default class Aboutscreen extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.textApp}> My Cashier v.0.1</Text>
        <Text style={{ textAlign: 'justify', padding:10 }}>
          The simple offline billing app to organize your store or products. Created by Aulia Khalqillah (2020).
          For more information peronal@auliakhalqillah.com
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container:{
    flex:1,
    justifyContent:'center',
    alignItems:'center'
  },
  textApp:{
    fontSize:20,
    fontWeight:'bold',
    padding:5
  }
})



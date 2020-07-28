import React, { Component } from "react";
import { KeyboardAvoidingView, Platform, Dimensions, SafeAreaView, Text, TextInput, Image, TouchableOpacity, ScrollView, AsyncStorage, StyleSheet, Keyboard, Alert } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import * as SQLite from 'expo-sqlite';

const product_base = SQLite.openDatabase("menuitem.db");

export default class Addmenuscreen extends Component {
  state = { selectedImage: '' }
  state = { productId: '' }
  state = { menu: '' }
  state = { category: '' }
  state = { price: '' }
  state = { discount: '' }
  state = { 'currentCurrency': '' }

  handleId = (text) => {
    this.setState({ productId: text })
  }
  handleMenu = (text) => {
    this.setState({ menu: text })
  }
  handleCategory = (text) => {
    this.setState({ category: text })
  }
  handlePrice = (text) => {
    this.setState({ price: text });
  }
  handleDiscount = (text) => {
    this.setState({ discount: text })
  }

  // choose a photo
  openImagePickerAsync = async () => {
    const permissionResult = await ImagePicker.requestCameraRollPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("Permission to access camera roll is required!");
      return;
    }

    pickerResult = await ImagePicker.launchImageLibraryAsync();
    console.log("Image info:", pickerResult);
    if (!pickerResult.cancelled) {
      this.setState({ selectedImage: pickerResult.uri });
      console.log("Image Path:", this.state.selectedImage);
      return;
    }
    return;
  }

  async componentDidMount() {
    product_base.transaction(tx => {
      tx.executeSql('create table if not exists table_product (id integer primary key not null, selectedImage text, productId text, menu text, category text, price text, discount integer);');
    });
    AsyncStorage.getItem('currentCurrency').then(
      (value) => this.setState({ 'currentCurrency': value })
    )
  }

  insert(selectedImage, productId, menu, category, price, discount) {
    var query = 'insert into table_product (id, selectedImage, productId, menu, category, price, discount) VALUES (null,?,?,?,?,?,?)';
    var params = [selectedImage, productId, menu, category, price, discount];
    product_base.transaction((tx) => {
      tx.executeSql(query, params, (tx, results) => {
        Alert.alert("Success", "Data has been saved");
        console.log(productId);
      }, function (tx, err) {
        Alert.alert("Error", "Please select a photo of an item and input required data");
        console.log(err);
        return;
      });
      tx.executeSql("select * from table_product", [], (_, { rows }) =>
        console.log(JSON.stringify(rows))
      );
    });
  }

  saveData() {
    const { selectedImage } = this.state;
    const { productId } = this.state;
    const { menu } = this.state;
    const { category } = this.state;
    const { price } = this.state;
    const { discount } = this.state;

    if (selectedImage != null && productId != '' && menu != '' && category != '' && price != '' && discount != '') {
      this.insert(selectedImage, productId, menu, category, price, discount);
    } else {
      Alert.alert("Error", "Please select a photo of an item and input required data");
    }
  }

  render() {
    const { selectedImage } = this.state;
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS == "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView style={{ flex: 1 }}>
          <SafeAreaView style={styles.subcontainer}>
            {selectedImage && (
              <Image source={{ uri: selectedImage }} style={styles.imageContainer} />
            )}
          </SafeAreaView>

          <TextInput
            placeholder="Product ID"
            style={styles.textInput}
            onChangeText={this.handleId}
            value={this.state.productId}
          />

          <TextInput
            placeholder="Product Name"
            style={styles.textInput}
            onChangeText={this.handleMenu}
            value={this.state.menu}
          />

          <TextInput
            placeholder="Category"
            style={styles.textInput}
            onChangeText={this.handleCategory}
            value={this.state.category}
          />

          <SafeAreaView style={{ flexDirection: 'row' }}>
            <Text style={{ margin: 10, marginTop: 15 }}>{this.state.currentCurrency}</Text>
            <TextInput
              placeholder="Price"
              style={styles.textInputPrice}
              onChangeText={this.handlePrice}
              value={this.state.price}
            />
          </SafeAreaView>

          <SafeAreaView style={{ flexDirection: 'row' }}>
            <Text style={{ margin: 10, marginTop: 15 }}>%  </Text>
            <TextInput
              placeholder="Discount"
              style={styles.textInputPrice}
              onChangeText={this.handleDiscount}
              value={this.state.discount}
            />
          </SafeAreaView>

          <SafeAreaView style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <SafeAreaView style={{ flexDirection: 'row' }}>
              <TouchableOpacity style={styles.styleButton} onPress={this.openImagePickerAsync.bind(this)}>
                <Text style={{ textAlign: 'center', fontSize: 12, color: '#fff', padding: 5 }}>
                  Select a Photo
                  </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.styleButton} onPress={() => this.saveData()}>
                <Text style={{ textAlign: 'center', fontSize: 12, color: '#fff', padding: 5 }}>
                  Save Data
                </Text>
              </TouchableOpacity>
            </SafeAreaView>
          </SafeAreaView>

        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  subcontainer: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  imageContainer: {
    width: 300,
    height: 300,
    resizeMode: 'contain'
  },
  textInput: {
    margin: 10,
    height: 30,
    borderColor: 'gray',
    borderWidth: 1
  },
  textInputPrice: {
    margin: 10,
    paddingLeft: 10,
    height: 30,
    width: 315,
    borderColor: 'gray',
    borderWidth: 1,
    width: (Dimensions.get('window').width - 58)
  },
  currencyStyle: {
    flex: 0.2,
    margin: 10,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'yellow'
  },
  priceInput: {
    flex: 0.2,
    flexDirection: 'column'
  },
  styleButton: {
    backgroundColor: '#17A589',
    margin: 10,
    padding: 5
  },

})

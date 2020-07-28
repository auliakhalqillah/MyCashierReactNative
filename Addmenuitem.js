import React from "react";
import { SafeAreaView, FlatList, Image, View, Text, TextInput, StyleSheet, Button, TouchableOpacity, ScrollView, Alert, AsyncStorage } from "react-native";
import { Entypo } from "@expo/vector-icons";
import { EvilIcons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { SearchBar } from 'react-native-elements';
import * as SQLite from 'expo-sqlite';
import Counter from "react-native-counters";
import * as FileSystem from 'expo-file-system';

// Alert
const AlertConfirm = 'Do you want to delete the item?';
const AlertCancel = 'Item has been canceled to delete';
const DeleteConfirm = 'Item has been deleted';

// Read menu database
const product_base = SQLite.openDatabase("menuitem.db");

// Collect database
const collectbase = SQLite.openDatabase("collects.db");

// counter icon
const minusIcon = (isDisabled) => {
  return <Entypo name='minus' size={20} color={'white'} />
};
const plusIcon = (isPlusDisabled) => {
  return <Entypo name='plus' size={20} color={'white'} />
};


// main
export default class Addmenuitem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      datatodo: [],
      search:'',
      number:0,
      ordernumber:'',
      menu:'',
      category:'',
      price:'',
      discount:'',
      productId:'',
      'currentCurrency':'',
      newitem:[]
    };

    // read menu database
    product_base.transaction(tx => {
      tx.executeSql('select * from table_product', [], (_, { rows }) => {
        var temp = [];
        for (let i = 0; i < rows.length; ++i) {
          temp.push(rows.item(i));
        }
        this.setState({
          datatodo: temp
        });
      });
    });
  }

  // tablle number
  handleTableNumber = (text) => {
    this.setState({ ordernumber: text })
  }

  // counter number
  async handleChange (num){
    await this.setState({number:num});
  }

  // Separator view
  SeparatorView = () => {
    return (
      <View style={{ height: 1, width: '100%', backgroundColor: '#7DCEA0' }} />
    );
  }
  // Seacrh bar
  async componentDidMount() {
    const { search } = this.state;
    await this.fetchData(search);
  }

  async handleSearch(val){
    this.setState({search: val});
    await this.fetchData(val);
  }

  fetchData(search) {
    var query = "select * from table_product where Menu like '%" + search + "%'";
    var param = [];
    product_base.transaction((tx) => {
      tx.executeSql(query,param, (tx, results) => {
        // console.log("RES:",results);
        if (results.rows._array.length >= 0) {
          this.setState({
            datatodo: results.rows._array
          });
        }
      }, function (tx, err) {
        console.log(err);
        Alert.alert('Database','Please input your item to database');
      });
    });
  }

  // delete button
  deleteMenu(id) {
    var query = 'delete from table_product where id = ?';
    var param = [id]
    product_base.transaction((tx) => {
      tx.executeSql(query, param, (tx, results) => {
        alert(DeleteConfirm);
      }, function(tx, err) {
        alert("1. Not Deleted");
        console.log(err);
        return;
      });
    })
  }

  async deleteData(id) {
    const { search } = this.state;
    this.deleteMenu(id);
    this.fetchData(search);
  }

  // Build collect database
  async componentDidMount(){
    collectbase.transaction(tx => {
      tx.executeSql('create table if not exists tablecollectorders (id integer primary key not null, ordernumber text, productId text, menu text, category text, price real, number integer, discount integer);');
    });

    AsyncStorage.getItem('currentCurrency').then(
      (value) => this.setState({'currentCurrency':value})
    )
  }

  insertcollect(ordernumber, productId, menu, category, price, number, discount) {
    var query = 'insert into tablecollectorders (id, ordernumber, productId, menu, category, price, number, discount) values (null,?,?,?,?,?,?,?)';
    var params = [ordernumber, productId, menu, category, price, number, discount];
    collectbase.transaction((tx) => {
      tx.executeSql(query, params, (tx, results) => {
        console.log(results);
        Alert.alert("Success","Order has been collected");
      }, function(tx, err) {
        alert("###. Not Saved");
        console.log(err);
        return;
      });
      tx.executeSql("select * from tablecollectorders", [], (_, { rows }) =>
        console.log(JSON.stringify(rows))
      );
    });
  }

  // Collect menu
  collectMenu(id) {
    const { number } = this.state;
    const { ordernumber } = this.state;

    var query = 'select * from table_product where id = ?';
    var param = [id]
    product_base.transaction((tx) => {
      tx.executeSql(query, param, (tx, results) => {
        let productId = results.rows._array.map(x => x.productId).toString();
        let menu = results.rows._array.map(x => x.menu).toString();
        let category = results.rows._array.map(x => x.category).toString();
        let price = Number(results.rows._array.map(x => x.price));
        let discount = Number(results.rows._array.map(x => x.discount));
        if (number != 0 && ordernumber != '') {
          this.insertcollect(ordernumber, productId, menu, category, price, number,discount);
        } else {
          Alert.alert("Failed to Collect","Please input table number")
        }
      }, function(tx, err) {
        alert("1. Not Collected");
        console.log(err);
        return;
      });
    })
  }

  async collectData(id) {
    const { search } = this.state;
    this.collectMenu(id);
    this.fetchData(search);
  }

  // update order
  updateOrderMenu(id) {
    const { number } = this.state;
    var query = 'update tablecollectorders set number=? where id=?';
    var param = [number, id]
    collectbase.transaction((tx) => {
      tx.executeSql(query, param, (tx, results) => {
        let productId = results.rows._array.map(x => x.productId);
        let menu = results.rows._array.map(x => x.menu);
        let category = results.rows._array.map(x => x.category);
        let price = results.rows._array.map(x => x.price);
        let discount = results.rows._array.map(x => x.discount);
        console.log('Menu',menu);
        console.log('Results',results.rowsAffected);
        if (results.rowsAffected > 0) {
          Alert.alert('Success','Order has been updated')
        }
      }, function(tx, err) {
        Alert.alert("Failed","Not Updated");
        console.log(err);
        return;
      });
    })
  }

  async updateOrder(id) {
    const { search } = this.state;
    this.updateOrderMenu(id);
    this.fetchData(search);
  }

  render() {
    // console.log(FileSystem.documentDirectory)
    return (
      <SafeAreaView style={{flex:1}}>
        <SearchBar
          platform = {"ios"}
          placeholder = "Search by name"
          onChangeText = {(val) => this.handleSearch(val)} value = {this.state.search}
        />
        <View>
          <TextInput
            placeholder = "Order Number"
            style={styles.textInput}
            onChangeText={this.handleTableNumber}
            value={this.state.ordernumber}
          />
        </View>
        <FlatList
          data = {this.state.datatodo}
          ItemSeparatorComponent={this.SeparatorView}
          keyExtractor={(item,index) => index.toString()}
          renderItem={({ item }) => (
            <View key={item.id} style={styles.menuContainer}>
              <View style={styles.imageContainer}>
                <Image source={{uri:item.selectedImage}} style={styles.imageStyle}/>
              </View>
              <View style={styles.menuTextConatiner}>
                <Text style={styles.textProductId}> {item.productId} </Text>
                <Text style={styles.textMenu}> {item.menu} </Text>
                <Text> {item.category} </Text>
                <Text> {this.state.currentCurrency+item.price} </Text>
                <Text> {item.discount}% </Text>
              </View>
              <View style={styles.buttonContainer}>
                <Counter
                  start={0}
                  max={20}
                  minusIcon={minusIcon}
                  plusIcon={plusIcon}
                  buttonStyle={{
                    borderColor:'white',
                    backgroundColor:'#17A589',
                  }}
                  countTextStyle={{
                    color:'#17A589'
                  }}
                  onChange={e => this.handleChange(e)}
                />
                <View style={styles.subButtonContainer}>
                  <View style={styles.subsubButtonCont}>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() =>
                        Alert.alert('Please Confirm',AlertConfirm, [
                          {text: 'Cancel', onPress:() => Alert.alert(AlertCancel)},
                          {text: 'OK', onPress:() => this.deleteData(item.id)},
                        ])
                      }
                    >
                      <EvilIcons name="trash" size={30} color="red" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.iconButton} onPress={() => this.collectData(item.id)}>
                      <EvilIcons name="check" size={30} color="blue" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.iconButton} onPress={() => this.updateOrder(item.id)}>
                      <MaterialIcons name="update" size={30} color="black" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          )}
        />
      </SafeAreaView>
    );
  }
}

const styles=StyleSheet.create({
  container:{
    flexDirection: 'column',
  },
  menuButton:{
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 5,
    marginBottom: 5,
    marginRight: 5
  },
  itemMenu: {
    flexDirection: 'column',
    backgroundColor: '#EAECEE'
  },
  collectButton: {
    backgroundColor: '#2E86C1',
    borderRadius: 30,
    height: 40
  },
  textInput: { 
    margin: 10, 
    height: 30, 
    borderColor: 'gray', 
    borderWidth: 1 
  },
  textDelete: {
    fontSize: 15,
    color: "#17A589"
  },
  textCollect: {
    fontSize: 15,
    color: '#17A589',
    textAlign: 'center',
    padding: 10
  },
  menuContainer: {
    flexDirection: 'row',
    backgroundColor: 'white'
  },
  imageContainer: {
    flex:1,
    justifyContent:'center', 
    alignItems:'center'
  },
  imageStyle: {
    width: 90,
    height: 90,
    resizeMode: 'contain'
  },
  menuTextConatiner: {
    flexDirection: 'column',
    flex:1,
    marginTop: 5
  },
  textProductId: {
    fontSize: 12, 
    color: '#ccc'
  },
  textMenu: {
    fontSize: 13, 
    fontWeight: 'bold'
  },
  buttonContainer: {
    paddingTop: 10, 
    flexDirection:'column', 
    flex:1.5, alignItems: 'center', 
    justifyContent: 'center'
  },
  subButtonContainer: {
    flexDirection:'column'
  },
  subsubButtonCont: {
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center',
    margin:10
  },
  iconButton: {
    padding:5
  }
});

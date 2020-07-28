import React, { Component } from "react";
import { SafeAreaView, View, Text, FlatList, Alert, StyleSheet } from "react-native";
import * as SQLite from 'expo-sqlite';
import { TouchableOpacity } from "react-native-gesture-handler";
import { EvilIcons } from '@expo/vector-icons';
import { SearchBar } from 'react-native-elements';

// read database of collect
const collectbase = SQLite.openDatabase("collects.db");

export default class Orderscreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      orderlist: [],
      search: '',
      number: 0,
      ordernumber: '',
      menu: '',
      category: '',
      price: '',
      discount: '',
      productId: '',
      store: [],
    };

    // read database of collect
    collectbase.transaction(tx => {
      tx.executeSql('select * from tablecollectorders', [], (_, { rows }) => {
        var temp = [];
        for (let i = 0; i < rows.length; ++i) {
          temp.push(rows.item(i));
        }
        this.setState({
          orderlist: temp
        });
      });
    });
  }

  // Separator view
  SeparatorView = () => {
    return (
      <View style={{ height: 1, width: '100%', backgroundColor: '#7DCEA0' }} />
    );
  }

  async handleSearch(val) {
    this.setState({ search: val });
    await this.fetchData(val);
  }

  fetchData(search) {
    var query = "select * from tablecollectorders where ordernumber like '%" + search + "%'";
    var param = [];
    collectbase.transaction((tx) => {
      tx.executeSql(query, param, (tx, results) => {
        // console.log("RES:",results.rows._array.length);
        if (results.rows._array.length >= 0) {
          this.setState({
            orderlist: results.rows._array
          });
        }
      }, function (tx, err) {
        console.log(err);
        Alert.alert('Order List', 'Empty');
      });
    });
  }

  // delete button
  deleteTable(ordernumber) {
    var query = 'delete from tablecollectorders where ordernumber = ?';
    var param = [ordernumber]
    collectbase.transaction((tx) => {
      tx.executeSql(query, param, (tx, results) => {
        // console.log('RESS', results)
        alert("Order has been deleted");
      }, function (tx, err) {
        alert("Order has not been deleted");
        console.log(err);
        return;
      });
    })
  }

  async deleteOrder(ordernumber) {
    const { search } = this.state;
    this.deleteTable(ordernumber);
    this.fetchData(search);
  }

  render() {
    const { orderlist } = this.state;

    // another way group data
    var groupData = orderlist.reduce((acc, next) => {
      var nextProduct = {
        productId: next.productId,
        menu: next.menu,
        category: next.category,
        price: next.price,
        number: next.number,
        discount: next.discount
      }
      var exist = acc.find(v => v.ordernumber === next.ordernumber);
      if (exist) {
        exist.store.push(nextProduct);
      } else {
        acc.push({
          ordernumber: next.ordernumber,
          store: [nextProduct]
        })
      }
      return acc
    }, [])

    // console.log("group Data\n:", groupData,"END");

    return (
      <SafeAreaView style={styles.container}>
        <SearchBar
          platform={"ios"}
          placeholder="Search by Order List"
          onChangeText={(val) => this.handleSearch(val)} value={this.state.search}
        />
        <FlatList
          data={groupData}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View key={item.id} style={styles.itemList}>
              <View style={styles.itemTextCont}>
                <TouchableOpacity style={styles.textButton} onPress={() => this.props.navigation.navigate('OrderView', { item })}>
                  <Text style={styles.textStyle}> Order List: {item.ordernumber} </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.iconContainer}>
                <TouchableOpacity onPress={() => this.deleteOrder(item.ordernumber)}>
                  <EvilIcons name="trash" size={40} color="red" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </SafeAreaView>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  itemList: {
    flexDirection: 'row',
    padding: 5,
    marginLeft: 5
  },
  itemTextCont: {
    flex: 2
  },
  textButton: {
    backgroundColor: '#1ABC9C'
  },
  textStyle: {
    padding: 10,
    fontSize: 15
  },
  iconContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  }
})

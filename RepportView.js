import React, { Component } from 'react';
import { View, SafeAreaView, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions, AsyncStorage } from 'react-native';
import * as SQLite from "expo-sqlite";
import * as FileSystem from 'expo-file-system';
import Converter from 'json-2-csv';
import * as Sharing from 'expo-sharing';

// open paid database
const paid_db = SQLite.openDatabase("paid_data.db");


export default class Reportview extends Component {
    constructor(props) {
        super(props);
        this.state = {
            Repport:[],
            itemlist:[],
            'currentCurrency': '',
            dirfile:''
        }

        // read paid dabatase
        paid_db.transaction(tx => {
            tx.executeSql('select * from table_paid', [], (_, { rows }) => {
                var temp = [];
                for (let i = 0; i < rows.length; ++i) {
                    temp.push(rows.item(i));
                }
                this.setState({
                    Repport: temp
                });
            });
        });
    }

    handletoCSV(){
        const {Repport} = this.state;

        Converter.json2csv(Repport, async (err, csvfile) => {
            if (err) {
                throw err;
            }
            // console.log(FileSystem.documentDirectory);
            let fileUri = FileSystem.documentDirectory + "Repport.csv";
            console.log(fileUri)
            FileSystem.writeAsStringAsync(fileUri, csvfile, { encoding: FileSystem.EncodingType.UTF8 })
            console.log(csvfile)

            if (!(await Sharing.isAvailableAsync())) {
                alert(`Uh oh, sharing isn't available on your platform`);
                return;
            }

            Sharing.shareAsync(fileUri);
        })
    }

    // delete button
    deleteTable() {
        var query = 'delete from table_paid';
        var param = []
        paid_db.transaction((tx) => {
            tx.executeSql(query, param, (tx, results) => {
                // console.log('RESS', results)
                alert("Repport has been deleted");
            }, function (tx, err) {
                alert("Repport is not deleted");
                console.log(err);
                return;
            });
        })
    }

    handletoDelete(){
        Alert.alert('Please Confirm', "Do you wan to delete the Repport?", [
            { text: 'Cancel', onPress: () => { } },
            {
                text: 'OK', onPress: () => {
                    this.deleteTable()
                    this.props.navigation.navigate('Home')
                }
            },
        ])
    }

    async componentDidMount() {
        AsyncStorage.getItem('currentCurrency').then(
          (value) => this.setState({ 'currentCurrency': value })
        )
      }

    render() {
        const {Repport} = this.state;
        // Group data by transaction Id
        var groupData = Repport.reduce((acc, next) => {
            var nextProduct = {
                menuname:next.menuname,
                menuprice: next.menuprice,
                qty:next.qty,
                totalpriceitem:next.totalpriceitem,
                grandtotal:next.grandtotal,
                discountlist:next.discountlist
            }
            var exist = acc.find(v => v.transactionid === next.transactionid);
            if (exist) {
                exist.itemlist.push(nextProduct);
            } else {
                acc.push({
                    transactionid: next.transactionid,
                    itemlist: [nextProduct]
                })
            }
            return acc
        }, [])

        const grandtotaltoday = groupData.map(
            value => value.itemlist.map(
                item => item.grandtotal).reduce(
                    (res,num) => res+num)/value.itemlist.length).reduce(
                        (val,total) => val+total,0)

        return (
            <SafeAreaView style={styles.container}>
                <ScrollView style={{ flex: 1 }}>
                    {
                        groupData.map((value,index) => (
                            <View key={index}>
                                <View style={{margin:5, flexDirection:'row', justifyContent:'space-between'}}>
                                    <View style={{flexDirection:'column'}}>
                                        <Text style={{ fontWeight: 'bold' }}>Transaction Id :</Text>
                                        <Text style={{ fontWeight: 'bold' }}>Grand Total :</Text>
                                    </View>

                                    <View style={{flexDirection:'column'}}>
                                        <Text style={{ fontWeight: 'bold' }}>{value.transactionid}</Text>
                                        <Text style={{ fontWeight: 'bold' }}>{this.state.currentCurrency}{value.itemlist.map(item => item.grandtotal).reduce((res, num) => res + num) / value.itemlist.length}</Text>
                                    </View>
                                </View>
                                
                                <View style={{padding:5, flexDirection:'row', backgroundColor:'#EAEDED'}}>
                                    <View style={{flex:0.3}}>
                                        <Text style={{fontWeight:'bold'}}>Item</Text>
                                        <Text>{value.itemlist.map(item => item.menuname+"\n")}</Text>
                                    </View>

                                    <View style={{flex:0.15}}>
                                        <Text style={{ fontWeight: 'bold' }}>Qty</Text>
                                        <Text>{value.itemlist.map(item => "x"+item.qty+"\n")}</Text>
                                    </View>

                                    <View style={{flex:0.2}}>
                                        <Text style={{ fontWeight: 'bold' }}>Price</Text>
                                        <Text>{value.itemlist.map(item => item.menuprice+"\n")}</Text>
                                    </View>

                                    <View style={{flex:0.2}}>
                                        <Text style={{ fontWeight: 'bold' }}>Total</Text>
                                        <Text>{value.itemlist.map(item => item.totalpriceitem+"\n")}</Text>
                                    </View>
                                    <View style={{flex:0.15}}>
                                        <Text style={{ fontWeight: 'bold' }}>Disc(%)</Text>
                                        <Text>{value.itemlist.map(item => item.discountlist+"\n")}</Text>
                                    </View>
                                </View>
                            </View>
                        ))
                    }
                </ScrollView>

                {/* Income */}
                <View syle={{flex:0.3}}>
                    <Text style={{fontSize:10, padding:2, color:'gray'}}>Click "Save to.." for more information about your Repport</Text>
                    <Text style={{fontWeight:'bold', fontSize:20, padding:5}}>Income Today: {this.state.currentCurrency}{grandtotaltoday} </Text>
                </View>

                {/* Button */}
                <View style={{flex:0.1, flexDirection:'row'}}>
                    <TouchableOpacity style={{ justifyContent: 'center', alignItems: 'center', padding: 10, backgroundColor: '#0E6655', width: (Dimensions.get('window').width)/2 }} onPress={() => this.handletoCSV()}>
                        <Text style={{ color: 'white', fontSize: 20 }}>Save to...</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={{ justifyContent: 'center', alignItems: 'center', padding: 10, backgroundColor: '#922B21', width: (Dimensions.get('window').width)/2 }} onPress={() => this.handletoDelete()}>
                        <Text style={{ color: 'white', fontSize: 20 }}>Delete</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection:'column',
        backgroundColor:'lightgray'
    }
})
import React, {Component} from 'react';
import { SafeAreaView, Modal, View, Text, TextInput, RefreshControlBase, ScrollView, TouchableOpacity, AsyncStorage, Alert, StyleSheet } from 'react-native';
import { CheckBox } from 'react-native-elements';
import { AntDesign } from '@expo/vector-icons';
import * as SQLite from 'expo-sqlite';

const paid_db = SQLite.openDatabase("paid_data.db");

export default class Payment extends Component {
  state = {
    checkcash:false,
    checkcard:false,
    transmode:'',
    cashamount:'',
    cardnumber:'',
    monthyear:'',
    cvcnumber:'',
    apprcode:'',
    totalallprice:'',
    disableinput: false,
    disableinputcash: false,
    modalVisible: false,
    backgroundInputCash:'lightgray',
    backgroundInputCard:'lightgray'
  };

  handleCheckCash = () => {
    if (!this.state.checkcash){
      this.setState({checkcash: true})
      this.setState({checkcard: false})  
      this.setState({disableinputcash: true})
      this.setState({cardnumber:''})
      this.setState({monthyear:''})
      this.setState({cvcnumber:''})
      this.setState({apprcode:''})
      this.setState({backgroundInputCash: '#ABEBC6'})
      this.setState({backgroundInputCard: 'lightgray'})
      this.setState({transmode:'Cash'})  
    }
  }

  handleCheckCard = () => {
    if (!this.state.checkcard){
     this.setState({checkcash: false})
     this.setState({checkcard: true})
     this.setState({disableinput: true})
     this.setState({disableinputcash: true})
     this.setState({cashamount:''})
     this.setState({backgroundInputCash: '#ABEBC6'})
     this.setState({backgroundInputCard: '#ABEBC6'})
     this.setState({transmode:'Card'})    
    }
 }

  handleCashAmount = (value) => {
    this.setState({ cashamount: value })
  }

  handleCardNumber = (value) => {
    if (value.length > 16) {
      Alert.alert('Error', 'Card Number is to long')
    } else {
      this.setState({ cardnumber: value })
    }
  }

  handleCardMY = (value) => {
    this.setState({ monthyear: value })
  }

  handleCardCvc = (value) => {
    this.setState({ cvcnumber: value })
  }

  handleCardAppr = (value) => {
    this.setState({ apprcode: value })
  }

  handlePay(visible) {
    const cashiername = this.state.currentUser;
    const transactionId = (this.props.route.params.saveAll.transactionId);
    const transactionmode = this.state.transmode;
    const menuname = (this.props.route.params.saveAll.menuname);
    const pricemenu = (this.props.route.params.saveAll.pricemenu);
    const qty = (this.props.route.params.saveAll.qty);
    const totalprice = (this.props.route.params.saveAll.totalprice);
    const cashamount = this.state.cashamount;
    const cardnumber = this.state.cardnumber;
    const monthyear = this.state.monthyear;
    const cvcnumber = this.state.cvcnumber;
    const apprcode = this.state.apprcode;
    const totalallprice = (this.props.route.params.saveAll.sum);
    const discountlist = (this.props.route.params.saveAll.discountlist);
    const discount = (this.props.route.params.saveAll.totalDiscount);
    const totaldiscount = ((discount/100)*totalallprice).toFixed(0);  
    const taxamount = ((this.state.currentTax)/100)*totalallprice
    const grandtotal = (totalallprice-totaldiscount)+taxamount
    const cashback = this.state.cashamount-grandtotal
    const currency = this.state.currentCurrency;

    if (this.state.transmode == '') {
      Alert.alert('Error', 'Please select the transaction mode')
      return this.props.navigation.navigate('Payment')
    }

    if (this.state.transmode == 'Cash') {
      if (this.state.cashamount < grandtotal) {
        Alert.alert('Error', 'Your cash amount is less')
      } else {
        this.insert(cashiername, transactionId, transactionmode, menuname, pricemenu, qty, totalprice, discountlist, cashamount, cardnumber, cvcnumber, monthyear, apprcode, totalallprice, discount, totaldiscount, taxamount, grandtotal, cashback, currency);
        this.setState({ modalVisible: visible })
      }
    }

    if (this.state.transmode == 'Card') {
      if (this.state.monthyear == '' || this.state.cvcnumber == '' || this.state.apprcode == '') {
        Alert.alert('Error', 'Please check the Month/Year or CVC or APPR code input')
      } else {
        this.insert(cashiername, transactionId, transactionmode, menuname, pricemenu, qty, totalprice, discountlist, cashamount, cardnumber, cvcnumber, monthyear, apprcode, totalallprice, discount, totaldiscount, taxamount, grandtotal, cashback, currency);
        this.setState({ modalVisible: visible })
      }
    }
  }

  //  Close modal payment
  handlePayed(visible){
    this.props.navigation.navigate('Home');
  }

  async componentDidMount(){
    AsyncStorage.getItem('currentCurrency').then(
      (value) => this.setState({'currentCurrency':value})
    )
    AsyncStorage.getItem('currentUser').then(
      (value) => this.setState({'currentUser':value})
    )
    AsyncStorage.getItem('totalallprice').then(
      (value) => this.setState({'totalallprice':value})
    )
    AsyncStorage.getItem('currentTax').then(
      (value) => this.setState({'currentTax': value})
    )

    // create sql database
    paid_db.transaction(tx => {
      tx.executeSql('create table if not exists table_paid (id integer primary key not null, cashiername text, transactionid text, transactionmode text, menuname text, menuprice real, qty integer, totalpriceitem real, discountlist integer, cashamount real, cardnumber integer, monthyear text, cvcnumber integer, apprcode integer, totalall real, discount integer, totaldiscount real, taxamount real, grandtotal real, cashback real, currency text);');
    });
  }

  insert(cashiername, transactionId, transactionmode, menuname, menuprice, qty, totalpriceitem, discountlist, cashamount, cardnumber, cvcnumber, monthyear, apprcode, totalall, discount, totaldiscount, taxamount, grandtotal, cashback, currency) {
    var query = 'insert into table_paid (id, cashiername, transactionId, transactionmode, menuname, menuprice, qty, totalpriceitem, discountlist, cashamount, cardnumber, monthyear, cvcnumber, apprcode, totalall, discount, totaldiscount, taxamount, grandtotal, cashback, currency) VALUES (null,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
    var params = [cashiername, transactionId, transactionmode, menuname, menuprice, qty, totalpriceitem, discountlist, cashamount, cardnumber, monthyear, cvcnumber, apprcode, totalall, discount, totaldiscount, taxamount, grandtotal, cashback, currency];
    paid_db.transaction((tx) => {
      tx.executeSql(query, params, (tx, results) => {
      }, function(tx, err) {
        alert("Payment is not saved!!");
        console.log(err);
        return;
      });
      tx.executeSql("select * from table_paid", [], (_, { rows }) =>
        console.log(JSON.stringify(rows))
      );
    });
  }
  
  render() {
    const transactionId = (this.props.route.params.saveAll.transactionId);
    const menuname = (this.props.route.params.saveAll.menuname);
    const pricemenu = (this.props.route.params.saveAll.pricemenu);
    const qty = (this.props.route.params.saveAll.qty);
    const totalprice = (this.props.route.params.saveAll.totalprice);
    const totalallprice = (this.props.route.params.saveAll.sum);
    const discountlist = (this.props.route.params.saveAll.discountlist);
    const discount = (this.props.route.params.saveAll.totalDiscount);
    const totaldiscount = ((discount/100)*totalallprice).toFixed(0);  
    const taxamount = ((this.state.currentTax)/100)*totalallprice
    const grandtotal = (totalallprice-totaldiscount)+taxamount
    const cashback = this.state.cashamount-grandtotal
    const { backgroundInputCash } = this.state;
    const { backgroundInputCard } = this.state;

    console.log(this.props.route.params.saveAll.menuname)
    
    return (
      <SafeAreaView style={styles.container}>
        <CheckBox
            title='Cash'
            checked={this.state.checkcash}
            onPress={() => this.handleCheckCash()}
            checkedIcon={<AntDesign name="checkcircle" size={24} color="#1ABC9C" />}
            uncheckedIcon={<AntDesign name="checkcircleo" size={24} color="#1ABC9C" />}
        />
        <CheckBox
            title='Credit Card/Debit Card'
            checked={this.state.checkcard}
            onPress={() => this.handleCheckCard()}
            checkedIcon={<AntDesign name="checkcircle" size={24} color="#1ABC9C" />}
            uncheckedIcon={<AntDesign name="checkcircleo" size={24} color="#1ABC9C" />}
        />
        <TextInput
          placeholder='Cash Amount'
          value={this.state.cashamount}
          style={{margin: 10, height: 30, borderColor: 'gray', borderWidth: 1, backgroundColor:backgroundInputCash}}
          onChangeText={this.handleCashAmount}
          editable={this.state.disableinputcash}
        />
        <TextInput
          placeholder='Card Number'
          value={this.state.cardnumber}
          style={{margin: 10, height: 30, borderColor: 'gray', borderWidth: 1, backgroundColor:backgroundInputCard}}
          onChangeText={this.handleCardNumber}
          editable={this.state.disableinput}
        />
        <SafeAreaView style={{flexDirection:'column'}}>
          <SafeAreaView style={{flexDirection:'row'}}>
          <TextInput
            placeholder='Month/Year'
            value={this.state.monthyear}
            style={{margin: 10, width:100, height: 30, borderColor: 'gray', borderWidth: 1, backgroundColor:backgroundInputCard}}
            onChangeText={this.handleCardMY}
            editable={this.state.disableinput}
          />
          <TextInput
            placeholder='CVC'
            value={this.state.cvcnumber}
            style={{margin: 10, width:60, height: 30, borderColor: 'gray', borderWidth: 1, backgroundColor:backgroundInputCard}}
            onChangeText={this.handleCardCvc}
            editable={this.state.disableinput}
          />
          <TextInput
            placeholder='APPR CODE'
            value={this.state.apprcode}
            style={{margin: 10, width:100, height: 30, borderColor: 'gray', borderWidth: 1, backgroundColor:backgroundInputCard}}
            onChangeText={this.handleCardAppr}
            editable={this.state.disableinput}
          />
          </SafeAreaView>
        </SafeAreaView>

        <View style={styles.itemList}>
          <ScrollView style={styles.itemScroll}>
            <Text>Cashier Name{'\t\t'}: {(`${this.state.currentUser}`)}</Text>
            <Text>Transaction Mode{'\t'}: {this.state.transmode}</Text>
            <Text>Transaction Id{'\t\t'}: {transactionId}</Text>

            <SafeAreaView style={styles.menuItem}>
              <Text style={styles.marginItem}>{menuname}</Text>
              <Text style={styles.marginItem}>{pricemenu}</Text>
              <Text style={styles.marginItem}>{qty}</Text>
              <Text style={styles.marginItem}>{totalprice}</Text>
              <Text style={styles.marginItem}>{discountlist}</Text>
            </SafeAreaView> 

            <Text style={styles.boldText}>Cash Amount{'\t\t'}: {(`${this.state.currentCurrency}`)}{this.state.cashamount}</Text>
            <Text style={styles.boldText}>Total{'\t\t\t\t'}: {(`${this.state.currentCurrency}`) + totalallprice}</Text>
            <Text style={styles.boldText}>Discount {discount}%{'\t\t'}: {(`${this.state.currentCurrency}`) + totaldiscount}</Text>
            <Text style={styles.boldText}>Tax {(`${this.state.currentTax}`)}%{'\t\t\t'}: {(`${this.state.currentCurrency}`) + taxamount}</Text>
            <Text style={styles.boldText}>Grand Total{'\t\t'}: {(`${this.state.currentCurrency}`)}{grandtotal} </Text>
            <Text style={styles.boldText}>Cash Back{'\t\t\t'}: {(`${this.state.currentCurrency}`) + cashback}</Text>
          </ScrollView>
        </View>

        <Modal animationType={"slide"} transparent={false} visible = {this.state.modalVisible}>
          <View style={styles.modalCont}>
            <Text style={{fontWeight:'bold', fontSize:20}}>Transaction is Complete</Text>
            <Text style={{fontWeight:'400', fontSize:15}}>Transaction Mode: {this.state.transmode}</Text>
            <Text style={{fontWeight:'bold', fontSize:20}}>Cash Back: {(`${this.state.currentCurrency}`) + cashback}</Text>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => this.handlePayed(false)}>
              <Text style={{padding:5}}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </Modal>
        
        <SafeAreaView style={styles.payButtoncont}>
          <TouchableOpacity style={styles.payButton} onPress={() => this.handlePay(true)}>
            <Text style={{color:'white', fontSize:20}}>Pay</Text>
          </TouchableOpacity>
        </SafeAreaView>

      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex:1, 
    flexDirection:'column'
  },
  itemList: {
    padding: 20,
    flex: 1,
    backgroundColor:'lightgray'
  },
  itemScroll: {
    flex:1,
    flexDirection:'column'
  },
  menuItem: {
    flexDirection: 'row',
    margin:10
  },
  boldText: {
    fontWeight:'bold',
    fontSize:15
  },
  modalCont: {
    flex:1,
    flexDirection:'column',
    margin:30,
    justifyContent:'center',
    alignItems:'center'
  },
  modalCloseButton: {
    backgroundColor:'#1ABC9C',
    marginTop:10, 
    borderRadius:20
  },
  payButtoncont: {
    flex:0.2,
    flexDirection:'column'
  },
  payButton: {
    padding:13,
    alignItems:'center',
    justifyContent:'center',
    backgroundColor:'#0E6655'
  },
  marginItem:{
    margin: 5
  }
})
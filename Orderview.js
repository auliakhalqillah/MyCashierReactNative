import * as  React from "react";
import { SafeAreaView, Dimensions, View, Text, TextInput, TouchableOpacity, StyleSheet, AsyncStorage, ScrollView, Modal, Alert } from "react-native";
import { CheckBox } from 'react-native-elements';
import { AntDesign } from '@expo/vector-icons';
import * as SQLite from 'expo-sqlite';

const paid_db = SQLite.openDatabase("paid_data.db");

// read database of collect
const collectbase = SQLite.openDatabase("collects.db");

export default class Orderviewscreen extends React.Component {
  state = {
    checkcash: false,
    checkcard: false,
    transmode: '',
    cashamount: '',
    cardnumber: '',
    monthyear: '',
    cvcnumber: '',
    apprcode: '',
    totalallprice: '',
    disableinput: false,
    disableinputcash: false,
    modalVisible: false,
    modalVisiblePayment: false,
    backgroundInputCash: 'white',
    backgroundInputCard: 'white',
    textfont: 'black',
    'currentCurrency': '',
    'currentUser': ''
  };

  handleCheckCash = () => {
    if (!this.state.checkcash) {
      this.setState({ checkcash: true })
      this.setState({ checkcard: false })
      this.setState({ disableinputcash: true })
      this.setState({ cardnumber: '' })
      this.setState({ monthyear: '' })
      this.setState({ cvcnumber: '' })
      this.setState({ apprcode: '' })
      this.setState({ backgroundInputCash: '#0E6655' })
      this.setState({ backgroundInputCard: 'white' })
      this.setState({ textfont: 'white' })
      this.setState({ transmode: 'Cash' })
    }
  }

  handleCheckCard = () => {
    if (!this.state.checkcard) {
      this.setState({ checkcash: false })
      this.setState({ checkcard: true })
      this.setState({ disableinput: true })
      this.setState({ disableinputcash: true })
      this.setState({ cashamount: '' })
      this.setState({ backgroundInputCash: '#0E6655' })
      this.setState({ backgroundInputCard: '#0E6655' })
      this.setState({ textfont: 'white' })
      this.setState({ transmode: 'Card' })
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

  // Go to payment
  handlePayment() {
    this.setState({ modalVisiblePayment: true })
  }

  handlePay() {
    const cashiername = this.state.currentUser;
    const transactionmode = this.state.transmode;
    const menuname = this.props.route.params.item.store.map(value => value.menu)
    const pricemenu = this.props.route.params.item.store.map(value => value.price)
    const qty = this.props.route.params.item.store.map(value => value.number)
    const totalprice = this.props.route.params.item.store.map(value => (value.price * value.number))
    const cashamount = this.state.cashamount;
    const cardnumber = this.state.cardnumber;
    const monthyear = this.state.monthyear;
    const cvcnumber = this.state.cvcnumber;
    const apprcode = this.state.apprcode;
    const totalallprice = totalprice.reduce((result, number) => result + number);
    const discountlist = this.props.route.params.item.store.map(value => value.discount)
    const discount = discountlist.reduce((result, totdisc) => result + totdisc);
    const totaldiscount = ((discount / 100) * totalallprice).toFixed(0);
    const taxamount = ((this.state.currentTax) / 100) * totalallprice
    const grandtotal = (totalallprice - totaldiscount) + taxamount
    const cashback = this.state.cashamount - grandtotal
    const currency = this.state.currentCurrency;

    // Generate transaction id using date and time
    let date = new Date().getDate().toString();
    let month = new Date().getMonth().toString();
    var year = new Date().getFullYear().toString();;
    var hours = new Date().getHours().toString();;
    var minutes = new Date().getMinutes().toString();;
    var seconds = new Date().getSeconds().toString();;
    const transactionId = date + month + year + hours + minutes + seconds;

    if (this.state.transmode == '') {
      Alert.alert('Error', 'Please select the transaction mode')
    }

    if (this.state.transmode == 'Cash') {
      if (this.state.cashamount < grandtotal) {
        Alert.alert('Error', 'Your cash amount is less')
      }

      if (this.state.cashamount > grandtotal) {
        for (var i = 0; i < menuname.length; i++) {
          this.insert(cashiername, transactionId, transactionmode, menuname[i], pricemenu[i], qty[i], totalprice[i], discountlist[i], cashamount, cardnumber, cvcnumber, monthyear, apprcode, totalallprice, discount, totaldiscount, taxamount, grandtotal, cashback, currency);
        }
        this.setState({ modalVisible: true })
      }
    }

    if (this.state.transmode == 'Card') {
      if (this.state.cashamount < grandtotal) {
        Alert.alert('Error', 'Your cash amount is less')
      }
      if (this.state.monthyear == '' || this.state.cvcnumber == '' || this.state.apprcode == '') {
        Alert.alert('Error', 'Please check the Month/Year or CVC or APPR code input')
      } else {
        for (var i = 0; i < menuname.length; i++) {
          this.insert(cashiername, transactionId, transactionmode, menuname[i], pricemenu[i], qty[i], totalprice[i], discountlist[i], cashamount, cardnumber, cvcnumber, monthyear, apprcode, totalallprice, discount, totaldiscount, taxamount, grandtotal, cashback, currency);
        }
        this.setState({ modalVisible: true })
      }
    }
  }

  // cancel pay
  handleCancelPay() {
    this.setState({ modalVisiblePayment: false })
    this.setState({ checkcash: false })
    this.setState({ checkcard: false })
    this.setState({ cardnumber: '' })
    this.setState({ monthyear: '' })
    this.setState({ cvcnumber: '' })
    this.setState({ apprcode: '' })
    this.setState({ cashamount: '' })
    this.setState({ textfont: 'black' })
    this.setState({ backgroundInputCash: 'white' })
    this.setState({ backgroundInputCard: 'white' })
    this.setState({ transmode: '' })
  }

  // delete button
  deleteTable() {
    const ordernumber = this.props.route.params.item.ordernumber;
    var query = 'delete from tablecollectorders where ordernumber = ?';
    var param = [ordernumber]
    collectbase.transaction((tx) => {
      tx.executeSql(query, param, (tx, results) => {
        // console.log('RESS', results)
        alert("Order has been deleted");
      }, function (tx, err) {
        alert("Not Deleted");
        console.log(err);
        return;
      });
    })
  }

  //  Close modal payment
  handlePayed() {
    this.props.navigation.navigate('Home');
    this.deleteTable()
  }

  async componentDidMount() {
    AsyncStorage.getItem('currentCurrency').then(
      (value) => this.setState({ 'currentCurrency': value })
    )
    AsyncStorage.getItem('currentUser').then(
      (value) => this.setState({ 'currentUser': value })
    )
    AsyncStorage.getItem('totalallprice').then(
      (value) => this.setState({ 'totalallprice': value })
    )
    AsyncStorage.getItem('currentTax').then(
      (value) => this.setState({ 'currentTax': value })
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
      }, function (tx, err) {
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
    const tablenum = this.props.route.params.item.ordernumber;
    const menuname = this.props.route.params.item.store.map(value => value.menu);
    const pricemenu = this.props.route.params.item.store.map(value => value.price);
    const qty = this.props.route.params.item.store.map(value => value.number);
    const discountlist = this.props.route.params.item.store.map(value => value.discount);
    const totalprice = this.props.route.params.item.store.map(value => (value.price * value.number));
    const totalAll = this.props.route.params.item.store.map(value => value.price * value.number);
    const totalallprice = totalAll.reduce((result, number) => result + number);
    const discount = this.props.route.params.item.store.map(value => value.discount);
    const totalDiscount = discount.reduce((result, totdisc) => result + totdisc);
    const totaldiscount = ((totalDiscount / 100) * totalallprice).toFixed(0);
    const taxamount = ((this.state.currentTax) / 100) * totalallprice
    const grandtotal = (totalallprice - totaldiscount) + taxamount
    const cashback = this.state.cashamount - grandtotal
    const totalItem = totalAll.length;
    const { backgroundInputCash } = this.state;
    const { backgroundInputCard } = this.state;
    const { textfont } = this.state;

    // Generate transaction id using date and time
    let date = new Date().getDate().toString();
    let month = new Date().getMonth().toString();
    var year = new Date().getFullYear().toString();;
    var hours = new Date().getHours().toString();;
    var minutes = new Date().getMinutes().toString();;
    var seconds = new Date().getSeconds().toString();;
    const transactionId = date + month + year + hours + minutes + seconds;

    var saveAll = {
      totalallprice: totalallprice,
      transactionId: transactionId,
      tablenum: tablenum,
      menuname: menuname,
      pricemenu: pricemenu,
      qty: qty,
      totalprice: totalprice,
      totalDiscount: totalDiscount,
      discountlist: discountlist
    }

    return (
      <SafeAreaView style={styles.container}>
        {/* Order Header */}
        <View style={styles.textTable}>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flexDirection: 'column' }}>
              <Text>Order</Text>
              <Text>Transaction Id</Text>
              <Text>Cashier Name</Text>
            </View>

            <View style={{ marginLeft: 20, flexDirection: 'column' }}>
              <Text>: {tablenum}</Text>
              <Text>: {transactionId}</Text>
              <Text>: {this.state.currentUser}</Text>
            </View>
          </View>
        </View>

        {/* Order item */}
        <ScrollView style={{ flex: 0.6 }}>
          {
            this.props.route.params.item.store.map((value, index) => (
              <View key={index} style={styles.menuListCont}>
                <View style={{ flex: 1.5 }}>
                  <Text style={styles.menuTextStyle}>{value.menu}</Text>
                </View>
                <View style={styles.menuTextCont}>
                  <Text style={styles.menuTextStyle}>{value.price}</Text>
                </View>
                <View style={{ flex: 0.3 }}>
                  <Text style={styles.menuTextStyle}>x{value.number}</Text>
                </View>
                <View style={styles.menuTextCont}>
                  <Text style={styles.menuTextStyle}>{value.number * value.price}</Text>
                </View>
                <View style={styles.menuTextCont}>
                  <Text style={styles.menuTextStyle}>{value.discount}</Text>
                </View>
              </View>
            ))
          }
        </ScrollView>

        {/* Total information */}
        <View style={styles.totalContainer}>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flexDirection: 'column' }}>
              <Text style={styles.totalText}>ITEM</Text>
              <Text style={styles.totalText}>TOTAL</Text>
              <Text style={styles.totalText}>TOTAL DISCOUNT</Text>
            </View>

            <View style={{ flexDirection: 'column' }}>
              <Text style={styles.totalText}>: {totalItem}</Text>
              <Text style={styles.totalText}>: {(`${this.state.currentCurrency}`) + totalallprice}</Text>
              <Text style={styles.totalText}>: {totalDiscount}%</Text>
            </View>
          </View>
        </View>

        {/* Modal payment process */}
        <Modal animationType={"slide"} transparent={false} visible={this.state.modalVisiblePayment}>
          <ScrollView>
            <SafeAreaView style={{ flex: 1 }}>
              {/* View check box */}
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

              {/* Text input of cash amount, card number and ect */}
              <TextInput
                placeholder='Cash Amount'
                placeholderTextColor={textfont}
                value={this.state.cashamount}
                style={{ paddingLeft: 5, margin: 10, height: 30, borderColor: 'gray', borderWidth: 1, backgroundColor: backgroundInputCash, width: Dimensions.get('window').width - 20 }}
                onChangeText={this.handleCashAmount}
                editable={this.state.disableinputcash}
              />
              <TextInput
                placeholder='Card Number'
                placeholderTextColor={textfont}
                value={this.state.cardnumber}
                style={{ paddingLeft: 5, margin: 10, height: 30, borderColor: 'gray', borderWidth: 1, backgroundColor: backgroundInputCard, width: Dimensions.get('window').width - 20 }}
                onChangeText={this.handleCardNumber}
                editable={this.state.disableinput}
              />

              {/* Text input for month/year, cvv and appr code */}
              <SafeAreaView style={{ flexDirection: 'row' }}>
                <TextInput
                  placeholder='Month/Year'
                  placeholderTextColor={textfont}
                  value={this.state.monthyear}
                  style={{ paddingLeft: 5, margin: 10, height: 30, borderColor: 'gray', borderWidth: 1, backgroundColor: backgroundInputCard, width: (Dimensions.get('window').width - 20) / 4 }}
                  onChangeText={this.handleCardMY}
                  editable={this.state.disableinput}
                />
                <TextInput
                  placeholder='CVC'
                  placeholderTextColor={textfont}
                  value={this.state.cvcnumber}
                  style={{ paddingLeft: 5, margin: 10, height: 30, borderColor: 'gray', borderWidth: 1, backgroundColor: backgroundInputCard, width: (Dimensions.get('window').width - 20) / 4 }}
                  onChangeText={this.handleCardCvc}
                  editable={this.state.disableinput}
                />
                <TextInput
                  placeholder='APPR CODE'
                  placeholderTextColor={textfont}
                  value={this.state.apprcode}
                  style={{ paddingLeft: 5, margin: 10, height: 30, borderColor: 'gray', borderWidth: 1, backgroundColor: backgroundInputCard, width: (Dimensions.get('window').width - 20) / 4 }}
                  onChangeText={this.handleCardAppr}
                  editable={this.state.disableinput}
                />
              </SafeAreaView>

              {/* Transaction information */}
              <View style={{ margin: 5, padding: 5, backgroundColor: '#A2D9CE', flexDirection: 'row' }}>
                <View style={{ flexDirection: 'column' }}>
                  <Text>Cashier Name</Text>
                  <Text>Transaction Mode</Text>
                  <Text>Transaction Id</Text>
                </View>

                <View style={{ flexDirection: 'column' }}>
                  <Text style={{ marginLeft: 25 }}>: {(`${this.state.currentUser}`)}</Text>
                  <Text style={{ marginLeft: 25 }}>: {this.state.transmode}</Text>
                  <Text style={{ marginLeft: 25 }}>: {transactionId}</Text>
                </View>
              </View>

              {/* Item */}
              <ScrollView style={styles.itemScroll}>
                {
                  this.props.route.params.item.store.map((value, index) => (
                    <SafeAreaView key={index} style={styles.menuItem}>
                      <View style={{ flexDirection: 'column', flex: 0.3 }}>
                        <Text style={styles.marginItem}>{value.menu}</Text>
                      </View>
                      <View style={{ flexDirection: 'column', flex: 0.3 }}>
                        <Text style={styles.marginItem}>{value.price}</Text>
                      </View>
                      <View style={{ flexDirection: 'column', flex: 0.1 }}>
                        <Text style={styles.marginItem}>x{value.number}</Text>
                      </View>
                      <View style={{ flexDirection: 'column', flex: 0.2 }}>
                        <Text style={styles.marginItem}>{value.number * value.price}</Text>
                      </View>
                      <View style={{ flexDirection: 'column', flex: 0.2 }}>
                        <Text style={styles.marginItem}>{value.discount}</Text>
                      </View>
                    </SafeAreaView>
                  ))
                }
              </ScrollView>
            </SafeAreaView>
          </ScrollView>

          <View style={{ padding: 10, flexDirection: 'row', backgroundColor: '#A2D9CE' }}>
            <View style={{ flexDirection: 'column' }}>
              <Text style={{ fontWeight: 'bold', fontSize: 12 }}>Cash Amount</Text>
              <Text style={{ fontWeight: 'bold', fontSize: 12 }}>Total</Text>
              <Text style={{ fontWeight: 'bold', fontSize: 12 }}>Dsicount {totalDiscount}%</Text>
              <Text style={{ fontWeight: 'bold', fontSize: 12 }}>Tax {(`${this.state.currentTax}`)}%</Text>
              <Text style={{ fontWeight: 'bold', fontSize: 12 }}>Grand Total</Text>
              <Text style={{ fontWeight: 'bold', fontSize: 12 }}>Cash Back</Text>
            </View>

            <View style={{ marginLeft: 40, flexDirection: 'column' }}>
              <Text style={{ fontWeight: 'bold', fontSize: 12 }}>: {(`${this.state.currentCurrency}`)}{this.state.cashamount}</Text>
              <Text style={{ fontWeight: 'bold', fontSize: 12 }}>: {(`${this.state.currentCurrency}`) + totalallprice}</Text>
              <Text style={{ fontWeight: 'bold', fontSize: 12 }}>: {(`${this.state.currentCurrency}`) + totaldiscount}</Text>
              <Text style={{ fontWeight: 'bold', fontSize: 12 }}>: {(`${this.state.currentCurrency}`) + taxamount}</Text>
              <Text style={{ fontWeight: 'bold', fontSize: 12 }}>: {(`${this.state.currentCurrency}`)}{grandtotal}</Text>
              <Text style={{ fontWeight: 'bold', fontSize: 12 }}>: {(`${this.state.currentCurrency}`) + cashback}</Text>
            </View>
          </View>

          {/* Modal transaction is complete */}
          <Modal animationType={"slide"} transparent={false} visible={this.state.modalVisible}>
            <View style={styles.modalCont}>
              <Text style={{ fontWeight: 'bold', fontSize: 20 }}>Transaction is Complete</Text>
              <Text style={{ fontWeight: '400', fontSize: 15 }}>Transaction Mode: {this.state.transmode}</Text>
              <Text style={{ fontWeight: 'bold', fontSize: 20 }}>Cash Back: {(`${this.state.currentCurrency}`) + cashback}</Text>
              <TouchableOpacity style={styles.modalCloseButton} onPress={() => this.handlePayed()}>
                <Text style={{ padding: 5 }}>CLOSE</Text>
              </TouchableOpacity>
            </View>
          </Modal>

          <SafeAreaView style={styles.payButtoncont}>
            <TouchableOpacity style={styles.payButton} onPress={() => this.handlePay()}>
              <Text style={{ color: 'white', fontSize: 20 }}>Pay</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={() => this.handleCancelPay(false)}>
              <Text style={{ color: 'white', fontSize: 20 }}>Cancel</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </Modal>

        {/* Process to payment button */}
        <View style={styles.processButton}>
          <TouchableOpacity onPress={() => this.handlePayment()}>
            <Text style={styles.textProcess}> Process to Payment </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column'
  },
  textTable: {
    flexDirection: 'column',
    backgroundColor: '#1ABC9C'
  },
  menuListCont: {
    flexDirection: 'row',
    backgroundColor: 'lightgray'
  },
  menuTextCont: {
    flex: 0.5,
    flexDirection: 'column'
  },
  menuTextStyle: {
    margin: 5
  },
  totalContainer: {
    flexDirection: 'column',
    backgroundColor: 'darkgray'
  },
  totalText: {
    margin: 5,
    fontWeight: 'bold'
  },
  processButton: {
    flex: 0.15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0E6655'
  },
  textProcess: {
    margin: 10,
    color: 'white',
    fontSize: 20
  },
  itemScroll: {
    flexDirection: 'column',
    margin: 5
  },
  menuItem: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#D1F2EB'
  },
  boldText: {
    fontWeight: 'bold',
    fontSize: 15
  },
  modalCont: {
    flex: 1,
    flexDirection: 'column',
    margin: 30,
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalCloseButton: {
    backgroundColor: '#1ABC9C',
    marginTop: 10,
    borderRadius: 20
  },
  payButtoncont: {
    flexDirection: 'row'
  },
  payButton: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0E6655',
    width: (Dimensions.get('window').width / 2)
  },
  cancelButton: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#922B21',
    width: (Dimensions.get('window').width / 2)
  },
  marginItem: {
    margin: 5
  }
})
// In App.js in a new project

import * as React from 'react';
import { TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Entypo } from "@expo/vector-icons";

import Homescreen from "./Homescreen";
import Aboutscreen from "./Aboutscreen";
import Settingscreen from "./Settingscreen"
import AddMenu from "./AddMenu";
import Addmenuitem from "./Addmenuitem";
import Orderlistscreen from "./Orderlistscreen";
import Orderview from "./Orderview";
import Loginscreen from "./Login";
import Registerscreen from "./Register";
import Paymentscreen from "./Payment";
import Repportscreen from "./RepportView";

const RegisterStack = createStackNavigator();
const LoginStack = createStackNavigator();
const HomeStack = createStackNavigator();
const SettingStack = createStackNavigator();
const AboutStack = createStackNavigator();
const AddMenuStack = createStackNavigator();
const AddItemStack = createStackNavigator();
const OrderStack = createStackNavigator();
const OrderViewStack = createStackNavigator();
const PaymentStack = createStackNavigator();
const ReportStack = createStackNavigator();

const HomeStackScreen = ({navigation}) => (
  <HomeStack.Navigator>
    <LoginStack.Screen
      name="Login"
      component={Loginscreen}
      options={{
        headerBackTitleStyle:{
          color:'#1ABC9C'
        },
        headerTintColor: '#1ABC9C'
      }}
    />
    <HomeStack.Screen
      name="Home"
      component={Homescreen}
      options={{
        headerTitleStyle:{
          fontSize: 20,
          color:'#1ABC9C',
        },
        headerLeft: () => (
          <TouchableOpacity style={{marginLeft:5}} onPress={()=>navigation.openDrawer()}>
            <Entypo name="menu" size={30} color="#1ABC9C"/>
          </TouchableOpacity>
        ),
        headerRight: () => (
          <TouchableOpacity  style={{marginRight:5}} onPress={()=>navigation.navigate('Settings')}>
            <Entypo name="cog" size={30} color="#1ABC9C"/>
          </TouchableOpacity>
        )
      }}
    />
    <SettingStack.Screen
      name="Settings"
      component={Settingscreen}
      options={{
        headerShown: false
      }}
    />
    <AddMenuStack.Screen
      name="AddMenu"
      component={AddMenu}
      options={{
        title:"Add New Menu",
        headerTintColor:'#1ABC9C'
      }}
    />
    <AddItemStack.Screen
      name="MenuItem"
      component={Addmenuitem}
      options={{
        title: "Menu Item",
        headerTintColor:'#1ABC9C'
      }}
    />
    <OrderStack.Screen
      name="OrderList"
      component={Orderlistscreen}
      options={{
        title: "Order List",
        headerTintColor:'#1ABC9C'
      }}
    />
    <OrderViewStack.Screen
      name="OrderView"
      component={Orderview}
      options={{
        title:"Order View",
        headerTintColor:'#1ABC9C'
      }}
    />
    <RegisterStack.Screen
      name="Register"
      component={Registerscreen}
      options={{
        headerBackTitleStyle:{
          color:'#1ABC9C'
        },
        headerTintColor: '#1ABC9C'
      }}
    />
    <PaymentStack.Screen
      name="Payment"
      component={Paymentscreen}
      options={{
        headerBackTitleStyle:{
          color:'#1ABC9C'
        },
        headerTintColor: '#1ABC9C'
      }}
    />
    <ReportStack.Screen
      name="Repport"
      component={Repportscreen}
      options={{
        headerBackTitleStyle:{
          color:'#1ABC9C'
        },
        headerTintColor: '#1ABC9C'
      }}
    />
  </HomeStack.Navigator>
)

const AboutStackScreen = ({navigation}) => (
  <AboutStack.Navigator>
    <AboutStack.Screen
      name="About"
      component={Aboutscreen}
      options={{
        headerTitleStyle:{
          fontSize: 20,
          color:'#1ABC9C',
        },
        headerLeft:()=> (
          <TouchableOpacity  onPress={()=>navigation.openDrawer()}>
            <Entypo name="menu" size={30} color="#1ABC9C"/>
          </TouchableOpacity>
        )
      }}
    />
  </AboutStack.Navigator>
)

const Drawer = createDrawerNavigator();
export default function App() {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        drawerContentOptions={{
          activeTintColor: '#1ABC9C',
        }}
        backBehaviour="history"
        drawerType='slide'
        drawerStyle={{backgroundColor: '#fff'}}
        initialRouteName="Login"
      >
        <Drawer.Screen
          name="Home"
          component={HomeStackScreen}
        />
        <Drawer.Screen
          name="About"
          component={AboutStackScreen}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

import { View, Text } from 'react-native'
import React from 'react'
import  List from './List';
import  Add from './Add';
import  Myprofile from './Myprofile';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';

const Tab = createMaterialBottomTabNavigator();
export default function Accueil(props) {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Contact" component={List} />
      <Tab.Screen name="Add" component={Add} />
      <Tab.Screen name="Profile" component={Myprofile} />
    </Tab.Navigator>
  )
}
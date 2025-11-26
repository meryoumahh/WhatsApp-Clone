import { View, Text } from 'react-native'
import React from 'react'
import  List from './List';
import  Add from './Add';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';

const Tab = createMaterialBottomTabNavigator();
export default function Accueil() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="list" component={List} />
      <Tab.Screen name="Add" component={Add} />
    </Tab.Navigator>
  )
}
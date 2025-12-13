import { View, Text } from 'react-native'
import React from 'react'
import  List from './List';
import  Add from './Add';
import  Myprofile from './Myprofile';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const Tab = createMaterialBottomTabNavigator();
export default function Accueil(props) {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Tab.Navigator
        activeColor="#25D366"
        inactiveColor="#667781"
        barStyle={{
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          height: 65,
          paddingBottom: 5
        }}
        labeled={true}
        shifting={false}
      >
      <Tab.Screen 
        name="Contacts" 
        component={List}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "people" : "people-outline"} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen 
        name="Add Contact" 
        component={Add}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "person-add" : "person-add-outline"} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={Myprofile}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "person-circle" : "person-circle-outline"} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      </Tab.Navigator>
    </SafeAreaView>
  )
}
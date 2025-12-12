import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import React from 'react'
import { StyleSheet, TextInput, TouchableOpacity, Image } from 'react-native';
import { Button } from 'react-native-paper';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons'
import initapp from '../Config';

export default function Add() {
    const database = initapp.database();
    const auth = initapp.auth();

    const [image, setImage] = useState(null);
    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');
    const [phone, setPhone] = useState('');
  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.textstyle}>Add New Contact</Text>
        
        <TouchableOpacity 
          style={styles.imageContainer}
          onPress={async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });
            if (!result.canceled) {
                setImage(result.assets[0].uri);
            }
          }}
        >
          <View style={styles.profileImageWrapper}>
            {image ? (
              <Image
                source={{ uri: image }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons name="person" size={60} color="#25D366" />
              </View>
            )}
            <View style={styles.cameraIcon}>
              <Ionicons name="camera" size={20} color="white" />
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>First Name</Text>
            <TextInput
              onChangeText={setNom}
              value={nom}
              placeholderTextColor="#999"
              placeholder="Enter first name"
              style={styles.textInput}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Last Name</Text>
            <TextInput
              onChangeText={setPrenom}
              value={prenom}
              placeholderTextColor="#999"
              placeholder="Enter last name"
              style={styles.textInput}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              onChangeText={setPhone}
              value={phone}
              placeholderTextColor="#999"
              placeholder="+1 234 567 8900"
              keyboardType="phone-pad"
              style={styles.textInput}
            />
          </View>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={async ()=>{
              if (!nom || !prenom || !phone) {
                  alert('Please fill all fields');
                  return;
              }
              
              const currentUser = auth.currentUser;
              if (!currentUser) {
                  alert('User not authenticated');
                  return;
              }

              try {
                  // Check if phone number exists in registered users
                  const usersSnapshot = await database.ref('users').orderByChild('phone').equalTo(phone).once('value');
                  
                  let isRegistered = false;
                  let registeredUserId = null;
                  
                  if (usersSnapshot.exists()) {
                      const userData = Object.values(usersSnapshot.val())[0];
                      if (userData.uid !== currentUser.uid) {
                          isRegistered = true;
                          registeredUserId = userData.uid;
                      } else {
                          alert('Cannot add yourself as contact');
                          return;
                      }
                  }
                  
                  // Generate contact ID
                  const contactRef = database.ref(`users/${currentUser.uid}/contacts`).push();
                  const contactId = contactRef.key;
                  
                  // Save contact
                  const contactData = {
                      name: `${nom} ${prenom}`,
                      phone: phone,
                      isRegistered: isRegistered,
                      addedAt: Date.now()
                  };
                  
                  if (isRegistered) {
                      contactData.registeredUserId = registeredUserId;
                  }
                  
                  await contactRef.set(contactData);
                  
                  // Create invite message for unregistered contacts
                  if (!isRegistered) {
                      const chatId = `${currentUser.uid}_${contactId}`;
                      const messageRef = database.ref(`ALL_CHAT/${chatId}/discussion`).push();
                      await messageRef.set({
                          idmsg: messageRef.key,
                          sender: 'system',
                          receiver: contactId,
                          message: 'Invite this user to use our app',
                          time: new Date().toLocaleTimeString(),
                          read: false,
                          isInviteMessage: true
                      });
                  }
                  
                  alert(isRegistered ? 'Contact added successfully!' : 'Contact added! They will need to register to chat.');
                  setNom('');
                  setPrenom('');
                  setPhone('');
                  setImage(null);
                  
              } catch (error) {
                  alert('Error adding contact: ' + error.message);
              }
          }}
        >
          <View style={styles.buttonContent}>
            <Ionicons name="person-add" size={20} color="white" />
            <Text style={styles.buttonText}>Add Contact</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F7F8FA',
    },
    scrollContainer: {
      flexGrow: 1,
      alignItems: 'center',
      paddingVertical: 40,
      paddingHorizontal: 20
    },
    textstyle: {
      fontSize: 28,
      fontWeight: "bold",
      color: "#25D366",
      textAlign: "center",
      marginBottom: 30
    },
    imageContainer: {
      marginBottom: 30
    },
    profileImageWrapper: {
      position: 'relative'
    },
    profileImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
      borderWidth: 4,
      borderColor: '#25D366'
    },
    placeholderImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: '#F0F0F0',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 4,
      borderColor: '#25D366'
    },
    cameraIcon: {
      position: 'absolute',
      bottom: 5,
      right: 5,
      backgroundColor: '#25D366',
      borderRadius: 18,
      width: 36,
      height: 36,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
      borderColor: 'white'
    },
    formContainer: {
      width: '100%',
      marginBottom: 30
    },
    inputGroup: {
      marginBottom: 20
    },
    inputLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: '#333',
      marginBottom: 8,
      marginLeft: 4
    },
    textInput: {
      height: 50,
      backgroundColor: 'white',
      borderRadius: 12,
      paddingHorizontal: 16,
      fontSize: 16,
      borderWidth: 1,
      borderColor: '#E1E1E1',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1
    },
    addButton: {
      backgroundColor: '#25D366',
      borderRadius: 25,
      paddingVertical: 15,
      paddingHorizontal: 40,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4
    },
    buttonContent: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    buttonText: {
      color: 'white',
      fontSize: 18,
      fontWeight: '600',
      marginLeft: 8
    }
  });
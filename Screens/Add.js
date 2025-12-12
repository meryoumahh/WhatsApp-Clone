import { View, Text } from 'react-native'
import React from 'react'
import { StyleSheet, TextInput, TouchableOpacity, Image } from 'react-native';
import { Button } from 'react-native-paper';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import initapp from '../Config';

export default function Add() {
    const database = initapp.database();
    const auth = initapp.auth();

    const [image, setImage] = useState(null);
    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');
    const [phone, setPhone] = useState('');
  return (
    <View style={styles.container}>
        <Text style={styles.textstyle}>Ajouter Contact</Text>
        <TouchableOpacity onPress={async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });
            if (!result.canceled) {
                setImage(result.assets[0].uri);
            }
        }}>
            <Image
            source={image ? { uri: image } : require("../assets/mitacs.jpg")}
            style={{
                resizeMode: "cover",
                height: 200,
                width: 200,
                borderRadius: 100,
            }}
            />
        </TouchableOpacity>

        <TextInput
            onChangeText={(text) => {
            setNom(text);
            }}
            textAlign="center"
            placeholderTextColor="#666"
            placeholder="Nom"
            keyboardType="name-phone-pad"
            style={styles.textinputstyle}
        ></TextInput>
        <TextInput
            onChangeText={(text) => {
            setPrenom(text);
            }}
            textAlign="center"
            placeholderTextColor="#666"
            placeholder="Prenom"
            keyboardType="name-phone-pad"
            style={styles.textinputstyle}
        ></TextInput>
        <TextInput
            onChangeText={(text) => {
            setPhone(text);
            }}
            textAlign="center"
            placeholderTextColor="#666"
            placeholder="Numero de telephone"
            keyboardType="name-phone-pad"
            style={styles.textinputstyle}
        ></TextInput>
        <Button
                mode="contained"
                style={{ marginTop: 20, width: '50%' }}
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
                Add
              </Button>
        </View>)
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    textstyle: {
      fontSize: 30,
      fontWeight: "bold",
      color: "black",
      textAlign: "center",
      
      textShadowOffset: { width: -1, height: 1 },
      textShadowRadius: 10,
      marginBottom: 20 // Added margin for spacing
    },
    textinputstyle: {
      height: 40,
      width: '90%',
      borderRadius: 5,
      textAlign: 'center',
      marginVertical: 10,
      backgroundColor: '#f0f0f0',
    }
  });
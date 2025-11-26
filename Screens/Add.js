import { View, Text } from 'react-native'
import React from 'react'
import { StyleSheet, TextInput, TouchableOpacity, Image } from 'react-native';
import { Button } from 'react-native-paper';
import { useState } from 'react';
import initapp from '../Config';

export default function Add() {
    const database = initapp.database();

    const [image, setImage] = useState(null);
    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');
    const [phone, setPhone] = useState('');
  return (
    <View style={styles.container}>
        <Text style={styles.textstyle}>Profil</Text>
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
                onPress={()=>{
                    if (!nom || !prenom || !phone) {
                        alert('Please fill all fields');
                        return;
                    }
                    
                    const ref_base = database.ref();
                    const ref_profils = ref_base.child('profils');
                    const key = ref_profils.push().key;
                    const ref_p = ref_profils.child('profil' + key);
                    
                    ref_p.set({
                        nom: nom,
                        prenom: prenom,
                        phone: phone, 
                        image: image || null,
                        id : key
                    }).then(() => {
                        alert('Profil added successfully');
                        setNom('');
                        setPrenom('');
                        setPhone('');
                        setImage(null);
                    }).catch((error) => {
                        alert(error.message);
                    });
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
      textShadowColor: "rgba(0, 0, 0, 0.75)",
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
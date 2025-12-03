import { View, ScrollView, Alert, ImageBackground, Image, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import { TextInput, Button, Text } from 'react-native-paper'
import * as ImagePicker from 'expo-image-picker'
import initapp from '../Config'
import { supabase } from '../Config'
import 'firebase/compat/database'
export default function Myprofile(props) {
  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [pseudo, setPseudo] = useState('')
  const [phone, setPhone] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [userId, setUserId] = useState(null)

  const auth = initapp.auth()
  const database = initapp.database()






  const [profileImage, setProfileImage] = useState();


  const uploadImageToSupabase = async (localURL) => {
    try {
      console.log('Uploading image for userId:', userId);
      const response = await fetch(localURL);
      const blob = await response.blob();
      const arraybuffer = await blob.arrayBuffer();
      
      const { error } = await supabase.storage
        .from('imagesProfile')
        .upload(userId + '.jpg', arraybuffer, {
          upsert: true,
        });
      
      if (error) {
        console.error('Supabase upload error:', error);
        throw error;
      }
      
      const { data } = supabase.storage
        .from('imagesProfile')
        .getPublicUrl(userId + '.jpg');
      
      console.log('Upload successful, public URL:', data.publicUrl);
      return data.publicUrl;
    } catch (error) {
      console.error('Upload failed:', error);
      Alert.alert('Error', 'Failed to upload image: ' + error.message);
      return null;
    }
  }
          
















  useEffect(() => {
    const user = auth.currentUser
    if (user) {
      setUserId(user.uid)
      loadUserProfile(user.uid)
    }
  }, [])

  const loadUserProfile = (uid) => {
    database.ref('users/' + uid).once('value')
      .then((snapshot) => {
        const data = snapshot.val()
        if (data) {
          setNom(data.nom || '')
          setPrenom(data.prenom || '')
          setPseudo(data.pseudo || '')
          setPhone(data.phone || '')
          setProfileImage(data.profileImageUrl || null)
        }
      })
      .catch((error) => {
        Alert.alert('Error', 'Failed to load profile')
      })
  }

  const pickProfileImage = async () => {
    console.log('TouchableOpacity pressed');
    
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('Permission status:', status);
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions');
        return;
      }

      console.log('Launching image picker');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      console.log('Image picker result:', result);
      if (!result.canceled && result.assets && result.assets[0]) {
        console.log('Selected image URI:', result.assets[0].uri);
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('ImagePicker error:', error);
      Alert.alert('Error', 'Failed to open image picker');
    }
  }

  const saveProfile = () => {
    if (!nom || !prenom || !pseudo || !phone) {
      Alert.alert('Error', 'Please fill all fields')
      return
    }

    const profileData = {
      nom,
      prenom,
      pseudo,
      phone,
      profileImageUrl: profileImage
    }

    database.ref('users/' + userId).set(profileData)
      .then(() => {
        Alert.alert('Success', 'Profile updated successfully')
        setIsEditing(false)
      })
      .catch((error) => {
        Alert.alert('Error', 'Failed to save profile')
      })
  }

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          onPress: () => {
            auth.signOut()
              .then(() => {
                props.navigation.reset({
                  index: 0,
                  routes: [{ name: 'Authentification' }],
                });
              })
              .catch((error) => {
                console.error('Logout error:', error);
                Alert.alert('Error', 'Failed to logout');
              });
          }
        }
      ]
    );
  }

  return (
    <ImageBackground
      source={require('../assets/bg.jpg')}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20, justifyContent: 'center' }}>
        <View style={{
          backgroundColor: 'rgba(0,0,0,0.7)',
          padding: 30,
          borderRadius: 15,
          marginHorizontal: 10
        }}>
          <Text style={{
            fontSize: 28,
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
            marginBottom: 30
          }}>My Profile</Text>

          <View style={{ alignItems: 'center', marginBottom: 30 }}>
            <TouchableOpacity onPress={pickProfileImage}>
              <Image
                source={profileImage ? { uri: profileImage } : require('../assets/mitacs.jpg')}
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  borderWidth: 3,
                  borderColor: 'white'
                }}
              />
            </TouchableOpacity>
          </View>

          <TextInput
            label="First Name"
            value={prenom}
            onChangeText={setPrenom}
            disabled={!isEditing}
            style={{ marginBottom: 15, backgroundColor: 'white' }}
          />

          <TextInput
            label="Last Name"
            value={nom}
            onChangeText={setNom}
            disabled={!isEditing}
            style={{ marginBottom: 15, backgroundColor: 'white' }}
          />

          <TextInput
            label="Pseudo Name"
            value={pseudo}
            onChangeText={setPseudo}
            disabled={!isEditing}
            style={{ marginBottom: 15, backgroundColor: 'white' }}
          />

          <TextInput
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            disabled={!isEditing}
            style={{ marginBottom: 25, backgroundColor: 'white' }}
          />

          {isEditing ? (
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <Button
                mode="contained"
                onPress={saveProfile}
                style={{ backgroundColor: '#4CAF50', flex: 1, marginRight: 10 }}
              >
                Save
              </Button>
              <Button
                mode="outlined"
                onPress={() => {
                  setIsEditing(false)
                  loadUserProfile(userId)
                }}
                style={{ borderColor: 'white', flex: 1 }}
                textColor="white"
              >
                Cancel
              </Button>
            </View>
          ) : (
            <View>
              <Button
                mode="contained"
                onPress={() => setIsEditing(true)}
                style={{ backgroundColor: 'rgba(33, 150, 243, 1)', marginBottom: 15 }}
              >
                Edit Profile
              </Button>
              
              <Button
                mode="contained"
                onPress={handleLogout}
                style={{ backgroundColor: '#FF5252' }}
                icon="logout"
              >
                Logout
              </Button>
            </View>
          )}
        </View>
      </ScrollView>
    </ImageBackground>
  )
}
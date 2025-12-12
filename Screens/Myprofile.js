import { View, ScrollView, Alert, ImageBackground, Image, TouchableOpacity, Modal } from 'react-native'
import React, { useState, useEffect } from 'react'
import { TextInput, Button, Text } from 'react-native-paper'
import * as ImagePicker from 'expo-image-picker'
import initapp from '../Config'
import { supabase } from '../Config'
import 'firebase/compat/database'
import 'firebase/compat/auth'
export default function Myprofile(props) {
  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [pseudo, setPseudo] = useState('')
  const [phone, setPhone] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [userId, setUserId] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [showResultModal, setShowResultModal] = useState(false)
  const [deleteResult, setDeleteResult] = useState({ success: false, message: '' })

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
    console.log('🔴 LOGOUT BUTTON PRESSED');
    console.log('🔴 Navigation props:', props.navigation ? 'EXISTS' : 'MISSING');
    console.log('🔴 Auth current user:', auth.currentUser ? 'EXISTS' : 'MISSING');
    
    // Temporarily bypass Alert for testing
    console.log('🔴 LOGOUT CONFIRMED - DIRECT CALL');
    auth.signOut()
      .then(() => {
        console.log('🔴 SIGNOUT SUCCESS');
        console.log('🔴 About to call navigation.reset');
        try {
          props.navigation.reset({
            index: 0,
            routes: [{ name: 'Authentification' }],
          });
          console.log('🔴 Navigation.reset called successfully');
        } catch (navError) {
          console.error('🔴 Navigation error:', navError);
        }
      })
      .catch((error) => {
        console.error('🔴 Logout error:', error);
        Alert.alert('Error', 'Failed to logout');
      });
  }

  const handleDeleteAccount = () => {
    console.log('🔴 DELETE ACCOUNT BUTTON PRESSED');
    console.log('🔴 Bypassing Alert - showing modal directly');
    // Temporarily bypass Alert for testing
    setShowDeleteModal(true);
  }

  const confirmDeleteAccount = async () => {
    console.log('🔴 CONFIRM DELETE CALLED');
    console.log('🔴 Password entered:', confirmPassword ? 'YES' : 'NO');
    
    if (!confirmPassword) {
      console.log('🔴 No password entered');
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    try {
      console.log('🔴 Starting delete process');
      setDeleting(true);
      
      const user = auth.currentUser;
      console.log('🔴 Current user:', user ? 'EXISTS' : 'MISSING');
      
      const credential = initapp.auth.EmailAuthProvider.credential(
        user.email,
        confirmPassword
      );
      
      console.log('🔴 Reauthenticating...');
      await user.reauthenticateWithCredential(credential);
      console.log('🔴 Reauthentication successful');
      
      console.log('🔴 Removing profile image...');
      await supabase.storage.from('imagesProfile').remove([userId + '.jpg']);
      console.log('🔴 Profile image removed');
      
      console.log('🔴 Removing user data...');
      await database.ref('users/' + userId).remove();
      console.log('🔴 User data removed');
      
      console.log('🔴 Removing chat data...');
      const chatsSnapshot = await database.ref('ALL_CHAT').once('value');
      if (chatsSnapshot.exists()) {
        const chats = chatsSnapshot.val();
        for (const chatId in chats) {
          if (chatId.includes(userId)) {
            await database.ref('ALL_CHAT/' + chatId).remove();
          }
        }
      }
      console.log('🔴 Chat data removed');
      
      console.log('🔴 Deleting Firebase user...');
      await user.delete();
      console.log('🔴 Firebase user deleted');
      
      console.log('🔴 Navigating to auth screen...');
      props.navigation.reset({
        index: 0,
        routes: [{ name: 'Authentification' }]
      });
      console.log('🔴 Navigation completed');
      
      setDeleteResult({ success: true, message: 'Account deleted successfully!' });
      setShowResultModal(true);
      
    } catch (error) {
      console.error('🔴 Delete account error:', error);
      setDeleteResult({ success: false, message: error.message || 'Failed to delete account' });
      setShowResultModal(true);
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setConfirmPassword('');
    }
  }

  return (
    <ImageBackground
      source={require('../assets/bg.jpg')}
      style={{ flex: 1, width: '100%', height: '100%' }}
      resizeMode="repeat"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20, justifyContent: 'center',  }}>
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
                style={{ backgroundColor: '#FF5252', marginBottom: 10 }}
                icon="logout"
              >
                Logout
              </Button>
              
              <Button
                mode="contained"
                onPress={handleDeleteAccount}
                style={{ backgroundColor: '#D32F2F' }}
                icon="account-remove"
              >
                Delete Account
              </Button>
            </View>
          )}
        </View>
      </ScrollView>
      
      <Modal visible={showDeleteModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center' }}>
          <View style={{ backgroundColor: 'white', margin: 20, borderRadius: 15, padding: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center', color: '#D32F2F' }}>
              ⚠️ Delete Account
            </Text>
            
            <Text style={{ fontSize: 16, marginBottom: 20, textAlign: 'center' }}>
              Enter your password to confirm account deletion. This action cannot be undone.
            </Text>
            
            <TextInput
              label="Confirm Password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={{ marginBottom: 20, backgroundColor: 'white' }}
            />
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <Button
                mode="outlined"
                onPress={() => {
                  setShowDeleteModal(false);
                  setConfirmPassword('');
                }}
                style={{ flex: 1, marginRight: 10 }}
                disabled={deleting}
              >
                Cancel
              </Button>
              
              <Button
                mode="contained"
                onPress={confirmDeleteAccount}
                style={{ backgroundColor: '#D32F2F', flex: 1 }}
                loading={deleting}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete Forever'}
              </Button>
            </View>
          </View>
        </View>
      </Modal>
      
      <Modal visible={showResultModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center' }}>
          <View style={{ backgroundColor: 'white', margin: 20, borderRadius: 15, padding: 20 }}>
            <Text style={{ 
              fontSize: 20, 
              fontWeight: 'bold', 
              marginBottom: 15, 
              textAlign: 'center', 
              color: deleteResult.success ? '#4CAF50' : '#D32F2F' 
            }}>
              {deleteResult.success ? '✅' : '❌'} {deleteResult.success ? 'Success' : 'Error'}
            </Text>
            
            <Text style={{ fontSize: 16, marginBottom: 20, textAlign: 'center' }}>
              {deleteResult.message}
            </Text>
            
            <Button
              mode="contained"
              onPress={() => {
                setShowResultModal(false);
                if (deleteResult.success) {
                  props.navigation.reset({
                    index: 0,
                    routes: [{ name: 'Authentification' }]
                  });
                }
              }}
              style={{ backgroundColor: deleteResult.success ? '#4CAF50' : '#D32F2F' }}
            >
              OK
            </Button>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  )
}
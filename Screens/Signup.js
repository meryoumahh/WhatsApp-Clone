import { View, ScrollView, KeyboardAvoidingView, Platform, ImageBackground, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import { TextInput, Button, Text } from 'react-native-paper'
import initapp from '../Config'

export default function Signup(props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [pseudo, setPseudo] = useState('')
  const [phone, setPhone] = useState('')

  const auth = initapp.auth()
  const database = initapp.database()

  const handleSignup = () => {
    if (!email || !password || !nom || !prenom || !pseudo || !phone) {
      alert('Please fill all fields')
      return
    }

    auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const user = userCredential.user
        
        // Save user profile to database
        database.ref('users/' + user.uid).set({
          nom,
          prenom,
          pseudo,
          phone,
          email,
          uid: user.uid,
          isOnline: true
        }).then(async () => {
          // Set up presence system
          database.ref('users/' + user.uid + '/isOnline').onDisconnect().set(false);
          
          // Update existing contacts that have this phone number
          try {
            const usersSnapshot = await database.ref('users').once('value');
            const updates = {};
            
            if (usersSnapshot.exists()) {
              usersSnapshot.forEach((userChild) => {
                const userData = userChild.val();
                const userId = userChild.key;
                
                if (userData.contacts) {
                  Object.keys(userData.contacts).forEach((contactId) => {
                    const contact = userData.contacts[contactId];
                    if (contact.phone === phone && !contact.isRegistered) {
                      // Update this contact to registered status
                      updates[`users/${userId}/contacts/${contactId}/isRegistered`] = true;
                      updates[`users/${userId}/contacts/${contactId}/registeredUserId`] = user.uid;
                    }
                  });
                }
              });
            }
            
            // Apply all updates at once
            if (Object.keys(updates).length > 0) {
              await database.ref().update(updates);
              console.log('Updated existing contacts for new user');
            }
          } catch (error) {
            console.error('Error updating existing contacts:', error);
          }
          
          alert('Account created successfully!')
          props.navigation.navigate('Accueil')
        })
      })
      .catch((error) => {
        alert(error.message)
      })
  }

  return (
    <ImageBackground
      source={require('../assets/bg.jpg')}
      style={{ flex: 1, width: '100%', height: '100%' }}
      resizeMode="repeat"
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20, justifyContent: 'center' }}>
          <View style={styles.formContainer}>
            <Text style={styles.title}>Create Account</Text>

            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              style={styles.input}
              theme={{ colors: { primary: '#25D366' } }}
            />

            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
              theme={{ colors: { primary: '#25D366' } }}
            />

            <TextInput
              label="First Name"
              value={prenom}
              onChangeText={setPrenom}
              style={styles.input}
              theme={{ colors: { primary: '#25D366' } }}
            />

            <TextInput
              label="Last Name"
              value={nom}
              onChangeText={setNom}
              style={styles.input}
              theme={{ colors: { primary: '#25D366' } }}
            />

            <TextInput
              label="Username"
              value={pseudo}
              onChangeText={setPseudo}
              style={styles.input}
              theme={{ colors: { primary: '#25D366' } }}
            />

            <TextInput
              label="Phone Number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              style={styles.lastInput}
              theme={{ colors: { primary: '#25D366' } }}
            />

            <Button
              mode="contained"
              onPress={handleSignup}
              style={styles.signupButton}
              labelStyle={styles.buttonLabel}
            >
              Create Account
            </Button>

            <Button
              mode="text"
              onPress={() => props.navigation.navigate('Authentification')}
              textColor="#25D366"
              labelStyle={styles.linkLabel}
            >
              Already have an account? Sign In
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  formContainer: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 30,
    borderRadius: 20,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#25D366',
    textAlign: 'center',
    marginBottom: 30
  },
  input: {
    marginBottom: 15,
    backgroundColor: 'white'
  },
  lastInput: {
    marginBottom: 25,
    backgroundColor: 'white'
  },
  signupButton: {
    backgroundColor: '#25D366',
    marginBottom: 15,
    paddingVertical: 8,
    borderRadius: 25
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600'
  },
  linkLabel: {
    fontSize: 14,
    fontWeight: '500'
  }
})
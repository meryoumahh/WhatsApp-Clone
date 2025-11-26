import { View, ScrollView, KeyboardAvoidingView, Platform, ImageBackground } from 'react-native'
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
          uid: user.uid
        }).then(() => {
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
      style={{ flex: 1 }}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
            }}>Sign Up</Text>

            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              style={{ marginBottom: 15, backgroundColor: 'white' }}
            />

            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={{ marginBottom: 15, backgroundColor: 'white' }}
            />

            <TextInput
              label="First Name"
              value={prenom}
              onChangeText={setPrenom}
              style={{ marginBottom: 15, backgroundColor: 'white' }}
            />

            <TextInput
              label="Last Name"
              value={nom}
              onChangeText={setNom}
              style={{ marginBottom: 15, backgroundColor: 'white' }}
            />

            <TextInput
              label="Pseudo Name"
              value={pseudo}
              onChangeText={setPseudo}
              style={{ marginBottom: 15, backgroundColor: 'white' }}
            />

            <TextInput
              label="Phone Number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              style={{ marginBottom: 25, backgroundColor: 'white' }}
            />

            <Button
              mode="contained"
              onPress={handleSignup}
              style={{ backgroundColor: '#4CAF50', marginBottom: 15 }}
            >
              Sign Up
            </Button>

            <Button
              mode="text"
              onPress={() => props.navigation.navigate('Authentification')}
              textColor="white"
            >
              Already have an account? Sign In
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  )
}
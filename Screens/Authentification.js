import { StatusBar } from 'expo-status-bar';
import { 
  TouchableOpacity, 
  Platform, 
  KeyboardAvoidingView, 
  ScrollView, // 1. Import ScrollView
  Dimensions 
} from 'react-native';
import { ImageBackground } from 'react-native';
import { StyleSheet, Text, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { useState , useRef} from 'react';
import initapp from '../Config';
import 'firebase/compat/auth';

const { height } = Dimensions.get('window');

export default function Authentification(props) {
  const auth = initapp.auth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const refinput2 = useRef();
  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" />
      <View style={{ height: 40, width: "100%", backgroundColor: "red" }}></View>
      
      <ImageBackground
        source={require('../assets/bg.jpg')}
        style={styles.container}
        resizeMode="repeat"
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView} 
        >
          {/* 2. Add ScrollView with flexGrow to ensure centering works */}
          <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.formContainer}>
              <Text style={styles.title}>Welcome to WhatsApp</Text>
              
              <TextInput
                keyboardType="email-address"
                label="Email"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                onSubmitEditing={()=>{refinput2.current.focus();}}
                theme={{ colors: { primary: '#25D366' } }}
              />

              <TextInput
                ref={refinput2}
                keyboardType="default"
                label="Password"
                secureTextEntry={true}
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                theme={{ colors: { primary: '#25D366' } }}
              />
              
              <Button
                mode="contained"
                style={styles.signInButton}
                labelStyle={styles.buttonLabel}
                onPress={() => {
                  if (email.length < 5 || password.length < 5) {
                    alert('Email and password must be at least 5 characters long');
                    return;
                  }
                  
                  auth.signInWithEmailAndPassword(email, password)
                    .then((userCredential) => {
                      const user = userCredential.user;
                      // Set user online
                      const database = initapp.database();
                      database.ref('users/' + user.uid + '/isOnline').set(true);
                      database.ref('users/' + user.uid + '/isOnline').onDisconnect().set(false);
                      
                      alert('Successfully signed in!');
                      props.navigation.navigate('Accueil');
                    })
                    .catch((error) => {
                      alert(error.message);
                    });
                }}
              >
                Sign In
              </Button>
              
              <TouchableOpacity 
                onPress={() => props.navigation.navigate('Signup')}
                style={styles.linkButton}
              >
                <Text style={styles.linkText}>
                  Don't have an account? Create one
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    width: '100%',
    height: '100%',
  },
  keyboardView: {
    flex: 1,
    width: '100%',
  },
  scrollContainer: {
    flexGrow: 1, 
    alignItems: 'center', 
    justifyContent: 'center',
    paddingHorizontal: 20
  },
  formContainer: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 40,
    paddingHorizontal: 30,
    borderRadius: 20,
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
    width: '100%',
    marginVertical: 10,
    backgroundColor: 'white',
  },
  signInButton: {
    marginTop: 25,
    width: '70%',
    backgroundColor: '#25D366',
    paddingVertical: 8,
    borderRadius: 25
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600'
  },
  linkButton: {
    marginTop: 20,
    paddingVertical: 10
  },
  linkText: {
    color: '#25D366',
    fontSize: 14,
    fontWeight: '500',
    textDecorationLine: 'underline'
  }
});
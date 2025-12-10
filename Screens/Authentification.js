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
            <View
              style={{
                backgroundColor: 'rgba(0,0,0,0.5)',
                alignItems: 'center',
                justifyContent: 'center',
                width: '90%',
                // 3. REMOVED height: '50%' 
                // 4. ADDED paddingVertical to let the box grow with content
                paddingVertical: 30, 
                borderRadius: 10,
              }}
            >
              <Text style={{
                fontSize: 30,
                fontWeight: "bold",
                color: "white",
                textAlign: "center",
                textShadowColor: "rgba(0, 0, 0, 0.75)",
                textShadowOffset: { width: -1, height: 1 },
                textShadowRadius: 10,
                marginBottom: 20 // Added margin for spacing
              }}>Authentification
              </Text>
              
              <TextInput
                keyboardType="email-address"
                placeholder="Email"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                onSubmitEditing={()=>{refinput2.current.focus();}}
              >
              </TextInput>

              <TextInput
                ref={refinput2}
                keyboardType="default"
                placeholder="password"
                secureTextEntry={true}
                style={styles.input}
                value={password}
                onChangeText={setPassword}
              >
              </TextInput>
              
              <Button
                mode="contained"
                style={{ marginTop: 20, width: '50%' }}
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
                sign in
              </Button>
              
              <TouchableOpacity 
                onPress={() => props.navigation.navigate('Signup')}
                >
                <Text
                  style={{
                    color: "white",
                    textDecorationLine: "underline",
                    marginTop: 20,
                  }}
                >
                  Create an account
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
  },
  keyboardView: {
    flex: 1,
    width: '100%',
  },
  // 5. This style ensures the form stays centered but scrolls if needed
  scrollContainer: {
    flexGrow: 1, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  input: {
    height: 40,
    width: '80%',
    borderRadius: 5,
    textAlign: 'center',
    marginVertical: 10, // Changed margin to marginVertical for better spacing
    backgroundColor: 'white',
  }
});
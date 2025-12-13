import Authentification from "./Screens/Authentification";
import Signup from "./Screens/Signup";
import Accueil from "./Screens/Accueil";
import Add from "./Screens/Add";
import Chat from "./Screens/Chat";
import { NavigationContainer } from '@react-navigation/native'; 
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppState } from 'react-native';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import initapp from './Config';

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      const user = initapp.auth().currentUser;
      if (user) {
        const database = initapp.database();
        if (nextAppState === 'active') {
          // User is online
          database.ref('users/' + user.uid + '/isOnline').set(true);
        } else if (nextAppState === 'background' || nextAppState === 'inactive') {
          // User is offline
          database.ref('users/' + user.uid + '/isOnline').set(false);
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Authentification" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Authentification" component={Authentification} />
          <Stack.Screen name="Signup" component={Signup} />
          <Stack.Screen name="Accueil" component={Accueil} options={{headerShown : true}}/>
          <Stack.Screen name="Add" component={Add} options={{headerShown : true}}/>
          <Stack.Screen name="Chat" component={Chat} options={{headerShown : true}}/>
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
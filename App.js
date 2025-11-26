import Authentification from "./Screens/Authentification";
import Signup from "./Screens/Signup";
import Accueil from "./Screens/Accueil";
import Add from "./Screens/Add";
import Chat from "./Screens/Chat";
import { NavigationContainer } from '@react-navigation/native'; 
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();
export default function App() {
  return (
    // The Provider is required for react-native-paper components to show up
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Authentification" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Authentification" component={Authentification} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="Accueil" component={Accueil} options={{headerShown : true}}/>
        <Stack.Screen name="Add" component={Add} options={{headerShown : true}}/>
        <Stack.Screen name="Chat" component={Chat} options={{headerShown : true}}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
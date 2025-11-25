import { Provider as PaperProvider } from 'react-native-paper';
import Authentification from "./Screens/Authentification";

export default function App() {
  return (
    // The Provider is required for react-native-paper components to show up
    <PaperProvider>
       <Authentification/>   
    </PaperProvider>
  );
}
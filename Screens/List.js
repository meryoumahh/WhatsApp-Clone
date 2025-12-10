import { View, Text, FlatList, TouchableHighlight } from 'react-native'
import React, { useState, useEffect } from 'react'
import { StatusBar } from 'expo-status-bar'
import { ImageBackground, StyleSheet } from 'react-native'
import initapp from '../Config';

export default function List(props) {
    const auth = initapp.auth();
  const [data, setData] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [interactions, setInteractions] = useState({});
  const database = initapp.database();

  const ref = database.ref();
  const ref_users = ref.child("users");

  useEffect(() => {
    getAllUsers();
    
    // Listen for unread message counts and interactions
    const currentUser = auth.currentUser;
    if (currentUser) {
      const unreadRef = database.ref(`users/${currentUser.uid}/unreadMessages`);
      const interactionRef = database.ref(`users/${currentUser.uid}/lastInteraction`);
      
      unreadRef.on('value', (snapshot) => {
        setUnreadCounts(snapshot.val() || {});
      });
      
      interactionRef.on('value', (snapshot) => {
        setInteractions(snapshot.val() || {});
      });
      
      return () => {
        ref_users.off();
        unreadRef.off();
        interactionRef.off();
      };
    }
    
    return () => {
      ref_users.off();
    };
  }, []);

  // Re-sort users when interactions change
  useEffect(() => {
    if (data.length > 0) {
      const sortedUsers = [...data].sort((a, b) => {
        const aTime = interactions[a.id] || 0;
        const bTime = interactions[b.id] || 0;
        
        // Primary: Recent interaction (newest first)
        if (aTime !== bTime) return bTime - aTime;
        
        // Secondary: Online status (online first)
        if (a.isOnline !== b.isOnline) return b.isOnline - a.isOnline;
        
        // Tertiary: Alphabetical by name
        return a.nom.localeCompare(b.nom);
      });
      
      setData(sortedUsers);
    }
  }, [interactions]);

  function getAllUsers() {
    ref_users.on("value", (snapshot) => { 
      let usersData = [];
      snapshot.forEach((child) => {
        const user = child.val();
        if (user && user.uid !== auth.currentUser?.uid) {
          usersData.push({
            id: user.uid,
            nom: user.nom,
            prenom: user.prenom,
            pseudo: user.pseudo,
            phone: user.phone,
            isOnline: user.isOnline || false
          });
        }
      });
      // Sort users by recent interaction
      const sortedUsers = usersData.sort((a, b) => {
        const aTime = interactions[a.id] || 0;
        const bTime = interactions[b.id] || 0;
        
        // Primary: Recent interaction (newest first)
        if (aTime !== bTime) return bTime - aTime;
        
        // Secondary: Online status (online first)
        if (a.isOnline !== b.isOnline) return b.isOnline - a.isOnline;
        
        // Tertiary: Alphabetical by name
        return a.nom.localeCompare(b.nom);
      });
      
      setData(sortedUsers);
    });
  }
  console.log(data);
//...
  return (
    <View style={styles.container}>
        
        <ImageBackground
            source={require("../assets/bg.jpg")}
            resizeMode="cover"
            style={styles.image}
        >
            <Text style={styles.accueil}>Accueil</Text>
            <StatusBar style="dark" />
            <FlatList
              data={data}
              style={{ width: "100%", flex: 1, marginBottom: 100 }}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableHighlight
                  onPress={() => {
                    props.navigation.navigate('Chat', {
                      currentid: auth.currentUser.uid,
                      secondid: item.id
                    });
                  }}
                  underlayColor="#DDDDDD"
                >
                  <View style={{
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    margin: 10,
                    padding: 15,
                    borderRadius: 10,
                    flexDirection: 'row',
                    alignItems: 'center'
                  }}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
                          {item.nom} {item.prenom}
                        </Text>
                        {item.isOnline && (
                          <View style={{
                            width: 10,
                            height: 10,
                            borderRadius: 5,
                            backgroundColor: '#4CAF50',
                            marginLeft: 8
                          }} />
                        )}
                      </View>
                      <Text style={{ fontSize: 16, color: '#2196F3', fontWeight: '500' }}>
                        @{item.pseudo}
                      </Text>
                      <Text style={{ fontSize: 14, color: '#666' }}>
                        {item.phone}
                      </Text>
                    </View>
                    {unreadCounts[item.id] > 0 && (
                      <View style={{
                        backgroundColor: '#F44336',
                        borderRadius: 10,
                        minWidth: 20,
                        height: 20,
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingHorizontal: 6
                      }}>
                        <Text style={{
                          color: 'white',
                          fontSize: 12,
                          fontWeight: 'bold'
                        }}>
                          {unreadCounts[item.id]}
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableHighlight>
              )}
            />
            <View style = {styles.layout}>
                <TouchableHighlight
                    style={styles.touch}
                    activeOpacity={0.5}
                    underlayColor="#DDDDDD"
                    title="logout"
                    >
                    <Text 
                    style = {styles.title}
                    onPress={() => {
                        const user = auth.currentUser;
                        if (user) {
                            // Set user offline before logout
                            database.ref('users/' + user.uid + '/isOnline').set(false);
                        }
                        auth.signOut().then(() => {
                            props.navigation.replace("Authentification");
                        }).catch((error) => {
                            alert(error.message);
                        });}}
                    >Logout</Text>
                    </TouchableHighlight>
            </View>
        </ImageBackground>
    </View>
  );
}
const styles = StyleSheet.create({  
    container: {   
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },  
    accueil: {  
        fontSize: 30,
        fontWeight: "bold",
        color: "white",
        textAlign: "center",
        textShadowColor: "rgba(0, 0, 0, 0.75)",
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,  
        padding: 10,
        marginBottom: 20 

    },
    image: {    
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        width: '100%',
        height: '100%',
    },  
    touch: {
        width: '100%',
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'red',
        borderRadius: 10,
        marginTop: 20,
    },
    title: {
        fontSize: 15,
        fontWeight: 'bold',
        color: 'white',
    },
    layout: {
        position: 'absolute',
        bottom: 50,
        width: '80%',
    },  
});
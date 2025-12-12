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
    getAllContacts();
    
    // Listen for unread messages
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

  // Ratib users when interactions change
  useEffect(() => {
    if (data.length > 0) {
      const sortedUsers = [...data].sort((a, b) => {
        const aTime = interactions[a.id] || 0;
        const bTime = interactions[b.id] || 0;
        
        // interactiit ajdad we7ids
        if (aTime !== bTime) return bTime - aTime;
        
        // snn en se basant 3ala activity 
        if (a.isOnline !== b.isOnline) return b.isOnline - a.isOnline;
        
        // snn tartib abajidi 
        return a.nom.localeCompare(b.nom);
      });
      
      setData(sortedUsers);
    }
  }, [interactions]);

  function getAllContacts() {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    
    // Listen to user's contacts
    const contactsRef = database.ref(`users/${currentUser.uid}/contacts`);
    contactsRef.on('value', async (contactsSnapshot) => {
      let contactsData = [];
      
      if (contactsSnapshot.exists()) {
        const contactPromises = [];
        
        contactsSnapshot.forEach((contactChild) => {
          const contact = contactChild.val();
          const contactId = contactChild.key;
          
          if (contact.isRegistered && contact.registeredUserId) {
            // Get registered user data
            const promise = database.ref(`users/${contact.registeredUserId}`).once('value')
              .then((userSnapshot) => {
                if (userSnapshot.exists()) {
                  const userData = userSnapshot.val();
                  return {
                    id: contact.registeredUserId,
                    nom: userData.nom,
                    prenom: userData.prenom,
                    pseudo: userData.pseudo,
                    phone: userData.phone,
                    isOnline: userData.isOnline || false,
                    isRegistered: true,
                    contactId: contactId
                  };
                }
                return null;
              });
            contactPromises.push(promise);
          } else {
            // Unregistered contact
            const nameParts = contact.name.split(' ');
            contactsData.push({
              id: contactId,
              nom: nameParts[0] || '',
              prenom: nameParts.slice(1).join(' ') || '',
              pseudo: 'Not registered',
              phone: contact.phone,
              isOnline: false,
              isRegistered: false,
              contactId: contactId
            });
          }
        });
        
        // Wait for all registered user data to be fetched
        const registeredContacts = await Promise.all(contactPromises);
        registeredContacts.forEach(contact => {
          if (contact) contactsData.push(contact);
        });
        
        updateContactsList(contactsData);
      } else {
        setData([]);
      }
    });
  }
  
  function updateContactsList(contactsData) {
    // Remove duplicates based on id
    const uniqueContacts = contactsData.filter((contact, index, self) => 
      index === self.findIndex(c => c.id === contact.id)
    );
    
    // Sort contacts
    const sortedContacts = uniqueContacts.sort((a, b) => {
      // Primary: Registered status (registered first)
      if (a.isRegistered !== b.isRegistered) return b.isRegistered - a.isRegistered;
      
      // Secondary: Recent interaction
      const aTime = interactions[a.id] || 0;
      const bTime = interactions[b.id] || 0;
      if (aTime !== bTime) return bTime - aTime;
      
      // Tertiary: Online status (for registered users)
      if (a.isRegistered && b.isRegistered && a.isOnline !== b.isOnline) {
        return b.isOnline - a.isOnline;
      }
      
      // Quaternary: Alphabetical by name
      return a.nom.localeCompare(b.nom);
    });
    
    setData(sortedContacts);
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
                    if (item.isRegistered) {
                      props.navigation.navigate('Chat', {
                        currentid: auth.currentUser.uid,
                        secondid: item.id
                      });
                    } else {
                      props.navigation.navigate('Chat', {
                        currentid: auth.currentUser.uid,
                        secondid: item.id,
                        isUnregistered: true
                      });
                    }
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
                      <Text style={{ fontSize: 16, color: item.isRegistered ? '#2196F3' : '#FF9800', fontWeight: '500' }}>
                        {item.isRegistered ? `@${item.pseudo}` : 'Invite this user to use our app'}
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
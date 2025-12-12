import { View, Text, FlatList, TouchableHighlight, Image } from 'react-native'
import React, { useState, useEffect } from 'react'
import { StatusBar } from 'expo-status-bar'
import { ImageBackground, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
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
            style={styles.image}
            resizeMode="repeat"
        >
            <Text style={styles.accueil}>WhatsApp</Text>
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
                  underlayColor="#E8F5E8"
                >
                  <View style={[
                    styles.contactCard,
                    { backgroundColor: item.isRegistered ? '#FFFFFF' : '#F8F8F8' }
                  ]}>
                    {/* Profile Picture */}
                    <View style={styles.profilePictureContainer}>
                      <View style={styles.profilePicture}>
                        <Text style={styles.profileInitials}>
                          {(item.nom.charAt(0) + item.prenom.charAt(0)).toUpperCase()}
                        </Text>
                      </View>
                      {item.isOnline && (
                        <View style={styles.onlineIndicator} />
                      )}
                    </View>
                    
                    {/* Contact Info */}
                    <View style={styles.contactInfo}>
                      <View style={styles.nameRow}>
                        <Text style={styles.contactName}>
                          {item.nom} {item.prenom}
                        </Text>
                        {item.isRegistered && (
                          <Ionicons name="checkmark-circle" size={16} color="#25D366" style={{ marginLeft: 6 }} />
                        )}
                      </View>
                      
                      <View style={styles.statusRow}>
                        {!item.isRegistered && (
                          <Ionicons name="person-add" size={14} color="#FF9800" style={{ marginRight: 4 }} />
                        )}
                        <Text style={[
                          styles.statusText,
                          { color: item.isRegistered ? '#667781' : '#FF9800' }
                        ]}>
                          {item.isRegistered ? `@${item.pseudo}` : 'Tap to invite'}
                        </Text>
                      </View>
                      
                      <Text style={styles.phoneText}>
                        {item.phone}
                      </Text>
                    </View>
                    
                    {/* Right Side */}
                    <View style={styles.rightSection}>
                      {unreadCounts[item.id] > 0 && (
                        <View style={styles.unreadBadge}>
                          <Text style={styles.unreadText}>
                            {unreadCounts[item.id]}
                          </Text>
                        </View>
                      )}
                      <Ionicons 
                        name="chevron-forward" 
                        size={20} 
                        color="#C4C4C4" 
                        style={{ marginTop: 4 }}
                      />
                    </View>
                  </View>
                </TouchableHighlight>
              )}
            />
            
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
        fontSize: 28,
        fontWeight: "bold",
        color: "#25D366",
        textAlign: "center",
        textShadowColor: "rgba(0, 0, 0, 0.3)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,  
        padding: 15,
        marginBottom: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 25,
        marginHorizontal: 20,
        overflow: 'hidden'
    },
    image: {    
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        width: '100%',
        height: '100%',
        paddingTop: 50
    },
    contactCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 12,
        marginVertical: 4,
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2
    },
    profilePictureContainer: {
        position: 'relative',
        marginRight: 12
    },
    profilePicture: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#25D366',
        justifyContent: 'center',
        alignItems: 'center'
    },
    profileInitials: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold'
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#4CAF50',
        borderWidth: 2,
        borderColor: 'white'
    },
    contactInfo: {
        flex: 1
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2
    },
    contactName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000000'
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2
    },
    statusText: {
        fontSize: 14,
        fontWeight: '500'
    },
    phoneText: {
        fontSize: 13,
        color: '#667781'
    },
    rightSection: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    unreadBadge: {
        backgroundColor: '#25D366',
        borderRadius: 12,
        minWidth: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 8,
        marginBottom: 4
    },
    unreadText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold'
    },
    layout: {
        position: 'absolute',
        bottom: 30,
        width: '90%',
    },
    logoutButton: {
        width: '100%',
        height: 50,
        backgroundColor: '#25D366',
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4
    },
    logoutContent: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        marginLeft: 8
    }
});
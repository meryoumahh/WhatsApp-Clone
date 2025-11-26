import { View, Text, FlatList, TouchableHighlight } from 'react-native'
import React, { useState, useEffect } from 'react'
import { StatusBar } from 'expo-status-bar'
import { ImageBackground, StyleSheet } from 'react-native'
import initapp from '../Config';

export default function List(props) {
    const auth = initapp.auth();
  const [data, setData] = useState([]);
  const database = initapp.database();

  const ref = database.ref();
  const ref_list = ref.child("profils");

  useEffect(() => {
    getallprofil();
    return () => {
      ref_list.off(); // Clean up listener
    };
  }, []);

  function getallprofil() {
    ref_list.on("value", (snapshot) => { 
      let profileData = [];
      snapshot.forEach((child) => {
        const profile = child.val();
        if (profile) {
          profileData.push({
            id: profile.id,
            nom: profile.nom,
            prenom: profile.prenom,
            phone: profile.phone, // Changed from numero to phone
            image: profile.image, // Changed from url_img to image
          });
        }
      });
      setData(profileData);
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
                <View style={{
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  margin: 10,
                  padding: 15,
                  borderRadius: 10,
                }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
                    {item.nom} {item.prenom}
                  </Text>
                  <Text style={{ fontSize: 16, color: '#666' }}>
                    {item.phone}
                  </Text>
                </View>
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
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    layout: {
        position: 'absolute',
        bottom: 50,
        width: '80%',
    },  
});
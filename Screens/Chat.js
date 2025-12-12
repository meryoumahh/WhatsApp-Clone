import { View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ImageBackground, Modal, ScrollView, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import initapp, { supabase } from '../Config';

const database = initapp.database();
const ref_all_chat = database.ref('ALL_CHAT');

export default function Chat(props) {
    const currentid = props.route?.params?.currentid || initapp.auth().currentUser?.uid; 
    const secondid = props.route?.params?.secondid;
    const isUnregistered = props.route?.params?.isUnregistered || false;

    if (!currentid || !secondid) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Error: Missing user information</Text>
            </View>
        );
    }

    const chatid = [currentid, secondid].sort().join('_');
    const ref_chat = ref_all_chat.child(chatid);
    const ref_discussion = ref_chat.child('discussion');
    const ref_typing = ref_chat.child('typing');
    const ref_settings = ref_chat.child('settings');

    console.log('Chat IDs:', { currentid, secondid, chatid });

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isOtherTyping, setIsOtherTyping] = useState(false);
    const [typingTimeout, setTypingTimeout] = useState(null);
    const [otherUserName, setOtherUserName] = useState('');
    const [chatBackground, setChatBackground] = useState('#E5DDD5');
    const [backgroundType, setBackgroundType] = useState('color');
    const [showBackgroundModal, setShowBackgroundModal] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const backgroundOptions = [
        { id: 'default', color: '#E5DDD5', name: 'Default' },
        { id: 'blue', color: '#E3F2FD', name: 'Light Blue' },
        { id: 'green', color: '#E8F5E8', name: 'Light Green' },
        { id: 'pink', color: '#FCE4EC', name: 'Light Pink' },
        { id: 'purple', color: '#F3E5F5', name: 'Light Purple' },
        { id: 'dark', color: '#424242', name: 'Dark Gray' }
    ];

    useEffect(() => {
        console.log('Setting up Firebase listener for:', chatid);
        
        const listener = ref_discussion.on('value', (snapshot) => {
            console.log('Firebase snapshot received:', snapshot.exists());
            let data = [];
            
            if (snapshot.exists()) {
                snapshot.forEach((one_msg) => {
                    const msgData = one_msg.val();
                    console.log('Message data:', msgData);
                    
                    // Filter out deleted messages
                    const deletedFor = msgData.deletedFor || [];
                    const deletedForEveryone = msgData.deletedForEveryone || false;
                    
                    // Skip if deleted for everyone or deleted for current user
                    if (!deletedForEveryone && !deletedFor.includes(currentid)) {
                        data.push({
                            id: msgData.idmsg,
                            text: msgData.message,
                            sender: msgData.sender === currentid ? 'me' : (msgData.sender === 'system' ? 'system' : 'other'),
                            time: msgData.time,
                            senderId: msgData.sender,
                            isInviteMessage: msgData.isInviteMessage || false
                        });
                    }
                });
            } else if (isUnregistered) {
                // If no messages exist for unregistered contact, create invite message
                data.push({
                    id: 'invite_msg',
                    text: 'Invite this user to use our app',
                    sender: 'system',
                    time: new Date().toLocaleTimeString(),
                    senderId: 'system',
                    isInviteMessage: true
                });
            }
            
            console.log('Setting messages:', data.length);
            setMessages(data);
        });
        
        // Get other user's name
        if (isUnregistered) {
            // For unregistered contacts, get name from current user's contacts
            database.ref(`users/${currentid}/contacts/${secondid}`).once('value')
                .then((snapshot) => {
                    const contactData = snapshot.val();
                    if (contactData) {
                        setOtherUserName(contactData.name || 'Contact');
                    }
                });
        } else {
            database.ref('users/' + secondid).once('value')
                .then((snapshot) => {
                    const userData = snapshot.val();
                    if (userData) {
                        setOtherUserName(userData.prenom || userData.pseudo || 'User');
                    }
                });
        }

        // Listen for typing status
        const typingListener = ref_typing.on('value', (snapshot) => {
            const typingData = snapshot.val();
            if (typingData && typingData[secondid]) {
                setIsOtherTyping(true);
            } else {
                setIsOtherTyping(false);
            }
        });

        // Listen for background changes
        const backgroundListener = ref_settings.on('value', (snapshot) => {
            const settingsData = snapshot.val();
            if (settingsData && settingsData.background) {
                setChatBackground(settingsData.background);
                setBackgroundType(settingsData.type || 'color');
            }
        });

        // Mark messages as read when chat opens
        ref_discussion.once('value', (snapshot) => {
            let hasUnreadMessages = false;
            snapshot.forEach((child) => {
                const msg = child.val();
                if (msg.sender === secondid && msg.read === false) {
                    child.ref.update({ read: true });
                    hasUnreadMessages = true;
                }
            });
            
            // Reset unread counter if there were unread messages
            if (hasUnreadMessages) {
                database.ref(`users/${currentid}/unreadMessages/${secondid}`).set(0);
            }
        });

        // Update last interaction when chat is opened
        const timestamp = Date.now();
        database.ref(`users/${currentid}/lastInteraction/${secondid}`).set(timestamp);

        return () => {
            console.log('Cleaning up Firebase listener');
            ref_discussion.off('value', listener);
            ref_typing.off('value', typingListener);
            ref_settings.off('value', backgroundListener);
        };
    }, [chatid, currentid]);

  const sendMessage = () => {
    if (isUnregistered) {
        Alert.alert(
            'Cannot Send Message',
            'This contact is not registered. Please invite them to use the app first.',
            [{ text: 'OK' }]
        );
        return;
    }
    
    if (input.trim().length > 0) {
        console.log('Sending message:', input);
        console.log('Chat path:', `ALL_CHAT/${chatid}/discussion`);
        
        const key = ref_discussion.push().key;
        const ref_msg = ref_discussion.child(key);
        
        const messageData = {
            idmsg: key,
            sender: currentid,
            receiver: secondid,
            time: new Date().toLocaleTimeString(),
            message: input,
            read: false
        };
        
        console.log('Message data to save:', messageData);
        
        ref_msg.set(messageData)
            .then(() => {
                console.log('Message saved successfully');
                // Increment unread counter for receiver
                database.ref(`users/${secondid}/unreadMessages/${currentid}`)
                    .transaction(count => (count || 0) + 1);
                
                // Update last interaction timestamps
                const timestamp = Date.now();
                database.ref(`users/${currentid}/lastInteraction/${secondid}`).set(timestamp);
                database.ref(`users/${secondid}/lastInteraction/${currentid}`).set(timestamp);
            })
            .catch((error) => {
                console.error('Error saving message:', error);
            });
      
      setInput('');
      stopTyping();
    }
  }

  const handleTyping = () => {
    // Set typing status
    ref_typing.child(currentid).set(true);
    
    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Set new timeout to stop typing after 2 seconds
    const timeout = setTimeout(() => {
      stopTyping();
    }, 2000);
    
    setTypingTimeout(timeout);
  }

  const stopTyping = () => {
    ref_typing.child(currentid).remove();
    if (typingTimeout) {
      clearTimeout(typingTimeout);
      setTypingTimeout(null);
    }
  }

  const uploadImageToSupabase = async (localUri) => {
    try {
      const fileName = `${chatid}_${Date.now()}.jpg`;
      
      // Create form data for React Native
      const formData = new FormData();
      formData.append('file', {
        uri: localUri,
        type: 'image/jpeg',
        name: fileName,
      });
      
      const { error } = await supabase.storage
        .from('imageProfile')
        .upload(fileName, formData, {
          contentType: 'image/jpeg',
          upsert: true
        });
      
      if (error) {
        console.error('Upload error:', error);
        return null;
      }
      
      const { data } = supabase.storage
        .from('imageProfile')
        .getPublicUrl(fileName);
      
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  }

  const changeBackground = (background, type = 'color') => {
    ref_settings.set({
      background: background,
      type: type,
      lastChangedBy: currentid,
      timestamp: new Date().toISOString()
    });
    setShowBackgroundModal(false);
  }

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [9, 16],
        quality: 0.5,
      });

      if (!result.canceled) {
        setUploadingImage(true);
        const publicUrl = await uploadImageToSupabase(result.assets[0].uri);
        
        if (publicUrl) {
          changeBackground(publicUrl, 'image');
        } else {
          Alert.alert('Error', 'Failed to upload image. Please try again.');
        }
        
        setUploadingImage(false);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      setUploadingImage(false);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  }

  const deleteForMe = (messageId) => {
    const ref_msg = ref_discussion.child(messageId);
    ref_msg.once('value', (snapshot) => {
      const msgData = snapshot.val();
      if (msgData) {
        const deletedFor = msgData.deletedFor || [];
        if (!deletedFor.includes(currentid)) {
          deletedFor.push(currentid);
          ref_msg.update({ deletedFor });
        }
      }
    });
    setShowDeleteModal(false);
    setSelectedMessage(null);
  }

  const deleteForEveryone = (messageId) => {
    const ref_msg = ref_discussion.child(messageId);
    ref_msg.update({ deletedForEveryone: true });
    setShowDeleteModal(false);
    setSelectedMessage(null);
  }

  const handleLongPress = (message) => {
    setSelectedMessage(message);
    setShowDeleteModal(true);
  }

  const renderMessage = ({ item }) => (
    <TouchableOpacity
      onLongPress={() => !item.isInviteMessage && handleLongPress(item)}
      style={{
        alignSelf: item.sender === 'me' ? 'flex-end' : (item.sender === 'system' ? 'center' : 'flex-start'),
        backgroundColor: selectedMessage?.id === item.id ? '#E0E0E0' : 
          (item.sender === 'system' ? '#FFF3E0' : 
           (item.sender === 'me' ? 'gray' : '#FFFFFF')),
        padding: 10,
        marginVertical: 2,
        marginHorizontal: 10,
        borderRadius: 10,
        maxWidth: item.sender === 'system' ? '90%' : '80%',
        elevation: 1,
        borderWidth: item.isInviteMessage ? 1 : 0,
        borderColor: item.isInviteMessage ? '#FF9800' : 'transparent'
      }}
    >
      <Text style={{ 
        fontSize: 16, 
        color: item.isInviteMessage ? '#FF9800' : '#000',
        fontStyle: item.isInviteMessage ? 'italic' : 'normal',
        textAlign: item.sender === 'system' ? 'center' : 'left'
      }}>
        {item.text}
      </Text>
      <Text style={{ 
        fontSize: 12, 
        color: '#666', 
        alignSelf: item.sender === 'system' ? 'center' : 'flex-end', 
        marginTop: 5 
      }}>
        {item.time}
      </Text>
    </TouchableOpacity>
  )

  return (
    backgroundType === 'image' ? (
      <ImageBackground source={{ uri: chatBackground }} style={{ flex: 1 }} resizeMode="cover">
        <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.1)' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', padding: 10, backgroundColor: 'rgba(255,255,255,0.9)' }}>
        <TouchableOpacity onPress={() => setShowBackgroundModal(true)}>
          <Ionicons name="color-palette" size={24} color="#666" />
        </TouchableOpacity>
      </View>
      
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        style={{ flex: 1, paddingTop: 10 }}
      />
      
      {isOtherTyping && (
        <View style={{
          paddingHorizontal: 15,
          paddingVertical: 8,
          alignItems: 'flex-start'
        }}>
          <View style={{
            backgroundColor: '#F0F0F0',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 15,
            alignSelf: 'flex-start'
          }}>
            <Text style={{ fontSize: 13, color: '#666', fontStyle: 'italic' }}>
              {otherUserName} is typing...
            </Text>
          </View>
        </View>
      )}
      
      <View style={{
        flexDirection: 'row',
        padding: 10,
        paddingBottom: 50,
        backgroundColor: '#FFFFFF',
        alignItems: 'center'
      }}>
        <TextInput
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: '#DDD',
            borderRadius: 25,
            paddingHorizontal: 15,
            paddingVertical: 10,
            marginRight: 10,
            backgroundColor: isUnregistered ? '#F5F5F5' : '#FFFFFF'
          }}
          placeholder={isUnregistered ? "Contact not registered" : "Type a message..."}
          value={input}
          onChangeText={(text) => {
            if (!isUnregistered) {
              setInput(text);
              handleTyping();
            }
          }}
          editable={!isUnregistered}
          multiline
        />
        <TouchableOpacity
          onPress={sendMessage}
          style={{
            backgroundColor: isUnregistered ? '#CCC' : 'blue',
            borderRadius: 25,
            padding: 12
          }}
          disabled={isUnregistered}
        >
          <Ionicons name={isUnregistered ? "person-add" : "send"} size={20} color="white" />
        </TouchableOpacity>
      </View>
      </KeyboardAvoidingView>
      
      <Modal visible={showBackgroundModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center' }}>
          <View style={{ backgroundColor: 'white', margin: 20, borderRadius: 15, padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' }}>Choose Background</Text>
            <ScrollView>
              {backgroundOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => changeBackground(option.color)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 15,
                    borderRadius: 10,
                    marginVertical: 5,
                    backgroundColor: option.color === chatBackground ? '#E0E0E0' : 'transparent'
                  }}
                >
                  <View style={{
                    width: 30,
                    height: 30,
                    backgroundColor: option.color,
                    borderRadius: 15,
                    marginRight: 15,
                    borderWidth: 1,
                    borderColor: '#DDD'
                  }} />
                  <Text style={{ fontSize: 16 }}>{option.name}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                onPress={pickImage}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 15,
                  borderRadius: 10,
                  marginVertical: 5,
                  backgroundColor: '#F0F0F0'
                }}
              >
                <Ionicons name="image" size={24} color="#666" style={{ marginRight: 15 }} />
                <Text style={{ fontSize: 16 }}>Choose from Gallery</Text>
              </TouchableOpacity>
            </ScrollView>
            <TouchableOpacity
              onPress={() => setShowBackgroundModal(false)}
              style={{ backgroundColor: '#666', padding: 12, borderRadius: 8, marginTop: 15 }}
            >
              <Text style={{ color: 'white', textAlign: 'center', fontSize: 16 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      <Modal visible={showDeleteModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center' }}>
          <View style={{ backgroundColor: 'white', margin: 20, borderRadius: 15, padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' }}>Delete Message</Text>
            
            <TouchableOpacity
              onPress={() => deleteForMe(selectedMessage?.id)}
              style={{
                padding: 15,
                borderRadius: 10,
                marginVertical: 5,
                backgroundColor: '#F0F0F0'
              }}
            >
              <Text style={{ fontSize: 16, textAlign: 'center' }}>Delete for Me</Text>
            </TouchableOpacity>
            
            {selectedMessage?.sender === 'me' && (
              <TouchableOpacity
                onPress={() => deleteForEveryone(selectedMessage?.id)}
                style={{
                  padding: 15,
                  borderRadius: 10,
                  marginVertical: 5,
                  backgroundColor: '#FFE0E0'
                }}
              >
                <Text style={{ fontSize: 16, textAlign: 'center', color: '#D32F2F' }}>Delete for Everyone</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              onPress={() => {
                setShowDeleteModal(false);
                setSelectedMessage(null);
              }}
              style={{ backgroundColor: '#666', padding: 12, borderRadius: 8, marginTop: 15 }}
            >
              <Text style={{ color: 'white', textAlign: 'center', fontSize: 16 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
        </View>
      </ImageBackground>
    ) : (
      <View style={{ flex: 1, backgroundColor: chatBackground }}>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', padding: 10, backgroundColor: 'rgba(255,255,255,0.9)' }}>
          <TouchableOpacity onPress={() => setShowBackgroundModal(true)}>
            <Ionicons name="color-palette" size={24} color="#666" />
          </TouchableOpacity>
        </View>
        
        <KeyboardAvoidingView 
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          style={{ flex: 1, paddingTop: 10 }}
        />
        
        {isOtherTyping && (
          <View style={{
            paddingHorizontal: 15,
            paddingVertical: 8,
            alignItems: 'flex-start'
          }}>
            <View style={{
              backgroundColor: '#F0F0F0',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 15,
              alignSelf: 'flex-start'
            }}>
              <Text style={{ fontSize: 13, color: '#666', fontStyle: 'italic' }}>
                {otherUserName} is typing...
              </Text>
            </View>
          </View>
        )}
        
        <View style={{
          flexDirection: 'row',
          padding: 10,
          paddingBottom: 50,
          backgroundColor: '#FFFFFF',
          alignItems: 'center'
        }}>
          <TextInput
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: '#DDD',
              borderRadius: 25,
              paddingHorizontal: 15,
              paddingVertical: 10,
              marginRight: 10,
              backgroundColor: '#FFFFFF'
            }}
            placeholder="Type a message..."
            value={input}
            onChangeText={(text) => {
              setInput(text);
              handleTyping();
            }}
            multiline
          />
          <TouchableOpacity
            onPress={sendMessage}
            style={{
              backgroundColor: 'blue',
              borderRadius: 25,
              padding: 12
            }}
          >
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
        </KeyboardAvoidingView>
        
        <Modal visible={showBackgroundModal} transparent animationType="slide">
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center' }}>
            <View style={{ backgroundColor: 'white', margin: 20, borderRadius: 15, padding: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' }}>Choose Background</Text>
              <ScrollView>
                {backgroundOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    onPress={() => changeBackground(option.color)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 15,
                      borderRadius: 10,
                      marginVertical: 5,
                      backgroundColor: option.color === chatBackground ? '#E0E0E0' : 'transparent'
                    }}
                  >
                    <View style={{
                      width: 30,
                      height: 30,
                      backgroundColor: option.color,
                      borderRadius: 15,
                      marginRight: 15,
                      borderWidth: 1,
                      borderColor: '#DDD'
                    }} />
                    <Text style={{ fontSize: 16 }}>{option.name}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  onPress={pickImage}
                  disabled={uploadingImage}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 15,
                    borderRadius: 10,
                    marginVertical: 5,
                    backgroundColor: uploadingImage ? '#E0E0E0' : '#F0F0F0'
                  }}
                >
                  <Ionicons name="image" size={24} color="#666" style={{ marginRight: 15 }} />
                  <Text style={{ fontSize: 16 }}>
                    {uploadingImage ? 'Uploading...' : 'Choose from Gallery'}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
              <TouchableOpacity
                onPress={() => setShowBackgroundModal(false)}
                style={{ backgroundColor: '#666', padding: 12, borderRadius: 8, marginTop: 15 }}
              >
                <Text style={{ color: 'white', textAlign: 'center', fontSize: 16 }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        
        <Modal visible={showDeleteModal} transparent animationType="fade">
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center' }}>
            <View style={{ backgroundColor: 'white', margin: 20, borderRadius: 15, padding: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' }}>Delete Message</Text>
              
              <TouchableOpacity
                onPress={() => deleteForMe(selectedMessage?.id)}
                style={{
                  padding: 15,
                  borderRadius: 10,
                  marginVertical: 5,
                  backgroundColor: '#F0F0F0'
                }}
              >
                <Text style={{ fontSize: 16, textAlign: 'center' }}>Delete for Me</Text>
              </TouchableOpacity>
              
              {selectedMessage?.sender === 'me' && (
                <TouchableOpacity
                  onPress={() => deleteForEveryone(selectedMessage?.id)}
                  style={{
                    padding: 15,
                    borderRadius: 10,
                    marginVertical: 5,
                    backgroundColor: '#FFE0E0'
                  }}
                >
                  <Text style={{ fontSize: 16, textAlign: 'center', color: '#D32F2F' }}>Delete for Everyone</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                onPress={() => {
                  setShowDeleteModal(false);
                  setSelectedMessage(null);
                }}
                style={{ backgroundColor: '#666', padding: 12, borderRadius: 8, marginTop: 15 }}
              >
                <Text style={{ color: 'white', textAlign: 'center', fontSize: 16 }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    )
  )
}
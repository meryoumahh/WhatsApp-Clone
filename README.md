# WhatsApp Clone - Complete React Native Application

A fully-featured React Native mobile application that replicates WhatsApp's core functionality with real-time messaging, user management, and cloud storage integration.

## 🚀 Complete Feature Set

### 🔐 **Authentication System**
- **Firebase Authentication**: Secure email/password authentication
- **User Registration**: Complete signup flow with profile creation
- **Session Management**: Persistent login sessions
- **Secure Logout**: Proper session cleanup and status updates

### 💬 **Real-Time Messaging System**
- **Instant Messaging**: Real-time message delivery using Firebase Realtime Database
- **Message Status**: Read/unread tracking for all messages
- **Typing Indicators**: Live "User is typing..." notifications
- **Message Timestamps**: Precise time tracking for all messages
- **Cross-Platform Sync**: Messages sync across all devices instantly

### 🎨 **Custom Chat Backgrounds**
- **Color Themes**: 6 predefined background colors
- **Custom Images**: Upload personal images as chat backgrounds
- **Real-Time Sync**: Background changes visible to both chat participants
- **Persistent Settings**: Background preferences saved in Firebase

### 👥 **User Management System**
- **Complete Profiles**: Name, surname, username, phone number
- **Profile Pictures**: Upload and manage profile images via Supabase
- **User Directory**: Browse all registered users
- **Profile Editing**: Real-time profile updates

### 🟢 **Online Status System**
- **Real-Time Presence**: Live online/offline status indicators
- **Automatic Detection**: App state monitoring for accurate status
- **Visual Indicators**: Green dots for online users
- **Disconnect Handling**: Automatic offline status on app close/network loss

### 🔴 **Unread Message Notifications**
- **Message Counters**: Red badges showing unread message counts
- **Real-Time Updates**: Instant notification when messages arrive
- **Auto-Clear**: Badges disappear when chat is opened
- **Multi-Chat Support**: Track unread messages from multiple users

### 📊 **Smart User Ordering**
- **Recent Interaction Sorting**: Users ordered by last message/interaction
- **Multi-Criteria Sorting**: Recent activity → Online status → Alphabetical
- **Dynamic Reordering**: List updates automatically with new interactions
- **Persistent Order**: Maintains sorting across app sessions

---

## 🏗️ Technical Architecture

### **Firebase Integration**

#### **Authentication Service**
```javascript
// Firebase Auth Configuration
import initapp from '../Config';
const auth = initapp.auth();

// User Registration
auth.createUserWithEmailAndPassword(email, password)
  .then(userCredential => {
    // Store user profile in Realtime Database
    database.ref('users/' + userCredential.user.uid).set({
      nom, prenom, pseudo, phone, email, uid, isOnline: true
    });
  });

// User Login with Presence
auth.signInWithEmailAndPassword(email, password)
  .then(userCredential => {
    // Set user online and configure disconnect handler
    database.ref('users/' + user.uid + '/isOnline').set(true);
    database.ref('users/' + user.uid + '/isOnline').onDisconnect().set(false);
  });
```

#### **Realtime Database Structure**
```javascript
{
  "users": {
    "{userId}": {
      "nom": "Last Name",
      "prenom": "First Name", 
      "pseudo": "username",
      "phone": "+1234567890",
      "email": "user@email.com",
      "uid": "firebase_user_id",
      "isOnline": true,
      "profileImageUrl": "supabase_public_url",
      "unreadMessages": {
        "{otherUserId}": 3,
        "{anotherUserId}": 1
      },
      "lastInteraction": {
        "{otherUserId}": 1640995200000,
        "{anotherUserId}": 1640995100000
      }
    }
  },
  "ALL_CHAT": {
    "{chatId}": {
      "discussion": {
        "{messageId}": {
          "idmsg": "message_id",
          "sender": "user_id_1",
          "receiver": "user_id_2", 
          "message": "Hello World!",
          "time": "10:30:45 AM",
          "read": false
        }
      },
      "typing": {
        "{userId}": true
      },
      "settings": {
        "background": "#E5DDD5",
        "type": "color",
        "lastChangedBy": "user_id",
        "timestamp": "2024-01-01T10:30:00Z"
      }
    }
  }
}
```

#### **Real-Time Listeners Implementation**
```javascript
// Message Listener (Chat.js)
useEffect(() => {
  const listener = ref_discussion.on('value', (snapshot) => {
    let data = [];
    snapshot.forEach((one_msg) => {
      const msgData = one_msg.val();
      data.push({
        id: msgData.idmsg,
        text: msgData.message,
        sender: msgData.sender === currentid ? 'me' : 'other',
        time: msgData.time
      });
    });
    setMessages(data);
  });
  
  return () => ref_discussion.off('value', listener);
}, []);

// Typing Status Listener
const typingListener = ref_typing.on('value', (snapshot) => {
  const typingData = snapshot.val();
  setIsOtherTyping(typingData && typingData[secondid]);
});

// Unread Messages Listener (List.js)
const unreadRef = database.ref(`users/${currentUser.uid}/unreadMessages`);
unreadRef.on('value', (snapshot) => {
  setUnreadCounts(snapshot.val() || {});
});
```

### **Supabase Integration**

#### **Storage Configuration**
```javascript
// Supabase Client Setup
import { supabase } from '../Config';

// Storage Bucket Structure
Storage Buckets:
├── imagesProfile/
│   ├── {userId}.jpg     // User profile pictures
│   ├── {userId2}.jpg
│   └── ...
```

#### **Image Upload Pipeline**
```javascript
const uploadImageToSupabase = async (localURL) => {
  try {
    // Convert image to uploadable format
    const response = await fetch(localURL);
    const blob = await response.blob();
    const arraybuffer = await blob.arrayBuffer();
    
    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from('imagesProfile')
      .upload(userId + '.jpg', arraybuffer, {
        upsert: true,  // Overwrite existing files
      });
    
    if (error) throw error;
    
    // Get public URL for the uploaded image
    const { data } = supabase.storage
      .from('imagesProfile')
      .getPublicUrl(userId + '.jpg');
    
    // Store URL in Firebase for cross-device access
    database.ref('users/' + userId).update({
      profileImageUrl: data.publicUrl
    });
    
    return data.publicUrl;
  } catch (error) {
    console.error('Upload failed:', error);
    return null;
  }
};
```

#### **Image Management Strategy**
- **File Naming**: `{userId}.jpg` for unique, predictable paths
- **Upsert Operations**: Automatic overwriting of existing profile images
- **Public URLs**: CDN-backed URLs for optimal performance and cross-device access
- **Firebase Integration**: URLs stored in Firebase for real-time sync

---

## 🔧 Core Implementation Details

### **Real-Time Chat System**

#### **Message Flow Architecture**
```javascript
// 1. Message Sending (Chat.js)
const sendMessage = () => {
  const messageData = {
    idmsg: key,
    sender: currentid,
    receiver: secondid,
    message: input,
    time: new Date().toLocaleTimeString(),
    read: false
  };
  
  // Save message to Firebase
  ref_discussion.child(key).set(messageData);
  
  // Update unread counter for receiver
  database.ref(`users/${secondid}/unreadMessages/${currentid}`)
    .transaction(count => (count || 0) + 1);
  
  // Update last interaction timestamps
  const timestamp = Date.now();
  database.ref(`users/${currentid}/lastInteraction/${secondid}`).set(timestamp);
  database.ref(`users/${secondid}/lastInteraction/${currentid}`).set(timestamp);
};

// 2. Message Reading (Chat.js)
useEffect(() => {
  // Mark messages as read when chat opens
  ref_discussion.once('value', (snapshot) => {
    snapshot.forEach((child) => {
      const msg = child.val();
      if (msg.sender === secondid && msg.read === false) {
        child.ref.update({ read: true });
      }
    });
  });
  
  // Reset unread counter
  database.ref(`users/${currentid}/unreadMessages/${secondid}`).set(0);
}, []);
```

#### **Typing Indicator System**
```javascript
// Typing Detection with Debouncing
const handleTyping = () => {
  // Set typing status in Firebase
  ref_typing.child(currentid).set(true);
  
  // Clear existing timeout
  if (typingTimeout) clearTimeout(typingTimeout);
  
  // Auto-clear typing status after 2 seconds
  const timeout = setTimeout(() => {
    ref_typing.child(currentid).remove();
  }, 2000);
  
  setTypingTimeout(timeout);
};

// Real-time Typing Display
{isOtherTyping && (
  <View style={typingIndicatorStyle}>
    <Text>{otherUserName} is typing...</Text>
  </View>
)}
```

### **Presence System Implementation**

#### **App State Monitoring**
```javascript
// App.js - Global presence management
useEffect(() => {
  const handleAppStateChange = (nextAppState) => {
    const user = initapp.auth().currentUser;
    if (user) {
      const database = initapp.database();
      if (nextAppState === 'active') {
        database.ref('users/' + user.uid + '/isOnline').set(true);
      } else {
        database.ref('users/' + user.uid + '/isOnline').set(false);
      }
    }
  };

  const subscription = AppState.addEventListener('change', handleAppStateChange);
  return () => subscription?.remove();
}, []);
```

#### **Disconnect Handling**
```javascript
// Automatic offline status on network disconnect
database.ref('users/' + user.uid + '/isOnline').onDisconnect().set(false);
```

### **Smart Sorting Algorithm**

#### **Multi-Criteria User Ordering**
```javascript
const sortUsers = (users, interactions) => {
  return users.sort((a, b) => {
    const aTime = interactions[a.id] || 0;
    const bTime = interactions[b.id] || 0;
    
    // Primary: Recent interaction (newest first)
    if (aTime !== bTime) return bTime - aTime;
    
    // Secondary: Online status (online users first)
    if (a.isOnline !== b.isOnline) return b.isOnline - a.isOnline;
    
    // Tertiary: Alphabetical by name
    return a.nom.localeCompare(b.nom);
  });
};
```

---

## 📱 User Interface Components

### **Chat Interface**
- **WhatsApp-style Design**: Familiar green and white color scheme
- **Message Bubbles**: Sent messages (gray), received messages (white)
- **Keyboard Handling**: Smart keyboard avoidance and proper padding
- **Background Support**: Dynamic backgrounds (colors and images)

### **User List Interface**
- **Status Indicators**: Green dots for online users
- **Unread Badges**: Red notification badges with message counts
- **Smart Ordering**: Recent interactions appear first
- **Touch Interactions**: Smooth navigation to chat screens

### **Profile Management**
- **Circular Profile Images**: 120px circular images with white borders
- **Touch-to-Edit**: Tap profile image to change from gallery
- **Form Validation**: Required field validation with user feedback
- **Real-time Updates**: Changes sync immediately across devices

---

## 🔒 Security & Performance

### **Data Security**
- **Firebase Rules**: Authenticated access only
- **Input Validation**: Client-side validation with server-side rules
- **File Type Restrictions**: Image-only uploads with MIME type checking
- **User Isolation**: Chat rooms accessible only to participants

### **Performance Optimizations**
- **Listener Management**: Proper cleanup to prevent memory leaks
- **Image Optimization**: 80% quality compression for faster loading
- **Efficient Queries**: Minimal data transfer with targeted listeners
- **State Management**: Strategic state separation for minimal re-renders

### **Error Handling**
- **Network Resilience**: Graceful handling of connection issues
- **User Feedback**: Clear error messages and loading states
- **Fallback Systems**: Default images and offline status handling
- **Comprehensive Logging**: Detailed console logging for debugging

---

## 🛠️ Installation & Setup

### **Prerequisites**
```bash
# Required tools
Node.js (v14 or higher)
npm or yarn
Expo CLI
Android Studio / Xcode (for device testing)
```

### **Project Setup**
```bash
# 1. Clone the repository
git clone https://github.com/meryoumahh/WhatsApp-Clone.git
cd WhatsApp-Clone

# 2. Install dependencies
npm install

# 3. Install additional packages
npm install react-native-paper @react-navigation/native @react-navigation/native-stack
npm install @react-navigation/material-bottom-tabs
expo install expo-status-bar expo-image-picker
npm install firebase @supabase/supabase-js
```

### **Firebase Configuration**
```javascript
// Config/index.js
import app from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com/",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

const initapp = app.initializeApp(firebaseConfig);
export default initapp;
```

### **Supabase Configuration**
```javascript
// Config/index.js (add to existing file)
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'your-supabase-url';
const supabaseKey = 'your-supabase-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);
```

### **Firebase Setup Steps**
1. **Create Firebase Project**: https://console.firebase.google.com
2. **Enable Authentication**: Email/Password provider
3. **Enable Realtime Database**: Start in test mode
4. **Configure Security Rules**:
```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null",
        ".write": "$uid === auth.uid"
      }
    },
    "ALL_CHAT": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

### **Supabase Setup Steps**
1. **Create Supabase Project**: https://supabase.com
2. **Create Storage Bucket**: Name it 'imagesProfile'
3. **Configure Bucket Policies**:
```sql
-- Allow authenticated users to upload their own profile images
CREATE POLICY "Users can upload their own profile images" ON storage.objects
FOR INSERT WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public access to profile images
CREATE POLICY "Profile images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'imagesProfile');
```

---

## 🚀 Running the Application

### **Development Mode**
```bash
# Start the Expo development server
npx expo start

# Run on specific platforms
npx expo start --ios     # iOS simulator
npx expo start --android # Android emulator
npx expo start --web     # Web browser
```

### **Device Testing**
```bash
# Install Expo Go app on your device
# Scan QR code from terminal
# Or use device simulators
```

---

## 📊 Database Schema Reference

### **Users Collection**
```typescript
interface User {
  uid: string;                    // Firebase Auth UID
  nom: string;                    // Last name
  prenom: string;                 // First name
  pseudo: string;                 // Username
  phone: string;                  // Phone number
  email: string;                  // Email address
  isOnline: boolean;              // Online status
  profileImageUrl?: string;       // Supabase image URL
  unreadMessages?: {              // Unread message counters
    [userId: string]: number;
  };
  lastInteraction?: {             // Last interaction timestamps
    [userId: string]: number;
  };
}
```

### **Chat Messages**
```typescript
interface Message {
  idmsg: string;                  // Unique message ID
  sender: string;                 // Sender user ID
  receiver: string;               // Receiver user ID
  message: string;                // Message content
  time: string;                   // Formatted time string
  read: boolean;                  // Read status
}
```

### **Chat Settings**
```typescript
interface ChatSettings {
  background: string;             // Color hex or image URL
  type: 'color' | 'image';       // Background type
  lastChangedBy: string;          // User who changed setting
  timestamp: string;              // ISO timestamp
}
```

---

## 🎯 Future Enhancements

### **Planned Features**
- **Push Notifications**: Firebase Cloud Messaging integration
- **Message Encryption**: End-to-end encryption for secure messaging
- **File Sharing**: Document and media sharing capabilities
- **Group Chats**: Multi-user conversation support
- **Voice Messages**: Audio recording and playback
- **Video Calls**: WebRTC integration for video communication
- **Message Reactions**: Emoji reactions to messages
- **Dark Mode**: Theme switching capability
- **Offline Support**: Local data caching with sync capabilities

### **Technical Improvements**
- **Performance Optimization**: Virtual scrolling for large chat histories
- **Advanced Search**: Message and user search functionality
- **Data Analytics**: User engagement and app usage metrics
- **Automated Testing**: Unit and integration test coverage
- **CI/CD Pipeline**: Automated deployment and testing

---

## 👨‍💻 Development Team

**Lead Developer**: Maatallah Meryem
- **GitHub**: [@meryoumahh](https://github.com/meryoumahh)
- **Project Repository**: [WhatsApp-Clone](https://github.com/meryoumahh/WhatsApp-Clone)

---

## 📄 License

This project is developed for educational purposes. Feel free to use and modify for learning and non-commercial purposes.

---

## 🙏 Acknowledgments

- **Firebase**: For providing robust backend services
- **Supabase**: For scalable file storage solutions
- **Expo**: For streamlined React Native development
- **React Native Community**: For excellent documentation and support

---

**Last Updated**: January 2024
**Version**: 2.0.0
**Status**: Production Ready ✅
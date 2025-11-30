# WhatsApp Clone - React Native App

A complete React Native mobile application featuring WhatsApp-inspired design with Firebase authentication, profile management, and real-time data synchronization.

## Features

### 🔐 Authentication
- **Firebase Authentication**: Secure user registration and login
- **Email/Password Authentication**: Standard email-based authentication
- **Form Validation**: Real-time input validation with user feedback
- **Beautiful UI**: Custom background with semi-transparent overlays
- **Responsive Design**: Keyboard-aware layout with automatic scrolling

### 👤 Profile Management
- **Add Profiles**: Create new user profiles with personal information
- **Image Selection**: Choose profile pictures from device gallery
- **Form Fields**: Name, surname, and phone number input
- **Firebase Storage**: Real-time data storage and retrieval

### 📋 Profile Listing
- **Real-time Updates**: Live profile list with Firebase listeners
- **Beautiful Cards**: Styled profile cards with user information
- **Logout Functionality**: Secure user logout with navigation
- **Background Design**: Consistent UI theme across screens

### 🎨 UI/UX Features
- **Material Design**: React Native Paper components
- **Custom Styling**: Rounded images, gradient overlays, custom buttons
- **Navigation**: Stack navigation between screens
- **Responsive Layout**: Adapts to different screen sizes
- **Keyboard Handling**: Smart keyboard avoidance and scrolling

## Tech Stack

- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and tools
- **Firebase**: Backend-as-a-Service for authentication and database
- **React Native Paper**: Material Design components
- **React Navigation**: Screen navigation management
- **Expo ImagePicker**: Device image selection
- **React Hooks**: Modern state management

## Project Structure

```
MaatallahMeryemWhatsApp/
├── App.js                    # Main app with navigation setup
├── Screens/
│   ├── Authentification.js  # Login/Register screen
│   ├── Add.js               # Add new profile screen
│   ├── List.js              # Profile list display
│   └── Accueil.js           # Home/Welcome screen
├── Config/
│   └── index.js             # Firebase configuration (gitignored)
├── assets/
│   ├── bg.jpg               # Background image
│   └── mitacs.jpg           # Default profile image
├── .gitignore               # Git ignore file
└── README.md                # Project documentation
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MaatallahMeryemWhatsApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Install required packages**
   ```bash
   npm install react-native-paper @react-navigation/native @react-navigation/native-stack
   expo install expo-status-bar expo-image-picker
   npm install firebase
   ```

4. **Firebase Setup**
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Authentication (Email/Password)
   - Enable Realtime Database
   - Create `Config/index.js` with your Firebase configuration:
   ```javascript
   import app from "firebase/compat/app";
   import "firebase/compat/auth";
   import "firebase/compat/database";
   
   const firebaseConfig = {
     // Your Firebase config
   };
   
   const initapp = app.initializeApp(firebaseConfig);
   export default initapp;
   ```

## Running the App

1. **Start the development server**
   ```bash
   npx expo start
   ```

2. **Run on device/simulator**
   - Scan QR code with Expo Go app (Android/iOS)
   - Press 'i' for iOS simulator
   - Press 'a' for Android emulator

## Key Components

### App.js
- Main application entry point with navigation setup
- Stack Navigator with all screens
- Paper Provider for Material Design components

### Authentification.js
- Firebase authentication (login/register)
- Keyboard-aware scrolling and responsive design
- Form validation with real-time feedback
- Navigation to home screen after successful auth

### Add.js
- Profile creation with image selection
- Firebase Realtime Database integration
- Form validation and data persistence
- Image picker functionality

### List.js
- Real-time profile listing from Firebase
- FlatList with custom styled cards
- Logout functionality
- Live data updates with Firebase listeners

### Accueil.js
- Home/Welcome screen
- Navigation hub to other screens

## Features Implementation

### Firebase Integration
- **Authentication**: `createUserWithEmailAndPassword` and `signInWithEmailAndPassword`
- **Realtime Database**: Live data sync with `ref.on('value')` listeners
- **Data Structure**: Organized profile storage under 'profils' node
- **Error Handling**: Comprehensive error catching and user feedback

### Responsive Design
- **KeyboardAvoidingView**: Platform-specific keyboard handling
- **ScrollView**: Flexible content scrolling with proper centering
- **Dynamic Sizing**: Adaptive layouts using percentages and flex
- **Image Handling**: Rounded profile images with fallback defaults

### Form Validation
- **Input Validation**: Email and password length requirements
- **Real-time Feedback**: Instant validation with user alerts
- **Field Management**: Proper state management for all form fields
- **Keyboard Types**: Appropriate keyboard types for different inputs

### UI/UX Enhancements
- **Material Design**: Consistent button and input styling
- **Visual Hierarchy**: Text shadows, overlays, and proper spacing
- **Loading States**: User feedback during async operations
- **Navigation Flow**: Smooth transitions between screens

## Dependencies

```json
{
  "expo": "~49.0.0",
  "react": "18.2.0",
  "react-native": "0.72.0",
  "react-native-paper": "^5.0.0",
  "@react-navigation/native": "^6.0.0",
  "@react-navigation/native-stack": "^6.0.0",
  "expo-status-bar": "~1.6.0",
  "expo-image-picker": "~14.0.0",
  "firebase": "^9.0.0"
}
```

## Firebase Database Structure

```json
{
  "profils": {
    "profil[key]": {
      "id": "unique_key",
      "nom": "Last Name",
      "prenom": "First Name",
      "phone": "Phone Number",
      "image": "image_uri_or_null"
    }
  }
}
```

## Development Notes

- **Modern React**: Functional components with Hooks (useState, useEffect, useRef)
- **Firebase Integration**: Real-time database with proper listener cleanup
- **Navigation**: Stack navigation with proper screen management
- **Image Handling**: Expo ImagePicker with aspect ratio and quality settings
- **Memory Management**: Proper cleanup of Firebase listeners to prevent leaks
- **Error Handling**: Comprehensive try-catch blocks and user feedback
- **Security**: Firebase config excluded from version control

## Security Considerations

- **Config Protection**: Firebase configuration is gitignored
- **Authentication**: Secure Firebase authentication implementation
- **Input Validation**: Client-side validation with server-side security rules
- **Data Privacy**: User data stored securely in Firebase

## Troubleshooting

### Common Issues
1. **Metro Cache**: Run `npx expo start --clear` if experiencing build issues
2. **Firebase Config**: Ensure Config/index.js is properly set up
3. **Image Picker**: Grant camera/gallery permissions on device
4. **Navigation**: Ensure all screens are registered in App.js

### Performance Tips
- Firebase listeners are cleaned up in useEffect cleanup
- Images are optimized with proper aspect ratios
- FlatList used for efficient list rendering
- Minimal re-renders with proper state management

## Recent Updates & New Features

### 🎯 For High School Students - What We Built Today:

#### **Real-Time Chat System**
Imagine texting your friends, but the app shows when they're typing! We built a chat system that works just like WhatsApp:

- **Instant Messaging**: Send and receive messages in real-time
- **Typing Indicators**: See "John is typing..." when your friend is writing a message
- **Message Bubbles**: Your messages appear on the right (gray), others on the left (white)
- **Time Stamps**: Every message shows what time it was sent

#### **Custom Chat Backgrounds**
Just like changing your phone wallpaper, but for each chat:

- **Color Themes**: Choose from 6 different background colors (blue, green, pink, etc.)
- **Custom Images**: Pick any photo from your gallery as the chat background
- **Shared Experience**: When you change the background, your chat partner sees it too!
- **Easy Switching**: Tap the palette icon to change backgrounds anytime

#### **Smart User System**
We created a proper signup system so everyone has their own account:

- **Complete Signup**: Enter your name, username, and phone number
- **User Directory**: See all other users in a list to start chatting
- **Profile Pictures**: Add your own photo that others can see
- **Secure Storage**: All your photos are safely stored in the cloud

#### **Profile Management**
Like having your own digital ID card:

- **Personal Info**: Store your first name, last name, username, and phone
- **Profile Photo**: Tap your picture to change it from your photo gallery
- **Edit Mode**: Switch between viewing and editing your information
- **Cloud Sync**: Your profile works on any device you log into

---

### 🔧 For Software Engineers - Technical Implementation:

#### **Real-Time Chat Architecture**

**Firebase Realtime Database Structure:**
```javascript
ALL_CHAT/
  {chatId}/                    // Sorted user IDs joined with '_'
    ├── discussion/
    │   ├── {messageId}/
    │   │   ├── idmsg: string
    │   │   ├── sender: userId
    │   │   ├── receiver: userId
    │   │   ├── message: string
    │   │   └── time: timestamp
    ├── typing/
    │   ├── {userId}: boolean    // Real-time typing status
    └── settings/
        ├── background: string   // Color hex or image URL
        ├── type: 'color'|'image'
        ├── lastChangedBy: userId
        └── timestamp: ISO string
```

**Key Technical Features:**
- **Deterministic Chat IDs**: `[userId1, userId2].sort().join('_')` ensures consistent room identification
- **Real-time Listeners**: Firebase `.on('value')` for live message updates
- **Typing Debouncing**: 2-second timeout mechanism for typing indicators
- **Memory Management**: Proper listener cleanup in `useEffect` return functions

#### **Background Synchronization System**

**Conditional Rendering Pattern:**
```javascript
backgroundType === 'image' ? (
  <ImageBackground source={{ uri: chatBackground }}>
    <ChatContent />
  </ImageBackground>
) : (
  <View style={{ backgroundColor: chatBackground }}>
    <ChatContent />
  </View>
)
```

**State Management:**
- **Background Type Tracking**: Separate state for `color` vs `image` backgrounds
- **Real-time Sync**: Firebase listeners update background for both users instantly
- **Fallback Handling**: Graceful degradation when image URLs fail to load

#### **User Authentication & Profile System**

**Enhanced Firebase Auth Integration:**
```javascript
// User registration with profile data
auth.createUserWithEmailAndPassword(email, password)
  .then(userCredential => {
    database.ref('users/' + userCredential.user.uid).set({
      nom, prenom, pseudo, phone, email, uid
    });
  });
```

**Profile Image Pipeline:**
1. **Image Selection**: Expo ImagePicker with 1:1 aspect ratio cropping
2. **Permission Handling**: `requestMediaLibraryPermissionsAsync()` for gallery access
3. **Cloud Storage**: Supabase Storage integration for scalable image hosting
4. **URL Management**: Public URLs stored in Firebase for cross-device access

#### **Supabase Integration Architecture**

**Image Upload Pipeline:**
```javascript
const uploadImageToSupabase = async (localURL) => {
  const response = await fetch(localURL);
  const blob = await response.blob();
  const arraybuffer = await blob.arrayBuffer();
  
  const { error } = await supabase.storage
    .from('imagesProfile')
    .upload(userId + '.jpg', arraybuffer, { upsert: true });
    
  const { data } = supabase.storage
    .from('imagesProfile')
    .getPublicUrl(userId + '.jpg');
    
  return data.publicUrl;
};
```

**Storage Strategy:**
- **Bucket Organization**: `imagesProfile` bucket for user avatars
- **File Naming**: `{userId}.jpg` for unique, predictable file paths
- **Upsert Operations**: Automatic overwriting of existing profile images
- **Public URL Generation**: CDN-backed URLs for optimal performance

#### **Navigation Architecture Updates**

**Stack vs Tab Navigation Pattern:**
```javascript
// Main Stack (App.js)
<Stack.Navigator>
  <Stack.Screen name="Authentification" />
  <Stack.Screen name="Signup" />           // New
  <Stack.Screen name="Accueil" />
  <Stack.Screen name="Chat" />             // New
</Stack.Navigator>

// Bottom Tabs (Accueil.js)
<Tab.Navigator>
  <Tab.Screen name="list" component={List} />
  <Tab.Screen name="Add" component={Add} />
  <Tab.Screen name="Profile" component={Myprofile} />
</Tab.Navigator>
```

**Parameter Passing Strategy:**
- **Chat Navigation**: `navigation.navigate('Chat', { currentid, secondid })`
- **User Context**: Proper user ID propagation through navigation params
- **Error Boundaries**: Validation for missing navigation parameters

#### **Performance Optimizations**

**Firebase Listener Management:**
- **Scoped Listeners**: Separate listeners for messages, typing, and settings
- **Cleanup Patterns**: Consistent `useEffect` cleanup to prevent memory leaks
- **Dependency Arrays**: Proper `useEffect` dependencies for re-render optimization

**Image Handling:**
- **Quality Optimization**: 80% quality for balance between size and clarity
- **Aspect Ratio Enforcement**: 1:1 cropping for consistent circular display
- **Conditional Loading**: Fallback to default assets when custom images unavailable

**State Management:**
- **Minimal Re-renders**: Strategic state separation (UI state vs data state)
- **Async State Handling**: Proper loading states for async operations
- **Error State Management**: Comprehensive error handling with user feedback

#### **Security Considerations**

**Data Validation:**
- **Input Sanitization**: Client-side validation with server-side Firebase rules
- **File Type Restrictions**: Image-only uploads with proper MIME type checking
- **Size Limitations**: Quality settings to prevent oversized uploads

**Access Control:**
- **Authenticated Uploads**: Supabase RLS policies for secure file operations
- **User Isolation**: Chat rooms accessible only to participants
- **Profile Privacy**: User data scoped to authenticated sessions

## Future Enhancements

- **Push Notifications**: Firebase Cloud Messaging integration
- **Message Encryption**: End-to-end encryption for secure messaging
- **File Sharing**: Document and media sharing capabilities
- **User Search**: Advanced search and filter functionality
- **Status Updates**: WhatsApp-style status features
- **Group Chats**: Multi-user conversation support
- **Dark Mode**: Theme switching capability
- **Offline Support**: Local data caching with sync capabilities
- **Message Reactions**: Emoji reactions to messages
- **Voice Messages**: Audio recording and playback
- **Video Calls**: WebRTC integration for video communication

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## Author

**Maatallah Meryem**
- GitHub: [@MaatallahMeryem](https://github.com/MaatallahMeryem)


## License

This project is for educational purposes. Feel free to use and modify for learning.



---

**Note**: Remember to set up your own Firebase project and update the configuration file before running the application.
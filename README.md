# WhatsApp Authentication App

A React Native mobile application featuring a WhatsApp-inspired authentication screen with a beautiful background image and responsive design.

## Features

- **Beautiful UI Design**: Custom background image with semi-transparent overlay
- **Responsive Layout**: Adapts to different screen sizes and keyboard appearance
- **Form Validation**: Email and password validation with user feedback
- **Keyboard Handling**: Automatic scrolling and view adjustment when keyboard appears
- **Material Design**: Uses React Native Paper components for consistent UI

## Screenshots

The app features:
- Background image covering the full screen
- Semi-transparent authentication form (90% width)
- Email and password input fields
- Sign in button with custom styling
- Create account link

## Tech Stack

- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and tools
- **React Native Paper**: Material Design components
- **React Hooks**: State management with useState and useRef

## Project Structure

```
MaatallahMeryemWhatsApp/
├── App.js                 # Main app component with Paper Provider
├── Screens/
│   └── Authentification.js # Authentication screen component
├── assets/
│   └── bg.jpg             # Background image
└── README.md              # Project documentation
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
   npm install react-native-paper
   expo install expo-status-bar
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
- Main application entry point
- Wraps the app with PaperProvider for Material Design components
- Renders the Authentification screen

### Authentification.js
- Complete authentication form with background
- Keyboard-aware scrolling and responsive design
- Form validation and user feedback
- Email and password input handling

## Features Implementation

### Responsive Design
- Uses `KeyboardAvoidingView` for iOS/Android keyboard handling
- `ScrollView` with `flexGrow: 1` for proper centering and scrolling
- Dynamic form sizing with `paddingVertical` instead of fixed height

### Form Validation
- Email and password length validation (minimum 5 characters)
- Real-time feedback with alerts
- Proper keyboard types for different input fields

### UI/UX Enhancements
- Semi-transparent overlay (rgba(0,0,0,0.5)) for better text readability
- Text shadows for better contrast
- Smooth transitions and proper spacing
- Material Design button styling

## Customization

### Background Image
Replace `assets/bg.jpg` with your preferred background image.

### Colors and Styling
Modify the styles in `Authentification.js`:
- Background overlay opacity
- Button colors
- Text colors and shadows
- Border radius and spacing

### Form Fields
Add or modify input fields in the authentication form as needed.

## Dependencies

```json
{
  "expo": "~49.0.0",
  "react": "18.2.0",
  "react-native": "0.72.0",
  "react-native-paper": "^5.0.0",
  "expo-status-bar": "~1.6.0"
}
```

## Development Notes

- Uses functional components with React Hooks
- Implements proper keyboard handling for mobile devices
- Responsive design works on various screen sizes
- Form validation provides user feedback
- Clean, maintainable code structure

## Future Enhancements

- Add navigation to other screens
- Implement actual authentication logic
- Add loading states and error handling
- Include forgot password functionality
- Add social login options

## Author

Maatallah Meryem

## License

This project is for educational purposes.
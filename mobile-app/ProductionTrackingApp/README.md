# Production Tracking System - React Native Mobile App

This is a React Native mobile app version of the Production Tracking System. It's designed to work with the Next.js backend API.

## Features

- Authentication system with role-based access control
- Work Order Management
- Order Management
- Machine Management
- Employee Management
- Customer Management
- Wire Production Calculator

## Prerequisites

- Node.js (v14 or higher)
- Expo CLI
- Running Next.js backend server (for API communication)

## Setup Instructions

1. Clone the repository
2. Navigate to the mobile app directory: `cd ProductionTrackingApp`
3. Install dependencies: `npm install`

### Backend Connection Setup (Important)

When using the app with your Next.js backend:

1. Update the backend API URL in `src/api/apiService.ts` with your computer's actual IP address:
   ```javascript
   const API_BASE_URL = 'http://YOUR_IP_ADDRESS:3000/api';
   ```

   **Note:** Using `localhost` won't work on physical devices because "localhost" refers to the device itself, not your computer. Use your actual network IP address instead (e.g., `192.168.1.X` or similar).

   To find your IP address:
   - On Mac: System Preferences → Network or run `ifconfig` in terminal
   - On Windows: Run `ipconfig` in command prompt

2. Make sure your computer and device are on the same network

3. Update Supabase credentials in `src/lib/supabaseClient.ts` with your actual Supabase URL and keys

## Running the App

```bash
# Start the app with Expo
npm run start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web
npm run web
```

### Testing on Physical Devices

To test on physical devices:

1. Install the Expo Go app on your device from App Store or Google Play
2. Make sure your phone and computer are on the same Wi-Fi network
3. Run `npm start` to start the Expo server
4. Scan the QR code with your phone's camera (iOS) or the Expo Go app (Android)

## Troubleshooting

### Network Request Failed

If you get a "Network request failed" error:

1. Check that you're using your computer's correct IP address in `apiService.ts`, not "localhost"
2. Verify that the Next.js backend server is running
3. Make sure your device and computer are on the same network
4. Check if any firewall is blocking the connection

### Authentication Issues

If login succeeds but you can't access the main app:

1. Check the console logs for any errors
2. Verify that the authentication tokens are being stored correctly in AsyncStorage
3. The app includes a periodic check for authentication status; if this doesn't work, try restarting the app

## Project Structure

```
src/
├── api/          # API service functions
├── assets/       # Images, fonts, etc.
├── components/   # Reusable UI components
├── lib/          # Utility functions and helpers
├── navigation/   # Navigation setup
├── screens/      # App screens
└── types/        # TypeScript type definitions
```

## Authentication

The app authenticates against the Next.js backend API and stores session information in AsyncStorage. It follows the same role-based access control system as the web app.

## Integration with the Next.js Backend

This mobile app uses the Next.js application as its backend. API calls are made to endpoints like `/api/system-auth` for login and other data operations. Make sure the Next.js server is running and accessible from your device or emulator.

## Customizing the App

- Colors and styling: most UI styles are defined in the individual component files
- Navigation: See `src/navigation/AppNavigator.tsx` for the navigation structure
- API endpoints: Update the API calls in the `src/api/apiService.ts` file

## License

This project is open source. 
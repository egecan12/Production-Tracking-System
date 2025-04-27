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
4. Update the backend API URL in `src/api/apiService.ts` to point to your running Next.js server
5. Update Supabase credentials in `src/lib/supabaseClient.ts` with your actual Supabase URL and keys

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
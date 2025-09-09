# AquaSetu

A mobile application built with Expo and React Native for monitoring groundwater quality.

## Prerequisites

- Node.js (version 22 or higher)
- Bun (optional, for faster package management)[bun.sh](https://bun.sh/)
- Expo CLI (install globally with `bun install -g @expo/cli`)

## Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/uiuxarghya/aquasetu.git
   cd aquasetu
   ```

2. Install dependencies:

   ```bash
   bun install
   ```

## Running the App

1. Start the Expo development server:

   ```bash
   bun run start
   ```

2. In the terminal output, you'll see options to open the app in:
   - [Development build](https://docs.expo.dev/develop/development-builds/introduction/)
   - [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
   - [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
   - [Expo Go](https://expo.dev/go) (limited sandbox for testing)

3. Scan the QR code with the Expo Go app on your phone, or press the appropriate key to open in an emulator/simulator.

## Project Structure

- `app/` - Main application code with file-based routing
- `components/` - Reusable UI components
- `assets/` - Images, fonts, and other static assets
- `constants/` - App constants like colors

## Development

- Edit files in the `app/` directory to modify the app
- The project uses [file-based routing](https://docs.expo.dev/router/introduction)
- Styling is done with Tailwind CSS v3 via NativeWind

## Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [NativeWind Documentation](https://www.nativewind.dev/)

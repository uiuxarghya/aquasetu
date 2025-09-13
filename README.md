# 🌊 AquaSetu

A comprehensive mobile application for monitoring and visualizing groundwater levels across India. Built with React Native and Expo, featuring interactive maps, real-time data visualization, push notifications, and user-friendly station exploration with drawer navigation and advanced analytics.

## 🌟 Features

### Core Functionality

- **Interactive Map**: Visualize groundwater monitoring stations across India using Mapbox
- **Station Search**: Advanced search with autocomplete for finding specific stations
- **Geolocation**: Find nearby stations and get directions
- **Station Details**: Detailed water quality parameters for each monitoring station
- **User Authentication**: Secure login and registration system
- **Bookmarks**: Save favorite stations for quick access
- **Alerts**: Receive notifications about groundwater quality changes
- **Analytics**: View data trends and insights
- **Settings**: Manage personal information and preferences

### Technical Features

- **Real-time Data**: Live groundwater quality metrics and trends
- **Offline Support**: Core functionality works without internet connection
- **Responsive Design**: Optimized for various screen sizes and orientations
- **Dark/Light Theme**: Automatic theme switching based on device settings
- **Smooth Animations**: Fluid user experience with React Native Reanimated
- **Push Notifications**: Real-time alerts for water quality changes
- **Geolocation Services**: GPS-based station discovery and directions
- **Haptic Feedback**: Enhanced user interaction with device vibrations

## 🛠️ Technologies Used

### Frontend

- **React Native 0.79.5** - Cross-platform mobile development
- **Expo SDK 53** - Development platform and build tools
- **Expo Router** - File-based routing for React Native
- **NativeWind** - Tailwind CSS for React Native
- **React Native Reanimated** - Smooth animations and gestures

### Backend & Services

- **Appwrite** - Backend-as-a-Service for authentication and database
- **Mapbox GL JS** - Interactive mapping and visualization
- **WebView** - Embedded web content for map rendering
- **React Native Gifted Charts** - Data visualization and analytics charts
- **Expo Notifications** - Push notifications and alerts
- **Expo Location** - GPS and geolocation services

### Development Tools

- **TypeScript** - Type-safe JavaScript with strict mode
- **ESLint** - Code linting and formatting
- **Prettier** - Code formatting with Tailwind CSS plugin
- **Bun** - Fast JavaScript runtime (optional)
- **Expo CLI** - Development and build tools
- **NativeWind** - Tailwind CSS integration for React Native

### UI Components

- **React Native Reusables** - Accessible components based on shadcn/ui
- **React Native Primitives** - Low-level UI primitives for custom components
- **Tailwind CSS** - Utility-first CSS framework
- **Expo Vector Icons** - Icon library with Ionicons
- **React Native Safe Area Context** - Safe area handling
- **NativeWind** - Tailwind CSS for React Native with dark mode support

## 📋 Prerequisites

- **Node.js** (version 22 or higher)
- **Bun** (optional, for faster package management) - [bun.sh](https://bun.sh/)
- **Expo CLI** (install globally with `bun install -g @expo/cli`)

## 🚀 Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/uiuxarghya/aquasetu.git
   cd aquasetu
   ```

2. **Install dependencies:**

   ```bash
   bun install
   ```

3. **Environment Configuration:**

   Create a `.env` file in the root directory with the following variables:

   ```env
   EXPO_PUBLIC_APPWRITE_ENDPOINT=https://your-appwrite-endpoint.com/v1
   EXPO_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
   EXPO_PUBLIC_APPWRITE_PROJECT_NAME=your-project-name
   EXPO_PUBLIC_APPWRITE_DATABASE_ID=your-database-id
   EXPO_PUBLIC_APPWRITE_USERS_COLLECTION_ID=users
   EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=your-mapbox-access-token
   EXPO_PUBLIC_GEOJSON_URL=https://your-geojson-data-url
   ```

4. **Configure Appwrite:**
   - Create an Appwrite project
   - Set up authentication and database
   - Configure the required collections and permissions

5. **Configure Mapbox:**
   - Get a Mapbox access token
   - Ensure your GeoJSON data is accessible via the provided URL

## 🏃‍♂️ Running the App

### Development

```bash
bun run dev
```

### Production Builds

```bash
# Android
bun run android

# iOS
bun run ios

# Web
bun run web
```

### Expo Go

```bash
bun run start
```

In the terminal output, you'll see options to open the app in:

- [Development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go) (limited sandbox for testing)

Scan the QR code with the Expo Go app on your phone, or press the appropriate key to open in an emulator/simulator.

## 📁 Project Structure

```
aquasetu/
├── app/                          # Main application code (file-based routing)
│   ├── _layout.tsx              # Root layout component
│   ├── globals.css              # Global styles
│   ├── (auth)/                  # Authentication screens
│   │   ├── auth.tsx
│   │   ├── login.tsx
│   │   └── register.tsx
│   └── (drawer)/                # Drawer navigation
│       ├── _layout.tsx          # Drawer layout
│       └── (tabs)/              # Main app tabs
│           ├── _layout.tsx      # Tab navigation layout
│           ├── index.tsx        # Home/dashboard screen
│           ├── map.tsx          # Interactive map screen
│           ├── search.tsx       # Search stations screen
│           ├── bookmarks.tsx    # Bookmarked stations
│           ├── alerts.tsx       # Alerts screen
│           ├── analytics.tsx    # Analytics screen
│           ├── settings.tsx     # Settings screen
│           └── station/         # Station details
│               └── [id].tsx     # Dynamic station detail page
├── components/                  # Reusable UI components
│   ├── notification-handler.tsx # Notification handling component
│   ├── side-menu-content.tsx    # Side menu content
│   └── ui/                      # UI component library
├── lib/                         # Core utilities and configurations
│   ├── alerts-context.tsx       # Alerts context for state management
│   ├── appwrite.config.ts       # Appwrite client configuration
│   ├── theme.ts                 # Theme configuration
│   ├── utils.ts                 # General utilities
│   └── utils/                   # Specialized utilities
│       ├── auth.ts              # Authentication helpers
│       ├── db.ts                # Database operations
│       ├── groundwater-data.ts  # Groundwater data utilities
│       ├── notifications.ts     # Notification utilities
│       └── search.ts            # Search utilities
├── assets/                      # Static assets
│   ├── fonts/                   # Custom fonts
│   │   └── SpaceMono-Regular.ttf
│   └── images/                  # App images and icons
│       ├── adaptive-icon.png
│       ├── favicon.png
│       ├── icon.png
│       └── splash-icon.png
└── constants/                   # App constants and configurations
```

## 🔧 Development

### Code Style

- Uses ESLint for code linting
- Prettier for code formatting
- TypeScript for type safety

### Key Development Files

- Edit screens in the `app/` directory
- Add components to `components/`
- Configure utilities in `lib/`
- Update styles using Tailwind CSS classes

### File-based Routing

The project uses [Expo Router](https://docs.expo.dev/router/introduction/) for navigation with [React Navigation](https://reactnavigation.org/):

- `(auth)` - Authentication group
- `(drawer)/(tabs)` - Drawer navigation with embedded tab navigation
- `station/[id]` - Dynamic station detail routes

**Navigation Features:**

- **Drawer Menu**: Side navigation accessible via swipe or menu button
- **Bottom Tabs**: Main navigation with Home, Map, Search, Bookmarks, and Alerts
- **Hidden Tabs**: Analytics and Settings accessed via drawer menu or other navigation
- **Badge Notifications**: Alert count displayed on the Alerts tab icon

## 🔒 Authentication & Database

### Appwrite Integration

- **Authentication**: User registration, login, and session management
- **Database**: User profiles and bookmarks storage
- **Real-time**: Live updates for user data

### Data Flow

1. User authenticates via Appwrite
2. User data stored in Appwrite database
3. Bookmarks and preferences synced across devices
4. Station data fetched from external GeoJSON source

## 🗺️ Mapping Features

### Mapbox Integration

- **Interactive Maps**: Full-screen map with station markers
- **Search Functionality**: Find stations by name, district, or state
- **Geolocation**: User location detection and nearby stations
- **Station Popups**: Detailed information on station click
- **Responsive Design**: Optimized for mobile devices

### Data Sources

- **GeoJSON**: Station locations and metadata
- **Real-time Updates**: Water quality parameters
- **Offline Caching**: Core map data stored locally

## 🎨 UI/UX Design

### Design System

- **NativeWind**: Tailwind CSS for React Native
- **Consistent Theming**: Light/dark mode support
- **Accessible Components**: WCAG compliant design
- **Smooth Animations**: Enhanced user experience

### Key Screens

- **Home**: Dashboard with recent stations and quick actions
- **Map**: Interactive groundwater station map
- **Search**: Advanced station search with filters
- **Bookmarks**: Saved stations for quick access
- **Alerts**: Notifications and alerts for water quality
- **Analytics**: Data visualization and trends
- **Settings**: User settings and information
- **Station Details**: Comprehensive water quality data

## 📱 Platform Support

- **iOS**: Full support with native performance, tablet compatibility
- **Android**: Complete feature parity, edge-to-edge display, adaptive icons
- **Web**: Responsive web version available
- **Expo Go**: Quick testing and development

**Platform Features:**

- **iOS**: Tablet support, foreground notifications
- **Android**: Edge-to-edge UI, vibration feedback, wake lock
- **Cross-platform**: Consistent experience across all platforms

## 🔧 Scripts

```json
{
  "dev": "expo start -c",
  "start": "expo start",
  "android": "expo start --android",
  "ios": "expo start --ios",
  "web": "expo start --web",
  "lint": "expo lint",
  "clean": "rm -rf .expo node_modules"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- [Expo](https://expo.dev/) for the amazing development platform
- [Mapbox](https://mapbox.com/) for mapping services
- [Appwrite](https://appwrite.io/) for backend services
- [NativeWind](https://www.nativewind.dev/) for styling
- Groundwater data provided by relevant authorities

---

**Built with ❤️ by Team Aarambh**

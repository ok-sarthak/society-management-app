# 🏢 Society Hub - Complete Society Management Application

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.1-blue.svg)
![React Native](https://img.shields.io/badge/React%20Native-0.79.5-61DAFB?logo=react)
![Expo](https://img.shields.io/badge/Expo-~53.0.17-000020?logo=expo)
![Firebase](https://img.shields.io/badge/Firebase-11.10.0-FFCA28?logo=firebase)

**A comprehensive mobile application for managing residential societies, built with React Native, Expo, and Firebase.**

[Features](#-features) • [Architecture](#-architecture) • [Installation](#-installation) • [Usage](#-usage) • [Documentation](#-documentation)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [User Roles](#-user-roles)
- [Module Documentation](#-module-documentation)
- [Project Structure](#-project-structure)
- [Services](#-services)
- [Contributing](#-contributing)
- [Contact](#-contact)

---

## 🌟 Overview

**Society Hub** is a modern, feature-rich mobile application designed to streamline residential society management. Built with React Native and Expo, it provides dual-role functionality for both primary administrators and secondary users (security guards, receptionists), offering comprehensive tools for member management, staff tracking, visitor logging, and maintenance coordination.

### Key Highlights

- 🔐 **Secure Authentication** - Firebase-based authentication with role-based access control
- 👥 **Member Management** - Complete CRUD operations with history tracking
- 🛡️ **Staff Management** - Attendance tracking, check-in/out, and activity logs
- 🚪 **Visitor Management** - Real-time visitor tracking with check-in/out functionality
- 💰 **Maintenance Tracking** - Payment management and maintenance records (Coming Soon)
- 🌐 **Offline Support** - Smart connectivity detection with graceful degradation
- 📱 **Cross-Platform** - Works seamlessly on iOS and Android

---

## ✨ Features

### 🔑 Authentication & Onboarding

- **Splash Screen** - Beautiful animated introduction
- **Onboarding Flow** - Interactive 3-page tutorial with swipe navigation
- **Role-Based Login** - Separate authentication for primary and secondary users
- **Forgot Password** - Email-based password reset functionality
- **Persistent Sessions** - AsyncStorage-based session management
- **Auto-Login** - Automatic authentication on app restart

### 👥 Member Management

#### Primary Users (Administrators)

- ➕ **Add Members** - Comprehensive member registration with personal details, residence info, emergency contacts, occupation, family members, vehicle registration, and notes
- 📋 **View Members** - Complete member directory with search functionality
- ✏️ **Edit Members** - Update member information with automatic history logging
- 📊 **Active/Inactive Members** - Filter members by status
- 🕒 **Members History** - Complete audit trail of all member changes

#### Secondary Users (Security/Reception)

- 👁️ **View Members** - Read-only access to member directory
- 🔍 **Search Members** - Quick member lookup by name, flat, or phone

### 🛡️ Staff Management

- 👷 **Add Staff** - Register new staff with detailed information
- ✅ **Check-In/Out** - Real-time staff attendance tracking
- 📈 **Staff Statistics** - Dashboard showing total staff, active/inactive, today's check-ins, currently on duty, and staff distribution by type
- 📝 **Staff Details** - Comprehensive staff profile view
- ✏️ **Edit Staff** - Update staff information with change tracking
- 📊 **Staff Attendance** - Complete attendance history and reports
- 🕐 **Staff History** - Activity logs with detailed change tracking
- 🔍 **Search & Filter** - Find staff by name, type, or status

### 🚪 Visitor Management

- 🆕 **Add Visitor** - Register new visitors with automatic check-in
- 📊 **Visitor Statistics** - Real-time dashboard with comprehensive metrics
- 👁️ **View Visitors** - Currently checked-in visitors list
- 🚪 **Check-Out** - Quick visitor checkout functionality
- 📜 **Visitor History** - Complete visitor logs with search
- 📱 **Visitor Details** - Full visitor information modal
- 🔍 **Smart Search** - Search by visitor name, phone, flat, or purpose
- ⏱️ **Activity Logs** - Detailed check-in/out tracking

### 📊 Dashboard Features

- 🎯 **Quick Navigation Cards** - Fast access to all modules
- 📈 **Statistics Overview** - Real-time counts and metrics
- 🌐 **Connectivity Status** - Live internet connection monitoring
- 🕐 **Live Clock** - Real-time date and time display
- 📞 **Contact Support** - Quick access to support channels
- 🔗 **External Links** - Social media and website links

### 🎨 UI/UX Features

- 🌈 **Beautiful Gradients** - Modern gradient designs throughout
- 💫 **Smooth Animations** - React Native Reanimated animations
- 📱 **Responsive Design** - Adapts to all screen sizes
- 🎯 **Haptic Feedback** - Tactile responses for better UX
- 🔄 **Pull to Refresh** - Easy data refreshing
- ⚡ **Loading States** - Clear loading indicators
- 🎨 **Custom Modals** - Beautiful modal designs for all features

---

## 🛠 Tech Stack

### Frontend Framework

- **React Native** (0.79.5), **Expo** (~53.0.17), **React** (19.0.0)

### Navigation & Routing

- **@react-navigation/native** (^7.1.6), **@react-navigation/bottom-tabs** (^7.3.10), **expo-router** (~5.1.3)

### Backend & Database

- **Firebase** (^11.10.0), **@react-native-firebase/auth** (^22.2.1), **@react-native-firebase/firestore** (^22.2.1)

### UI Components & Styling

- **expo-linear-gradient** (^14.1.5), **@expo/vector-icons** (^14.1.0), **react-native-reanimated** (~3.17.4), **react-native-modal** (^14.0.0-rc.1)

### State & Storage

- **@react-native-async-storage/async-storage** (^2.2.0)

### Additional Features

- **expo-haptics** (~14.1.4), **expo-linking** (~7.1.7), **react-native-gesture-handler** (~2.24.0), **react-native-pager-view** (^6.8.1)

### Development Tools

- **TypeScript** (~5.8.3), **ESLint** (^9.25.0), **Babel** (^7.25.2)

---

## 🏗 Architecture

### Application Flow

```
App Start → Splash Screen → Check Onboarding → Check Login → Route to Dashboard
                                    ↓                ↓
                            Onboarding (First Time)  Authentication Screen
                                                      ↓
                                            Primary/Secondary Dashboard
```

### Component Architecture

```
AppNavigator (Root)
    ├── SplashScreen
    ├── OnboardingScreen
    ├── AuthScreen
    ├── PrimaryDashboard → [DashboardTab, MembersTab, StaffTab, VisitorsTab, MaintenanceTab]
    └── SecondaryDashboard → [Same structure with limited permissions]
```

### Data Flow

```
User Action → Component Handler → Service Layer → Firebase Firestore → State Update → UI Render
```

---

## 📥 Installation

### Prerequisites

- **Node.js** (v16+), **npm/yarn**, **Expo CLI**, **iOS Simulator/Android Emulator**, **Firebase Account**

### Step 1: Clone Repository

```bash
git clone https://github.com/ok-sarthak/society-management-app.git
cd society-management-app
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Firebase Configuration

1. Create Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication (Email/Password)
3. Create Firestore database
4. Copy `config/firebase.example.js` to `config/firebase.js`
5. Update with your credentials

### Step 4: Firestore Collections

Create these collections:

- **users** - User accounts with userType (primary/secondary)
- **members** - Society members data
- **membersHistory** - Member change logs
- **staff** - Staff members data
- **staffAttendance** - Staff attendance records
- **staffHistory** - Staff activity logs
- **visitors** - Visitor records
- **visitorLogs** - Visitor activity logs

### Step 5: Run Application

```bash
npx expo start
npm run ios      # iOS
npm run android  # Android
```

---

## 🎯 Usage

### Creating User Accounts

1. Create user in Firebase Authentication
2. Add user document in Firestore `users` collection with `userType` field

### Login Process

1. Open app → Complete onboarding → Select user type → Enter credentials → Sign In

### Primary User Workflow

- **Dashboard**: View statistics and quick actions
- **Members**: Add, view, edit members; track history
- **Staff**: Manage staff, track attendance, view history
- **Visitors**: Register visitors, checkout, view logs

### Secondary User Workflow

- **Members**: Read-only access
- **Staff**: Full management capabilities
- **Visitors**: Full management capabilities

---

## 👥 User Roles

### Primary User (Administrator)

✅ Complete member, staff, visitor management | ✅ All statistics and reports | ✅ History access

**Typical Users**: Society Manager, Committee Members, Admin Staff

### Secondary User (Staff)

❌ Read-only member access | ✅ Full staff & visitor management

**Typical Users**: Security Guards, Receptionists, Front Desk Staff

---

## 📚 Module Documentation

### Members Module

- Add, view, edit members with history tracking
- Active/inactive filtering
- Components: `AddMemberForm`, `ViewMembers`, `EditMembers`, `ActiveMembers`, `InactiveMembers`, `MembersHistory`

### Staff Module

- Staff registration, attendance tracking, statistics
- Check-in/out system, activity logs
- Components: `AddStaffModal`, `ViewAllStaffModal`, `StaffDetailsModal`, `EditStaffModal`, `CheckInOutModal`, `StaffAttendanceModal`, `StaffHistoryModal`

### Visitors Module

- Visitor registration, real-time tracking, checkout
- Statistics, search, activity logs
- Components: `AddVisitorModal`, `VisitorDetailsModal`, `VisitorLogsModal`, `VisitorsHistoryModal`

### Authentication Module

- Email/password login, role-based access
- Password reset, session management
- Components: `AuthScreen`, `AppNavigator`

---

## 📁 Project Structure

```
society-management-app/
├── app/                    # Expo Router
├── assets/                 # Static assets
├── components/             # React components
│   ├── members/           # Member components
│   ├── staff/             # Staff components
│   ├── visitors/          # Visitor components
│   └── tabs/              # Tab components
├── config/                 # Configuration
├── constants/              # App constants
├── services/               # Service layer
├── app.json               # Expo config
└── package.json           # Dependencies
```

---

## 🔧 Services

### Members Service (`services/membersService.js`)

`addMember`, `getAllMembers`, `getActiveMembers`, `getInactiveMembers`, `updateMember`, `getMemberHistory`

### Staff Service (`services/staffService.js`)

`addStaff`, `getAllStaff`, `getStaffStats`, `updateStaff`, `checkIn`, `checkOut`, `getStaffHistory`, `getStaffAttendance`

### Visitors Service (`services/visitorsService.js`)

`addVisitor`, `getAllVisitors`, `getCheckedInVisitors`, `checkOutVisitor`, `getVisitorStats`, `searchVisitors`, `getVisitorLogs`

---

## 🚀 Build & Deployment

```bash
# Development
npx expo start

# Production Build
npm install -g eas-cli
eas build --platform all
```

---

## 🐛 Troubleshooting

- **Firebase Errors**: Check internet connection, verify Firebase config
- **Auth Failures**: Ensure Firestore user has correct `userType`
- **Session Issues**: Clear app data and reinstall

---

## 📱 Supported Platforms

- ✅ iOS 13.0+
- ✅ Android 5.0+ (API 21)
- ⚠️ Web (Limited support)

---

## 🔐 Security Features

- Firebase Authentication with token management
- Role-based access control (RBAC)
- Secure session storage
- Password reset via email
- Firestore security rules (setup required)

---

## 🔄 Version History

### v1.0.1 (Current)

- Enhanced dashboard UI
- Connectivity monitoring
- Contact support
- Bug fixes

### v1.0.0

- Initial release
- Complete auth system
- Member, staff, visitor modules
- Dual dashboards

---

## 🛣 Roadmap

**Q1 2026**: Maintenance module, push notifications, dark mode  
**Q2 2026**: Reports & analytics, document management  
**Q3 2026**: Notice board, event management, amenity booking  
**Q4 2026**: Multi-society support, payment gateway, exports

---

## 📞 Contact & Support
 
**Developer**: Sarthak Chakraborty  
**Email**: <sarthak@vacantvectors.in>   
**Website**: [sarthakchakraborty.in](https://sarthakchakraborty.in)  
**GitHub**: [@ok-sarthak](https://github.com/ok-sarthak)

---

## 📊 Statistics

- **40+ Components** | **30+ Service Methods** | **8 Database Collections**
- **2 Platforms** (iOS, Android) | **10,000+ Lines of Code** | **3+ Months Development**

---

<div align="center">

**Built with ❤️ by [Sarthak Chakraborty](https://sarthakchakraborty.in)**

[⬆ Back to Top](#-society-hub---complete-society-management-application)

</div>

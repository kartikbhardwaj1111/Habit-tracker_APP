<div align="center">
  <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Activities/Target.png" alt="Target" width="100" height="100" />
  
  # 🎯 AI Habit Tracker
  
  <p align="center">
    <strong>Transform your daily routines into lasting habits with AI-powered insights</strong>
  </p>
  
  <p align="center">
    <img src="https://img.shields.io/badge/React%20Native-0.81.5-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
    <img src="https://img.shields.io/badge/Expo-54.0.20-000020?style=for-the-badge&logo=expo&logoColor=white" />
    <img src="https://img.shields.io/badge/TypeScript-Ready-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
    <img src="https://img.shields.io/badge/Jest-Testing-C21325?style=for-the-badge&logo=jest&logoColor=white" />
  </p>
  
  <p align="center">
    <img src="https://img.shields.io/badge/iOS-Compatible-000000?style=flat-square&logo=ios&logoColor=white" />
    <img src="https://img.shields.io/badge/Android-Compatible-3DDC84?style=flat-square&logo=android&logoColor=white" />
    <img src="https://img.shields.io/badge/Web-Compatible-FF6B6B?style=flat-square&logo=web&logoColor=white" />
  </p>
</div>

---

## 🌟 Features

<table>
  <tr>
    <td align="center" width="33%">
      <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Chart%20Increasing.png" width="60" height="60" />
      <h3>📊 Smart Tracking</h3>
      <p>Advanced progress analytics with completion history and streak tracking</p>
    </td>
    <td align="center" width="33%">
      <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Robot.png" width="60" height="60" />
      <h3>🤖 AI Insights</h3>
      <p>Personalized motivational tips and habit optimization suggestions</p>
    </td>
    <td align="center" width="33%">
      <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Trophy.png" width="60" height="60" />
      <h3>🏆 Achievements</h3>
      <p>Unlock badges and celebrate milestones in your habit journey</p>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Cloud.png" width="60" height="60" />
      <h3>☁️ Offline First</h3>
      <p>Works seamlessly without internet connection using local storage</p>
    </td>
    <td align="center">
      <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Mobile%20Phone.png" width="60" height="60" />
      <h3>📱 Cross Platform</h3>
      <p>Native performance on iOS, Android, and Web platforms</p>
    </td>
    <td align="center">
      <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Artist%20Palette.png" width="60" height="60" />
      <h3>🎨 Beautiful UI</h3>
      <p>Modern design with smooth animations and responsive layouts</p>
    </td>
  </tr>
</table>

---

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator / Android Emulator (optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ai-habit-tracker.git

# Navigate to project directory
cd ai-habit-tracker

# Install dependencies
npm install

# Start the development server
npm start
```

### Running the App

<table>
  <tr>
    <th>Platform</th>
    <th>Command</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>📱 iOS</td>
    <td><code>npm run ios</code></td>
    <td>Launch in iOS Simulator</td>
  </tr>
  <tr>
    <td>🤖 Android</td>
    <td><code>npm run android</code></td>
    <td>Launch in Android Emulator</td>
  </tr>
  <tr>
    <td>🌐 Web</td>
    <td><code>npm run web</code></td>
    <td>Open in web browser</td>
  </tr>
  <tr>
    <td>📲 Device</td>
    <td>Scan QR code with Expo Go</td>
    <td>Run on physical device</td>
  </tr>
</table>

---

## 🏗️ Architecture

<details>
<summary><strong>📁 Project Structure</strong></summary>

```
📦 ai-habit-tracker/
├── 📱 App.js                 # Main app component with initialization
├── 📄 app.json              # Expo configuration
├── 📦 package.json          # Dependencies and scripts
├── 🧪 jest.config.js        # Testing configuration
└── 📂 src/
    ├── 🧩 components/        # Reusable UI components
    │   ├── 🎯 HabitCard.js   # Individual habit display
    │   ├── 🔘 Button.js      # Custom button component
    │   ├── 📊 ProgressRing.js # Circular progress indicator
    │   ├── 🏆 AchievementBadge.js # Achievement display
    │   └── 🧪 __tests__/     # Component tests
    ├── 🧭 navigation/        # App navigation setup
    │   └── AppNavigator.js   # Stack navigator configuration
    ├── 📱 screens/           # Screen components
    │   ├── 🏠 HomeScreen.js  # Main habits dashboard
    │   ├── ➕ AddHabitScreen.js # Habit creation form
    │   ├── 💡 InsightsScreen.js # AI-powered insights
    │   ├── 🏆 AchievementsScreen.js # User achievements
    │   └── 🌟 SplashScreen.js # App loading screen
    ├── 🎨 styles/            # Global styling system
    │   └── globalStyles.js   # Design tokens and themes
    └── 🔧 utils/             # Utility functions
        ├── 💾 storage.js     # AsyncStorage operations
        ├── 📊 progressCalculations.js # Progress analytics
        ├── 🤖 aiTips.js      # AI insight generation
        ├── 🏆 achievementSystem.js # Achievement logic
        ├── 🌐 networkStatus.js # Connectivity monitoring
        ├── 📱 appStateManager.js # App state management
        └── 🧪 __tests__/     # Utility tests
```

</details>

<details>
<summary><strong>🔧 Tech Stack</strong></summary>

### Core Technologies
- **React Native 0.81.5** - Cross-platform mobile framework
- **Expo ~54.0.20** - Development platform and toolchain
- **React Navigation 7.x** - Navigation library
- **AsyncStorage** - Local data persistence

### Development Tools
- **Jest** - Testing framework
- **React Native Testing Library** - Component testing utilities
- **Babel** - JavaScript transpilation
- **ESLint** - Code linting (ready to configure)

### Key Libraries
- **@expo/vector-icons** - Icon library
- **expo-linear-gradient** - Gradient components
- **react-native-safe-area-context** - Safe area handling

</details>

---

## 🧪 Testing

<div align="center">
  <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Test%20Tube.png" width="60" height="60" />
</div>

### Test Coverage

- ✅ **Component Tests** - UI component behavior and rendering
- ✅ **Utility Tests** - Business logic and data operations
- ✅ **Integration Tests** - Cross-component functionality
- ✅ **User Flow Tests** - Complete user journey testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

---

## 📊 Development Status

<div align="center">
  
| Feature | Status | Description |
|---------|--------|--------------|
| 🏗️ **Core Architecture** | ✅ Complete | Project structure, navigation, and styling system |
| 💾 **Data Management** | ✅ Complete | AsyncStorage integration with validation |
| 🎨 **UI Components** | ✅ Complete | Reusable components with animations |
| 📱 **Screens** | ✅ Complete | All main screens implemented |
| 🤖 **AI Integration** | ✅ Complete | Motivational tips and insights |
| 🏆 **Achievement System** | ✅ Complete | Badge unlocking and progress tracking |
| 🧪 **Testing Suite** | ✅ Complete | Comprehensive test coverage |
| 🔒 **Security** | ⚠️ In Progress | Addressing CSRF and timing vulnerabilities |

</div>

---

## 🛡️ Security

<div align="center">
  <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Shield.png" width="60" height="60" />
</div>

### Security Measures
- 🔐 **Data Validation** - Comprehensive input validation
- 💾 **Secure Storage** - Encrypted local data storage
- 🌐 **Network Security** - Secure API communication
- 🔍 **Code Analysis** - Regular security audits

### Known Issues
- ⚠️ **CSRF Protection** - Currently being addressed
- ⚠️ **Timing Attacks** - Security patches in progress

---

## 🤝 Contributing

<div align="center">
  <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Hand%20gestures/Handshake.png" width="60" height="60" />
</div>

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow

1. 🍴 Fork the repository
2. 🌿 Create a feature branch
3. 💻 Make your changes
4. 🧪 Add tests for new features
5. ✅ Ensure all tests pass
6. 📝 Update documentation
7. 🚀 Submit a pull request

---

## 📄 License

<div align="center">
  <p>This project is licensed under the MIT License - see the <a href="LICENSE">LICENSE</a> file for details.</p>
  
  <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Heart%20with%20Arrow.png" width="40" height="40" />
  
  <p><strong>Made with ❤️ for building better habits</strong></p>
</div>

---

<div align="center">
  <h3>🌟 Star this repo if you found it helpful! 🌟</h3>
  
  <p>
    <a href="#top">⬆️ Back to Top</a>
  </p>
</div>
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import * as Linking from 'expo-linking'
import { sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { Alert, KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import Animated, { FadeIn, FadeInDown, FadeInLeft, FadeInRight, FadeInUp, FadeOut } from 'react-native-reanimated'
import { auth, db } from '../config/firebase'

export default function AuthScreen({ onLogin }) {
  const [userType, setUserType] = useState('primary')
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    resetEmail: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorModal, setErrorModal] = useState({ visible: false, title: '', message: '', icon: '' })
  const [successModal, setSuccessModal] = useState({ visible: false, title: '', message: '' })

  const handleExternalLink = (url, linkName) => {
    Alert.alert(
      "Leaving App",
      `You are about to open ${linkName} in your browser. This will take you outside the app.`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Continue",
          onPress: () => Linking.openURL(url)
        }
      ]
    );
  };

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      showErrorModal({ 
        code: 'auth/missing-fields', 
        message: 'Please fill in all required fields to continue.' 
      })
      return
    }

    setIsLoading(true)
    
    try {
      // Firebase authentication
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password)
      const user = userCredential.user

      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid))
      
      if (userDoc.exists()) {
        const userData = userDoc.data()
        
        // Check if user type matches selection
        if (userData.userType !== userType) {
          showErrorModal({ 
            code: 'auth/user-type-mismatch', 
            message: `This account is registered as a ${userData.userType} user. Please select the correct user type and try again.` 
          })
          setIsLoading(false)
          return
        }

        // Store user data locally
        await AsyncStorage.setItem('userType', userData.userType)
        await AsyncStorage.setItem('userData', JSON.stringify(userData))
        await AsyncStorage.setItem('isLoggedIn', 'true')

        setIsLoading(false)
        onLogin(userData)
        showSuccessModal('Welcome Back!', `Hi ${userData.firstName || 'there'}! You have successfully logged in to your ${userData.userType} account.`)
      } else {
        showErrorModal({ 
          code: 'auth/user-data-not-found', 
          message: 'User profile data not found. Please contact support for assistance.' 
        })
        setIsLoading(false)
      }
    } catch (error) {
      setIsLoading(false)
      showErrorModal(error)
    }
  }



  const handleForgotPassword = async () => {
    if (!formData.resetEmail) {
      showErrorModal({ 
        code: 'auth/missing-email', 
        message: 'Please enter your email address to receive a password reset link.' 
      })
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.resetEmail)) {
      showErrorModal({ 
        code: 'auth/invalid-email', 
        message: 'Please enter a valid email address.' 
      })
      return
    }

    setIsLoading(true)
    
    try {
      await sendPasswordResetEmail(auth, formData.resetEmail)
      setIsLoading(false)
      showSuccessModal(
        'Reset Link Sent!',
        `We've sent a password reset link to ${formData.resetEmail}. Please check your email and follow the instructions to reset your password.`
      )
      // Clear the email field
      setFormData({...formData, resetEmail: ''})
      // Close forgot password screen after success
      setTimeout(() => {
        closeSuccessModal()
        setTimeout(() => {
          setShowForgotPassword(false)
        }, 300)
      }, 5000)
    } catch (error) {
      setIsLoading(false)
      showErrorModal(error)
    }
  }

  // Custom Error Modal Component - Modern Design
  const ErrorModal = ({ visible, title, message, icon, onClose }) => (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity 
          style={styles.modalBackdrop} 
          activeOpacity={1} 
          onPress={onClose}
        />
        <Animated.View 
          style={styles.errorModalContainer}
          entering={FadeIn.duration(400).springify()}
          exiting={FadeOut.duration(300)}
        >
          <View style={styles.errorModalContent}>
            {/* Icon Container */}
            <View style={styles.errorIconContainer}>
              <View style={styles.errorIconBackground}>
                <Ionicons name={icon || "alert-circle"} size={32} color="#ff4757" />
              </View>
            </View>
            
            {/* Content */}
            <View style={styles.modalTextContainer}>
              <Text style={styles.errorModalTitle}>{title}</Text>
              <Text style={styles.errorModalMessage}>{message}</Text>
            </View>
            
            {/* Action Button */}
            <TouchableOpacity 
              style={styles.errorModalButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#ff4757', '#ff3742']}
                style={styles.errorButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.errorModalButtonText}>Got it</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  )

  // Success Modal Component - Modern Design
  const SuccessModal = ({ visible, title, message, onClose }) => (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity 
          style={styles.modalBackdrop} 
          activeOpacity={1} 
          onPress={onClose}
        />
        <Animated.View 
          style={styles.successModalContainer}
          entering={FadeIn.duration(400).springify()}
          exiting={FadeOut.duration(300)}
        >
          <View style={styles.successModalContent}>
            {/* Icon Container */}
            <View style={styles.successIconContainer}>
              <View style={styles.successIconBackground}>
                <Ionicons name="checkmark-circle" size={32} color="#2ed573" />
              </View>
            </View>
            
            {/* Content */}
            <View style={styles.modalTextContainer}>
              <Text style={styles.successModalTitle}>{title}</Text>
              <Text style={styles.successModalMessage}>{message}</Text>
            </View>
            
            {/* Action Button */}
            <TouchableOpacity 
              style={styles.successModalButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#2ed573', '#17c0eb']}
                style={styles.successButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.successModalButtonText}>Awesome!</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  )

  // Enhanced error handling function
  const showErrorModal = (error) => {
    let title = 'Authentication Error'
    let message = 'Something went wrong. Please try again.'
    let icon = 'alert-circle'

    switch (error.code) {
      case 'auth/invalid-email':
        title = 'Invalid Email'
        message = 'Please enter a valid email address.'
        icon = 'mail-outline'
        break
      case 'auth/user-disabled':
        title = 'Account Disabled'
        message = 'Your account has been disabled. Please contact support for assistance.'
        icon = 'person-remove-outline'
        break
      case 'auth/user-not-found':
        title = 'Account Not Found'
        message = 'No account exists with this email address. Please check your email or create a new account.'
        icon = 'person-outline'
        break
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        title = 'Incorrect Credentials'
        message = 'The email or password you entered is incorrect. Please try again.'
        icon = 'lock-closed-outline'
        break
      case 'auth/too-many-requests':
        title = 'Too Many Attempts'
        message = 'Access to this account has been temporarily disabled due to many failed login attempts. Try again later or reset your password.'
        icon = 'time-outline'
        break
      case 'auth/network-request-failed':
        title = 'Connection Error'
        message = 'Unable to connect to our servers. Please check your internet connection and try again.'
        icon = 'wifi-outline'
        break
      case 'auth/timeout':
        title = 'Connection Timeout'
        message = 'The request timed out. Please check your internet connection and try again.'
        icon = 'time-outline'
        break
      case 'auth/internal-error':
        title = 'Server Error'
        message = 'Our servers are experiencing issues. Please try again in a few moments.'
        icon = 'server-outline'
        break
      case 'auth/requires-recent-login':
        title = 'Session Expired'
        message = 'For security reasons, please log in again to continue.'
        icon = 'time-outline'
        break
      case 'auth/email-already-in-use':
        title = 'Email In Use'
        message = 'An account with this email already exists. Try logging in instead.'
        icon = 'mail-outline'
        break
      case 'auth/weak-password':
        title = 'Weak Password'
        message = 'Your password should be at least 6 characters long.'
        icon = 'lock-closed-outline'
        break
      case 'auth/operation-not-allowed':
        title = 'Service Unavailable'
        message = 'This sign-in method is currently disabled. Please contact support.'
        icon = 'ban-outline'
        break
      case 'auth/user-type-mismatch':
        title = 'Wrong User Type'
        message = error.message
        icon = 'people-outline'
        break
      case 'auth/user-data-not-found':
        title = 'Profile Error'
        message = error.message
        icon = 'person-outline'
        break
      case 'auth/missing-email':
        title = 'Email Required'
        message = error.message
        icon = 'mail-outline'
        break
      case 'auth/missing-fields':
        title = 'Required Fields Missing'
        message = error.message
        icon = 'warning-outline'
        break
      case 'auth/quota-exceeded':
        title = 'Service Limit Exceeded'
        message = 'Too many requests. Please try again later.'
        icon = 'warning-outline'
        break
      case 'auth/app-deleted':
        title = 'Service Unavailable'
        message = 'The authentication service is temporarily unavailable. Please try again later.'
        icon = 'warning-outline'
        break
      default:
        // Handle unknown errors with better detection
        if (error.message) {
          message = error.message
        }
        
        // Check for specific string patterns in unknown errors
        const errorMsg = error.message ? error.message.toLowerCase() : ''
        if (errorMsg.includes('network') || errorMsg.includes('connection') || errorMsg.includes('offline')) {
          title = 'Network Error'
          message = 'Please check your internet connection and try again.'
          icon = 'wifi-outline'
        } else if (errorMsg.includes('timeout') || errorMsg.includes('deadline')) {
          title = 'Connection Timeout'
          message = 'The request is taking too long. Please try again.'
          icon = 'time-outline'
        } else if (errorMsg.includes('server') || errorMsg.includes('internal')) {
          title = 'Server Error'
          message = 'Our servers are experiencing issues. Please try again in a few moments.'
          icon = 'server-outline'
        }
        break
    }

    setErrorModal({
      visible: true,
      title,
      message,
      icon
    })

    // Provide haptic feedback for errors
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    } catch (_error) {
      // Haptics not available on this device, silently ignore
    }
  }

  const showSuccessModal = (title, message) => {
    setSuccessModal({
      visible: true,
      title,
      message
    })

    // Provide haptic feedback for success
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    } catch (_error) {
      // Haptics not available on this device, silently ignore
    }
  }

  const closeErrorModal = () => {
    setErrorModal({ visible: false, title: '', message: '', icon: '' })
  }

  const closeSuccessModal = () => {
    setSuccessModal({ visible: false, title: '', message: '' })
  }

  useEffect(() => {
    const originalConsoleError = console.error
    const originalConsoleWarn = console.warn
    
    console.error = (...args) => {
      const errorMessage = args.join(' ')
      
      // Suppress specific Firebase/Firestore connection errors that are expected when offline
      if (
        errorMessage.includes('Firebase') ||
        errorMessage.includes('Firestore') ||
        errorMessage.includes('auth/network-request-failed') ||
        errorMessage.includes('Failed to get document because the client is offline') ||
        errorMessage.includes('Could not reach Cloud Firestore backend') ||
        errorMessage.includes('@firebase') ||
        errorMessage.includes('connectivity') ||
        errorMessage.includes('PERMISSION_DENIED') ||
        errorMessage.includes('deadline-exceeded')
      ) {
        // Silently handle these errors - they're expected when offline or during connection issues
        return
      }
      
      // For all other errors, show them normally
      originalConsoleError(...args)
    }

    console.warn = (...args) => {
      const warnMessage = args.join(' ')
      
      // Suppress Firebase warnings too
      if (
        warnMessage.includes('Firebase') ||
        warnMessage.includes('Firestore') ||
        warnMessage.includes('@firebase') ||
        warnMessage.includes('auth/') ||
        warnMessage.includes('connectivity')
      ) {
        return
      }
      
      originalConsoleWarn(...args)
    }

    return () => {
      console.error = originalConsoleError
      console.warn = originalConsoleWarn
    }
  }, [])

  // ... rest of your existing JSX code remains the same
  // (The UI components don't need to change, just the authentication logic)

  if (showForgotPassword) {
    return (
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <LinearGradient
          colors={['#667eea', '#764ba2', '#667eea']}
          style={styles.gradient}
        >
          <Animated.View 
            style={styles.forgotContainer}
            entering={FadeInUp.delay(200)}
          >
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => setShowForgotPassword(false)}
            >
              <Ionicons name="arrow-back" size={24} color="#ffffff" />
            </TouchableOpacity>

            <View style={styles.forgotHeader}>
              <Ionicons name="lock-closed" size={60} color="#ffffff" />
              <Text style={styles.forgotTitle}>Forgot Password?</Text>
              <Text style={styles.forgotSubtitle}>
                No worries! Enter your email and we&apos;ll send you a reset link.
              </Text>
            </View>

            <Animated.View 
              style={styles.forgotForm}
              entering={FadeInDown.delay(400)}
            >
              <View style={styles.forgotInputWrapper}>
                <Ionicons name="mail" size={20} color="#667eea" style={styles.inputIcon} />
                <TextInput
                  style={styles.forgotInput}
                  placeholder="Enter your email address"
                  placeholderTextColor="#999"
                  value={formData.resetEmail}
                  onChangeText={(text) => setFormData({...formData, resetEmail: text.trim()})}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                />
              </View>

              <TouchableOpacity 
                style={styles.resetButton} 
                onPress={handleForgotPassword}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.resetGradient}
                >
                  {isLoading ? (
                    <Animated.View entering={FadeInLeft}>
                      <Ionicons name="reload" size={20} color="#ffffff" />
                    </Animated.View>
                  ) : (
                    <Text style={styles.resetButtonText}>Send Reset Link</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </LinearGradient>

        {/* Error Modal */}
        <ErrorModal
          visible={errorModal.visible}
          title={errorModal.title}
          message={errorModal.message}
          icon={errorModal.icon}
          onClose={closeErrorModal}
        />

        {/* Success Modal */}
        <SuccessModal
          visible={successModal.visible}
          title={successModal.title}
          message={successModal.message}
          onClose={closeSuccessModal}
        />
      </KeyboardAvoidingView>
    )
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#667eea', '#764ba2', '#667eea']}
        style={styles.gradient}
      >
        {/* Header */}
        <Animated.View 
          style={styles.header}
          entering={FadeInUp.delay(200)}
        >
          <View style={styles.logoContainer}>
            <Ionicons name="business" size={50} color="#ffffff" />
          </View>
          <Text style={styles.headerTitle}>SocietyHub</Text>
          <Text style={styles.headerSubtitle}>Welcome back to Society Management</Text>
        </Animated.View>

        {/* Form Container */}
        <Animated.View 
          style={styles.formContainer}
          entering={FadeInDown.delay(400)}
        >
          {/* User Type Selector */}
          <Animated.View 
            style={styles.userTypeContainer}
            entering={FadeInLeft.delay(600)}
          >
            <Text style={styles.userTypeLabel}>Login as</Text>
            <View style={styles.userTypeSelector}>
              <TouchableOpacity
                style={[styles.userTypeButton, userType === 'primary' && styles.activeUserType]}
                onPress={() => setUserType('primary')}
              >
                <Ionicons 
                  name="person" 
                  size={20} 
                  color={userType === 'primary' ? '#ffffff' : '#667eea'} 
                />
                <Text style={[
                  styles.userTypeText, 
                  userType === 'primary' && styles.activeUserTypeText
                ]}>
                  Primary User
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.userTypeButton, userType === 'secondary' && styles.activeUserType]}
                onPress={() => setUserType('secondary')}
              >
                <Ionicons 
                  name="people" 
                  size={20} 
                  color={userType === 'secondary' ? '#ffffff' : '#667eea'} 
                />
                <Text style={[
                  styles.userTypeText, 
                  userType === 'secondary' && styles.activeUserTypeText
                ]}>
                  Secondary User
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Form Fields */}
          <Animated.View 
            style={styles.inputContainer}
            entering={FadeInRight.delay(800)}
          >
            <View style={styles.inputWrapper}>
              <Ionicons name="mail" size={20} color="#667eea" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor="#999"
                value={formData.email}
                onChangeText={(text) => setFormData({...formData, email: text.trim()})}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed" size={20} color="#667eea" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#999"
                value={formData.password}
                onChangeText={(text) => setFormData({...formData, password: text})}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="password"
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons 
                  name={showPassword ? "eye" : "eye-off"} 
                  size={20} 
                  color="#667eea" 
                />
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Forgot Password */}
          <Animated.View 
            style={styles.forgotPasswordContainer}
            entering={FadeInLeft.delay(1000)}
          >
            <TouchableOpacity 
              style={styles.forgotPassword}
              onPress={() => setShowForgotPassword(true)}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Login Button */}
          <Animated.View 
            style={styles.loginButtonContainer}
            entering={FadeInDown.delay(1200)}
          >
            <TouchableOpacity 
              style={styles.loginButton} 
              onPress={handleLogin}
              disabled={isLoading}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.loginGradient}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <Animated.View 
                      entering={FadeInLeft}
                      style={styles.loadingDot}
                    />
                    <Text style={styles.loadingText}>Signing in...</Text>
                  </View>
                ) : (
                  <>
                    <Text style={styles.loginButtonText}>Sign In</Text>
                    <Ionicons name="arrow-forward" size={20} color="#ffffff" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* User Type Info */}
          {/* <Animated.View 
            style={styles.infoContainer}
            entering={FadeInUp.delay(1400)}
          >
            <Text style={styles.infoText}>
              {userType === 'primary' 
                ? 'Primary users have full access to society management features'
                : 'Secondary users have limited access to society management features'
              }
            </Text>
          </Animated.View> */}
          <Animated.View
            style={styles.infoContainer}
            entering={FadeInUp.delay(1600)}
          >
            <Text style={styles.infoText}>
              By signing in, you agree to our{' '}
              <Text 
                style={{ color: '#667eea', textDecorationLine: 'underline' }}
                onPress={() => handleExternalLink('https://vacantvectors.tech/terms', 'Terms of Service')}
              >Terms of Service</Text> and{' '}
              <Text 
                style={{ color: '#667eea', textDecorationLine: 'underline' }}
                onPress={() => handleExternalLink('https://vacantvectors.tech/privacy', 'Privacy Policy')}
              >Privacy Policy</Text>
            </Text>
          </Animated.View>
        </Animated.View>
        </LinearGradient>

        {/* Error Modal */}
        <ErrorModal
          visible={errorModal.visible}
          title={errorModal.title}
          message={errorModal.message}
          icon={errorModal.icon}
          onClose={closeErrorModal}
        />

        {/* Success Modal */}
        <SuccessModal
          visible={successModal.visible}
          title={successModal.title}
          message={successModal.message}
          onClose={closeSuccessModal}
        />
      </KeyboardAvoidingView>
  )
}

// ... rest of your existing styles remain the same

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 40,
    minHeight: '50%',
  },
  userTypeContainer: {
    marginBottom: 30,
  },
  userTypeLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  userTypeSelector: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fb',
    borderRadius: 15,
    padding: 6,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  userTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  activeUserType: {
    backgroundColor: '#667eea',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  userTypeText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
  },
  activeUserTypeText: {
    color: '#ffffff',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fb',
    borderRadius: 15,
    marginBottom: 20,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 15,
  },
  input: {
    flex: 1,
    paddingVertical: 18,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  eyeIcon: {
    padding: 8,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 30,
  },
  forgotPassword: {
    padding: 5,
  },
  forgotPasswordText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
  },
  loginButtonContainer: {
    marginBottom: 20,
  },
  loginButton: {
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  loginGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loadingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ffffff',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    alignItems: 'center',
    paddingTop: 10,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
    opacity: 0.8,
  },

  // Forgot Password Styles
  forgotContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  forgotHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  forgotTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 20,
    marginBottom: 10,
  },
  forgotSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 24,
  },
  forgotForm: {
    backgroundColor: '#ffffff',
    borderRadius: 25,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  forgotInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fb',
    borderRadius: 15,
    paddingHorizontal: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  forgotInput: {
    flex: 1,
    paddingVertical: 18,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  resetButton: {
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  resetGradient: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
  },
  resetButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  
  // Modern Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  
  // Error Modal Styles - Modern
  errorModalContainer: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 20,
  },
  errorModalContent: {
    padding: 32,
    alignItems: 'center',
  },
  errorIconContainer: {
    marginBottom: 24,
  },
  errorIconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffebee',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffcdd2',
  },
  modalTextContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  errorModalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  errorModalMessage: {
    fontSize: 16,
    color: '#5a6c7d',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  errorModalButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#ff4757',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  errorButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  errorModalButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  
  // Success Modal Styles - Modern
  successModalContainer: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 20,
  },
  successModalContent: {
    padding: 32,
    alignItems: 'center',
  },
  successIconContainer: {
    marginBottom: 24,
  },
  successIconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e8f5e8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#c8e6c9',
  },
  successModalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  successModalMessage: {
    fontSize: 16,
    color: '#5a6c7d',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  successModalButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#2ed573',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  successButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  successModalButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
})
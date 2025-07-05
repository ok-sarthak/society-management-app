import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, KeyboardAvoidingView, Platform, Alert } from 'react-native'
import React, { useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import Animated, { FadeInDown, FadeInUp, FadeInLeft, FadeInRight } from 'react-native-reanimated'
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../config/firebase'
import AsyncStorage from '@react-native-async-storage/async-storage'

const { width, height } = Dimensions.get('window')

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

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all fields')
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
          Alert.alert('Error', `This account is registered as ${userData.userType} user`)
          setIsLoading(false)
          return
        }

        // Store user data locally
        await AsyncStorage.setItem('userType', userData.userType)
        await AsyncStorage.setItem('userData', JSON.stringify(userData))
        await AsyncStorage.setItem('isLoggedIn', 'true')

        setIsLoading(false)
        onLogin(userData)
      } else {
        Alert.alert('Error', 'User data not found')
        setIsLoading(false)
      }
    } catch (error) {
      setIsLoading(false)
      let errorMessage = 'Login failed'
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email'
          break
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password'
          break
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address'
          break
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled'
          break
        default:
          errorMessage = error.message
      }
      
      Alert.alert('Login Error', errorMessage)
    }
  }

  const handleForgotPassword = async () => {
    if (!formData.resetEmail) {
      Alert.alert('Error', 'Please enter your email address')
      return
    }

    setIsLoading(true)
    
    try {
      await sendPasswordResetEmail(auth, formData.resetEmail)
      setIsLoading(false)
      Alert.alert(
        'Password Reset',
        'A password reset link has been sent to your email address.',
        [
          {
            text: 'OK',
            onPress: () => setShowForgotPassword(false)
          }
        ]
      )
    } catch (error) {
      setIsLoading(false)
      let errorMessage = 'Failed to send reset email'
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address'
      }
      
      Alert.alert('Error', errorMessage)
    }
  }

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
                No worries! Enter your email and we'll send you a reset link.
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
                  onChangeText={(text) => setFormData({...formData, resetEmail: text})}
                  keyboardType="email-address"
                  autoCapitalize="none"
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
                onChangeText={(text) => setFormData({...formData, email: text})}
                keyboardType="email-address"
                autoCapitalize="none"
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
          <Animated.View 
            style={styles.infoContainer}
            entering={FadeInUp.delay(1400)}
          >
            <Text style={styles.infoText}>
              {userType === 'primary' 
                ? 'Primary users have full access to society management features'
                : 'Secondary users have limited access to society management features'
              }
            </Text>
          </Animated.View>
        </Animated.View>
      </LinearGradient>
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
})
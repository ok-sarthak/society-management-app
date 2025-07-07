import AsyncStorage from '@react-native-async-storage/async-storage'
import { signOut } from 'firebase/auth'
import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
import { auth } from '../config/firebase'
import AuthScreen from './AuthScreen'
import OnboardingScreen from './OnboardingScreen'
import PrimaryDashboard from './PrimaryDashboard'
import SecondaryDashboard from './SecondaryDashboard'
import SplashScreen from './SplashScreen'

export default function AppNavigator() {
  const [currentScreen, setCurrentScreen] = useState('splash')
  const [isLoading, setIsLoading] = useState(true)
  const [userData, setUserData] = useState(null)

  useEffect(() => {
    checkOnboardingStatus()
  }, [])

  const checkOnboardingStatus = async () => {
    try {
      const hasOnboarded = await AsyncStorage.getItem('hasOnboarded')
      const isLoggedIn = await AsyncStorage.getItem('isLoggedIn')
      const storedUserData = await AsyncStorage.getItem('userData')
      
      if (hasOnboarded && isLoggedIn && storedUserData) {
        setUserData(JSON.parse(storedUserData))
        setCurrentScreen('main')
      } else if (hasOnboarded) {
        setCurrentScreen('auth')
      } else {
        setCurrentScreen('splash')
      }
    } catch (error) {
      console.log('Error checking onboarding status:', error)
      setCurrentScreen('splash')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSplashFinish = () => {
    setCurrentScreen('onboarding')
  }

  const handleOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem('hasOnboarded', 'true')
      setCurrentScreen('auth')
    } catch (error) {
      console.log('Error saving onboarding status:', error)
    }
  }

  const handleLogin = async (user) => {
    try {
      await AsyncStorage.setItem('isLoggedIn', 'true')
      setUserData(user)
      setCurrentScreen('main')
    } catch (error) {
      console.log('Error saving login status:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      await AsyncStorage.multiRemove(['isLoggedIn', 'userData', 'userType'])
      setUserData(null)
      setCurrentScreen('auth')
    } catch (error) {
      console.log('Error during logout:', error)
    }
  }

  if (isLoading) {
    return <View style={{flex: 1, backgroundColor: '#4c669f'}} />
  }

  const renderScreen = () => {
    if (currentScreen === 'main') {
    // If userData is missing or user is not logged in, force logout and redirect to auth
    if (!userData) {
      handleLogout()
      return <AuthScreen onLogin={handleLogin} />
    }
  }
    switch (currentScreen) {
      case 'splash':
        return <SplashScreen onFinish={handleSplashFinish} />
      case 'onboarding':
        return <OnboardingScreen onComplete={handleOnboardingComplete} />
      case 'auth':
        return <AuthScreen onLogin={handleLogin} />
      case 'main':
        if (userData?.userType === 'primary') {
          return <PrimaryDashboard userData={userData} onLogout={handleLogout} />
        } else {
          return <SecondaryDashboard userData={userData} onLogout={handleLogout} />
        }
      default:
        return <SplashScreen onFinish={handleSplashFinish} />
    }
  }

  // Clear AsyncStorage for testing purposes
  // AsyncStorage.clear() 


  return renderScreen()
}
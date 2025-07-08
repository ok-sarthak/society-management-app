import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import React, { useEffect, useState } from 'react'
import { Alert, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Animated, {
  Easing,
  ZoomIn,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming
} from 'react-native-reanimated'

// Import tab components
import DashboardTab from './tabs/primary/DashboardTab/DashboardTab'
import MaintenanceTab from './tabs/primary/MaintenanceTab/MaintenanceTab'
import MembersTab from './tabs/primary/MembersTab/MembersTab'
import StaffTab from './tabs/primary/StaffTab/StaffTab'
import VisitorsTab from './tabs/primary/VisitorsTab/VisitorsTab'

export default function PrimaryDashboard({ userData, onLogout }) {
  const [selectedTab, setSelectedTab] = useState(0)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isOnline, setIsOnline] = useState(true) // Start with true assumption
  const [retrySpinning, setRetrySpinning] = useState(false)
  const headerAnimation = useSharedValue(0)
  const pulseAnimation = useSharedValue(1)
  const retrySpinAnimation = useSharedValue(0)

  // Global error handler for Firebase and network errors
  useEffect(() => {
    const originalConsoleError = console.error
    const originalConsoleWarn = console.warn
    
    console.error = (...args) => {
      const errorMessage = args.join(' ')
      
      // Suppress all Firebase/Firestore connection errors
      if (
        errorMessage.includes('Could not reach Cloud Firestore backend') ||
        errorMessage.includes('FirebaseError: [code=unavailable]') ||
        errorMessage.includes('The operation could not be completed') ||
        errorMessage.includes('Connection failed') ||
        errorMessage.includes('Most recent error: FirebaseError') ||
        errorMessage.includes('@firebase/firestore') ||
        errorMessage.includes('Firestore (')
      ) {
        // Silently handle these errors - they're expected when offline
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
        warnMessage.includes('@firebase')
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

  React.useEffect(() => {
    headerAnimation.value = withTiming(1, { duration: 1200 })
    pulseAnimation.value = withRepeat(
      withTiming(1.1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    )
  }, [headerAnimation, pulseAnimation])

  // Real-time clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Check internet connectivity with better error handling
  useEffect(() => {
    let connectivityInterval;
    let fastCheckInterval;
    let currentOnlineState = true; // Local state to avoid dependency issues
    
    const checkConnectivity = async () => {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3000) // Slightly longer timeout
        
        // Try multiple endpoints for better reliability
        const endpoints = [
          'https://www.google.com',
          'https://www.cloudflare.com',
          'https://8.8.8.8'
        ];
        
        // Try the first endpoint
        const response = await fetch(endpoints[0], { 
          method: 'HEAD',
          cache: 'no-cache',
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (response.ok && response.status === 200) {
          currentOnlineState = true
          setIsOnline(true)
        } else {
          currentOnlineState = false
          setIsOnline(false)
        }
      } catch (_error) {
        // If first endpoint fails, try a backup
        try {
          const backupResponse = await fetch('https://www.cloudflare.com', { 
            method: 'HEAD',
            cache: 'no-cache'
          })
          if (backupResponse.ok) {
            currentOnlineState = true
            setIsOnline(true)
          } else {
            currentOnlineState = false
            setIsOnline(false)
          }
        } catch (_backupError) {
          currentOnlineState = false
          setIsOnline(false)
        }
      }
    }

    const setupIntervals = () => {
      // Clear existing intervals
      if (connectivityInterval) clearInterval(connectivityInterval)
      if (fastCheckInterval) clearInterval(fastCheckInterval)
      
      // Regular check every 5 seconds
      connectivityInterval = setInterval(() => {
        checkConnectivity()
        
        // If offline, also setup fast checking
        setTimeout(() => {
          if (!currentOnlineState) {
            if (!fastCheckInterval) {
              fastCheckInterval = setInterval(checkConnectivity, 2000)
            }
          } else {
            if (fastCheckInterval) {
              clearInterval(fastCheckInterval)
              fastCheckInterval = null
            }
          }
        }, 100)
      }, 5000)
    }

    // Initial check
    checkConnectivity()
    setupIntervals()

    // For React Native, we'll rely on the interval checks
    try {
      // Only add web listeners if available
      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        const handleOnline = () => {
          currentOnlineState = true
          setIsOnline(true)
          checkConnectivity() // Double-check
        }
        const handleOffline = () => {
          currentOnlineState = false
          setIsOnline(false)
        }
        const handleVisibilityChange = () => {
          if (document.visibilityState === 'visible') {
            checkConnectivity()
          }
        }

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)
        document.addEventListener('visibilitychange', handleVisibilityChange)

        return () => {
          if (connectivityInterval) clearInterval(connectivityInterval)
          if (fastCheckInterval) clearInterval(fastCheckInterval)
          window.removeEventListener('online', handleOnline)
          window.removeEventListener('offline', handleOffline)
          document.removeEventListener('visibilitychange', handleVisibilityChange)
        }
      }
    } catch (_) {
      // Ignore errors in React Native environment
    }

    return () => {
      if (connectivityInterval) clearInterval(connectivityInterval)
      if (fastCheckInterval) clearInterval(fastCheckInterval)
    }
  }, [])

  // Additional aggressive checking when offline detected
  useEffect(() => {
    let aggressiveCheckInterval;
    
    if (!isOnline) {
      // When offline, check every 1.5 seconds aggressively
      const aggressiveCheck = async () => {
        try {
          const response = await fetch('https://www.google.com', { 
            method: 'HEAD',
            cache: 'no-cache'
          })
          if (response.ok) {
            setIsOnline(true)
          }
        } catch (_error) {
          // Still offline, try backup
          try {
            const backupResponse = await fetch('https://www.cloudflare.com', { 
              method: 'HEAD',
              cache: 'no-cache'
            })
            if (backupResponse.ok) {
              setIsOnline(true)
            }
          } catch (_backupError) {
            // Still offline
          }
        }
      }
      
      aggressiveCheckInterval = setInterval(aggressiveCheck, 1500)
    }

    return () => {
      if (aggressiveCheckInterval) clearInterval(aggressiveCheckInterval)
    }
  }, [isOnline])

  // Handle manual retry with animation
  const handleRetry = async () => {
    if (retrySpinning) return // Prevent multiple simultaneous retries
    
    setRetrySpinning(true)
    retrySpinAnimation.value = withRepeat(
      withTiming(360, { duration: 1000, easing: Easing.linear }),
      -1,
      false
    )

    try {
      // Try multiple endpoints for better success rate
      const endpoints = ['https://www.google.com', 'https://www.cloudflare.com'];
      let connected = false;
      
      for (const endpoint of endpoints) {
        try {
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 4000)
          
          const response = await fetch(endpoint, { 
            method: 'HEAD',
            cache: 'no-cache',
            signal: controller.signal
          })
          
          clearTimeout(timeoutId)
          
          if (response.ok) {
            connected = true;
            break;
          }
        } catch (_) {
          // Try next endpoint
          continue;
        }
      }
      
      if (connected) {
        setIsOnline(true)
      } else {
        setIsOnline(false)
      }
    } catch (_error) {
      // Don't log retry errors to keep console clean
      setIsOnline(false)
    } finally {
      // Stop spinning after attempt
      setTimeout(() => {
        setRetrySpinning(false)
        retrySpinAnimation.value = 0
      }, 800) // Slightly faster feedback
    }
  }

  const handleLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: onLogout
        }
      ]
    )
  }

  const welcomeGreeting = () => {
    const hours = new Date().getHours();
    if ( hours >= 5 && hours < 12) {
      return 'Good Morning'
    } else if (hours >= 12 && hours < 18) {
      return 'Good Afternoon'
    } else {
      return 'Good Evening'
    }
  }

  const formatTime = () => {
    return currentTime.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatDate = () => {
    return currentTime.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const getUserStatus = () => {
    return userData?.status || 'inactive' // Default to active if no status provided
  }

  const getUserRole = () => {
    return userData?.role || 'Society Member Role' // Default role
  }

  const renderNoInternetScreen = () => (
    <View style={styles.noInternetContainer}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.noInternetGradient}
      >
        <Animated.View entering={ZoomIn.delay(300)} style={styles.noInternetContent}>
          <Ionicons name="wifi-outline" size={80} color="#ffffff" />
          <Text style={styles.noInternetTitle}>No Internet Connection</Text>
          <Text style={styles.noInternetMessage}>
            Please check your internet connection and try again
          </Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={handleRetry}
            disabled={retrySpinning}
          >
            <Animated.View style={retrySpinning ? retrySpinStyle : {}}>
              <Ionicons 
                name="refresh-outline" 
                size={20} 
                color={retrySpinning ? "#999" : "#667eea"} 
              />
            </Animated.View>
            <Text style={[styles.retryText, retrySpinning && styles.retryTextDisabled]}>
              {retrySpinning ? 'Checking...' : 'Retry'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>
    </View>
  )

  const bottomTabs = [
    { name: 'Dashboard', icon: 'grid', id: 0 },
    { name: 'Members', icon: 'people', id: 1 },
    { name: 'Maintenance', icon: 'card', id: 2 },
    { name: 'Visitors', icon: 'car-sport', id: 3 },
    { name: 'Staff', icon: 'people-circle', id: 4 },
  ]

  const renderTabContent = () => {
    switch(selectedTab) {
      case 0:
        return <DashboardTab userData={userData} onTabChange={setSelectedTab} />
      case 1:
        return <MembersTab userData={userData} />
      case 2:
        return <MaintenanceTab userData={userData} />
      case 3:
        return <VisitorsTab userData={userData} />
      case 4:
        return <StaffTab userData={userData} />
      default:
        return <DashboardTab userData={userData} onTabChange={setSelectedTab} />
    }
  }

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(headerAnimation.value, [0, 1], [0, 1])
    const translateY = interpolate(headerAnimation.value, [0, 1], [-30, 0])
    
    return {
      opacity,
      transform: [{ translateY }]
    }
  })

  const pulseStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseAnimation.value }]
    }
  })

  const retrySpinStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${retrySpinAnimation.value}deg` }]
    }
  })

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {!isOnline ? renderNoInternetScreen() : (
        <>
          {/* Compact Header */}
          <LinearGradient
            colors={['#667eea', '#764ba2', '#f093fb']}
            style={styles.compactHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Animated.View style={[styles.headerContent, headerAnimatedStyle]}>
              <View style={styles.headerLeft}>
                <View style={styles.userInfo}>
                  <Text style={styles.welcomeText}>{welcomeGreeting()}</Text>
                  <Text style={styles.userName}>{userData?.name || 'Society Name'}</Text>
                  <Text style={styles.userRole}>{getUserRole() || 'Society Member Role'}</Text>
                </View>
                
                {/* Status Section */}
                <View style={styles.statusSection}>
                  <View style={styles.statusContainer}>
                    <View style={[
                      styles.statusDot, 
                      { backgroundColor: getUserStatus() === 'active' ? '#4ade80' : '#f87171' }
                    ]} />
                    <Text style={styles.statusText}>
                      {getUserStatus() === 'active' ? 'Active' : 'Inactive'}
                    </Text>
                    {/* Connection Status Indicator */}
                  <View style={[styles.connectionContainer, { marginTop: 4 }]}>
                    <View style={[
                      styles.connectionDot, 
                      { backgroundColor: isOnline ? '#10b981' : '#ef4444' }
                    ]} />
                    <Text style={styles.connectionText}>
                      {isOnline ? 'Connected' : 'Offline'}
                    </Text>
                  </View>
                  </View>
                  
                  
                </View>
              </View>
              
              {/* Time and Logout Section */}
              <View style={styles.rightSection}>
                <View style={styles.timeSection}>
                  <Text style={styles.timeText}>{formatTime()}</Text>
                  <Text style={styles.dateText}>{formatDate()}</Text>
                </View>
                
                <Animated.View entering={ZoomIn.delay(600)} style={[pulseStyle, styles.logoutButtonContainer]}>
                  <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={16} color="#ffffff" />
                  </TouchableOpacity>
                </Animated.View>
              </View>
            </Animated.View>
          </LinearGradient>

          {/* Tab Content */}
          <View style={styles.tabContent}>
            {renderTabContent()}
          </View>

          {/* Bottom Tab Bar */}
          <View style={styles.bottomTabContainer}>
            <LinearGradient
              colors={['#ffffff', '#f8f9fa']}
              style={styles.bottomTabGradient}
            >
              {bottomTabs.map((tab) => (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.tabButton, selectedTab === tab.id && styles.activeTab]}
                  onPress={() => setSelectedTab(tab.id)}
                >
                  <Ionicons
                    name={tab.icon}
                    size={24}
                    color={selectedTab === tab.id ? '#667eea' : '#999'}
                  />
                  <Text style={[
                    styles.tabText,
                    selectedTab === tab.id && styles.activeTabText
                  ]}>
                    {tab.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </LinearGradient>
          </View>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  compactHeader: {
    paddingTop: 45,
    paddingBottom: 18,
    paddingHorizontal: 18,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  userInfo: {
    marginBottom: 8,
  },
  welcomeText: {
    color: '#ffffff',
    fontSize: 13,
    opacity: 0.9,
    fontWeight: '500',
    fontFamily: 'outfit-medium',
  },
  userName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'outfit-bold',
    marginTop: 1,
    marginBottom: 1,
  },
  userRole: {
    color: '#ffffff',
    fontSize: 11,
    opacity: 0.8,
    fontWeight: '500',
    fontFamily: 'outfit-regular',
  },
  statusSection: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 10,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-start',
    gap: 10,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 5,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'outfit-medium',
  },
  connectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 4,
  },
  connectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  connectionText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '500',
    fontFamily: 'outfit-medium',
    opacity: 0.9,
  },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 75,
  },
  timeSection: {
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 6,
  },
  timeText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'outfit-bold',
  },
  dateText: {
    color: '#ffffff',
    fontSize: 10,
    opacity: 0.9,
    fontFamily: 'outfit-medium',
    marginTop: 1,
  },
  logoutButtonContainer: {
    marginTop: 'auto',
  },
  logoutButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  noInternetContainer: {
    flex: 1,
  },
  noInternetGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noInternetContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  noInternetTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'outfit-bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  noInternetMessage: {
    color: '#ffffff',
    fontSize: 16,
    opacity: 0.8,
    fontFamily: 'outfit-medium',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'outfit-semibold',
    marginLeft: 8,
  },
  retryTextDisabled: {
    color: '#999',
    opacity: 0.7,
  },
  tabContent: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  bottomTabContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomTabGradient: {
    flexDirection: 'row',
    paddingTop: 15,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeTab: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderRadius: 12,
  },
  tabText: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
    fontFamily: 'outfit-medium',
  },
  activeTabText: {
    color: '#667eea',
    fontWeight: '600',
    fontFamily: 'outfit-bold',
  },
})
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, StatusBar } from 'react-native'
import React, { useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import Animated, {  
  FadeInUp,
  ZoomIn,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withRepeat,
  Easing
} from 'react-native-reanimated'

// Import tab components
import DashboardTab from './tabs/DashboardTab'
import MembersTab from './tabs/MembersTab'
import MaintenanceTab from './tabs/MaintenanceTab'
import VisitorsTab from './tabs/VisitorsTab'
import StaffTab from './tabs/StaffTab'

const { width, height } = Dimensions.get('window')

export default function PrimaryDashboard({ userData, onLogout }) {
  const [selectedTab, setSelectedTab] = useState(0)
  const headerAnimation = useSharedValue(0)
  const pulseAnimation = useSharedValue(1)

  React.useEffect(() => {
    headerAnimation.value = withTiming(1, { duration: 1200 })
    pulseAnimation.value = withRepeat(
      withTiming(1.1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    )
  }, [])

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

  const bottomTabs = [
    { name: 'Dashboard', icon: 'grid', id: 0 },
    { name: 'Members', icon: 'people', id: 1 },
    { name: 'Maintenance', icon: 'card', id: 2 },
    { name: 'Visitors', icon: 'car-sport', id: 3 },
    { name: 'Staff', icon: 'people-circle', id: 4 },
  ]

  const getTabTitle = () => {
    switch(selectedTab) {
      case 0: return 'Dashboard Overview'
      case 1: return 'Members Management'
      case 2: return 'Maintenance & Bills'
      case 3: return 'Visitor Management'
      case 4: return 'Staff Management'
      default: return 'Dashboard Overview'
    }
  }

  const getTabSubtitle = () => {
    switch(selectedTab) {
      case 0: return 'Welcome back to your society dashboard'
      case 1: return 'Manage all society members and residents'
      case 2: return 'Track payments and maintenance records'
      case 3: return 'Monitor and manage visitor entries'
      case 4: return 'Oversee staff and their activities'
      default: return 'Welcome back to your society dashboard'
    }
  }

  const renderTabContent = () => {
    switch(selectedTab) {
      case 0:
        return <DashboardTab userData={userData} />
      case 1:
        return <MembersTab userData={userData} />
      case 2:
        return <MaintenanceTab userData={userData} />
      case 3:
        return <VisitorsTab userData={userData} />
      case 4:
        return <StaffTab userData={userData} />
      default:
        return <DashboardTab userData={userData} />
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View style={[styles.headerContent, headerAnimatedStyle]}>
          <View style={styles.headerLeft}>
            <Animated.View entering={FadeInUp.delay(200)}>
              <Text style={styles.welcomeText}>{welcomeGreeting()}</Text>
              <Text style={styles.userName}>{userData?.name || 'Society'}</Text>
              <Text style={styles.userRole}>Society Administrator</Text>
            </Animated.View>
            <Animated.View entering={FadeInUp.delay(400)} style={styles.dateContainer}>
              <Ionicons name="calendar-outline" size={16} color="#ffffff" />
              <Text style={styles.dateText}>
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
            </Animated.View>
          </View>
          <Animated.View entering={ZoomIn.delay(600)} style={pulseStyle}>
            <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
              <Ionicons name="log-out-outline" size={24} color="#ffffff" />
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </LinearGradient>

      {/* Tab Header */}
      <Animated.View 
        entering={FadeInUp.delay(800)}
        style={styles.tabHeader}
      >
        <Text style={styles.tabTitle}>{getTabTitle()}</Text>
        <Text style={styles.tabSubtitle}>{getTabSubtitle()}</Text>
      </Animated.View>

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
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  welcomeText: {
    color: '#ffffff',
    fontSize: 18,
    opacity: 0.9,
    fontWeight: '600',
    fontFamily: 'outfit-medium',
  },
  userName: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '800',
    fontFamily: 'outfit-bold',
    marginTop: 6,
    marginBottom: 4,
  },
  userRole: {
    color: '#ffffff',
    fontSize: 16,
    opacity: 0.85,
    fontWeight: '500',
    fontFamily: 'outfit-thin',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  dateText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'outfit-extrabold',
  },
  logoutButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  tabHeader: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
  },
  tabTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 4,
  },
  tabSubtitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
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
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, StatusBar } from 'react-native'
import React, { useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import Animated, { 
  FadeInDown, 
  FadeInRight, 
  FadeInUp,
  SlideInLeft,
  SlideInRight,
  ZoomIn,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withRepeat,
  Easing
} from 'react-native-reanimated'

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

  const dashboardCards = [
    {
      id: 1,
      title: 'Total Members',
      icon: 'people',
      gradient: ['#667eea', '#764ba2'],
      count: '247',
      subtitle: 'Active Residents',
      trend: '+12%',
      trendIcon: 'trending-up',
      description: 'New registrations this month'
    },
    {
      id: 2,
      title: 'Maintenance Revenue',
      icon: 'wallet',
      gradient: ['#11998e', '#38ef7d'],
      count: '₹1.2L',
      subtitle: 'Current Month',
      trend: '+8%',
      trendIcon: 'trending-up',
      description: 'Collection efficiency: 94%'
    },
    {
      id: 3,
      title: 'Daily Visitors',
      icon: 'car',
      gradient: ['#ff6b6b', '#ee5a24'],
      count: '42',
      subtitle: 'Today',
      trend: '+5%',
      trendIcon: 'trending-up',
      description: 'Peak hours: 6-8 PM'
    },
    {
      id: 4,
      title: 'Staff Management',
      icon: 'shield-checkmark',
      gradient: ['#a8edea', '#fed6e3'],
      count: '8',
      subtitle: 'On Duty',
      trend: '100%',
      trendIcon: 'checkmark-circle',
      description: 'All positions filled'
    }
  ]

  const bottomTabs = [
    { name: 'Dashboard', icon: 'grid', id: 0 },
    { name: 'Members', icon: 'people', id: 1 },
    { name: 'Maintenance', icon: 'card', id: 2 },
    { name: 'Visitors', icon: 'car-sport', id: 3 },
    { name: 'Staff', icon: 'people-circle', id: 4 },
  ]

  const statsCards = [
    { 
      title: 'Total Revenue', 
      value: '₹45.2L', 
      icon: 'trending-up', 
      color: '#11998e',
      percentage: '+15.2%',
      subtitle: 'vs last month'
    },
    { 
      title: 'Pending Bills', 
      value: '23', 
      icon: 'time', 
      color: '#ff6b6b',
      percentage: '-8%',
      subtitle: 'decreased'
    },
    { 
      title: 'New Registrations', 
      value: '12', 
      icon: 'person-add', 
      color: '#667eea',
      percentage: '+25%',
      subtitle: 'this week'
    },
    { 
      title: 'Complaints Resolved', 
      value: '18', 
      icon: 'checkmark-done-circle', 
      color: '#38ef7d',
      percentage: '100%',
      subtitle: 'completion rate'
    },
  ]

  const renderStatsCard = (stat, index) => (
    <Animated.View
      key={index}
      entering={SlideInLeft.delay(index * 150).springify()}
      style={styles.statsCard}
    >
      <LinearGradient
        colors={[stat.color + '15', stat.color + '05']}
        style={styles.statsGradient}
      >
        <View style={styles.statsHeader}>
          <View style={[styles.statsIconContainer, { backgroundColor: stat.color + '20' }]}>
            <Ionicons name={stat.icon} size={24} color={stat.color} />
          </View>
          <View style={styles.statsPercentage}>
            <Text style={[styles.percentageText, { color: stat.color }]}>
              {stat.percentage}
            </Text>
          </View>
        </View>
        <View style={styles.statsContent}>
          <Text style={styles.statsValue}>{stat.value}</Text>
          <Text style={styles.statsTitle}>{stat.title}</Text>
          <Text style={styles.statsSubtitle}>{stat.subtitle}</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  )

  const renderDashboardCard = (card, index) => (
    <Animated.View
      key={card.id}
      entering={FadeInDown.delay(index * 200).springify()}
      style={styles.cardContainer}
    >
      <TouchableOpacity activeOpacity={0.9}>
        <LinearGradient
          colors={card.gradient}
          style={styles.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardIconContainer}>
              <View style={styles.iconBackground}>
                <Ionicons name={card.icon} size={32} color="#ffffff" />
              </View>
            </View>
            <View style={styles.trendContainer}>
              <Ionicons name={card.trendIcon} size={14} color="#ffffff" />
              <Text style={styles.trendText}>{card.trend}</Text>
            </View>
          </View>
          
          <View style={styles.cardContent}>
            <Text style={styles.cardCount}>{card.count}</Text>
            <Text style={styles.cardTitle}>{card.title}</Text>
            <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
            <Text style={styles.cardDescription}>{card.description}</Text>
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.cardProgressBar}>
              <Animated.View 
                style={[styles.cardProgress, { width: '75%' }]}
                entering={SlideInRight.delay(index * 200 + 500)}
              />
            </View>
            <TouchableOpacity style={styles.viewMoreButton}>
              <Text style={styles.viewMoreText}>View Details</Text>
              <Ionicons name="arrow-forward" size={14} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  )

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
              <Text style={styles.welcomeText}>Good Morning!</Text>
              <Text style={styles.userName}>{userData?.name || 'Admin'}</Text>
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

      {/* Dashboard Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Stats */}
        <Animated.View 
          entering={FadeInUp.delay(800)}
          style={styles.quickStatsContainer}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Analytics Overview</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.statsScrollView}
            contentContainerStyle={styles.statsScrollContent}
          >
            {statsCards.map((stat, index) => renderStatsCard(stat, index))}
          </ScrollView>
        </Animated.View>

        {/* Main Dashboard Cards */}
        <Animated.View 
          entering={FadeInUp.delay(1000)}
          style={styles.dashboardSection}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Management Hub</Text>
            <TouchableOpacity>
              <Ionicons name="settings-outline" size={20} color="#667eea" />
            </TouchableOpacity>
          </View>
          <View style={styles.dashboardGrid}>
            {dashboardCards.map((card, index) => renderDashboardCard(card, index))}
          </View>
        </Animated.View>
      </ScrollView>

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
  },
  userName: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '800',
    marginTop: 6,
    marginBottom: 4,
  },
  userRole: {
    color: '#ffffff',
    fontSize: 16,
    opacity: 0.85,
    fontWeight: '500',
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
  content: {
    flex: 1,
  },
  quickStatsContainer: {
    paddingTop: 30,
    paddingHorizontal: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
  },
  statsScrollView: {
    marginBottom: 10,
  },
  statsScrollContent: {
    paddingRight: 24,
  },
  statsCard: {
    marginRight: 20,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  statsGradient: {
    padding: 20,
    minWidth: 180,
    backgroundColor: '#ffffff',
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsPercentage: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  percentageText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statsContent: {
    alignItems: 'flex-start',
  },
  statsValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 4,
  },
  statsTitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 2,
  },
  statsSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  dashboardSection: {
    paddingHorizontal: 24,
    paddingTop: 30,
  },
  dashboardGrid: {
    paddingBottom: 140,
  },
  cardContainer: {
    marginBottom: 24,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  cardGradient: {
    borderRadius: 28,
    padding: 28,
    minHeight: 180,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardIconContainer: {
    position: 'relative',
  },
  iconBackground: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  trendText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },
  cardContent: {
    marginBottom: 24,
  },
  cardCount: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: '900',
    marginBottom: 8,
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
    opacity: 0.95,
  },
  cardSubtitle: {
    color: '#ffffff',
    fontSize: 14,
    opacity: 0.8,
    fontWeight: '500',
    marginBottom: 4,
  },
  cardDescription: {
    color: '#ffffff',
    fontSize: 12,
    opacity: 0.7,
    fontWeight: '500',
  },
  cardFooter: {
    marginTop: 'auto',
  },
  cardProgressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 16,
  },
  cardProgress: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 3,
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  viewMoreText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
    marginRight: 6,
    opacity: 0.9,
  },
  bottomTabContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    fontFamily: 'medium',
  },
  activeTabText: {
    color: '#667eea',
    fontWeight: '600',
  },
})
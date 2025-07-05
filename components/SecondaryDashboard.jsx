import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, StatusBar } from 'react-native'
import React, { useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated'

const { width, height } = Dimensions.get('window')

export default function SecondaryDashboard({ userData, onLogout }) {
  const [selectedTab, setSelectedTab] = useState(0)

  const dashboardCards = [
    {
      id: 1,
      title: 'My Payments',
      icon: 'card',
      color: '#4CAF50',
      count: '₹5,200',
      subtitle: 'This Month',
      options: [
        { name: 'View Payment History', icon: 'time' },
        { name: 'Download Receipt', icon: 'download' },
        { name: 'Payment Reminders', icon: 'notifications' }
      ]
    },
    {
      id: 2,
      title: 'Visitors',
      icon: 'car',
      color: '#FF6B6B',
      count: '3',
      subtitle: 'Today',
      options: [
        { name: 'Add Visitor', icon: 'person-add' },
        { name: 'My Visitor Log', icon: 'clipboard' },
        { name: 'Pre-approve Guests', icon: 'checkmark-circle' }
      ]
    },
    {
      id: 3,
      title: 'Community',
      icon: 'chatbubbles',
      color: '#9C27B0',
      count: '12',
      subtitle: 'New Messages',
      options: [
        { name: 'Community Chat', icon: 'chatbubbles' },
        { name: 'Announcements', icon: 'megaphone' },
        { name: 'Event Updates', icon: 'calendar' }
      ]
    }
  ]

  const bottomTabs = [
    { name: 'Home', icon: 'home', id: 0 },
    { name: 'Payments', icon: 'card', id: 1 },
    { name: 'Profile', icon: 'person', id: 2 }
  ]

  const renderDashboardCard = (card, index) => (
    <Animated.View
      key={card.id}
      entering={FadeInDown.delay(index * 200)}
      style={styles.cardContainer}
    >
      <LinearGradient
        colors={[card.color, `${card.color}CC`]}
        style={styles.cardGradient}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardIconContainer}>
            <Ionicons name={card.icon} size={30} color="#ffffff" />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{card.title}</Text>
            <Text style={styles.cardCount}>{card.count}</Text>
            <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.cardOptions}>
        {card.options.map((option, optionIndex) => (
          <TouchableOpacity
            key={optionIndex}
            style={styles.optionButton}
            onPress={() => console.log(`${card.title} - ${option.name}`)}
          >
            <Ionicons name={option.icon} size={20} color={card.color} />
            <Text style={[styles.optionText, { color: card.color }]}>
              {option.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  )

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.welcomeText}>Hello!</Text>
            <Text style={styles.userName}>{userData?.name || 'Secondary User'}</Text>
            <Text style={styles.userRole}>Family Member</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
            <Ionicons name="log-out" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Dashboard Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.dashboardGrid}>
          {dashboardCards.map((card, index) => renderDashboardCard(card, index))}
        </View>
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

// ... styles remain the same as PrimaryDashboard
const styles = StyleSheet.create({
  // ... copy all styles from PrimaryDashboard
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    color: '#ffffff',
    fontSize: 16,
    opacity: 0.9,
    fontFamily: 'medium',
  },
  userName: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'bold',
    marginTop: 4,
  },
  userRole: {
    color: '#ffffff',
    fontSize: 14,
    opacity: 0.8,
    fontFamily: 'regular',
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  dashboardGrid: {
    paddingTop: 20,
    paddingBottom: 100,
  },
  cardContainer: {
    marginBottom: 20,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardGradient: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'bold',
  },
  cardCount: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'extrabold',
    marginTop: 4,
  },
  cardSubtitle: {
    color: '#ffffff',
    fontSize: 14,
    opacity: 0.9,
    fontFamily: 'regular',
  },
  cardOptions: {
    padding: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
  },
  optionText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'medium',
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
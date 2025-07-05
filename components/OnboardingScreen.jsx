import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native'
import React, { useState, useRef } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import PagerView from 'react-native-pager-view'
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated'

const { width, height } = Dimensions.get('window')

const onboardingData = [
  {
    id: 1,
    icon: 'home',
    title: 'Welcome Home',
    subtitle: 'Your Digital Society',
    description: 'Manage your Society with ease. From members, maintenance payments to visitors management, everything at your fingertips.',
    color: '#4c6a2f',
  },
  {
    id: 2,
    icon: 'people',
    title: 'Build Strong Staff Community',
    subtitle: 'Foster Collaboration & Engagement',
    description: 'Record attendance, manage staff, and communicate effectively with your society members.',
    color: '#764ba2',
  },
  {
    id: 3,
    icon: 'notifications',
    title: 'Stay Informed',
    subtitle: 'Instant Notifications',
    description: 'Send instant notifications about visitors, staff entry and exit times, and maintenance updates.',
    color: '#ff6b6b',
  },
]

export default function OnboardingScreen({ onComplete }) {
  const [currentPage, setCurrentPage] = useState(0)
  const pagerRef = useRef(null)

  const handleNext = () => {
    if (currentPage < onboardingData.length - 1) {
      const nextPage = currentPage + 1
      pagerRef.current?.setPage(nextPage)
      setCurrentPage(nextPage)
    } else {
      onComplete?.()
    }
  }

  const handleSkip = () => {
    onComplete?.()
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[onboardingData[currentPage].color, '#ffffff']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Skip Button */}
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        {/* Page Indicator */}
        <View style={styles.indicatorContainer}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === currentPage && styles.activeIndicator,
              ]}
            />
          ))}
        </View>

        {/* Content */}
        <PagerView
          ref={pagerRef}
          style={styles.pagerView}
          initialPage={0}
          onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
        >
          {onboardingData.map((item, index) => (
            <Animated.View
              key={item.id}
              style={styles.page}
              entering={FadeInRight}
              exiting={FadeOutLeft}
            >
              <View style={styles.iconContainer}>
                <Ionicons name={item.icon} size={80} color="#ffffff" />
              </View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </Animated.View>
          ))}
        </PagerView>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>
              {currentPage === onboardingData.length - 1 ? 'Get Started' : 'Next'}
            </Text>
            <Ionicons 
              name={currentPage === onboardingData.length - 1 ? 'checkmark' : 'arrow-forward'} 
              size={20} 
              color="#ffffff" 
              style={styles.nextIcon}
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
  skipText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  indicatorContainer: {
    position: 'absolute',
    top: 120,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    zIndex: 1,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#ffffff',
    width: 24,
  },
  pagerView: {
    flex: 1,
    marginTop: 160,
  },
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily:'outfit-extrabold',
  },
  subtitle: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.9,
    fontFamily:'outfit-bold'
  },
  description: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.8,
    fontFamily:'outfit'
  },
  bottomSection: {
    paddingHorizontal: 40,
    paddingBottom: 50,
  },
  nextButton: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  nextButtonText: {
    color: '#333',
    fontSize: 18,
    fontWeight: '600',
    fontFamily:'outfit-bold'
  },
  nextIcon: {
    marginLeft: 8,
    color: '#333',
  },
})
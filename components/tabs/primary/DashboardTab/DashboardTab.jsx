import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  LinearGradient
} from 'react-native';
import { membersService } from '../../../../services/membersService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function DashboardTab({ userData }) {
  const [memberStats, setMemberStats] = useState({
    total: 0,
    active: 0,
    inactive: 0
  });
  const [loading, setLoading] = useState(true);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Individual card animations
  const card1Anim = useRef(new Animated.Value(0)).current;
  const card2Anim = useRef(new Animated.Value(0)).current;
  const card3Anim = useRef(new Animated.Value(0)).current;
  const card4Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadMemberStats();
    startAnimations();
    startPulseAnimation();
  }, []);

  const loadMemberStats = async () => {
    try {
      setLoading(true);
      const [allMembersResult, activeMembersResult, inactiveMembersResult] = await Promise.all([
        membersService.getAllMembers(),
        membersService.getActiveMembers(),
        membersService.getInactiveMembers()
      ]);

      if (allMembersResult.success && activeMembersResult.success && inactiveMembersResult.success) {
        setMemberStats({
          total: allMembersResult.data.length,
          active: activeMembersResult.data.length,
          inactive: inactiveMembersResult.data.length
        });
      }
    } catch (error) {
      console.error('Error loading member stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const startAnimations = () => {
    // Main entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      })
    ]).start();

    // Staggered card animations
    Animated.sequence([
      Animated.timing(card1Anim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(card2Anim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(card3Anim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(card4Anim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start();

    // Rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: true,
      })
    ).start();
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ])
    ).start();
  };

  const PremiumStatCard = ({ title, value, icon, gradient, cardAnim, percentage }) => {
    const cardOpacity = cardAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    const cardTranslate = cardAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [50, 0],
    });

    return (
      <Animated.View
        style={[
          styles.premiumStatCard,
          {
            opacity: cardOpacity,
            transform: [{ translateY: cardTranslate }],
          }
        ]}
      >
        <View style={[styles.gradientBackground, { backgroundColor: gradient[0] }]}>
          <View style={styles.cardGlow} />
          
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: gradient[1] }]}>
              <Ionicons name={icon} size={20} color="#fff" />
            </View>
            <View style={styles.percentageContainer}>
              <Text style={styles.percentageText}>{percentage}%</Text>
            </View>
          </View>

          <View style={styles.cardContent}>
            <Text style={styles.cardValue}>{loading ? '••' : value}</Text>
            <Text style={styles.cardTitle}>{title}</Text>
          </View>

          <View style={styles.cardPattern}>
            <View style={styles.patternDot} />
            <View style={styles.patternDot} />
            <View style={styles.patternDot} />
          </View>
        </View>
      </Animated.View>
    );
  };

  const FloatingActionButton = ({ icon, color, onPress, delay = 0 }) => {
    const fabAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      setTimeout(() => {
        Animated.spring(fabAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }).start();
      }, delay);
    }, []);

    const fabScale = fabAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    return (
      <Animated.View style={[styles.fab, { transform: [{ scale: fabScale }] }]}>
        <TouchableOpacity
          style={[styles.fabButton, { backgroundColor: color }]}
          onPress={onPress}
          activeOpacity={0.8}
        >
          <Ionicons name={icon} size={24} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const PremiumWelcomeCard = () => {
    const spin = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <Animated.View
        style={[
          styles.premiumWelcomeCard,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ],
          }
        ]}
      >
        <View style={styles.welcomeGradient}>
          <View style={styles.welcomeContent}>
            <View style={styles.welcomeTextContainer}>
              <Text style={styles.welcomeGreeting}>Good Morning</Text>
              <Text style={styles.welcomeName}>{userData?.name || 'Administrator'}</Text>
              <Text style={styles.welcomeSubtitle}>Ready to manage your society?</Text>
            </View>
            
            <View style={styles.welcomeIconContainer}>
              <Animated.View
                style={[
                  styles.rotatingBackground,
                  { transform: [{ rotate: spin }] }
                ]}
              />
              <Animated.View
                style={[
                  styles.pulsingIcon,
                  { transform: [{ scale: pulseAnim }] }
                ]}
              >
                <Ionicons name="business" size={32} color="#fff" />
              </Animated.View>
            </View>
          </View>
          
          <View style={styles.weatherInfo}>
            <View style={styles.weatherItem}>
              <Ionicons name="sunny" size={16} color="#FFA726" />
              <Text style={styles.weatherText}>28°C</Text>
            </View>
            <View style={styles.weatherDivider} />
            <View style={styles.weatherItem}>
              <Ionicons name="time" size={16} color="#42A5F5" />
              <Text style={styles.weatherText}>{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
          </View>
        </View>
      </Animated.View>
    );
  };

  const calculatePercentage = (value, total) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Premium Header */}
        <View style={styles.premiumHeader}>
          <View style={styles.headerBackground} />
          <PremiumWelcomeCard />
        </View>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Analytics Overview</Text>
          
          <View style={styles.statsGrid}>
            <PremiumStatCard
              title="Total Members"
              value={memberStats.total}
              icon="people"
              gradient={['#667eea', '#764ba2']}
              cardAnim={card1Anim}
              percentage={100}
            />
            
            <PremiumStatCard
              title="Active Members"
              value={memberStats.active}
              icon="checkmark-circle"
              gradient={['#11998e', '#38ef7d']}
              cardAnim={card2Anim}
              percentage={calculatePercentage(memberStats.active, memberStats.total)}
            />
            
            <PremiumStatCard
              title="Inactive Members"
              value={memberStats.inactive}
              icon="pause-circle"
              gradient={['#ff416c', '#ff4b2b']}
              cardAnim={card3Anim}
              percentage={calculatePercentage(memberStats.inactive, memberStats.total)}
            />
            
            <PremiumStatCard
              title="Occupancy Rate"
              value={`${calculatePercentage(memberStats.active, memberStats.total)}%`}
              icon="home"
              gradient={['#ff9a9e', '#fecfef']}
              cardAnim={card4Anim}
              percentage={calculatePercentage(memberStats.active, memberStats.total)}
            />
          </View>
        </View>

        {/* Activity Timeline */}
        <Animated.View
          style={[
            styles.timelineContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          
          <View style={styles.timelineCard}>
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: '#11998e' }]} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>New Member Added</Text>
                <Text style={styles.timelineSubtitle}>John Doe joined Tower A-101</Text>
                <Text style={styles.timelineTime}>2 hours ago</Text>
              </View>
            </View>
            
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: '#667eea' }]} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Member Updated</Text>
                <Text style={styles.timelineSubtitle}>Profile information changed</Text>
                <Text style={styles.timelineTime}>5 hours ago</Text>
              </View>
            </View>
            
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: '#ff416c' }]} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>System Backup</Text>
                <Text style={styles.timelineSubtitle}>Daily backup completed</Text>
                <Text style={styles.timelineTime}>1 day ago</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Quick Access */}
        <Animated.View
          style={[
            styles.quickAccessContainer,
            {
              opacity: fadeAnim,
            }
          ]}
        >
          <Text style={styles.sectionTitle}>Quick Access</Text>
          
          <View style={styles.quickAccessGrid}>
            <TouchableOpacity style={[styles.quickAccessCard, { borderColor: '#667eea' }]}>
              <View style={[styles.quickAccessIcon, { backgroundColor: '#667eea' }]}>
                <Ionicons name="person-add" size={24} color="#fff" />
              </View>
              <Text style={styles.quickAccessText}>Add Member</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.quickAccessCard, { borderColor: '#11998e' }]}>
              <View style={[styles.quickAccessIcon, { backgroundColor: '#11998e' }]}>
                <Ionicons name="analytics" size={24} color="#fff" />
              </View>
              <Text style={styles.quickAccessText}>Analytics</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.quickAccessCard, { borderColor: '#ff416c' }]}>
              <View style={[styles.quickAccessIcon, { backgroundColor: '#ff416c' }]}>
                <Ionicons name="settings" size={24} color="#fff" />
              </View>
              <Text style={styles.quickAccessText}>Settings</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.quickAccessCard, { borderColor: '#ff9a9e' }]}>
              <View style={[styles.quickAccessIcon, { backgroundColor: '#ff9a9e' }]}>
                <Ionicons name="notifications" size={24} color="#fff" />
              </View>
              <Text style={styles.quickAccessText}>Notifications</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Floating Action Buttons */}
      <View style={styles.fabContainer}>
        <FloatingActionButton
          icon="add"
          color="#667eea"
          delay={1000}
        />
        <FloatingActionButton
          icon="search"
          color="#11998e"
          delay={1200}
        />
        <FloatingActionButton
          icon="notifications"
          color="#ff416c"
          delay={1400}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafe',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  premiumHeader: {
    height: 240,
    position: 'relative',
    overflow: 'hidden',
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: '#667eea',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  premiumWelcomeCard: {
    margin: 20,
    marginTop: 60,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  welcomeGradient: {
    backgroundColor: '#fff',
    padding: 24,
  },
  welcomeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeGreeting: {
    fontSize: 14,
    color: '#8f9bb3',
    marginBottom: 4,
  },
  welcomeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e3a59',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#8f9bb3',
  },
  welcomeIconContainer: {
    position: 'relative',
    width: 64,
    height: 64,
  },
  rotatingBackground: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#667eea',
    opacity: 0.1,
  },
  pulsingIcon: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  weatherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eef1f7',
  },
  weatherItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherText: {
    fontSize: 14,
    color: '#8f9bb3',
    marginLeft: 6,
  },
  weatherDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#eef1f7',
    marginHorizontal: 16,
  },
  statsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e3a59',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  premiumStatCard: {
    width: (screenWidth - 60) / 2,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  gradientBackground: {
    padding: 20,
    position: 'relative',
    minHeight: 140,
  },
  cardGlow: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  percentageText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  cardContent: {
    marginBottom: 16,
  },
  cardValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  cardPattern: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
  },
  patternDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginLeft: 4,
  },
  timelineContainer: {
    padding: 20,
  },
  timelineCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 16,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2e3a59',
    marginBottom: 4,
  },
  timelineSubtitle: {
    fontSize: 14,
    color: '#8f9bb3',
    marginBottom: 4,
  },
  timelineTime: {
    fontSize: 12,
    color: '#c5cee0',
  },
  quickAccessContainer: {
    padding: 20,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAccessCard: {
    backgroundColor: '#fff',
    width: (screenWidth - 60) / 2,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  quickAccessIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickAccessText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2e3a59',
  },
  fabContainer: {
    position: 'absolute',
    right: 20,
    bottom: 30,
  },
  fab: {
    marginBottom: 12,
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
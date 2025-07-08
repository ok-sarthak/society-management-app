import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';

export default function MaintenanceTab({ userData }) {
  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Welcome Header */}
        <View style={styles.welcomeHeader}>
          <LinearGradient
            colors={['#11998e', '#38ef7d', '#54e19b']}
            style={styles.welcomeGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.welcomeContent}>
              <View style={styles.welcomeText}>
                <Text style={styles.greeting}>Maintenance Module</Text>
                <Text style={styles.userName}>Welcome, {userData?.name || 'Administrator'}</Text>
                <Text style={styles.welcomeSubtext}>Track payments & manage dues</Text>
              </View>
              <View style={styles.welcomeIcon}>
                <Ionicons name="card" size={32} color="#ffffff" />
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Coming Soon Section */}
        <View style={styles.comingSoonContainer}>
          <View style={styles.comingSoonCard}>
            <LinearGradient
              colors={['#ffffff', '#f8fafc']}
              style={styles.comingSoonGradient}
            >
              {/* Icon Section */}
              <View style={styles.iconSection}>
                <View style={styles.iconWrapper}>
                  <LinearGradient
                    colors={['#11998e', '#38ef7d']}
                    style={styles.iconBackground}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="construct" size={48} color="#ffffff" />
                  </LinearGradient>
                </View>
              </View>

              {/* Content Section */}
              <View style={styles.contentSection}>
                <Text style={styles.comingSoonTitle}>Coming Soon</Text>
                <Text style={styles.comingSoonSubtitle}>We&apos;re building something amazing!</Text>
                <Text style={styles.comingSoonDescription}>
                  The Maintenance module is under development. Soon you&apos;ll be able to:
                </Text>
              </View>

              {/* Features List */}
              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <View style={styles.featureIcon}>
                    <Ionicons name="checkmark-circle" size={20} color="#11998e" />
                  </View>
                  <Text style={styles.featureText}>Track monthly maintenance payments</Text>
                </View>
                
                <View style={styles.featureItem}>
                  <View style={styles.featureIcon}>
                    <Ionicons name="checkmark-circle" size={20} color="#11998e" />
                  </View>
                  <Text style={styles.featureText}>Generate payment reports</Text>
                </View>
                
                <View style={styles.featureItem}>
                  <View style={styles.featureIcon}>
                    <Ionicons name="checkmark-circle" size={20} color="#11998e" />
                  </View>
                  <Text style={styles.featureText}>Send payment reminders</Text>
                </View>
                
                <View style={styles.featureItem}>
                  <View style={styles.featureIcon}>
                    <Ionicons name="checkmark-circle" size={20} color="#11998e" />
                  </View>
                  <Text style={styles.featureText}>Manage due dates and penalties</Text>
                </View>
              </View>

              {/* Status Section */}
              <View style={styles.statusSection}>
                <View style={styles.statusCard}>
                  <LinearGradient
                    colors={['rgba(17,153,142,0.1)', 'rgba(56,239,125,0.1)']}
                    style={styles.statusGradient}
                  >
                    <Ionicons name="time" size={24} color="#11998e" />
                    <Text style={styles.statusText}>In Development</Text>
                    <Text style={styles.statusSubtext}>Expected launch: Q2 2025</Text>
                  </LinearGradient>
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footerContainer}>
          <View style={styles.footerCard}>
            <LinearGradient
              colors={['#ffffff', '#f8fafc']}
              style={styles.footerGradient}
            >
              <View style={styles.footerContent}>
                <Ionicons name="notifications" size={20} color="#11998e" />
                <Text style={styles.footerText}>
                  We&apos;ll notify you when this feature is ready!
                </Text>
              </View>
            </LinearGradient>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingBottom: 80,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // Welcome Header Styles
  welcomeHeader: {
    margin: 20,
    marginTop: 10,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#11998e',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  welcomeGradient: {
    padding: 24,
  },
  welcomeContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '400',
  },
  welcomeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },

  // Coming Soon Container
  comingSoonContainer: {
    padding: 20,
    paddingTop: 0,
  },
  comingSoonCard: {
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  comingSoonGradient: {
    padding: 32,
  },

  // Icon Section
  iconSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconWrapper: {
    borderRadius: 40,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#11998e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  iconBackground: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Content Section
  contentSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  comingSoonTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 8,
    textAlign: 'center',
  },
  comingSoonSubtitle: {
    fontSize: 18,
    color: '#4a5568',
    marginBottom: 16,
    textAlign: 'center',
  },
  comingSoonDescription: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 24,
  },

  // Features List
  featuresList: {
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  featureIcon: {
    marginRight: 16,
  },
  featureText: {
    fontSize: 16,
    color: '#4a5568',
    flex: 1,
  },

  // Status Section
  statusSection: {
    alignItems: 'center',
  },
  statusCard: {
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
  },
  statusGradient: {
    padding: 20,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#11998e',
    marginTop: 8,
    marginBottom: 4,
  },
  statusSubtext: {
    fontSize: 14,
    color: '#718096',
  },

  // Footer
  footerContainer: {
    padding: 20,
    paddingTop: 16,
  },
  footerCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  footerGradient: {
    padding: 16,
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#4a5568',
    marginLeft: 8,
    textAlign: 'center',
  },
});
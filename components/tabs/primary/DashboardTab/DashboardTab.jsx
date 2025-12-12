import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Linking from 'expo-linking';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function DashboardTab({ userData, onTabChange }) {
  const [contactModalVisible, setContactModalVisible] = useState(false);

  const handleNavigation = (tabIndex) => {
    if (onTabChange) {
      onTabChange(tabIndex);
    }
  };

  const getUserName = () => {
    return userData?.name || 'Administrator'; // Default name
  };

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

  const handleContact = (type) => {
    // setContactModalVisible(false);
    
    if (type === 'email') {
      Linking.openURL('mailto:sarthak@vacantvectors.com?subject=Society Management App Support');
    } else if (type === 'phone') {
      Linking.openURL('tel:+919876543210');
    } else if (type === 'whatsapp') {
      Linking.openURL('whatsapp://send?phone=919876543210&text=Hello, I need help with Society Hub');
    }

    setTimeout(() => {
    setContactModalVisible(false);
  }, 100);
  };

  const SimpleCard = ({ title, subtitle, icon, gradient, onPress }) => {
    return (
      <View style={styles.liquidCard}>
        <TouchableOpacity
          style={styles.cardTouchable}
          onPress={onPress}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={gradient}
            style={styles.cardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Content */}
            <View style={styles.cardContent}>
              <View style={styles.iconContainer}>
                <Ionicons name={icon} size={24} color="#ffffff" />
              </View>
              
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardTitle}>{title}</Text>
                <Text style={styles.cardSubtitle}>{subtitle}</Text>
              </View>
              
              <View style={styles.cardArrow}>
                <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  };

  const ContactModal = () => {
    if (!contactModalVisible) return null;
    
    return (
      <View style={styles.modalOverlayContainer}>
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'rgba(102,126,234,0.2)', 'rgba(118,75,162,0.25)', 'rgba(0,0,0,0.4)']}
          style={styles.modalOverlay}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <TouchableOpacity 
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setContactModalVisible(false)}
          />
          <View style={styles.modalContent}>
            <LinearGradient
              colors={['rgba(102,126,234,0.95)', 'rgba(118,75,162,0.95)', 'rgba(240,147,251,0.90)']}
              style={styles.modalGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
            <View style={styles.modalHeader}>
              <Ionicons name="headset" size={48} color="#ffffff" />
              <Text style={styles.modalTitle}>Contact Support</Text>
              <Text style={styles.modalSubtitle}>Our team is here to help you 24/7</Text>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonContainer}
                onPress={() => handleContact('email')}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.85)']}
                  style={styles.modalButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={[styles.modalButtonIcon, { backgroundColor: '#4285F4' }]}>
                    <Ionicons name="mail" size={20} color="#ffffff" />
                  </View>
                  <View style={styles.modalButtonContent}>
                    <Text style={styles.modalButtonText}>Send Email</Text>
                    <Text style={styles.modalButtonSubtext}>sarthak@vacantvectors.com</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#667eea" />
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalButtonContainer}
                onPress={() => handleContact('phone')}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.85)']}
                  style={styles.modalButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={[styles.modalButtonIcon, { backgroundColor: '#34C759' }]}>
                    <Ionicons name="call" size={20} color="#ffffff" />
                  </View>
                  <View style={styles.modalButtonContent}>
                    <Text style={styles.modalButtonText}>Call Support</Text>
                    <Text style={styles.modalButtonSubtext}>+91 98765 43210</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#667eea" />
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalButtonContainer}
                onPress={() => handleContact('whatsapp')}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.85)']}
                  style={styles.modalButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={[styles.modalButtonIcon, { backgroundColor: '#25D366' }]}>
                    <Ionicons name="logo-whatsapp" size={20} color="#ffffff" />
                  </View>
                  <View style={styles.modalButtonContent}>
                    <Text style={styles.modalButtonText}>WhatsApp</Text>
                    <Text style={styles.modalButtonSubtext}>Quick response</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#667eea" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setContactModalVisible(false)}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                style={styles.modalCloseGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.modalCloseText}>Cancel</Text>
              </LinearGradient>
            </TouchableOpacity>
            </LinearGradient>
          </View>
        </LinearGradient>
      </View>
    );
  };

  const WelcomeHeader = () => {
    const getGreeting = () => {
      const hours = new Date().getHours();
      if (hours >= 5 && hours < 12) return 'Good Morning';
      if (hours >= 12 && hours < 18) return 'Good Afternoon';
      return 'Good Evening';
    };

    return (
      <View style={styles.welcomeHeader}>
        <LinearGradient
          colors={['#667eea', '#764ba2', '#f093fb']}
          style={styles.welcomeGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.welcomeContent}>
            <View style={styles.welcomeText}>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.userName}>{getUserName() || 'Administrator'}</Text>
              <Text style={styles.welcomeSubtext}>Manage your society efficiently</Text>
            </View>
            <View style={styles.welcomeIcon}>
              <Ionicons name="business" size={32} color="#ffffff" />
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Welcome Header */}
        <WelcomeHeader />

        {/* Navigation Cards */}
        <View style={styles.navigationContainer}>
          <Text style={styles.sectionTitle}>Quick Navigation</Text>
          
          <View style={styles.cardsGrid}>
            <SimpleCard
              title="Members"
              subtitle="Manage residents"
              icon="people"
              gradient={['#667eea', '#764ba2']}
              onPress={() => handleNavigation(1)}
            />
            
            <SimpleCard
              title="Maintenance"
              subtitle="Track payments"
              icon="card"
              gradient={['#11998e', '#38ef7d']}
              onPress={() => handleNavigation(2)}
            />
            
            <SimpleCard
              title="Visitors"
              subtitle="Guest management"
              icon="car-sport"
              gradient={['#ff416c', '#ff4b2b']}
              onPress={() => handleNavigation(3)}
            />
            
            <SimpleCard
              title="Staff"
              subtitle="Employee records"
              icon="people-circle"
              gradient={['#ff9a9e', '#fecfef']}
              onPress={() => handleNavigation(4)}
            />
          </View>
        </View>

        {/* Contact Support Card */}
        <View style={styles.supportContainer}>
          <Text style={styles.sectionTitle}>Need Help?</Text>
          
          <SimpleCard
            title="Contact Support"
            subtitle="Get help from our team"
            icon="headset"
            gradient={['#667eea', '#764ba2']}
            onPress={() => setContactModalVisible(true)}
          />
        </View>

        {/* Footer Section */}
        <View style={styles.footerContainer}>
          <View style={styles.footerCard}>
            <LinearGradient
              colors={['#ffffff', '#f8fafc']}
              style={styles.footerGradient}
            >
              {/* Made in India Section */}
              <View style={styles.madeInIndiaSection}>
                <View style={styles.flagContainer}>
                  <Text style={styles.flagEmoji}>🇮🇳</Text>
                </View>
                <Text style={styles.madeInIndiaText}>Made in India</Text>
              </View>

              {/* Developer Section */}
              <TouchableOpacity 
                style={styles.developerSection}
                onPress={() => handleExternalLink('https://vacantvectors.com', 'Vacant Vectors')}
              >
                <Ionicons name="code-slash" size={20} color="#667eea" />
                <Text style={styles.developerText}>Developed by Vacant Vectors</Text>
              </TouchableOpacity>

              {/* Links Section */}
              <View style={styles.linksSection}>
                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={() => handleExternalLink('https://vacantvectors.com/terms', 'Terms & Conditions')}
                >
                  <Text style={styles.linkText}>Terms & Conditions</Text>
                </TouchableOpacity>
                
                <View style={styles.linkDivider} />
                
                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={() => handleExternalLink('https://vacantvectors.com/privacy', 'Privacy Policy')}
                >
                  <Text style={styles.linkText}>Privacy Policy</Text>
                </TouchableOpacity>
                
                <View style={styles.linkDivider} />
                
                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={() => handleExternalLink('https://vacantvectors.com/cookies', 'Cookie Policy')}
                >
                  <Text style={styles.linkText}>Cookies</Text>
                </TouchableOpacity>
              </View>

              {/* Version Info */}
              <View style={styles.versionSection}>
                <Text style={styles.versionText}>Version 1.0.1</Text>
                <Text style={styles.copyrightText}>© 2025 Vacant Vectors</Text>
              </View>
            </LinearGradient>
          </View>
        </View>
      </ScrollView>

      {/* Contact Modal */}
      <ContactModal />
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
    shadowColor: '#667eea',
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

  // Navigation Container
  navigationContainer: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 16,
    fontFamily: 'outfit-bold',
  },
  cardsGrid: {
    gap: 12,
  },

  // Card Styles
  liquidCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    backgroundColor: '#ffffff',
  },
  cardTouchable: {
    width: '100%',
  },
  cardGradient: {
    padding: 20,
    height: 100,
    justifyContent: 'center',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
    fontFamily: 'outfit-bold',
  },
  cardSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'outfit-medium',
  },
  cardArrow: {
    marginLeft: 12,
  },

  // Support Container
  supportContainer: {
    padding: 20,
    paddingTop: 0,
  },

  // Footer Styles
  footerContainer: {
    padding: 20,
    paddingTop: 0,
  },
  footerCard: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  footerGradient: {
    padding: 24,
  },
  madeInIndiaSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  flagContainer: {
    marginRight: 8,
  },
  flagEmoji: {
    fontSize: 24,
  },
  madeInIndiaText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
    fontFamily: 'outfit-bold',
  },
  developerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  developerText: {
    fontSize: 16,
    color: '#4a5568',
    marginLeft: 8,
    fontFamily: 'outfit-medium',
  },
  linksSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  linkButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  linkText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '500',
    fontFamily: 'outfit-medium',
  },
  linkDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 8,
  },
  versionSection: {
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 16,
  },
  versionText: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 4,
    fontFamily: 'outfit-regular',
  },
  copyrightText: {
    fontSize: 12,
    color: '#a0aec0',
    fontFamily: 'outfit-regular',
  },

  // Enhanced Modal Styles
  modalOverlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    zIndex: 1001,
  },
  modalGradient: {
    padding: 24,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 12,
    marginBottom: 8,
    fontFamily: 'outfit-bold',
  },
  modalSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontFamily: 'outfit-medium',
  },
  modalButtons: {
    width: '100%',
    gap: 12,
    marginBottom: 20,
  },
  modalButtonContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  modalButtonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modalButtonContent: {
    flex: 1,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 2,
    fontFamily: 'outfit-semibold',
  },
  modalButtonSubtext: {
    fontSize: 12,
    color: '#718096',
    fontFamily: 'outfit-regular',
  },
  modalCloseButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  modalCloseGradient: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'outfit-medium',
    fontWeight: '600',
  },
});
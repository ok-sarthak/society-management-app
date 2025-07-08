import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import Modal from 'react-native-modal';
import ActiveMembers from '../../../members/ActiveMembers';
import AddMemberForm from '../../../members/AddMemberForm';
import EditMembers from '../../../members/EditMembers';
import InactiveMembers from '../../../members/InactiveMembers';
import MembersHistory from '../../../members/MembersHistory';
import ViewMembers from '../../../members/ViewMembers';

const { height: screenHeight } = Dimensions.get('window');

export default function MembersTab({ userData }) {
  const [activeModal, setActiveModal] = useState(null);

  const memberOptions = [
    {
      id: 'add',
      title: 'Add Members',
      subtitle: 'Add new society members',
      icon: 'person-add',
      color: '#007bff',
      gradient: ['#007bff', '#0056b3']
    },
    {
      id: 'view',
      title: 'View Members',
      subtitle: 'See all registered members',
      icon: 'people',
      color: '#28a745',
      gradient: ['#28a745', '#1e7e34']
    },
    {
      id: 'edit',
      title: 'Edit Members',
      subtitle: 'Update member information',
      icon: 'create',
      color: '#ffc107',
      gradient: ['#ffc107', '#e0a800']
    },
    {
      id: 'history',
      title: 'Members History',
      subtitle: 'View edit logs and changes',
      icon: 'time',
      color: '#6c757d',
      gradient: ['#6c757d', '#545b62']
    },
    {
      id: 'active',
      title: 'Active Members',
      subtitle: 'View currently active members',
      icon: 'checkmark-circle',
      color: '#20c997',
      gradient: ['#20c997', '#1aa179']
    },
    {
      id: 'inactive',
      title: 'Inactive Members',
      subtitle: 'View inactive members',
      icon: 'close-circle',
      color: '#dc3545',
      gradient: ['#dc3545', '#c82333']
    }
  ];

  const handleOptionPress = (optionId) => {
    setActiveModal(optionId);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const renderModal = () => {
    switch (activeModal) {
      case 'add':
        return (
          <AddMemberForm 
            onClose={closeModal} 
            onSuccess={() => {
              // Could trigger a refresh of member lists here
            }} 
          />
        );
      case 'view':
        return <ViewMembers onClose={closeModal} />;
      case 'edit':
        return <EditMembers onClose={closeModal} />;
      case 'history':
        return <MembersHistory onClose={closeModal} />;
      case 'active':
        return <ActiveMembers onClose={closeModal} />;
      case 'inactive':
        return <InactiveMembers onClose={closeModal} />;
      default:
        return null;
    }
  };

  const MemberOptionCard = ({ option }) => (
    <TouchableOpacity
      style={[styles.optionCard, { borderLeftColor: option.color }]}
      onPress={() => handleOptionPress(option.id)}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <View style={[styles.iconContainer, { backgroundColor: option.color }]}>
          <Ionicons name={option.icon} size={24} color="#fff" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.optionTitle}>{option.title}</Text>
          <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <View style={styles.content}>
          <View style={styles.optionsGrid}>
            {memberOptions.map((option) => (
              <MemberOptionCard key={option.id} option={option} />
            ))}
          </View>
        </View>
      </ScrollView>

      <Modal
        isVisible={activeModal !== null}
        style={styles.modal}
        onBackdropPress={closeModal}
        onBackButtonPress={closeModal}
        propagateSwipe={true}
        avoidKeyboard={true}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        animationInTiming={300}
        animationOutTiming={300}
        backdropOpacity={0.5}
      >
        <View style={styles.modalContent}>
          {renderModal()}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingBottom: 80,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6c757d',
  },
  content: {
    padding: 20,
  },
  optionsGrid: {
    gap: 15,
  },
  optionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#6c757d',
  },
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: screenHeight * 0.9,
    minHeight: screenHeight * 0.7,
    flex: 1,
  },
});
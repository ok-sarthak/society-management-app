import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { membersService } from '../../services/membersService';

const MemberDetailsModal = ({ member, visible, onClose }) => {
  if (!member) return null;

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      return new Date(timestamp.seconds * 1000).toLocaleDateString();
    } catch {
      return 'N/A';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Active Member Details</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalScrollView} contentContainerStyle={styles.memberDetailsContainer}>
          <View style={styles.memberHeader}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {member.name?.charAt(0)?.toUpperCase() || 'M'}
              </Text>
            </View>
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>{member.name}</Text>
              <Text style={styles.memberLocation}>
                {member.tower}-{member.flatNumber}
              </Text>
              <View style={styles.activeBadge}>
                <Text style={styles.activeText}>ACTIVE</Text>
              </View>
            </View>
          </View>

          <View style={styles.detailsGrid}>
            <DetailItem label="Email" value={member.email} icon="mail" />
            <DetailItem label="Phone" value={member.phone} icon="call" />
            <DetailItem label="Membership Type" value={member.membershipType} icon="person" />
            <DetailItem label="Emergency Contact" value={member.emergencyContact} icon="people" />
            <DetailItem label="Emergency Phone" value={member.emergencyContactPhone} icon="call" />
            <DetailItem label="Occupation" value={member.occupation} icon="briefcase" />
            <DetailItem label="Family Members" value={member.familyMembers} icon="home" />
            <DetailItem label="Vehicle Number" value={member.vehicleNumber} icon="car" />
            <DetailItem label="Joined Date" value={formatDate(member.createdAt)} icon="calendar" />
            <DetailItem label="Last Updated" value={formatDate(member.updatedAt)} icon="time" />
            {member.notes && <DetailItem label="Notes" value={member.notes} icon="document-text" />}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const DetailItem = ({ label, value, icon }) => {
  if (!value) return null;
  
  return (
    <View style={styles.detailItem}>
      <View style={styles.detailHeader}>
        <Ionicons name={icon} size={16} color="#28a745" />
        <Text style={styles.detailLabel}>{label}</Text>
      </View>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
};

const ActiveMemberCard = ({ member, onPress }) => {
  return (
    <TouchableOpacity style={styles.memberCard} onPress={() => onPress(member)}>
      <View style={styles.cardHeader}>
        <View style={styles.memberBasicInfo}>
          <View style={styles.avatarSmall}>
            <Text style={styles.avatarTextSmall}>
              {member.name?.charAt(0)?.toUpperCase() || 'M'}
            </Text>
          </View>
          <View style={styles.memberCardInfo}>
            <Text style={styles.cardName}>{member.name}</Text>
            <Text style={styles.cardLocation}>
              Tower {member.tower}, Flat {member.flatNumber}
            </Text>
            <Text style={styles.cardContact}>{member.phone}</Text>
          </View>
        </View>
        <View style={styles.cardRight}>
          <View style={styles.activeBadgeSmall}>
            <Text style={styles.activeTextSmall}>ACTIVE</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.membershipType}>
          {member.membershipType?.charAt(0)?.toUpperCase() + member.membershipType?.slice(1) || 'Unknown'}
        </Text>
        {member.vehicleNumber && (
          <Text style={styles.vehicleInfo}>Vehicle: {member.vehicleNumber}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const ActiveMembers = ({ onClose }) => {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [detailsVisible, setDetailsVisible] = useState(false);

  useEffect(() => {
    loadActiveMembers();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredMembers(members);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = members.filter(member =>
      member.name?.toLowerCase().includes(query) ||
      member.email?.toLowerCase().includes(query) ||
      member.phone?.includes(query) ||
      member.flatNumber?.toLowerCase().includes(query) ||
      member.tower?.toLowerCase().includes(query) ||
      member.vehicleNumber?.toLowerCase().includes(query)
    );
    setFilteredMembers(filtered);
  }, [searchQuery, members]);

  const loadActiveMembers = async () => {
    setLoading(true);
    try {
      const result = await membersService.getActiveMembers();
      if (result.success) {
        setMembers(result.data);
      } else {
        Alert.alert('Error', result.error || 'Failed to load active members');
      }
    } catch (_error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleMemberPress = (member) => {
    setSelectedMember(member);
    setDetailsVisible(true);
  };

  const handleRefresh = () => {
    loadActiveMembers();
  };

  const renderMember = ({ item }) => (
    <ActiveMemberCard member={item} onPress={handleMemberPress} />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="checkmark-circle-outline" size={64} color="#28a745" />
      <Text style={styles.emptyStateTitle}>
        {searchQuery ? 'No active members found' : 'No active members'}
      </Text>
      <Text style={styles.emptyStateText}>
        {searchQuery 
          ? 'Try adjusting your search criteria'
          : 'Active members will appear here'
        }
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Active Members ({filteredMembers.length})</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search active members..."
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Ionicons name="refresh" size={20} color="#28a745" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#28a745" />
          <Text style={styles.loadingText}>Loading active members...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredMembers}
          renderItem={renderMember}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
        />
      )}

      <MemberDetailsModal
        member={selectedMember}
        visible={detailsVisible}
        onClose={() => {
          setDetailsVisible(false);
          setSelectedMember(null);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
  },
  closeButton: {
    padding: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
    backgroundColor: '#fff',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2c3e50',
  },
  refreshButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6c757d',
  },
  listContainer: {
    padding: 15,
    paddingBottom: 80,
  },
  memberCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  memberBasicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#28a745',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarTextSmall: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  memberCardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  cardLocation: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 2,
  },
  cardContact: {
    fontSize: 14,
    color: '#6c757d',
  },
  cardRight: {
    alignItems: 'center',
    gap: 8,
  },
  activeBadgeSmall: {
    backgroundColor: '#d4edda',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeTextSmall: {
    fontSize: 10,
    fontWeight: '600',
    color: '#155724',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f3f4',
  },
  membershipType: {
    fontSize: 12,
    fontWeight: '500',
    color: '#28a745',
    backgroundColor: '#d4edda',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  vehicleInfo: {
    fontSize: 12,
    color: '#6c757d',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6c757d',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#adb5bd',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    backgroundColor: '#fff',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
  },
  modalScrollView: {
    flex: 1,
  },
  memberDetailsContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#28a745',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 24,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
  },
  memberLocation: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 8,
  },
  activeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#d4edda',
  },
  activeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#155724',
  },
  detailsGrid: {
    gap: 15,
  },
  detailItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6c757d',
  },
  detailValue: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '400',
  },
});

export default ActiveMembers;

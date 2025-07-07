import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { membersService } from '../../services/membersService';

const EditMemberModal = ({ member, visible, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || '',
        email: member.email || '',
        phone: member.phone || '',
        flatNumber: member.flatNumber || '',
        tower: member.tower || '',
        membershipType: member.membershipType || 'owner',
        emergencyContact: member.emergencyContact || '',
        emergencyContactPhone: member.emergencyContactPhone || '',
        occupation: member.occupation || '',
        familyMembers: member.familyMembers || '',
        vehicleNumber: member.vehicleNumber || '',
        notes: member.notes || '',
        status: member.status || 'active'
      });
    }
  }, [member]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const required = ['name', 'email', 'phone', 'flatNumber', 'tower'];
    for (let field of required) {
      if (!formData[field]?.trim()) {
        Alert.alert('Error', `${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
        return false;
      }
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    
    // Phone validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const result = await membersService.updateMember(member.id, formData);
      
      if (result.success) {
        Alert.alert(
          'Success',
          'Member updated successfully!',
          [{ text: 'OK', onPress: () => {
            onSuccess();
            onClose();
          }}]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to update member');
      }
    } catch (_error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!member) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <KeyboardAvoidingView 
        style={styles.modalContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Edit Member</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="Enter full name"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              placeholder="Enter email address"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Flat Number *</Text>
              <TextInput
                style={styles.input}
                value={formData.flatNumber}
                onChangeText={(value) => handleInputChange('flatNumber', value)}
                placeholder="e.g., 101"
                placeholderTextColor="#999"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
              <Text style={styles.label}>Tower *</Text>
              <TextInput
                style={styles.input}
                value={formData.tower}
                onChangeText={(value) => handleInputChange('tower', value)}
                placeholder="e.g., A"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Membership Type</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={[styles.radioOption, formData.membershipType === 'owner' && styles.radioSelected]}
                onPress={() => handleInputChange('membershipType', 'owner')}
              >
                <Text style={[styles.radioText, formData.membershipType === 'owner' && styles.radioTextSelected]}>
                  Owner
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.radioOption, formData.membershipType === 'tenant' && styles.radioSelected]}
                onPress={() => handleInputChange('membershipType', 'tenant')}
              >
                <Text style={[styles.radioText, formData.membershipType === 'tenant' && styles.radioTextSelected]}>
                  Tenant
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Status</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={[styles.radioOption, formData.status === 'active' && styles.radioSelected]}
                onPress={() => handleInputChange('status', 'active')}
              >
                <Text style={[styles.radioText, formData.status === 'active' && styles.radioTextSelected]}>
                  Active
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.radioOption, formData.status === 'inactive' && styles.radioSelected]}
                onPress={() => handleInputChange('status', 'inactive')}
              >
                <Text style={[styles.radioText, formData.status === 'inactive' && styles.radioTextSelected]}>
                  Inactive
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Emergency Contact Name</Text>
            <TextInput
              style={styles.input}
              value={formData.emergencyContact}
              onChangeText={(value) => handleInputChange('emergencyContact', value)}
              placeholder="Enter emergency contact name"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Emergency Contact Phone</Text>
            <TextInput
              style={styles.input}
              value={formData.emergencyContactPhone}
              onChangeText={(value) => handleInputChange('emergencyContactPhone', value)}
              placeholder="Enter emergency contact phone"
              keyboardType="phone-pad"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Occupation</Text>
            <TextInput
              style={styles.input}
              value={formData.occupation}
              onChangeText={(value) => handleInputChange('occupation', value)}
              placeholder="Enter occupation"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Family Members Count</Text>
            <TextInput
              style={styles.input}
              value={formData.familyMembers}
              onChangeText={(value) => handleInputChange('familyMembers', value)}
              placeholder="Enter number of family members"
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Vehicle Number</Text>
            <TextInput
              style={styles.input}
              value={formData.vehicleNumber}
              onChangeText={(value) => handleInputChange('vehicleNumber', value)}
              placeholder="Enter vehicle number"
              autoCapitalize="characters"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.notes}
              onChangeText={(value) => handleInputChange('notes', value)}
              placeholder="Additional notes (optional)"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              placeholderTextColor="#999"
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onClose}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.submitButton, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Updating...' : 'Update Member'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const MemberEditCard = ({ member, onPress }) => {
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
          <View style={[styles.statusBadgeSmall, member.status === 'active' ? styles.activeBadge : styles.inactiveBadge]}>
            <Text style={[styles.statusTextSmall, member.status === 'active' ? styles.activeText : styles.inactiveText]}>
              {member.status?.toUpperCase() || 'UNKNOWN'}
            </Text>
          </View>
          <Ionicons name="create-outline" size={20} color="#007bff" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const EditMembers = ({ onClose }) => {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);

  useEffect(() => {
    loadMembers();
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

  const loadMembers = async () => {
    setLoading(true);
    try {
      const result = await membersService.getAllMembers();
      if (result.success) {
        setMembers(result.data);
      } else {
        Alert.alert('Error', result.error || 'Failed to load members');
      }
    } catch (_error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleMemberPress = (member) => {
    setSelectedMember(member);
    setEditModalVisible(true);
  };

  const handleEditSuccess = () => {
    loadMembers(); // Reload the members list
  };

  const renderMember = ({ item }) => (
    <MemberEditCard member={item} onPress={handleMemberPress} />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="create-outline" size={64} color="#ccc" />
      <Text style={styles.emptyStateTitle}>
        {searchQuery ? 'No members found' : 'No members to edit'}
      </Text>
      <Text style={styles.emptyStateText}>
        {searchQuery 
          ? 'Try adjusting your search criteria'
          : 'Add members first to edit them'
        }
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Edit Members ({filteredMembers.length})</Text>
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
            placeholder="Search members to edit..."
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Loading members...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredMembers}
          renderItem={renderMember}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}

      <EditMemberModal
        member={selectedMember}
        visible={editModalVisible}
        onClose={() => {
          setEditModalVisible(false);
          setSelectedMember(null);
        }}
        onSuccess={handleEditSuccess}
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
    padding: 15,
    backgroundColor: '#fff',
  },
  searchBox: {
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
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    backgroundColor: '#007bff',
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
  statusBadgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusTextSmall: {
    fontSize: 10,
    fontWeight: '600',
  },
  activeBadge: {
    backgroundColor: '#d4edda',
  },
  inactiveBadge: {
    backgroundColor: '#f8d7da',
  },
  activeText: {
    color: '#155724',
  },
  inactiveText: {
    color: '#721c24',
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
  form: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#2c3e50',
  },
  textArea: {
    minHeight: 80,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 15,
  },
  radioOption: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#dee2e6',
    backgroundColor: '#fff',
  },
  radioSelected: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  radioText: {
    color: '#6c757d',
    fontWeight: '500',
  },
  radioTextSelected: {
    color: '#fff',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  submitButton: {
    backgroundColor: '#007bff',
  },
  disabledButton: {
    backgroundColor: '#adb5bd',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditMembers;

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { membersService } from '../../services/membersService';
import { staffService } from '../../services/staffService';

export default function EditStaffModal({ 
  visible, 
  onClose, 
  staff, 
  onStaffUpdated, 
  userData 
}) {
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    alternatePhoneNumber: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    staffType: '',
    salary: '',
    notes: '',
    assignedFlats: []
  });
  const [isActive, setIsActive] = useState(true);
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [showMemberSearch, setShowMemberSearch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const staffTypes = [
    'Housekeeping',
    'Security',
    'Maintenance', 
    'Gardener',
    'Driver',
    'Cook',
    'Maid',
    'Nanny',
    'Other'
  ];

  useEffect(() => {
    if (visible && staff) {
      setFormData({
        name: staff.name || '',
        phoneNumber: staff.phoneNumber || '',
        alternatePhoneNumber: staff.alternatePhoneNumber || '',
        address: staff.address || '',
        emergencyContact: staff.emergencyContact || '',
        emergencyPhone: staff.emergencyPhone || '',
        staffType: staff.staffType || '',
        salary: staff.salary ? staff.salary.toString() : '',
        notes: staff.notes || '',
        assignedFlats: staff.assignedFlats || []
      });
      setIsActive(staff.isActive !== false);
      loadMembers();
    }
  }, [visible, staff]);

  useEffect(() => {
    if (memberSearchQuery.trim()) {
      const filtered = members.filter(member => 
        member.name?.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
        member.flatNumber?.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
        member.phoneNumber?.includes(memberSearchQuery)
      );
      setFilteredMembers(filtered);
    } else {
      setFilteredMembers(members);
    }
  }, [memberSearchQuery, members]);

  const loadMembers = async () => {
    setLoadingMembers(true);
    try {
      const result = await membersService.getAllMembers();
      if (result.success) {
        setMembers(result.data.filter(member => member.status === 'active'));
        setFilteredMembers(result.data.filter(member => member.status === 'active'));
      }
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleFlatAssignment = (member) => {
    const isAssigned = formData.assignedFlats.some(flat => flat.memberId === member.id);
    
    if (isAssigned) {
      setFormData(prev => ({
        ...prev,
        assignedFlats: prev.assignedFlats.filter(flat => flat.memberId !== member.id)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        assignedFlats: [...prev.assignedFlats, {
          memberId: member.id,
          memberName: member.name,
          flatNumber: member.flatNumber,
          assignedAt: new Date().toISOString()
        }]
      }));
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter staff name');
      return false;
    }
    if (!formData.phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter phone number');
      return false;
    }
    if (!formData.staffType) {
      Alert.alert('Error', 'Please select staff type');
      return false;
    }
    if (formData.phoneNumber.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const updatedData = {
        ...formData,
        salary: formData.salary ? parseFloat(formData.salary) : 0,
        isActive,
        updatedBy: userData?.name || 'Admin',
        updatedById: userData?.id || 'admin'
      };

      const result = await staffService.updateStaff(
        staff.id, 
        updatedData, 
        userData?.name || 'Admin'
      );
      
      if (result.success) {
        Alert.alert('Success', 'Staff member updated successfully');
        onStaffUpdated();
        onClose();
      } else {
        Alert.alert('Error', result.error || 'Failed to update staff member');
      }
    } catch (error) {
      console.error('Error updating staff:', error);
      Alert.alert('Error', 'Failed to update staff member');
    } finally {
      setLoading(false);
    }
  };

  const removeFlatAssignment = (memberId) => {
    setFormData(prev => ({
      ...prev,
      assignedFlats: prev.assignedFlats.filter(flat => flat.memberId !== memberId)
    }));
  };

  if (!visible || !staff) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Edit Staff Member</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
                placeholder="Enter full name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number *</Text>
              <TextInput
                style={styles.input}
                value={formData.phoneNumber}
                onChangeText={(value) => handleInputChange('phoneNumber', value)}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Alternate Phone Number</Text>
              <TextInput
                style={styles.input}
                value={formData.alternatePhoneNumber}
                onChangeText={(value) => handleInputChange('alternatePhoneNumber', value)}
                placeholder="Enter alternate phone number"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Address</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.address}
                onChangeText={(value) => handleInputChange('address', value)}
                placeholder="Enter address"
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          {/* Emergency Contact */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Emergency Contact</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Emergency Contact Name</Text>
              <TextInput
                style={styles.input}
                value={formData.emergencyContact}
                onChangeText={(value) => handleInputChange('emergencyContact', value)}
                placeholder="Enter emergency contact name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Emergency Contact Phone</Text>
              <TextInput
                style={styles.input}
                value={formData.emergencyPhone}
                onChangeText={(value) => handleInputChange('emergencyPhone', value)}
                placeholder="Enter emergency contact phone"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Work Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Work Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Staff Type *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeContainer}>
                {staffTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeChip,
                      formData.staffType === type && styles.typeChipSelected
                    ]}
                    onPress={() => handleInputChange('staffType', type)}
                  >
                    <Text style={[
                      styles.typeChipText,
                      formData.staffType === type && styles.typeChipTextSelected
                    ]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Salary (Monthly)</Text>
              <TextInput
                style={styles.input}
                value={formData.salary}
                onChangeText={(value) => handleInputChange('salary', value)}
                placeholder="Enter monthly salary"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.notes}
                onChangeText={(value) => handleInputChange('notes', value)}
                placeholder="Enter any additional notes"
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          {/* Status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status</Text>
            <TouchableOpacity
              style={styles.statusToggle}
              onPress={() => setIsActive(!isActive)}
            >
              <View style={[styles.statusIndicator, isActive ? styles.statusActive : styles.statusInactive]} />
              <Text style={styles.statusText}>
                {isActive ? 'Active' : 'Inactive'}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Assigned Flats */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Assigned Flats ({formData.assignedFlats.length})</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowMemberSearch(true)}
              >
                <Ionicons name="add" size={20} color="#007AFF" />
                <Text style={styles.addButtonText}>Add Flat</Text>
              </TouchableOpacity>
            </View>

            {formData.assignedFlats.length > 0 ? (
              <View style={styles.assignedFlats}>
                {formData.assignedFlats.map((flat, index) => (
                  <View key={`${flat.memberId}-${index}`} style={styles.assignedFlat}>
                    <View style={styles.flatInfo}>
                      <Text style={styles.flatNumber}>{flat.flatNumber}</Text>
                      <Text style={styles.flatOwner}>{flat.memberName}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => removeFlatAssignment(flat.memberId)}
                      style={styles.removeButton}
                    >
                      <Ionicons name="close-circle" size={20} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="home-outline" size={48} color="#C7C7CC" />
                <Text style={styles.emptyStateText}>No flats assigned</Text>
                <Text style={styles.emptyStateSubtext}>Tap &ldquo;Add Flat&rdquo; to assign this staff member to flats</Text>
              </View>
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Updating...' : 'Update Staff'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Member Search Modal */}
        <Modal
          visible={showMemberSearch}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Flats to Assign</Text>
              <TouchableOpacity
                onPress={() => setShowMemberSearch(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name, flat number, or phone"
                value={memberSearchQuery}
                onChangeText={setMemberSearchQuery}
              />
            </View>

            {loadingMembers ? (
              <View style={styles.loadingContainer}>
                <Text>Loading members...</Text>
              </View>
            ) : (
              <FlatList
                data={filteredMembers}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                  const isAssigned = formData.assignedFlats.some(flat => flat.memberId === item.id);
                  return (
                    <TouchableOpacity
                      style={[styles.memberItem, isAssigned && styles.memberItemSelected]}
                      onPress={() => toggleFlatAssignment(item)}
                    >
                      <View style={styles.memberInfo}>
                        <Text style={styles.memberName}>{item.name}</Text>
                        <Text style={styles.memberDetails}>
                          Flat {item.flatNumber} • {item.phoneNumber}
                        </Text>
                      </View>
                      <View style={[styles.checkbox, isAssigned && styles.checkboxSelected]}>
                        {isAssigned && <Ionicons name="checkmark" size={16} color="#FFF" />}
                      </View>
                    </TouchableOpacity>
                  );
                }}
                contentContainerStyle={styles.membersList}
              />
            )}

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.doneButton}
                onPress={() => setShowMemberSearch(false)}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 20,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  typeContainer: {
    marginTop: 8,
  },
  typeChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginRight: 8,
  },
  typeChipSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  typeChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  typeChipTextSelected: {
    color: '#FFF',
  },
  statusToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusActive: {
    backgroundColor: '#34C759',
  },
  statusInactive: {
    backgroundColor: '#FF3B30',
  },
  statusText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
    marginLeft: 4,
  },
  assignedFlats: {
    gap: 12,
  },
  assignedFlat: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  flatInfo: {
    flex: 1,
  },
  flatNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  flatOwner: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  removeButton: {
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8E8E93',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  membersList: {
    paddingHorizontal: 20,
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  memberItemSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  memberDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#C7C7CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  modalFooter: {
    padding: 20,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  doneButton: {
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});

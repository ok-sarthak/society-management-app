import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { visitorsService } from '../../services/visitorsService';

export default function AddVisitorModal({ visible, onClose, onSuccess, userData }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    purpose: '',
    vehicleNumber: '',
    idProofType: 'aadhar',
    idProofNumber: '',
    tower: '',
    flatNumber: '',
    ownerName: '',
    ownerPhone: '',
    numberOfVisitors: '1',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [showFlatSelector, setShowFlatSelector] = useState(false);
  const [flats, setFlats] = useState([]);
  const [filteredFlats, setFilteredFlats] = useState([]);
  const [flatSearchQuery, setFlatSearchQuery] = useState('');
  const [loadingFlats, setLoadingFlats] = useState(false);

  const idProofTypes = [
    { id: 'aadhar', name: 'Aadhaar Card' },
    { id: 'pan', name: 'PAN Card' },
    { id: 'voter', name: 'Voter ID' },
    { id: 'passport', name: 'Passport' },
    { id: 'driving', name: 'Driving License' },
    { id: 'other', name: 'Other' }
  ];

  const purposeOptions = [
    'Meeting Resident',
    'Delivery',
    'Maintenance',
    'Guest Visit',
    'Business Meeting',
    'Event Attendance',
    'Service Provider',
    'Real Estate Visit',
    'Other'
  ];

  useEffect(() => {
    if (visible) {
      loadAllFlats();
      resetForm();
    }
  }, [visible]);

  useEffect(() => {
    filterFlats();
  }, [flats, flatSearchQuery, filterFlats]);

  const loadAllFlats = async () => {
    setLoadingFlats(true);
    try {
      const result = await visitorsService.getAllFlats();
      if (result.success) {
        setFlats(result.data.filter(flat => flat.status === 'active'));
      }
    } catch (error) {
      console.error('Error loading flats:', error);
    } finally {
      setLoadingFlats(false);
    }
  };

  const filterFlats = useCallback(() => {
    if (!flatSearchQuery.trim()) {
      setFilteredFlats(flats);
      return;
    }

    const query = flatSearchQuery.toLowerCase();
    const filtered = flats.filter(flat =>
      flat.flatNumber.toLowerCase().includes(query) ||
      flat.ownerName.toLowerCase().includes(query) ||
      flat.tower.toLowerCase().includes(query) ||
      flat.phone.includes(query)
    );
    setFilteredFlats(filtered);
  }, [flats, flatSearchQuery]);

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      purpose: '',
      vehicleNumber: '',
      idProofType: 'aadhar',
      idProofNumber: '',
      tower: '',
      flatNumber: '',
      ownerName: '',
      ownerPhone: '',
      numberOfVisitors: '1',
      notes: ''
    });
    setFlatSearchQuery('');
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFlatSelect = (flat) => {
    setFormData(prev => ({
      ...prev,
      tower: flat.tower,
      flatNumber: flat.flatNumber,
      ownerName: flat.ownerName,
      ownerPhone: flat.phone
    }));
    setShowFlatSelector(false);
    setFlatSearchQuery('');
  };

  const validateForm = () => {
    const required = ['name', 'phone', 'purpose', 'flatNumber'];
    for (let field of required) {
      if (!formData[field].trim()) {
        Alert.alert('Error', `Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }

    if (formData.phone.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const visitorData = {
        ...formData,
        addedBy: userData?.name || 'Admin',
        addedById: userData?.uid || 'admin'
      };

      const result = await visitorsService.addVisitor(visitorData);

      if (result.success) {
        Alert.alert(
          'Success',
          'Visitor has been checked in successfully!',
          [{ text: 'OK', onPress: onSuccess }]
        );
        onClose();
        resetForm();
      } else {
        Alert.alert('Error', result.error || 'Failed to add visitor');
      }
    } catch (_error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Add Visitor</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Visitor Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Visitor Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Visitor Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
                placeholder="Enter visitor's full name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number *</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(value) => handleInputChange('phone', value)}
                placeholder="Enter 10-digit phone number"
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Purpose of Visit *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.purposeContainer}>
                {purposeOptions.map((purpose) => (
                  <TouchableOpacity
                    key={purpose}
                    style={[
                      styles.purposeChip,
                      formData.purpose === purpose && styles.purposeChipSelected
                    ]}
                    onPress={() => handleInputChange('purpose', purpose)}
                  >
                    <Text style={[
                      styles.purposeChipText,
                      formData.purpose === purpose && styles.purposeChipTextSelected
                    ]}>
                      {purpose}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>Vehicle Number</Text>
                <TextInput
                  style={styles.input}
                  value={formData.vehicleNumber}
                  onChangeText={(value) => handleInputChange('vehicleNumber', value.toUpperCase())}
                  placeholder="MH01AB1234"
                  autoCapitalize="characters"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                <Text style={styles.label}>Number of Visitors</Text>
                <TextInput
                  style={styles.input}
                  value={formData.numberOfVisitors}
                  onChangeText={(value) => handleInputChange('numberOfVisitors', value)}
                  placeholder="1"
                  keyboardType="numeric"
                  maxLength={2}
                />
              </View>
            </View>
          </View>

          {/* ID Proof Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ID Proof Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>ID Proof Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.idProofContainer}>
                {idProofTypes.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.idProofChip,
                      formData.idProofType === type.id && styles.idProofChipSelected
                    ]}
                    onPress={() => handleInputChange('idProofType', type.id)}
                  >
                    <Text style={[
                      styles.idProofChipText,
                      formData.idProofType === type.id && styles.idProofChipTextSelected
                    ]}>
                      {type.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>ID Proof Number</Text>
              <TextInput
                style={styles.input}
                value={formData.idProofNumber}
                onChangeText={(value) => handleInputChange('idProofNumber', value)}
                placeholder="Enter ID proof number"
              />
            </View>
          </View>

          {/* Destination Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Destination *</Text>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => setShowFlatSelector(true)}
              >
                <Ionicons name="add" size={20} color="#007AFF" />
                <Text style={styles.selectButtonText}>Select Flat</Text>
              </TouchableOpacity>
            </View>

            {formData.flatNumber ? (
              <View style={styles.selectedFlat}>
                <View style={styles.flatInfo}>
                  <View style={styles.flatHeader}>
                    <Text style={styles.flatNumber}>Flat {formData.flatNumber}</Text>
                    <Text style={styles.towerName}>Tower {formData.tower}</Text>
                  </View>
                  <Text style={styles.ownerName}>{formData.ownerName}</Text>
                  <Text style={styles.ownerPhone}>{formData.ownerPhone}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setFormData(prev => ({ ...prev, tower: '', flatNumber: '', ownerName: '', ownerPhone: '' }))}
                  style={styles.removeButton}
                >
                  <Ionicons name="close-circle" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="home-outline" size={48} color="#C7C7CC" />
                <Text style={styles.emptyStateText}>No destination selected</Text>
                <Text style={styles.emptyStateSubtext}>Tap &quot;Select Flat&quot; to choose visitor&apos;s destination</Text>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Additional Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.notes}
                onChangeText={(value) => handleInputChange('notes', value)}
                placeholder="Any additional notes..."
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
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
              {loading ? 'Adding...' : 'Check In Visitor'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Flat Selection Modal */}
        <Modal
          visible={showFlatSelector}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Destination Flat</Text>
              <TouchableOpacity
                onPress={() => setShowFlatSelector(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by flat number, tower, owner name, or phone"
                value={flatSearchQuery}
                onChangeText={setFlatSearchQuery}
                autoCorrect={false}
                autoCapitalize="none"
              />
              {flatSearchQuery.length > 0 && (
                <TouchableOpacity 
                  onPress={() => setFlatSearchQuery('')}
                  style={styles.clearButton}
                >
                  <Ionicons name="close-circle" size={20} color="#8E8E93" />
                </TouchableOpacity>
              )}
            </View>

            {loadingFlats ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading flats...</Text>
              </View>
            ) : (
              <ScrollView style={styles.flatsList} showsVerticalScrollIndicator={false}>
                {filteredFlats.length === 0 ? (
                  <View style={styles.emptyResults}>
                    <Ionicons name="search" size={48} color="#C7C7CC" />
                    <Text style={styles.emptyResultsText}>No flats found</Text>
                    <Text style={styles.emptyResultsSubtext}>Try adjusting your search criteria</Text>
                  </View>
                ) : (
                  filteredFlats.map((flat, index) => (
                    <TouchableOpacity
                      key={`${flat.tower}-${flat.flatNumber}-${index}`}
                      style={styles.flatItem}
                      onPress={() => handleFlatSelect(flat)}
                    >
                      <View style={styles.flatItemIcon}>
                        <Ionicons name="home" size={20} color="#007AFF" />
                      </View>
                      <View style={styles.flatItemInfo}>
                        <View style={styles.flatItemHeader}>
                          <Text style={styles.flatItemNumber}>Flat {flat.flatNumber}</Text>
                          <Text style={styles.flatItemTower}>Tower {flat.tower}</Text>
                        </View>
                        <Text style={styles.flatItemOwner}>{flat.ownerName}</Text>
                        <Text style={styles.flatItemPhone}>{flat.phone}</Text>
                      </View>
                      <View style={[
                        styles.statusIndicator,
                        { backgroundColor: flat.status === 'active' ? '#28a745' : '#dc3545' }
                      ]}>
                        <Text style={styles.statusText}>
                          {flat.status === 'active' ? 'Active' : 'Inactive'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            )}

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.doneButton}
                onPress={() => setShowFlatSelector(false)}
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  purposeContainer: {
    marginTop: 8,
  },
  purposeChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginRight: 8,
  },
  purposeChipSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  purposeChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  purposeChipTextSelected: {
    color: '#FFF',
  },
  idProofContainer: {
    marginTop: 8,
  },
  idProofChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginRight: 8,
  },
  idProofChipSelected: {
    backgroundColor: '#28A745',
    borderColor: '#28A745',
  },
  idProofChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000',
  },
  idProofChipTextSelected: {
    color: '#FFF',
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
    marginLeft: 4,
  },
  selectedFlat: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
    marginBottom: 16,
  },
  flatInfo: {
    flex: 1,
  },
  flatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  flatNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginRight: 8,
  },
  towerName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    backgroundColor: '#E5E5EA',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 2,
  },
  ownerPhone: {
    fontSize: 14,
    color: '#666',
  },
  removeButton: {
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    marginBottom: 16,
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
  // Modal styles
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
  clearButton: {
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  flatsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyResults: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyResultsText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8E8E93',
    marginTop: 12,
  },
  emptyResultsSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 4,
  },
  flatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  flatItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  flatItemInfo: {
    flex: 1,
  },
  flatItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  flatItemNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginRight: 8,
  },
  flatItemTower: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  flatItemOwner: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    marginBottom: 2,
  },
  flatItemPhone: {
    fontSize: 12,
    color: '#666',
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: '600',
    textTransform: 'uppercase',
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

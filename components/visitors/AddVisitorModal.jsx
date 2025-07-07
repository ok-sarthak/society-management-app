import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
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
import { visitorsService } from '../../services/visitorsService';

const { width: screenWidth } = Dimensions.get('window');

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
  const [towers, setTowers] = useState([]);
  const [flats, setFlats] = useState([]);
  const [showTowerSelector, setShowTowerSelector] = useState(false);
  const [showFlatSelector, setShowFlatSelector] = useState(false);

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
      loadTowers();
      resetForm();
    }
  }, [visible]);

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
    setFlats([]);
  };

  const loadTowers = async () => {
    try {
      const result = await visitorsService.getAllTowers();
      if (result.success) {
        setTowers(result.data);
      }
    } catch (error) {
      console.error('Error loading towers:', error);
    }
  };

  const loadFlats = async (selectedTower) => {
    try {
      const result = await visitorsService.getFlatsByTower(selectedTower);
      if (result.success) {
        setFlats(result.data);
      }
    } catch (error) {
      console.error('Error loading flats:', error);
      Alert.alert('Error', 'Failed to load flats for selected tower');
    }
  };

  const handleTowerSelect = (tower) => {
    setFormData({ ...formData, tower, flatNumber: '', ownerName: '', ownerPhone: '' });
    setShowTowerSelector(false);
    loadFlats(tower);
  };

  const handleFlatSelect = (flat) => {
    setFormData({
      ...formData,
      flatNumber: flat.flatNumber,
      ownerName: flat.ownerName,
      ownerPhone: flat.phone
    });
    setShowFlatSelector(false);
  };

  const validateForm = () => {
    const required = ['name', 'phone', 'purpose', 'tower', 'flatNumber'];
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
      } else {
        Alert.alert('Error', result.error || 'Failed to add visitor');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const TowerSelectorModal = () => (
    <Modal
      visible={showTowerSelector}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.selectorContainer}>
        <View style={styles.selectorHeader}>
          <Text style={styles.selectorTitle}>Select Tower</Text>
          <TouchableOpacity onPress={() => setShowTowerSelector(false)}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={towers}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.selectorItem}
              onPress={() => handleTowerSelect(item)}
            >
              <Text style={styles.selectorItemText}>Tower {item}</Text>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          )}
        />
      </View>
    </Modal>
  );

  const FlatSelectorModal = () => (
    <Modal
      visible={showFlatSelector}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.selectorContainer}>
        <View style={styles.selectorHeader}>
          <Text style={styles.selectorTitle}>Select Flat</Text>
          <TouchableOpacity onPress={() => setShowFlatSelector(false)}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={flats}
          keyExtractor={(item) => `${item.tower}-${item.flatNumber}`}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.flatSelectorItem}
              onPress={() => handleFlatSelect(item)}
            >
              <View style={styles.flatInfo}>
                <Text style={styles.flatNumber}>{item.flatNumber}</Text>
                <Text style={styles.flatOwner}>{item.ownerName}</Text>
                <Text style={styles.flatPhone}>{item.phone}</Text>
              </View>
              <View style={[
                styles.statusIndicator,
                { backgroundColor: item.status === 'active' ? '#28a745' : '#dc3545' }
              ]} />
            </TouchableOpacity>
          )}
        />
      </View>
    </Modal>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Add Visitor</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Visitor Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Visitor Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Visitor Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Enter visitor's full name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number *</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
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
                    onPress={() => setFormData({ ...formData, purpose })}
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
                  onChangeText={(text) => setFormData({ ...formData, vehicleNumber: text.toUpperCase() })}
                  placeholder="MH01AB1234"
                  autoCapitalize="characters"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                <Text style={styles.label}>Number of Visitors</Text>
                <TextInput
                  style={styles.input}
                  value={formData.numberOfVisitors}
                  onChangeText={(text) => setFormData({ ...formData, numberOfVisitors: text })}
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
                    onPress={() => setFormData({ ...formData, idProofType: type.id })}
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
                onChangeText={(text) => setFormData({ ...formData, idProofNumber: text })}
                placeholder="Enter ID proof number"
              />
            </View>
          </View>

          {/* Destination Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Destination Information</Text>
            
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>Tower *</Text>
                <TouchableOpacity
                  style={[styles.input, styles.selector]}
                  onPress={() => setShowTowerSelector(true)}
                >
                  <Text style={[styles.selectorText, !formData.tower && styles.placeholder]}>
                    {formData.tower ? `Tower ${formData.tower}` : 'Select Tower'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                <Text style={styles.label}>Flat Number *</Text>
                <TouchableOpacity
                  style={[styles.input, styles.selector]}
                  onPress={() => formData.tower ? setShowFlatSelector(true) : Alert.alert('Info', 'Please select a tower first')}
                >
                  <Text style={[styles.selectorText, !formData.flatNumber && styles.placeholder]}>
                    {formData.flatNumber || 'Select Flat'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
              </View>
            </View>

            {formData.ownerName && (
              <View style={styles.ownerInfo}>
                <View style={styles.ownerCard}>
                  <Ionicons name="person" size={20} color="#667eea" />
                  <View style={styles.ownerDetails}>
                    <Text style={styles.ownerName}>{formData.ownerName}</Text>
                    <Text style={styles.ownerPhone}>{formData.ownerPhone}</Text>
                  </View>
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Additional Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                placeholder="Any additional notes..."
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Adding Visitor...' : 'Check In Visitor'}
            </Text>
          </TouchableOpacity>
        </View>

        <TowerSelectorModal />
        <FlatSelectorModal />
      </KeyboardAvoidingView>
    </Modal>
  );
}

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
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  closeButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
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
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectorText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  placeholder: {
    color: '#adb5bd',
  },
  purposeContainer: {
    marginTop: 8,
  },
  purposeChip: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  purposeChipSelected: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  purposeChipText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  purposeChipTextSelected: {
    color: '#fff',
  },
  idProofContainer: {
    marginTop: 8,
  },
  idProofChip: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  idProofChipSelected: {
    backgroundColor: '#28a745',
    borderColor: '#28a745',
  },
  idProofChipText: {
    fontSize: 12,
    color: '#2c3e50',
  },
  idProofChipTextSelected: {
    color: '#fff',
  },
  ownerInfo: {
    marginBottom: 16,
  },
  ownerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  ownerDetails: {
    marginLeft: 12,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  ownerPhone: {
    fontSize: 14,
    color: '#6c757d',
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  submitButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  selectorContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  selectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  selectorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  selectorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f7',
  },
  selectorItemText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  flatSelectorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f7',
  },
  flatInfo: {
    flex: 1,
  },
  flatNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  flatOwner: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 2,
  },
  flatPhone: {
    fontSize: 12,
    color: '#8f9bb3',
    marginTop: 2,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});

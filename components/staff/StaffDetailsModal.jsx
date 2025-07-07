import { Ionicons } from '@expo/vector-icons';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function StaffDetailsModal({ visible, onClose, staff, onEdit }) {
  if (!staff) return null;

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString();
  };

  const getStaffTypeIcon = (type) => {
    const icons = {
      maid: 'home',
      cook: 'restaurant',
      driver: 'car',
      security: 'shield',
      gardener: 'leaf',
      maintenance: 'build',
      housekeeping: 'home',
      nanny: 'heart',
      other: 'ellipsis-horizontal'
    };
    return icons[type?.toLowerCase()] || 'person';
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Staff Details</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              onPress={() => onEdit(staff)} 
              style={styles.editButton}
            >
              <Ionicons name="create" size={20} color="#667eea" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Staff Overview */}
          <View style={styles.overviewCard}>
            <View style={styles.staffHeader}>
              <View style={[styles.staffTypeIcon, { backgroundColor: staff.isActive ? '#28a745' : '#6c757d' }]}>
                <Ionicons 
                  name={getStaffTypeIcon(staff.staffType)} 
                  size={32} 
                  color="#fff" 
                />
              </View>
              <View style={styles.staffMainInfo}>
                <Text style={styles.staffName}>{staff.name}</Text>
                <Text style={styles.staffType}>{staff.staffType?.toUpperCase()}</Text>
                <View style={[
                  styles.statusBadge,
                  staff.isActive ? styles.activeBadge : styles.inactiveBadge
                ]}>
                  <Text style={[
                    styles.statusText,
                    staff.isActive ? styles.activeText : styles.inactiveText
                  ]}>
                    {staff.isActive ? 'Active' : 'Inactive'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Contact Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Ionicons name="call" size={20} color="#667eea" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Phone Number</Text>
                  <Text style={styles.infoValue}>{staff.phoneNumber || 'N/A'}</Text>
                </View>
              </View>

              {staff.alternatePhoneNumber && (
                <View style={styles.infoRow}>
                  <Ionicons name="call-outline" size={20} color="#667eea" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Alternate Phone</Text>
                    <Text style={styles.infoValue}>{staff.alternatePhoneNumber}</Text>
                  </View>
                </View>
              )}

              {staff.emergencyPhone && (
                <View style={styles.infoRow}>
                  <Ionicons name="medical" size={20} color="#dc3545" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Emergency Phone</Text>
                    <Text style={styles.infoValue}>{staff.emergencyPhone}</Text>
                  </View>
                </View>
              )}

              {staff.emergencyContact && (
                <View style={styles.infoRow}>
                  <Ionicons name="person-circle" size={20} color="#dc3545" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Emergency Contact</Text>
                    <Text style={styles.infoValue}>{staff.emergencyContact}</Text>
                  </View>
                </View>
              )}

              {staff.address && (
                <View style={styles.infoRow}>
                  <Ionicons name="location" size={20} color="#28a745" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Address</Text>
                    <Text style={styles.infoValue}>{staff.address}</Text>
                  </View>
                </View>
              )}

              {staff.salary && (
                <View style={styles.infoRow}>
                  <Ionicons name="cash" size={20} color="#28a745" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Monthly Salary</Text>
                    <Text style={styles.infoValue}>₹{staff.salary}</Text>
                  </View>
                </View>
              )}

              {staff.aadharNumber && (
                <View style={styles.infoRow}>
                  <Ionicons name="card" size={20} color="#ffc107" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Aadhar Number</Text>
                    <Text style={styles.infoValue}>{staff.aadharNumber}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Notes */}
          {staff.notes && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notes</Text>
              <View style={styles.infoCard}>
                <Text style={styles.notesText}>{staff.notes}</Text>
              </View>
            </View>
          )}

          {/* Assigned Flats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Assigned Flats ({staff.assignedFlats?.length || 0})</Text>
            <View style={styles.infoCard}>
              {staff.assignedFlats && staff.assignedFlats.length > 0 ? (
                staff.assignedFlats.map((flat, index) => (
                  <View key={index} style={styles.flatRow}>
                    <View style={styles.flatIcon}>
                      <Ionicons name="home" size={20} color="#667eea" />
                    </View>
                    <View style={styles.flatInfo}>
                      <Text style={styles.flatNumber}>{flat.flatNumber}</Text>
                      <Text style={styles.flatOwner}>{flat.memberName}</Text>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyFlats}>
                  <Ionicons name="home-outline" size={32} color="#c5cee0" />
                  <Text style={styles.emptyFlatsText}>No flats assigned</Text>
                </View>
              )}
            </View>
          </View>

          {/* System Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>System Information</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Ionicons name="calendar" size={20} color="#17a2b8" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Date Added</Text>
                  <Text style={styles.infoValue}>{formatDate(staff.createdAt)}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="time" size={20} color="#6c757d" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Last Updated</Text>
                  <Text style={styles.infoValue}>{formatDate(staff.updatedAt)}</Text>
                </View>
              </View>

              {staff.addedBy && (
                <View style={styles.infoRow}>
                  <Ionicons name="person" size={20} color="#495057" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Added By</Text>
                    <Text style={styles.infoValue}>{staff.addedBy}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, styles.editButtonFull]}
            onPress={() => onEdit(staff)}
          >
            <Ionicons name="create" size={20} color="#fff" />
            <Text style={styles.editButtonText}>Edit Staff Member</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    padding: 8,
    marginRight: 8,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  overviewCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  staffHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  staffTypeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  staffMainInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  staffType: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: '#d4edda',
  },
  inactiveBadge: {
    backgroundColor: '#f8d7da',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activeText: {
    color: '#155724',
  },
  inactiveText: {
    color: '#721c24',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  flatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f7',
  },
  flatIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  flatInfo: {
    flex: 1,
  },
  flatNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  flatOwner: {
    fontSize: 14,
    color: '#6c757d',
  },
  emptyFlats: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyFlatsText: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 8,
  },
  notesText: {
    fontSize: 16,
    color: '#2c3e50',
    lineHeight: 24,
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  editButtonFull: {
    backgroundColor: '#667eea',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

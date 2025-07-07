import { Ionicons } from '@expo/vector-icons';
import {
    Alert,
    Linking,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function VisitorDetailsModal({ visible, onClose, visitor, onCheckOut }) {
  if (!visitor) return null;

  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleString();
  };

  const handleCall = (phoneNumber) => {
    if (!phoneNumber) {
      Alert.alert('Error', 'No phone number available');
      return;
    }

    Alert.alert(
      'Make Call',
      `Do you want to call ${phoneNumber}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call', 
          onPress: () => Linking.openURL(`tel:${phoneNumber}`)
        }
      ]
    );
  };

  const InfoRow = ({ label, value, icon, onPress, actionIcon }) => (
    <TouchableOpacity 
      style={styles.infoRow} 
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.infoRowLeft}>
        <Ionicons name={icon} size={20} color="#667eea" />
        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>{label}</Text>
          <Text style={styles.infoValue}>{value || 'N/A'}</Text>
        </View>
      </View>
      {actionIcon && (
        <Ionicons name={actionIcon} size={20} color="#8f9bb3" />
      )}
    </TouchableOpacity>
  );

  const StatusBadge = ({ status }) => {
    const getStatusStyle = () => {
      switch (status) {
        case 'checked_in':
          return { backgroundColor: '#d4edda', color: '#155724', text: 'Checked In' };
        case 'checked_out':
          return { backgroundColor: '#f8d7da', color: '#721c24', text: 'Checked Out' };
        default:
          return { backgroundColor: '#fff3cd', color: '#856404', text: 'Unknown' };
      }
    };

    const statusStyle = getStatusStyle();

    return (
      <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
        <Text style={[styles.statusText, { color: statusStyle.color }]}>
          {statusStyle.text}
        </Text>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Visitor Details</Text>
            <StatusBadge status={visitor.status} />
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Visitor Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Visitor Information</Text>
            
            <InfoRow
              label="Name"
              value={visitor.name}
              icon="person"
            />

            <InfoRow
              label="Phone Number"
              value={visitor.phone}
              icon="call"
              onPress={() => handleCall(visitor.phone)}
              actionIcon="call-outline"
            />

            <InfoRow
              label="Purpose of Visit"
              value={visitor.purpose}
              icon="clipboard"
            />

            <InfoRow
              label="Number of Visitors"
              value={visitor.numberOfVisitors}
              icon="people"
            />

            {visitor.vehicleNumber && (
              <InfoRow
                label="Vehicle Number"
                value={visitor.vehicleNumber}
                icon="car"
              />
            )}
          </View>

          {/* ID Proof Information */}
          {(visitor.idProofType || visitor.idProofNumber) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>ID Proof Information</Text>
              
              {visitor.idProofType && (
                <InfoRow
                  label="ID Proof Type"
                  value={visitor.idProofType.charAt(0).toUpperCase() + visitor.idProofType.slice(1)}
                  icon="card"
                />
              )}

              {visitor.idProofNumber && (
                <InfoRow
                  label="ID Proof Number"
                  value={visitor.idProofNumber}
                  icon="document-text"
                />
              )}
            </View>
          )}

          {/* Destination Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Destination</Text>
            
            <InfoRow
              label="Tower"
              value={`Tower ${visitor.tower}`}
              icon="business"
            />

            <InfoRow
              label="Flat Number"
              value={visitor.flatNumber}
              icon="home"
            />

            <InfoRow
              label="Flat Owner"
              value={visitor.ownerName}
              icon="person-circle"
            />

            {visitor.ownerPhone && (
              <InfoRow
                label="Owner Phone"
                value={visitor.ownerPhone}
                icon="call"
                onPress={() => handleCall(visitor.ownerPhone)}
                actionIcon="call-outline"
              />
            )}
          </View>

          {/* Visit Timing */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Visit Timeline</Text>
            
            <InfoRow
              label="Check-in Time"
              value={formatTime(visitor.checkInTime)}
              icon="log-in"
            />

            {visitor.checkOutTime && (
              <InfoRow
                label="Check-out Time"
                value={formatTime(visitor.checkOutTime)}
                icon="log-out"
              />
            )}

            {visitor.addedBy && (
              <InfoRow
                label="Added By"
                value={visitor.addedBy}
                icon="person-add"
              />
            )}

            {visitor.checkOutBy && (
              <InfoRow
                label="Checked Out By"
                value={visitor.checkOutBy}
                icon="checkmark-circle"
              />
            )}
          </View>

          {/* Additional Notes */}
          {visitor.notes && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Additional Notes</Text>
              <View style={styles.notesContainer}>
                <Text style={styles.notesText}>{visitor.notes}</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Actions */}
        {visitor.status === 'checked_in' && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={() => onCheckOut(visitor)}
            >
              <Ionicons name="log-out" size={20} color="#fff" />
              <Text style={styles.checkoutButtonText}>Check Out Visitor</Text>
            </TouchableOpacity>
          </View>
        )}
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
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginRight: 12,
  },
  closeButton: {
    padding: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f7',
  },
  infoRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#8f9bb3',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  notesContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  notesText: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  checkoutButton: {
    backgroundColor: '#dc3545',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

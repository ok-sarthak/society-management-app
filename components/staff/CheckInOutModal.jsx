import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { staffService } from '../../services/staffService';

export default function CheckInOutModal({ visible, onClose, onSuccess, userData }) {
  const [activeStaff, setActiveStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState([]);

  useEffect(() => {
    if (visible) {
      loadData();
    }
  }, [visible]);

  useEffect(() => {
    filterStaff();
  }, [activeStaff, searchQuery, todayAttendance, filterStaff]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [staffResult, attendanceResult] = await Promise.all([
        staffService.getActiveStaff(),
        staffService.getTodayAttendance()
      ]);

      if (staffResult.success) {
        setActiveStaff(staffResult.data);
      }

      if (attendanceResult.success) {
        setTodayAttendance(attendanceResult.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterStaff = useCallback(() => {
    let filtered = [...activeStaff];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(staff =>
        staff.name?.toLowerCase().includes(query) ||
        staff.phone?.includes(query) ||
        staff.staffType?.toLowerCase().includes(query)
      );
    }

    // Add attendance status to each staff member
    filtered = filtered.map(staff => {
      const staffAttendance = todayAttendance.filter(a => a.staffId === staff.id);
      const lastAction = staffAttendance.length > 0 ? staffAttendance[0].action : null;
      
      return {
        ...staff,
        isCheckedIn: lastAction === 'CHECK_IN',
        lastAction,
        attendanceCount: staffAttendance.length
      };
    });

    setFilteredStaff(filtered);
  }, [activeStaff, searchQuery, todayAttendance]);

  const handleCheckInOut = async (staff, action) => {
    try {
      setLoading(true);
      
      const attendanceData = {
        staffName: staff.name,
        staffType: staff.staffType,
        checkedBy: userData?.name || 'Admin',
        notes: `${action === 'CHECK_IN' ? 'Checked in' : 'Checked out'} by ${userData?.name || 'Admin'}`
      };

      const result = action === 'CHECK_IN' 
        ? await staffService.checkInStaff(staff.id, attendanceData)
        : await staffService.checkOutStaff(staff.id, attendanceData);

      if (result.success) {
        Alert.alert(
          'Success', 
          `${staff.name} has been ${action === 'CHECK_IN' ? 'checked in' : 'checked out'} successfully`
        );
        loadData(); // Refresh data
      } else {
        Alert.alert('Error', result.error || `Failed to ${action === 'CHECK_IN' ? 'check in' : 'check out'} staff`);
      }
    } catch (_error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const confirmAction = (staff, action) => {
    const actionText = action === 'CHECK_IN' ? 'check in' : 'check out';
    Alert.alert(
      `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} Staff`,
      `Are you sure you want to ${actionText} ${staff.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: actionText.charAt(0).toUpperCase() + actionText.slice(1), 
          onPress: () => handleCheckInOut(staff, action)
        }
      ]
    );
  };

  const getStaffTypeIcon = (type) => {
    const icons = {
      maid: 'home',
      cook: 'restaurant',
      driver: 'car',
      security: 'shield',
      gardener: 'leaf',
      maintenance: 'build',
      other: 'person'
    };
    return icons[type?.toLowerCase()] || 'person';
  };

  const StaffCard = ({ staff }) => (
    <View style={styles.staffCard}>
      <View style={styles.staffInfo}>
        <View style={styles.staffHeader}>
          <View style={[
            styles.staffTypeIcon, 
            { backgroundColor: staff.isCheckedIn ? '#28a745' : '#6c757d' }
          ]}>
            <Ionicons 
              name={getStaffTypeIcon(staff.staffType)} 
              size={20} 
              color="#fff" 
            />
          </View>
          <View style={styles.staffDetails}>
            <Text style={styles.staffName}>{staff.name}</Text>
            <Text style={styles.staffType}>{staff.staffType}</Text>
            <Text style={styles.staffPhone}>{staff.phone}</Text>
          </View>
        </View>

        <View style={styles.statusContainer}>
          <View style={[
            styles.statusBadge,
            staff.isCheckedIn ? styles.checkedInBadge : styles.checkedOutBadge
          ]}>
            <Ionicons 
              name={staff.isCheckedIn ? 'checkmark-circle' : 'time'} 
              size={12} 
              color={staff.isCheckedIn ? '#155724' : '#856404'} 
            />
            <Text style={[
              styles.statusText,
              staff.isCheckedIn ? styles.checkedInText : styles.checkedOutText
            ]}>
              {staff.isCheckedIn ? 'Checked In' : 'Available'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actionContainer}>
        {staff.isCheckedIn ? (
          <TouchableOpacity
            style={[styles.actionButton, styles.checkOutButton]}
            onPress={() => confirmAction(staff, 'CHECK_OUT')}
          >
            <Ionicons name="log-out" size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Check Out</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.actionButton, styles.checkInButton]}
            onPress={() => confirmAction(staff, 'CHECK_IN')}
          >
            <Ionicons name="log-in" size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Check In</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="people-outline" size={64} color="#c5cee0" />
      <Text style={styles.emptyStateTitle}>
        {searchQuery ? 'No staff found' : 'No active staff'}
      </Text>
      <Text style={styles.emptyStateSubtitle}>
        {searchQuery 
          ? 'Try adjusting your search terms' 
          : 'Add active staff members to enable check-in/out'
        }
      </Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Staff Check-In/Out</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#8f9bb3" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search staff by name, phone, type..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#8f9bb3" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {filteredStaff.filter(s => s.isCheckedIn).length}
            </Text>
            <Text style={styles.statLabel}>Checked In</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {filteredStaff.filter(s => !s.isCheckedIn).length}
            </Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{filteredStaff.length}</Text>
            <Text style={styles.statLabel}>Total Active</Text>
          </View>
        </View>

        {/* Staff List */}
        <FlatList
          data={filteredStaff}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <StaffCard staff={item} />}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={!loading ? <EmptyState /> : null}
        />
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
  closeButton: {
    padding: 8,
  },
  searchContainer: {
    padding: 20,
    backgroundColor: '#fff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2c3e50',
    marginLeft: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f7',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
  },
  listContainer: {
    padding: 20,
  },
  staffCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  staffInfo: {
    marginBottom: 12,
  },
  staffHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  staffTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  staffDetails: {
    flex: 1,
  },
  staffName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 2,
  },
  staffType: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '500',
    marginBottom: 2,
  },
  staffPhone: {
    fontSize: 12,
    color: '#6c757d',
  },
  statusContainer: {
    alignItems: 'flex-start',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  checkedInBadge: {
    backgroundColor: '#d4edda',
  },
  checkedOutBadge: {
    backgroundColor: '#fff3cd',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  checkedInText: {
    color: '#155724',
  },
  checkedOutText: {
    color: '#856404',
  },
  actionContainer: {
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 120,
    justifyContent: 'center',
  },
  checkInButton: {
    backgroundColor: '#28a745',
  },
  checkOutButton: {
    backgroundColor: '#dc3545',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#8f9bb3',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

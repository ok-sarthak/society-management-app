import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { staffService } from '../../../../services/staffService';
import AddStaffModal from '../../../staff/AddStaffModal';
import CheckInOutModal from '../../../staff/CheckInOutModal';
import EditStaffModal from '../../../staff/EditStaffModal';
import StaffAttendanceModal from '../../../staff/StaffAttendanceModal';
import StaffDetailsModal from '../../../staff/StaffDetailsModal';
import StaffHistoryModal from '../../../staff/StaffHistoryModal';
import ViewAllStaffModal from '../../../staff/ViewAllStaffModal';

const { width: screenWidth } = Dimensions.get('window');

export default function StaffTab({ userData }) {
  const [staffStats, setStaffStats] = useState({
    totalStaff: 0,
    activeStaff: 0,
    inactiveStaff: 0,
    todayCheckIns: 0,
    currentlyOnDuty: 0,
    staffByType: {}
  });
  const [staffList, setStaffList] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Modal states
  const [addStaffModalVisible, setAddStaffModalVisible] = useState(false);
  const [staffDetailsModalVisible, setStaffDetailsModalVisible] = useState(false);
  const [editStaffModalVisible, setEditStaffModalVisible] = useState(false);
  const [staffHistoryModalVisible, setStaffHistoryModalVisible] = useState(false);
  const [staffAttendanceModalVisible, setStaffAttendanceModalVisible] = useState(false);
  const [checkInOutModalVisible, setCheckInOutModalVisible] = useState(false);
  const [viewAllStaffModalVisible, setViewAllStaffModalVisible] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  const filters = [
    { id: 'all', name: 'All Staff', icon: 'people' },
    { id: 'active', name: 'Active', icon: 'checkmark-circle' },
    { id: 'inactive', name: 'Inactive', icon: 'close-circle' },
    { id: 'maid', name: 'Maid', icon: 'home' },
    { id: 'cook', name: 'Cook', icon: 'restaurant' },
    { id: 'driver', name: 'Driver', icon: 'car' },
    { id: 'security', name: 'Security', icon: 'shield' },
  ];

  useEffect(() => {
    loadStaffData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [staffList, searchQuery, selectedFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadStaffData = async () => {
    try {
      setLoading(true);
      const [statsResult, staffResult] = await Promise.all([
        staffService.getStaffStats(),
        staffService.getAllStaff()
      ]);

      if (statsResult.success) {
        setStaffStats(statsResult.data);
      }

      if (staffResult.success) {
        setStaffList(staffResult.data);
      }
    } catch (error) {
      console.error('Error loading staff data:', error);
      Alert.alert('Error', 'Failed to load staff data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadStaffData();
    setRefreshing(false);
  };

  const applyFilters = () => {
    let filtered = [...staffList];

    // Apply status filter
    if (selectedFilter === 'active') {
      filtered = filtered.filter(staff => staff.isActive === true);
    } else if (selectedFilter === 'inactive') {
      filtered = filtered.filter(staff => staff.isActive === false);
    } else if (selectedFilter !== 'all') {
      filtered = filtered.filter(staff => 
        staff.staffType?.toLowerCase() === selectedFilter.toLowerCase()
      );
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(staff =>
        staff.name?.toLowerCase().includes(query) ||
        staff.phoneNumber?.includes(query) ||
        staff.staffType?.toLowerCase().includes(query) ||
        staff.assignedFlats?.some(flat => 
          flat.flatNumber?.toLowerCase().includes(query) ||
          flat.memberName?.toLowerCase().includes(query)
        )
      );
    }

    setFilteredStaff(filtered);
  };

  const handleStaffAction = (action, staff = null) => {
    switch (action) {
      case 'add':
        setAddStaffModalVisible(true);
        break;
      case 'viewAll':
        setViewAllStaffModalVisible(true);
        break;
      case 'details':
        setSelectedStaff(staff);
        setStaffDetailsModalVisible(true);
        break;
      case 'edit':
        setSelectedStaff(staff);
        setEditStaffModalVisible(true);
        break;
      case 'history':
        setSelectedStaff(staff);
        setStaffHistoryModalVisible(true);
        break;
      case 'attendance':
        setSelectedStaff(staff);
        setStaffAttendanceModalVisible(true);
        break;
      case 'checkInOut':
        setCheckInOutModalVisible(true);
        break;
      default:
        break;
    }
  };

  const StatCard = ({ title, value, icon, color, onPress }) => (
    <TouchableOpacity
      style={[styles.statCard, { borderLeftColor: color }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.statIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={20} color="#fff" />
      </View>
      <View style={styles.statInfo}>
        <Text style={styles.statValue}>{loading ? '...' : value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </TouchableOpacity>
  );

  const StaffCard = ({ staff }) => (
    <TouchableOpacity
      style={styles.staffCard}
      onPress={() => handleStaffAction('details', staff)}
      activeOpacity={0.8}
    >
      <View style={styles.staffCardHeader}>
        <View style={styles.staffInfo}>
          <Text style={styles.staffName}>{staff.name}</Text>
          <Text style={styles.staffType}>{staff.staffType}</Text>
          <Text style={styles.staffPhone}>{staff.phoneNumber}</Text>
        </View>
        <View style={styles.staffStatus}>
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
      
      <View style={styles.staffCardFooter}>
        <Text style={styles.assignedFlatsLabel}>Assigned Flats:</Text>
        <Text style={styles.assignedFlats}>
          {staff.assignedFlats?.map(flat => flat.flatNumber).join(', ') || 'None'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const QuickActionButton = ({ title, icon, color, onPress }) => (
    <TouchableOpacity
      style={[styles.quickActionButton, { backgroundColor: color }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons name={icon} size={20} color="#fff" />
      <Text style={styles.quickActionText}>{title}</Text>
    </TouchableOpacity>
  );

  const FilterChip = ({ filter, isSelected, onPress }) => (
    <TouchableOpacity
      style={[styles.filterChip, isSelected && styles.filterChipSelected]}
      onPress={onPress}
    >
      <Ionicons 
        name={filter.icon} 
        size={16} 
        color={isSelected ? '#fff' : '#667eea'} 
      />
      <Text style={[
        styles.filterChipText,
        isSelected && styles.filterChipTextSelected
      ]}>
        {filter.name}
      </Text>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <>
    {searchQuery.trim() === '' && (
      <>
      {/* Stats Grid */}
      <View style={styles.statsContainer}>
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Staff"
            value={staffStats.totalStaff}
            icon="people"
            color="#667eea"
          />
          
          <StatCard
            title="Active Staff"
            value={staffStats.activeStaff}
            icon="checkmark-circle"
            color="#28a745"
          />
          
          <StatCard
            title="On Duty Today"
            value={staffStats.currentlyOnDuty}
            icon="time"
            color="#ffc107"
          />
          
          <StatCard
            title="Today Check-ins"
            value={staffStats.todayCheckIns}
            icon="log-in"
            color="#17a2b8"
          />
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <QuickActionButton
            title="Add Staff"
            icon="person-add"
            color="#667eea"
            onPress={() => handleStaffAction('add')}
          />
          
          <QuickActionButton
            title="View All Staff"
            icon="people"
            color="#007AFF"
            onPress={() => handleStaffAction('viewAll')}
          />
          
          <QuickActionButton
            title="Check In/Out"
            icon="time"
            color="#28a745"
            onPress={() => handleStaffAction('checkInOut')}
          />
          
          <QuickActionButton
            title="Attendance"
            icon="calendar"
            color="#ffc107"
            onPress={() => handleStaffAction('attendance')}
          />
          
          <QuickActionButton
            title="History"
            icon="document-text"
            color="#dc3545"
            onPress={() => handleStaffAction('history')}
          />
        </View>
      </View>
      </>
    )}

      

      

      {/* List Header */}
      <View style={styles.listHeaderContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Staff Members</Text>
          <Text style={styles.staffCount}>
            {filteredStaff.length} staff member{filteredStaff.length !== 1 ? 's' : ''}
          </Text>
          
        </View>
        {/* Filters */}
      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filters}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <FilterChip
              filter={item}
              isSelected={selectedFilter === item.id}
              onPress={() => setSelectedFilter(item.id)}
            />
          )}
          contentContainerStyle={styles.filtersContent}
        />
      </View>
      </View>
    </>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="people-outline" size={64} color="#c5cee0" />
      <Text style={styles.emptyStateTitle}>
        {searchQuery ? 'No staff found' : 'No staff members'}
      </Text>
      <Text style={styles.emptyStateSubtitle}>
        {searchQuery 
          ? 'Try adjusting your search terms or filters' 
          : 'Add staff members to get started'
        }
      </Text>
      {!searchQuery && (
        <TouchableOpacity
          style={styles.addStaffButton}
          onPress={() => handleStaffAction('add')}
        >
          <Text style={styles.addStaffButtonText}>Add Staff Member</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#6c757d" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search staff by name, phone, type, flat..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#6c757d" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <FlatList
        data={filteredStaff}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <StaffCard staff={item} />}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.flatListContent}
        style={styles.flatList}
      />

      {/* Modals */}
      <AddStaffModal
        visible={addStaffModalVisible}
        onClose={() => setAddStaffModalVisible(false)}
        onSuccess={() => {
          setAddStaffModalVisible(false);
          loadStaffData();
        }}
        userData={userData}
      />

      <StaffDetailsModal
        visible={staffDetailsModalVisible}
        onClose={() => setStaffDetailsModalVisible(false)}
        staff={selectedStaff}
        onEdit={(staff) => {
          setStaffDetailsModalVisible(false);
          handleStaffAction('edit', staff);
        }}
      />

      <EditStaffModal
        visible={editStaffModalVisible}
        onClose={() => setEditStaffModalVisible(false)}
        staff={selectedStaff}
        onStaffUpdated={() => {
          setEditStaffModalVisible(false);
          loadStaffData();
        }}
        userData={userData}
      />

      <StaffHistoryModal
        visible={staffHistoryModalVisible}
        onClose={() => setStaffHistoryModalVisible(false)}
        staff={selectedStaff}
      />

      <StaffAttendanceModal
        visible={staffAttendanceModalVisible}
        onClose={() => setStaffAttendanceModalVisible(false)}
        staff={selectedStaff}
      />

      <CheckInOutModal
        visible={checkInOutModalVisible}
        onClose={() => setCheckInOutModalVisible(false)}
        onSuccess={() => {
          setCheckInOutModalVisible(false);
          loadStaffData();
        }}
        userData={userData}
      />

      <ViewAllStaffModal
        visible={viewAllStaffModalVisible}
        onClose={() => setViewAllStaffModalVisible(false)}
        onEditStaff={(staff) => {
          setViewAllStaffModalVisible(false);
          setSelectedStaff(staff);
          setEditStaffModalVisible(true);
        }}
        onViewDetails={(staff) => {
          setViewAllStaffModalVisible(false);
          setSelectedStaff(staff);
          setStaffDetailsModalVisible(true);
        }}
        refreshTrigger={0}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafe',
  },
  flatList: {
    flex: 1,
  },
  flatListContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: (screenWidth - 60) / 2,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e3a59',
    marginBottom: 2,
  },
  statTitle: {
    fontSize: 12,
    color: '#8f9bb3',
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e3a59',
    marginBottom: 16,
  },
  quickActionsGrid: {
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    flexDirection: 'row',
    gap: 10,
  },
  quickActionButton: {
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0.23,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  quickActionText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2e3a59',
    marginLeft: 12,
  },
  filtersContainer: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f7',
    marginBottom: 16,
  },
  filtersContent: {
    paddingHorizontal: 20,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#667eea',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  filterChipSelected: {
    backgroundColor: '#667eea',
  },
  filterChipText: {
    fontSize: 12,
    color: '#667eea',
    marginLeft: 4,
    fontWeight: '500',
  },
  filterChipTextSelected: {
    color: '#fff',
  },
  listHeaderContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  staffCount: {
    fontSize: 14,
    color: '#8f9bb3',
    fontWeight: '500',
  },
  staffCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  staffCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  staffInfo: {
    flex: 1,
    marginRight: 12,
  },
  staffName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e3a59',
    marginBottom: 4,
  },
  staffType: {
    fontSize: 14,
    color: '#667eea',
    marginBottom: 2,
    fontWeight: '500',
  },
  staffPhone: {
    fontSize: 12,
    color: '#8f9bb3',
  },
  staffStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
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
    fontSize: 10,
    fontWeight: '600',
  },
  activeText: {
    color: '#155724',
  },
  inactiveText: {
    color: '#721c24',
  },
  staffCardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f1f3f7',
    paddingTop: 12,
  },
  assignedFlatsLabel: {
    fontSize: 12,
    color: '#8f9bb3',
    marginBottom: 4,
  },
  assignedFlats: {
    fontSize: 12,
    color: '#2e3a59',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    flex: 1,
    justifyContent: 'center',
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e3a59',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#8f9bb3',
    textAlign: 'center',
    marginBottom: 24,
  },
  addStaffButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addStaffButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
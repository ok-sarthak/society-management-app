import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { staffService } from '../../services/staffService';

export default function StaffAttendanceModal({ visible, onClose, staff = null }) {
  const [attendanceData, setAttendanceData] = useState([]);
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [selectedStaffFilter, setSelectedStaffFilter] = useState('all');
  const [allStaff, setAllStaff] = useState([]);
  const [showStaffSelector, setShowStaffSelector] = useState(false);
  const [selectedStaffForView, setSelectedStaffForView] = useState(null);
  const [staffSearchQuery, setStaffSearchQuery] = useState('');
  const [filteredStaffList, setFilteredStaffList] = useState([]);
  const [stats, setStats] = useState({
    totalRecords: 0,
    todayRecords: 0,
    totalStaff: 0,
    activeToday: 0
  });

  const dateFilters = [
    { id: 'all', name: 'All Time', icon: 'calendar' },
    { id: 'today', name: 'Today', icon: 'today' },
    { id: 'week', name: 'This Week', icon: 'calendar-outline' },
    { id: 'month', name: 'This Month', icon: 'calendar-clear' },
  ];

  const statusFilters = [
    { id: 'all', name: 'All', icon: 'list' },
    { id: 'CHECK_IN', name: 'Check In', icon: 'log-in' },
    { id: 'CHECK_OUT', name: 'Check Out', icon: 'log-out' },
  ];

  useEffect(() => {
    if (visible) {
      loadAttendanceData();
      if (!staff) {
        loadAllStaff();
      }
    }
    // Reset staff search when modal opens
    if (visible) {
      setStaffSearchQuery('');
    }
  }, [visible, staff?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    filterAttendance();
  }, [attendanceData, searchQuery, selectedDateFilter, selectedStatusFilter, selectedStaffFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    filterStaffList();
  }, [allStaff, staffSearchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadAllStaff = async () => {
    try {
      const result = await staffService.getAllStaff();
      if (result.success) {
        setAllStaff(result.data);
        setFilteredStaffList(result.data);
      }
    } catch (error) {
      console.error('Error loading staff:', error);
    }
  };

  const filterStaffList = () => {
    let filtered = [...allStaff];
    
    if (staffSearchQuery.trim()) {
      const query = staffSearchQuery.toLowerCase();
      filtered = filtered.filter(staff =>
        staff.name?.toLowerCase().includes(query) ||
        staff.staffType?.toLowerCase().includes(query) ||
        staff.phoneNumber?.includes(query)
      );
    }
    
    setFilteredStaffList(filtered);
  };

  const loadAttendanceData = async () => {
    setLoading(true);
    try {
      let result;
      if (staff?.id) {
        // Load attendance for specific staff member
        result = await staffService.getStaffAttendance(staff.id);
      } else {
        // Load attendance for all staff members
        result = await staffService.getAllAttendanceRecords();
      }
      
      if (result.success) {
        setAttendanceData(result.data);
        calculateStats(result.data);
      }
    } catch (error) {
      console.error('Error loading attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      let result;
      if (staff?.id) {
        // Load attendance for specific staff member
        result = await staffService.getStaffAttendance(staff.id);
      } else {
        // Load attendance for all staff members
        result = await staffService.getAllAttendanceRecords();
      }
      
      if (result.success) {
        setAttendanceData(result.data);
        calculateStats(result.data);
      }
      
      if (!staff) {
        // Also refresh staff list if viewing all attendance
        const staffResult = await staffService.getAllStaff();
        if (staffResult.success) {
          setAllStaff(staffResult.data);
          setFilteredStaffList(staffResult.data);
        }
      }
    } catch (error) {
      console.error('Error refreshing attendance:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const calculateStats = (attendance) => {
    if (attendance.length === 0) {
      setStats({ totalRecords: 0, todayRecords: 0, totalStaff: 0, activeToday: 0 });
      return;
    }

    const today = new Date().toDateString();
    const todayRecords = attendance.filter(record => {
      const recordDate = new Date(record.timestamp?.seconds ? record.timestamp.seconds * 1000 : record.timestamp);
      return recordDate.toDateString() === today;
    });

    const uniqueStaff = new Set(attendance.map(record => record.staffId));
    const activeTodayStaff = new Set(todayRecords.filter(record => record.action === 'CHECK_IN').map(record => record.staffId));

    setStats({
      totalRecords: attendance.length,
      todayRecords: todayRecords.length,
      totalStaff: uniqueStaff.size,
      activeToday: activeTodayStaff.size
    });
  };

  const filterAttendance = () => {
    let filtered = [...attendanceData];

    // Apply staff filter
    if (selectedStaffFilter !== 'all' && !staff) {
      filtered = filtered.filter(item => item.staffId === selectedStaffFilter);
    }

    // Apply date filter
    if (selectedDateFilter !== 'all') {
      const now = new Date();
      const startDate = new Date();

      switch (selectedDateFilter) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - now.getDay());
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'month':
          startDate.setDate(1);
          startDate.setHours(0, 0, 0, 0);
          break;
      }

      filtered = filtered.filter(item => {
        const itemDate = new Date(item.timestamp?.seconds ? item.timestamp.seconds * 1000 : item.timestamp);
        return itemDate >= startDate;
      });
    }

    // Apply status filter
    if (selectedStatusFilter !== 'all') {
      filtered = filtered.filter(item => item.action === selectedStatusFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(item =>
        item.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.staffName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredAttendance(filtered);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    
    let date;
    if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else {
      date = new Date(timestamp);
    }
    
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '--:--';
    
    let date;
    if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else {
      date = new Date(timestamp);
    }
    
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActionIcon = (action) => {
    return action === 'CHECK_IN' ? 'log-in' : 'log-out';
  };

  const getActionColor = (action) => {
    return action === 'CHECK_IN' ? '#34C759' : '#FF3B30';
  };

  const renderAttendanceItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.attendanceItem}
      activeOpacity={0.8}
      onPress={() => {
        if (!staff && item.staffId) {
          setSelectedStaffForView(item.staffId);
        }
      }}
    >
      <View style={styles.attendanceHeader}>
        <View style={styles.actionInfo}>
          <View style={[styles.actionIcon, { backgroundColor: getActionColor(item.action) }]}>
            <Ionicons 
              name={getActionIcon(item.action)} 
              size={18} 
              color="#FFF" 
            />
          </View>
          <View style={styles.actionText}>
            <View style={styles.actionTitleRow}>
              <Text style={styles.actionTitle}>
                {item.action === 'CHECK_IN' ? 'Check In' : 'Check Out'}
              </Text>
              <View style={[styles.actionBadge, { backgroundColor: getActionColor(item.action) }]}>
                <Text style={styles.actionBadgeText}>
                  {item.action === 'CHECK_IN' ? 'IN' : 'OUT'}
                </Text>
              </View>
            </View>
            {!staff && item.staffName && (
              <Text style={styles.staffNameText}>{item.staffName}</Text>
            )}
            <Text style={styles.actionDate}>{formatDate(item.timestamp)}</Text>
          </View>
        </View>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(item.timestamp)}</Text>
          <Text style={styles.timeLabel}>
            {new Date(item.timestamp?.seconds ? item.timestamp.seconds * 1000 : item.timestamp).toLocaleDateString('en-US', { weekday: 'short' })}
          </Text>
        </View>
      </View>

      <View style={styles.attendanceDetails}>
        {item.location && (
          <View style={styles.detailItem}>
            <Ionicons name="location" size={14} color="#8E8E93" />
            <Text style={styles.detailText}>{item.location}</Text>
          </View>
        )}

        {item.notes && (
          <View style={styles.detailItem}>
            <Ionicons name="document-text" size={14} color="#8E8E93" />
            <Text style={styles.detailText}>{item.notes}</Text>
          </View>
        )}

        {item.duration && (
          <View style={styles.detailItem}>
            <Ionicons name="time" size={14} color="#8E8E93" />
            <Text style={styles.detailText}>Duration: {item.duration}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderStatsCard = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.totalRecords}</Text>
          <Text style={styles.statLabel}>Total Records</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.todayRecords}</Text>
          <Text style={styles.statLabel}>Today</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.totalStaff}</Text>
          <Text style={styles.statLabel}>Staff</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.activeToday}</Text>
          <Text style={styles.statLabel}>Active Today</Text>
        </View>
      </View>
    </View>
  );

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {staff ? `Attendance - ${staff.name}` : selectedStaffForView ? `Attendance - ${selectedStaffForView.name}` : 'Staff Attendance'}
          </Text>
          <View style={styles.headerActions}>
            {!staff && (
              <TouchableOpacity 
                onPress={() => setShowStaffSelector(true)}
                style={styles.staffSelectorButton}
              >
                <Ionicons name="person" size={20} color="#007AFF" />
                <Text style={styles.staffSelectorText}>
                  {selectedStaffForView ? selectedStaffForView.name : 'Select Staff'}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              onPress={handleRefresh} 
              style={styles.refreshButton}
              disabled={refreshing}
            >
              <Ionicons 
                name="refresh" 
                size={20} 
                color={refreshing ? "#999" : "#007AFF"} 
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        {renderStatsCard()}

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search attendance records..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Date Filters */}
        <View style={styles.filtersContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={dateFilters}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  selectedDateFilter === item.id && styles.filterChipSelected
                ]}
                onPress={() => setSelectedDateFilter(item.id)}
              >
                <Ionicons 
                  name={item.icon} 
                  size={16} 
                  color={selectedDateFilter === item.id ? '#FFF' : '#666'} 
                />
                <Text style={[
                  styles.filterChipText,
                  selectedDateFilter === item.id && styles.filterChipTextSelected
                ]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.filtersList}
          />
        </View>

        {/* Status Filters */}
        <View style={styles.filtersContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={statusFilters}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  selectedStatusFilter === item.id && styles.filterChipSelected
                ]}
                onPress={() => setSelectedStatusFilter(item.id)}
              >
                <Ionicons 
                  name={item.icon} 
                  size={16} 
                  color={selectedStatusFilter === item.id ? '#FFF' : '#666'} 
                />
                <Text style={[
                  styles.filterChipText,
                  selectedStatusFilter === item.id && styles.filterChipTextSelected
                ]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.filtersList}
          />
        </View>

        {/* Attendance List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading attendance...</Text>
          </View>
        ) : filteredAttendance.length > 0 ? (
          <FlatList
            data={filteredAttendance}
            keyExtractor={(item) => item.id}
            renderItem={renderAttendanceItem}
            contentContainerStyle={styles.attendanceList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={handleRefresh}
                tintColor="#007AFF"
                colors={["#007AFF"]}
              />
            }
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={64} color="#C7C7CC" />
            <Text style={styles.emptyStateTitle}>No Attendance Records</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery.trim() || selectedDateFilter !== 'all' || selectedStatusFilter !== 'all'
                ? 'No records match your search criteria' 
                : 'No attendance records found for this staff member'
              }
            </Text>
          </View>
        )}
      </View>

      {/* Staff Selector Modal */}
      <Modal
        visible={showStaffSelector}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.staffSelectorContainer}>
          <View style={styles.staffSelectorHeader}>
            <Text style={styles.staffSelectorHeaderTitle}>Select Staff Member</Text>
            <TouchableOpacity onPress={() => setShowStaffSelector(false)} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          {/* Search for staff */}
          <View style={styles.staffSearchContainer}>
            <Ionicons name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
            <TextInput
              style={styles.staffSearchInput}
              placeholder="Search staff by name, type, or phone..."
              value={staffSearchQuery}
              onChangeText={setStaffSearchQuery}
            />
            {staffSearchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setStaffSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#8E8E93" />
              </TouchableOpacity>
            )}
          </View>

          {/* Clear selection option */}
          <View style={styles.staffSelectorActions}>
            <TouchableOpacity
              style={styles.clearSelectionButton}
              onPress={() => {
                setSelectedStaffForView(null);
                setSelectedStaffFilter('all');
                setShowStaffSelector(false);
              }}
            >
              <Ionicons name="people" size={20} color="#FF3B30" />
              <Text style={styles.clearSelectionText}>Show All Staff Attendance</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={filteredStaffList}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.staffSelectorItem,
                  selectedStaffForView?.id === item.id && styles.staffSelectorItemSelected
                ]}
                onPress={() => {
                  setSelectedStaffForView(item);
                  setSelectedStaffFilter(item.id);
                  setShowStaffSelector(false);
                }}
              >
                <View style={styles.staffSelectorInfo}>
                  <View style={[
                    styles.staffSelectorAvatar,
                    { backgroundColor: item.isActive ? '#007AFF' : '#8E8E93' }
                  ]}>
                    <Text style={styles.staffSelectorInitials}>
                      {item.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.staffSelectorTextInfo}>
                    <Text style={styles.staffSelectorName}>{item.name}</Text>
                    <Text style={styles.staffSelectorType}>{item.staffType}</Text>
                    <Text style={[
                      styles.staffSelectorStatus,
                      { color: item.isActive ? '#34C759' : '#FF3B30' }
                    ]}>
                      {item.isActive ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                </View>
                <View style={styles.staffSelectorChevron}>
                  {selectedStaffForView?.id === item.id ? (
                    <Ionicons name="checkmark-circle" size={20} color="#007AFF" />
                  ) : (
                    <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
                  )}
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.staffSelectorList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.staffEmptyState}>
                <Ionicons name="person-outline" size={48} color="#C7C7CC" />
                <Text style={styles.staffEmptyStateText}>
                  {staffSearchQuery ? 'No staff members match your search' : 'No staff members found'}
                </Text>
              </View>
            }
          />
        </View>
      </Modal>
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
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  staffSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F0F8FF',
    borderRadius: 16,
    marginRight: 12,
  },
  staffSelectorText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 4,
    fontWeight: '500',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#F0F8FF',
    marginRight: 8,
  },
  closeButton: {
    padding: 8,
  },
  statsContainer: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 16,
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
  filtersContainer: {
    marginTop: 12,
  },
  filtersList: {
    paddingHorizontal: 20,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginRight: 8,
  },
  filterChipSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginLeft: 6,
  },
  filterChipTextSelected: {
    color: '#FFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 12,
  },
  attendanceList: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  attendanceItem: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  attendanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  actionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionText: {
    flex: 1,
  },
  actionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  actionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  actionBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  staffNameText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
    marginBottom: 2,
  },
  actionDate: {
    fontSize: 13,
    color: '#8E8E93',
  },
  timeContainer: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  timeLabel: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 2,
  },
  attendanceDetails: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F1F1',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  // Staff Selector Styles
  staffSelectorContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  staffSelectorHeader: {
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
  staffSelectorHeaderTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  staffSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  staffSearchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  staffSelectorActions: {
    marginHorizontal: 20,
    marginTop: 16,
  },
  clearSelectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  clearSelectionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF3B30',
    marginLeft: 8,
  },
  staffSelectorList: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  staffSelectorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  staffSelectorItemSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  staffSelectorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  staffSelectorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  staffSelectorInitials: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  staffSelectorTextInfo: {
    flex: 1,
  },
  staffSelectorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  staffSelectorType: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 2,
  },
  staffSelectorStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  staffSelectorChevron: {
    marginLeft: 8,
  },
  staffEmptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  staffEmptyStateText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 24,
  },
});

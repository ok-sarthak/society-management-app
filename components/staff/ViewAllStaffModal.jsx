import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
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

export default function ViewAllStaffModal({ 
  visible, 
  onClose, 
  onEditStaff, 
  onViewDetails,
  refreshTrigger 
}) {
  const [staffList, setStaffList] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filters = [
    { id: 'all', name: 'All Staff', icon: 'people' },
    { id: 'active', name: 'Active', icon: 'checkmark-circle' },
    { id: 'inactive', name: 'Inactive', icon: 'close-circle' },
    { id: 'Maid', name: 'Maids', icon: 'home' },
    { id: 'Cook', name: 'Cooks', icon: 'restaurant' },
    { id: 'Security', name: 'Security', icon: 'shield' },
    { id: 'Driver', name: 'Drivers', icon: 'car' },
  ];

  useEffect(() => {
    if (visible) {
      loadStaffData();
    }
  }, [visible, refreshTrigger]);

  useEffect(() => {
    applyFilters();
  }, [staffList, searchQuery, selectedFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadStaffData = async () => {
    setLoading(true);
    try {
      const result = await staffService.getAllStaff();
      if (result.success && Array.isArray(result.data)) {
        setStaffList(result.data);
      } else {
        setStaffList([]);
      }
    } catch (error) {
      console.error('Error loading staff:', error);
      setStaffList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const result = await staffService.getAllStaff();
      if (result.success && Array.isArray(result.data)) {
        setStaffList(result.data);
      } else {
        setStaffList([]);
      }
    } catch (error) {
      console.error('Error refreshing staff:', error);
      setStaffList([]);
    } finally {
      setRefreshing(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...(staffList || [])];

    // Apply status filter
    if (selectedFilter === 'active') {
      filtered = filtered.filter(staff => staff && staff.isActive === true);
    } else if (selectedFilter === 'inactive') {
      filtered = filtered.filter(staff => staff && staff.isActive !== true);
    } else if (selectedFilter !== 'all') {
      // Filter by staff type
      filtered = filtered.filter(staff => staff && staff.staffType === selectedFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(staff =>
        staff && (
          (staff.name || '').toLowerCase().includes(query) ||
          (staff.phoneNumber || '').includes(query) ||
          (staff.staffType || '').toLowerCase().includes(query) ||
          staff.assignedFlats?.some(flat => 
            (flat.flatNumber || '').toLowerCase().includes(query) ||
            (flat.memberName || '').toLowerCase().includes(query)
          )
        )
      );
    }

    setFilteredStaff(filtered || []);
  };

  const getStatusColor = (isActive) => {
    return isActive === true ? '#34C759' : '#FF3B30';
  };

  const getStatusText = (isActive) => {
    return isActive === true ? 'Active' : 'Inactive';
  };

  const getStaffTypeIcon = (staffType) => {
    switch (staffType?.toLowerCase()) {
      case 'maid':
        return 'home';
      case 'cook':
        return 'restaurant';
      case 'security':
        return 'shield';
      case 'driver':
        return 'car';
      case 'gardener':
        return 'leaf';
      case 'maintenance':
        return 'build';
      default:
        return 'person';
    }
  };

  const renderStaffItem = ({ item }) => {
    // Add safety check for item
    if (!item) return null;
    
    return (
    <View style={styles.staffCard}>
      <View style={styles.staffHeader}>
        <View style={styles.staffInfo}>
          <View style={styles.staffTypeIcon}>
            <Ionicons 
              name={getStaffTypeIcon(item.staffType)} 
              size={20} 
              color="#007AFF" 
            />
          </View>
          <View style={styles.staffBasicInfo}>
            <Text style={styles.staffName}>{item.name || 'Unknown Staff'}</Text>
            <Text style={styles.staffType}>{item.staffType || 'Unknown Type'}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.isActive) }]}>
          <Text style={styles.statusText}>{getStatusText(item.isActive)}</Text>
        </View>
      </View>

      <View style={styles.staffDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="call" size={14} color="#666" />
          <Text style={styles.detailText}>{item.phoneNumber || 'N/A'}</Text>
        </View>
        {item.assignedFlats && item.assignedFlats.length > 0 && (
          <View style={styles.detailRow}>
            <Ionicons name="home" size={14} color="#666" />
            <Text style={styles.detailText}>
              {item.assignedFlats.length} flat{item.assignedFlats.length > 1 ? 's' : ''} assigned
            </Text>
          </View>
        )}
        {item.salary ? (
  <View style={styles.detailRow}>
    <Ionicons name="card" size={14} color="#666" />
    <Text style={styles.detailText}>₹{item.salary}/month</Text>
  </View>
) : (
  <View style={styles.detailRow}>
    <Ionicons name="card" size={14} color="#666" />
    <Text style={styles.detailText}>N/A</Text>
  </View>
)}
      </View>

      <View style={styles.staffActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onViewDetails && onViewDetails(item)}
        >
          <Ionicons name="eye" size={16} color="#007AFF" />
          <Text style={styles.actionButtonText}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => onEditStaff && onEditStaff(item)}
        >
          <Ionicons name="create" size={16} color="#007AFF" />
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>
    </View>
    );
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>All Staff Members</Text>
          <View style={styles.headerActions}>
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

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search staff by name, phone, type, or flat..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={filters}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  selectedFilter === item.id && styles.filterChipSelected
                ]}
                onPress={() => setSelectedFilter(item.id)}
              >
                <Ionicons 
                  name={item.icon} 
                  size={16} 
                  color={selectedFilter === item.id ? '#FFF' : '#666'} 
                />
                <Text style={[
                  styles.filterChipText,
                  selectedFilter === item.id && styles.filterChipTextSelected
                ]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.filtersList}
          />
        </View>

        {/* Staff List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading staff...</Text>
          </View>
        ) : filteredStaff.length > 0 ? (
          <View style={styles.listContainer}>
            <Text style={styles.resultCount}>
              {filteredStaff.length} staff member{filteredStaff.length > 1 ? 's' : ''} found
            </Text>
            <FlatList
              data={filteredStaff.filter(item => item && item.id)}
              keyExtractor={(item, index) => item?.id || `staff-${index}`}
              renderItem={renderStaffItem}
              contentContainerStyle={styles.staffList}
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
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color="#C7C7CC" />
            <Text style={styles.emptyStateTitle}>No Staff Found</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery.trim() || selectedFilter !== 'all' 
                ? 'No staff members match your search criteria' 
                : 'No staff members added yet'
              }
            </Text>
          </View>
        )}
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#F0F8FF',
  },
  closeButton: {
    padding: 8,
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
    marginTop: 16,
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
  listContainer: {
    flex: 1,
    paddingTop: 16,
  },
  resultCount: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 20,
    marginBottom: 8,
  },
  staffList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  staffCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  staffHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  staffInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  staffTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  staffBasicInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  staffType: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  staffDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  staffActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#F8F9FA',
    marginHorizontal: 4,
  },
  editButton: {
    backgroundColor: '#F0F8FF',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
    marginLeft: 4,
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

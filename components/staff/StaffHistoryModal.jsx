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

export default function StaffHistoryModal({ visible, onClose, staff = null }) {
  const [historyData, setHistoryData] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedStaffFilter, setSelectedStaffFilter] = useState('all');
  const [allStaff, setAllStaff] = useState([]);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);

  const activityFilters = [
    { id: 'all', name: 'All Activities', icon: 'list' },
    { id: 'STAFF_ADDED', name: 'Added', icon: 'person-add' },
    { id: 'STAFF_UPDATED', name: 'Updated', icon: 'create' },
    { id: 'STATUS_CHANGED', name: 'Status Changed', icon: 'swap-horizontal' },
    { id: 'ASSIGNMENT_CHANGED', name: 'Assignment', icon: 'home' },
  ];

  useEffect(() => {
    if (visible) {
      loadStaffHistory();
      if (!staff) {
        loadAllStaff();
      }
    }
  }, [visible, staff?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    filterHistory();
  }, [historyData, searchQuery, selectedFilter, selectedStaffFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadAllStaff = async () => {
    try {
      const result = await staffService.getAllStaff();
      if (result.success) {
        setAllStaff(result.data);
      }
    } catch (error) {
      console.error('Error loading staff:', error);
    }
  };

  const loadStaffHistory = async () => {
    setLoading(true);
    try {
      let result;
      if (staff?.id) {
        // Load history for specific staff member
        result = await staffService.getStaffHistory(staff.id);
      } else {
        // Load history for all staff members
        result = await staffService.getStaffHistory();
      }
      
      if (result.success) {
        setHistoryData(result.data);
      }
    } catch (error) {
      console.error('Error loading staff history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      let result;
      if (staff?.id) {
        // Load history for specific staff member
        result = await staffService.getStaffHistory(staff.id);
      } else {
        // Load history for all staff members
        result = await staffService.getStaffHistory();
      }
      
      if (result.success) {
        setHistoryData(result.data);
      }

      if (!staff) {
        // Also refresh staff list if viewing all history
        const staffResult = await staffService.getAllStaff();
        if (staffResult.success) {
          setAllStaff(staffResult.data);
        }
      }
    } catch (error) {
      console.error('Error refreshing staff history:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const filterHistory = () => {
    let filtered = [...historyData];

    // Apply activity filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(item => item.activityType === selectedFilter);
    }

    // Apply staff filter (only when showing all staff history)
    if (!staff && selectedStaffFilter !== 'all') {
      filtered = filtered.filter(item => item.staffId === selectedStaffFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(item =>
        item.activityType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.details?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.performedBy?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.changes?.oldData?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.changes?.newData?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.staffName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredHistory(filtered);
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

  const getActivityIcon = (activityType) => {
    switch (activityType) {
      case 'STAFF_ADDED':
        return 'person-add';
      case 'STAFF_UPDATED':
        return 'create';
      case 'STATUS_CHANGED':
        return 'swap-horizontal';
      case 'ASSIGNMENT_CHANGED':
        return 'home';
      case 'CHECK_IN':
        return 'log-in';
      case 'CHECK_OUT':
        return 'log-out';
      default:
        return 'time';
    }
  };

  const getActivityColor = (activityType) => {
    switch (activityType) {
      case 'STAFF_ADDED':
        return '#34C759';
      case 'STAFF_UPDATED':
        return '#007AFF';
      case 'STATUS_CHANGED':
        return '#FF9500';
      case 'ASSIGNMENT_CHANGED':
        return '#5856D6';
      case 'CHECK_IN':
        return '#34C759';
      case 'CHECK_OUT':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  const getActivityTitle = (activityType) => {
    switch (activityType) {
      case 'STAFF_ADDED':
        return 'Staff Added';
      case 'STAFF_UPDATED':
        return 'Details Updated';
      case 'STATUS_CHANGED':
        return 'Status Changed';
      case 'ASSIGNMENT_CHANGED':
        return 'Assignment Changed';
      case 'CHECK_IN':
        return 'Checked In';
      case 'CHECK_OUT':
        return 'Checked Out';
      default:
        return 'Activity';
    }
  };

  const renderChanges = (changes) => {
    if (!changes) return null;

    const { oldData, newData } = changes;
    const changedFields = [];

    if (oldData && newData) {
      Object.keys(newData).forEach(key => {
        if (oldData[key] !== newData[key] && key !== 'updatedAt' && key !== 'updatedBy') {
          changedFields.push({
            field: key,
            old: oldData[key],
            new: newData[key]
          });
        }
      });
    }

    if (changedFields.length === 0) return null;

    return (
      <View style={styles.changesContainer}>
        {changedFields.map((change, index) => (
          <View key={index} style={styles.changeItem}>
            <Text style={styles.changeField}>{formatFieldName(change.field)}:</Text>
            <View style={styles.changeValues}>
              <Text style={styles.oldValue}>{formatValue(change.old)}</Text>
              <Ionicons name="arrow-forward" size={12} color="#8E8E93" style={styles.arrow} />
              <Text style={styles.newValue}>{formatValue(change.new)}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const formatFieldName = (field) => {
    return field
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  const formatValue = (value) => {
    if (value === null || value === undefined) return 'Not set';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const renderHistoryItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.historyItem}
      onPress={() => {
        setSelectedHistoryItem(item);
        setDetailsModalVisible(true);
      }}
      activeOpacity={0.8}
    >
      <View style={styles.historyHeader}>
        <View style={styles.activityInfo}>
          <View style={[styles.activityIcon, { backgroundColor: getActivityColor(item.activityType) }]}>
            <Ionicons 
              name={getActivityIcon(item.activityType)} 
              size={16} 
              color="#FFF" 
            />
          </View>
          <View style={styles.activityText}>
            <Text style={styles.activityTitle}>{getActivityTitle(item.activityType)}</Text>
            {!staff && item.staffName && (
              <Text style={styles.staffName}>{item.staffName}</Text>
            )}
            <Text style={styles.activityDate}>{formatDate(item.createdAt)}</Text>
          </View>
        </View>
        <View style={styles.activityActions}>
          <View style={styles.performedBy}>
            <Text style={styles.performedByText}>by {item.performedBy || 'System'}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#C7C7CC" style={styles.chevron} />
        </View>
      </View>

      {item.details && (
        <Text style={styles.detailsPreview} numberOfLines={1}>
          {item.details}
        </Text>
      )}

      {item.changes && (
        <View style={styles.changesPreview}>
          <Ionicons name="swap-horizontal" size={12} color="#8E8E93" />
          <Text style={styles.changesText}>
            {Object.keys(item.changes.newData || {}).length} field(s) changed
          </Text>
        </View>
      )}
    </TouchableOpacity>
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
            {staff ? `Staff History - ${staff.name}` : 'All Staff History'}
          </Text>
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
            placeholder="Search history..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={activityFilters}
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

        {/* Staff Filter (only when showing all staff history) */}
        {!staff && (
          <View style={styles.filtersContainer}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={[
                { id: 'all', name: 'All Staff', icon: 'people' },
                ...allStaff.map(staffMember => ({
                  id: staffMember.id,
                  name: staffMember.name,
                  icon: 'person'
                }))
              ]}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    selectedStaffFilter === item.id && styles.filterChipSelected
                  ]}
                  onPress={() => setSelectedStaffFilter(item.id)}
                >
                  <Ionicons 
                    name={item.icon} 
                    size={16} 
                    color={selectedStaffFilter === item.id ? '#FFF' : '#666'} 
                  />
                  <Text style={[
                    styles.filterChipText,
                    selectedStaffFilter === item.id && styles.filterChipTextSelected
                  ]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.filtersList}
            />
          </View>
        )}

        {/* History List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading history...</Text>
          </View>
        ) : filteredHistory.length > 0 ? (
          <FlatList
            data={filteredHistory}
            keyExtractor={(item) => item.id}
            renderItem={renderHistoryItem}
            contentContainerStyle={styles.historyList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#007AFF"
              />
            }
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={64} color="#C7C7CC" />
            <Text style={styles.emptyStateTitle}>No History Found</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery.trim() || selectedFilter !== 'all' || (!staff && selectedStaffFilter !== 'all')
                ? 'No activities match your search criteria' 
                : staff ? 'No activities recorded for this staff member' : 'No staff activities recorded'
              }
            </Text>
          </View>
        )}
      </View>

      {/* History Details Modal */}
      <Modal
        visible={detailsModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.detailsModalContainer}>
          <View style={styles.detailsHeader}>
            <Text style={styles.detailsHeaderTitle}>Activity Details</Text>
            <TouchableOpacity onPress={() => setDetailsModalVisible(false)} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          {selectedHistoryItem && (
            <View style={styles.detailsContent}>
              {/* Activity Summary */}
              <View style={styles.detailsSection}>
                <View style={styles.detailsSummary}>
                  <View style={[styles.detailsActivityIcon, { backgroundColor: getActivityColor(selectedHistoryItem.activityType) }]}>
                    <Ionicons 
                      name={getActivityIcon(selectedHistoryItem.activityType)} 
                      size={24} 
                      color="#FFF" 
                    />
                  </View>
                  <View style={styles.detailsSummaryText}>
                    <Text style={styles.detailsActivityTitle}>
                      {getActivityTitle(selectedHistoryItem.activityType)}
                    </Text>
                    {selectedHistoryItem.staffName && (
                      <Text style={styles.detailsStaffName}>{selectedHistoryItem.staffName}</Text>
                    )}
                    <Text style={styles.detailsDate}>
                      {formatDate(selectedHistoryItem.createdAt)}
                    </Text>
                    <Text style={styles.detailsPerformedBy}>
                      Performed by {selectedHistoryItem.performedBy || 'System'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Description */}
              {selectedHistoryItem.details && (
                <View style={styles.detailsSection}>
                  <Text style={styles.detailsSectionTitle}>Description</Text>
                  <Text style={styles.detailsDescription}>{selectedHistoryItem.details}</Text>
                </View>
              )}

              {/* Changes */}
              {selectedHistoryItem.changes && (
                <View style={styles.detailsSection}>
                  <Text style={styles.detailsSectionTitle}>Changes Made</Text>
                  {renderChanges(selectedHistoryItem.changes)}
                </View>
              )}
            </View>
          )}
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
    gap: 8,
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
  historyList: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  historyItem: {
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
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  activityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityText: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  staffName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
    marginTop: 2,
  },
  activityDate: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  activityActions: {
    alignItems: 'flex-end',
  },
  performedBy: {
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  performedByText: {
    fontSize: 12,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
  chevron: {
    marginTop: 4,
  },
  detailsPreview: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  changesPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  changesText: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 4,
  },
  details: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  changesContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  changeItem: {
    marginBottom: 8,
  },
  changeField: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  changeValues: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  oldValue: {
    fontSize: 14,
    color: '#FF3B30',
    textDecorationLine: 'line-through',
    flex: 1,
  },
  arrow: {
    marginHorizontal: 8,
  },
  newValue: {
    fontSize: 14,
    color: '#34C759',
    fontWeight: '500',
    flex: 1,
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
  // Details Modal Styles
  detailsModalContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  detailsHeader: {
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
  detailsHeaderTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  detailsContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  detailsSection: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  detailsSummary: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailsActivityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  detailsSummaryText: {
    flex: 1,
  },
  detailsActivityTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  detailsStaffName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
    marginBottom: 4,
  },
  detailsDate: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
  },
  detailsPerformedBy: {
    fontSize: 14,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
  detailsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  detailsDescription: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
});

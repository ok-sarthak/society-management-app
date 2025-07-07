import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { visitorsService } from '../../services/visitorsService';
import VisitorDetailsModal from './VisitorDetailsModal';

export default function VisitorsHistoryModal({ visible, onClose, userData }) {
  const [visitors, setVisitors] = useState([]);
  const [filteredVisitors, setFilteredVisitors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  
  // Modal states
  const [visitorDetailsModalVisible, setVisitorDetailsModalVisible] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState(null);

  const filters = [
    { id: 'all', name: 'All Visitors', icon: 'people' },
    { id: 'checked_in', name: 'Checked In', icon: 'log-in' },
    { id: 'checked_out', name: 'Checked Out', icon: 'log-out' },
    { id: 'today', name: 'Today', icon: 'today' },
    { id: 'this_week', name: 'This Week', icon: 'calendar' },
  ];

  useEffect(() => {
    if (visible) {
      loadVisitors();
    }
  }, [visible]);

  useEffect(() => {
    applyFilters();
  }, [visitors, searchQuery, selectedFilter, applyFilters]);

  const loadVisitors = async () => {
    try {
      setLoading(true);
      const result = await visitorsService.getVisitorsHistory();
      
      if (result.success) {
        setVisitors(result.data);
      } else {
        Alert.alert('Error', result.error || 'Failed to load visitors history');
      }
    } catch (_error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadVisitors();
    setRefreshing(false);
  };

  const handleVisitorPress = (visitor) => {
    setSelectedVisitor(visitor);
    setVisitorDetailsModalVisible(true);
  };

  const applyFilters = useCallback(() => {
    let filtered = [...visitors];

    // Apply status filter
    if (selectedFilter === 'checked_in') {
      filtered = filtered.filter(visitor => visitor.status === 'checked_in');
    } else if (selectedFilter === 'checked_out') {
      filtered = filtered.filter(visitor => visitor.status === 'checked_out');
    } else if (selectedFilter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filtered = filtered.filter(visitor => {
        if (!visitor.checkInTime) return false;
        const checkInDate = new Date(visitor.checkInTime.seconds * 1000);
        return checkInDate >= today;
      });
    } else if (selectedFilter === 'this_week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      oneWeekAgo.setHours(0, 0, 0, 0);
      filtered = filtered.filter(visitor => {
        if (!visitor.checkInTime) return false;
        const checkInDate = new Date(visitor.checkInTime.seconds * 1000);
        return checkInDate >= oneWeekAgo;
      });
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(visitor =>
        visitor.name?.toLowerCase().includes(query) ||
        visitor.phone?.includes(query) ||
        visitor.flatNumber?.toLowerCase().includes(query) ||
        visitor.tower?.toLowerCase().includes(query) ||
        visitor.purpose?.toLowerCase().includes(query) ||
        visitor.ownerName?.toLowerCase().includes(query)
      );
    }

    setFilteredVisitors(filtered);
  }, [visitors, searchQuery, selectedFilter]);

  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleString();
  };

  const calculateDuration = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 'Ongoing';
    
    const checkInTime = new Date(checkIn.seconds * 1000);
    const checkOutTime = new Date(checkOut.seconds * 1000);
    const duration = checkOutTime - checkInTime;
    
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const VisitorHistoryCard = ({ visitor }) => (
    <TouchableOpacity
      style={styles.visitorCard}
      onPress={() => handleVisitorPress(visitor)}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={styles.visitorInfo}>
          <Text style={styles.visitorName}>{visitor.name}</Text>
          <Text style={styles.visitorDetails}>
            {visitor.tower} - {visitor.flatNumber} | {visitor.ownerName}
          </Text>
          <Text style={styles.visitorPurpose}>{visitor.purpose}</Text>
        </View>
        
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusBadge,
            visitor.status === 'checked_in' 
              ? styles.checkedInBadge 
              : styles.checkedOutBadge
          ]}>
            <Text style={[
              styles.statusText,
              visitor.status === 'checked_in' 
                ? styles.checkedInText 
                : styles.checkedOutText
            ]}>
              {visitor.status === 'checked_in' ? 'Checked In' : 'Checked Out'}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.cardFooter}>
        <View style={styles.timeInfo}>
          <View style={styles.timeRow}>
            <Ionicons name="log-in" size={14} color="#28a745" />
            <Text style={styles.timeLabel}>In: </Text>
            <Text style={styles.timeValue}>{formatTime(visitor.checkInTime)}</Text>
          </View>
          
          {visitor.checkOutTime && (
            <View style={styles.timeRow}>
              <Ionicons name="log-out" size={14} color="#dc3545" />
              <Text style={styles.timeLabel}>Out: </Text>
              <Text style={styles.timeValue}>{formatTime(visitor.checkOutTime)}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.durationInfo}>
          <Text style={styles.durationLabel}>Duration</Text>
          <Text style={styles.durationValue}>
            {calculateDuration(visitor.checkInTime, visitor.checkOutTime)}
          </Text>
        </View>
      </View>
      
      {visitor.phone && (
        <View style={styles.contactInfo}>
          <Ionicons name="call" size={14} color="#667eea" />
          <Text style={styles.phoneText}>{visitor.phone}</Text>
        </View>
      )}
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

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="document-text-outline" size={64} color="#c5cee0" />
      <Text style={styles.emptyStateTitle}>
        {searchQuery ? 'No visitors found' : 'No visitor history'}
      </Text>
      <Text style={styles.emptyStateSubtitle}>
        {searchQuery 
          ? 'Try adjusting your search terms or filters' 
          : 'Visitor history will appear here once visitors are added'
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
          <Text style={styles.title}>Visitors History</Text>
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
              placeholder="Search visitors..."
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

        {/* Results Count */}
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsText}>
            {filteredVisitors.length} visitor{filteredVisitors.length !== 1 ? 's' : ''} found
          </Text>
        </View>

        {/* Visitors List */}
        <FlatList
          data={filteredVisitors}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <VisitorHistoryCard visitor={item} />}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={!loading ? <EmptyState /> : null}
        />
      </View>

      {/* Visitor Details Modal */}
      <VisitorDetailsModal
        visible={visitorDetailsModalVisible}
        onClose={() => setVisitorDetailsModalVisible(false)}
        visitor={selectedVisitor}
        onCheckOut={() => {
          // Visitor is already checked out in history, so this won't be used
          setVisitorDetailsModalVisible(false);
        }}
      />
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
  filtersContainer: {
    backgroundColor: '#fff',
    paddingBottom: 20,
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
  },
  filterChipSelected: {
    backgroundColor: '#667eea',
  },
  filterChipText: {
    fontSize: 14,
    color: '#667eea',
    marginLeft: 6,
    fontWeight: '500',
  },
  filterChipTextSelected: {
    color: '#fff',
  },
  resultsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f7',
  },
  resultsText: {
    fontSize: 14,
    color: '#8f9bb3',
    fontWeight: '500',
  },
  listContainer: {
    padding: 20,
  },
  visitorCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  visitorInfo: {
    flex: 1,
    marginRight: 12,
  },
  visitorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  visitorDetails: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  visitorPurpose: {
    fontSize: 14,
    color: '#8f9bb3',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  checkedInBadge: {
    backgroundColor: '#d4edda',
  },
  checkedOutBadge: {
    backgroundColor: '#f8d7da',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  checkedInText: {
    color: '#155724',
  },
  checkedOutText: {
    color: '#721c24',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#f1f3f7',
    paddingTop: 12,
    marginBottom: 8,
  },
  timeInfo: {
    flex: 1,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  timeLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginLeft: 4,
    fontWeight: '500',
  },
  timeValue: {
    fontSize: 12,
    color: '#2c3e50',
  },
  durationInfo: {
    alignItems: 'flex-end',
  },
  durationLabel: {
    fontSize: 12,
    color: '#8f9bb3',
    marginBottom: 2,
  },
  durationValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#667eea',
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 6,
  },
  phoneText: {
    fontSize: 12,
    color: '#667eea',
    marginLeft: 6,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
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

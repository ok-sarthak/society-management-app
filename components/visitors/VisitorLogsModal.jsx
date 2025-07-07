import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
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

export default function VisitorLogsModal({ visible, onClose, userData }) {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filters = [
    { id: 'all', name: 'All Activities', icon: 'list', color: '#667eea' },
    { id: 'check_in', name: 'Check In', icon: 'log-in', color: '#28a745' },
    { id: 'check_out', name: 'Check Out', icon: 'log-out', color: '#dc3545' },
    { id: 'today', name: 'Today', icon: 'today', color: '#ffc107' },
  ];

  useEffect(() => {
    if (visible) {
      loadLogs();
    }
  }, [visible]);

  useEffect(() => {
    applyFilters();
  }, [logs, searchQuery, selectedFilter]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const result = await visitorsService.getVisitorLogs();
      
      if (result.success) {
        setLogs(result.data);
      } else {
        Alert.alert('Error', result.error || 'Failed to load visitor logs');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadLogs();
    setRefreshing(false);
  };

  const applyFilters = () => {
    let filtered = [...logs];

    // Apply activity type filter
    if (selectedFilter === 'check_in') {
      filtered = filtered.filter(log => log.activityType === 'check_in');
    } else if (selectedFilter === 'check_out') {
      filtered = filtered.filter(log => log.activityType === 'check_out');
    } else if (selectedFilter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filtered = filtered.filter(log => {
        if (!log.timestamp) return false;
        const logDate = new Date(log.timestamp.seconds * 1000);
        return logDate >= today;
      });
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(log =>
        log.data?.name?.toLowerCase().includes(query) ||
        log.data?.phone?.includes(query) ||
        log.data?.flatNumber?.toLowerCase().includes(query) ||
        log.data?.tower?.toLowerCase().includes(query) ||
        log.data?.purpose?.toLowerCase().includes(query)
      );
    }

    setFilteredLogs(filtered);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleString();
  };

  const getActivityIcon = (activityType) => {
    switch (activityType) {
      case 'check_in':
        return { name: 'log-in', color: '#28a745' };
      case 'check_out':
        return { name: 'log-out', color: '#dc3545' };
      default:
        return { name: 'document', color: '#6c757d' };
    }
  };

  const getActivityTitle = (activityType) => {
    switch (activityType) {
      case 'check_in':
        return 'Visitor Check In';
      case 'check_out':
        return 'Visitor Check Out';
      default:
        return 'Activity';
    }
  };

  const LogCard = ({ log }) => {
    const icon = getActivityIcon(log.activityType);
    const title = getActivityTitle(log.activityType);

    return (
      <View style={styles.logCard}>
        <View style={styles.logHeader}>
          <View style={[styles.activityIcon, { backgroundColor: icon.color }]}>
            <Ionicons name={icon.name} size={16} color="#fff" />
          </View>
          
          <View style={styles.logInfo}>
            <Text style={styles.activityTitle}>{title}</Text>
            <Text style={styles.activityTime}>{formatTime(log.timestamp)}</Text>
          </View>
        </View>

        {log.data && (
          <View style={styles.logDetails}>
            {log.data.name && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Visitor:</Text>
                <Text style={styles.detailValue}>{log.data.name}</Text>
              </View>
            )}

            {log.data.phone && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Phone:</Text>
                <Text style={styles.detailValue}>{log.data.phone}</Text>
              </View>
            )}

            {log.data.tower && log.data.flatNumber && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Destination:</Text>
                <Text style={styles.detailValue}>
                  {log.data.tower} - {log.data.flatNumber}
                </Text>
              </View>
            )}

            {log.data.purpose && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Purpose:</Text>
                <Text style={styles.detailValue}>{log.data.purpose}</Text>
              </View>
            )}

            {log.data.checkOutBy && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Checked out by:</Text>
                <Text style={styles.detailValue}>{log.data.checkOutBy}</Text>
              </View>
            )}

            {log.data.addedBy && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Added by:</Text>
                <Text style={styles.detailValue}>{log.data.addedBy}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  const FilterChip = ({ filter, isSelected, onPress }) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        isSelected && { backgroundColor: filter.color },
        !isSelected && { borderColor: filter.color }
      ]}
      onPress={onPress}
    >
      <Ionicons 
        name={filter.icon} 
        size={16} 
        color={isSelected ? '#fff' : filter.color} 
      />
      <Text style={[
        styles.filterChipText,
        { color: isSelected ? '#fff' : filter.color }
      ]}>
        {filter.name}
      </Text>
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="receipt-outline" size={64} color="#c5cee0" />
      <Text style={styles.emptyStateTitle}>
        {searchQuery ? 'No activity logs found' : 'No visitor activity'}
      </Text>
      <Text style={styles.emptyStateSubtitle}>
        {searchQuery 
          ? 'Try adjusting your search terms or filters' 
          : 'Visitor activity logs will appear here'
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
          <Text style={styles.title}>Visitor Activity Logs</Text>
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
              placeholder="Search activity logs..."
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
            {filteredLogs.length} activit{filteredLogs.length !== 1 ? 'ies' : 'y'} found
          </Text>
        </View>

        {/* Logs List */}
        <FlatList
          data={filteredLogs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <LogCard log={item} />}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
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
    borderWidth: 2,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
  },
  filterChipText: {
    fontSize: 14,
    marginLeft: 6,
    fontWeight: '500',
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
  logCard: {
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
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#8f9bb3',
  },
  logDetails: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
    width: 100,
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: '#2c3e50',
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

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
import { visitorsService } from '../../../../services/visitorsService';
import AddVisitorModal from '../../../visitors/AddVisitorModal';
import VisitorDetailsModal from '../../../visitors/VisitorDetailsModal';
import VisitorLogsModal from '../../../visitors/VisitorLogsModal';
import VisitorsHistoryModal from '../../../visitors/VisitorsHistoryModal';

const { width: screenWidth } = Dimensions.get('window');

export default function VisitorsTab({ userData }) {
  const [visitorStats, setVisitorStats] = useState({
    totalVisitors: 0,
    currentlyCheckedIn: 0,
    todayVisitors: 0,
    thisWeekVisitors: 0
  });
  const [checkedInVisitors, setCheckedInVisitors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredVisitors, setFilteredVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal states
  const [addVisitorModalVisible, setAddVisitorModalVisible] = useState(false);
  const [visitorDetailsModalVisible, setVisitorDetailsModalVisible] = useState(false);
  const [visitorsHistoryModalVisible, setVisitorsHistoryModalVisible] = useState(false);
  const [visitorLogsModalVisible, setVisitorLogsModalVisible] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState(null);

  useEffect(() => {
    loadVisitorData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredVisitors(checkedInVisitors);
    } else {
      const q = searchQuery.trim().toLowerCase();
      setFilteredVisitors(
        checkedInVisitors.filter(visitor =>
          (visitor.name && visitor.name.toLowerCase().includes(q)) ||
          (visitor.phone && visitor.phone.toLowerCase().includes(q)) ||
          (visitor.flatNumber && visitor.flatNumber.toLowerCase().includes(q)) ||
          (visitor.tower && visitor.tower.toLowerCase().includes(q)) ||
          (visitor.purpose && visitor.purpose.toLowerCase().includes(q)) ||
          (visitor.ownerName && visitor.ownerName.toLowerCase().includes(q))
        )
      );
    }
  }, [searchQuery, checkedInVisitors]);


  const loadVisitorData = async () => {
    try {
      setLoading(true);
      const [statsResult, checkedInResult] = await Promise.all([
        visitorsService.getVisitorStats(),
        visitorsService.getCheckedInVisitors()
      ]);

      if (statsResult.success) {
        setVisitorStats(statsResult.data);
      }

      if (checkedInResult.success) {
        setCheckedInVisitors(checkedInResult.data);
        setFilteredVisitors(checkedInResult.data);
      }
    } catch (_error) {
      console.error('Error loading visitor data:', _error);
      Alert.alert('Error', 'Failed to load visitor data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadVisitorData();
    setRefreshing(false);
  };

  const handleVisitorAction = (action, visitor = null) => {
    switch (action) {
      case 'add':
        setAddVisitorModalVisible(true);
        break;
      case 'details':
        setSelectedVisitor(visitor);
        setVisitorDetailsModalVisible(true);
        break;
      case 'history':
        setVisitorsHistoryModalVisible(true);
        break;
      case 'logs':
        setVisitorLogsModalVisible(true);
        break;
      case 'checkout':
        handleCheckOut(visitor);
        break;
      default:
        break;
    }
  };

  const handleCheckOut = (visitor) => {
    Alert.alert(
      'Check Out Visitor',
      `Are you sure you want to check out ${visitor.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Check Out', 
          onPress: async () => {
            try {
              const result = await visitorsService.checkOutVisitor(visitor.id, {
                checkOutBy: userData?.name || 'Admin'
              });

              if (result.success) {
                Alert.alert('Success', 'Visitor checked out successfully');
                loadVisitorData();
              } else {
                Alert.alert('Error', result.error || 'Failed to check out visitor');
              }
            } catch (_error) {
              Alert.alert('Error', 'An unexpected error occurred');
            }
          }
        }
      ]
    );
  };

  const StatCard = ({ title, value, icon, color, onPress }) => {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: color }]}>
            <Ionicons name={icon} size={24} color="#fff" />
          </View>
          <View style={styles.statInfo}>
            <Text style={styles.statValue}>{loading ? '...' : value}</Text>
            <Text style={styles.statTitle}>{title}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const VisitorCard = ({ visitor }) => (
    <TouchableOpacity
      style={styles.visitorCard}
      onPress={() => handleVisitorAction('details', visitor)}
      activeOpacity={0.8}
    >
      <View style={styles.visitorCardHeader}>
        <View style={styles.visitorInfo}>
          <Text style={styles.visitorName}>{visitor.name}</Text>
          <Text style={styles.visitorDetails}>
            {visitor.tower} - {visitor.flatNumber} | {visitor.ownerName}
          </Text>
          <Text style={styles.visitorPurpose}>{visitor.purpose}</Text>
        </View>
        <View style={styles.visitorActions}>
          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={() => handleVisitorAction('checkout', visitor)}
          >
            <Ionicons name="log-out" size={16} color="#fff" />
            <Text style={styles.checkoutButtonText}>Check Out</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.visitorCardFooter}>
        <View style={styles.timeInfo}>
          <Ionicons name="time" size={14} color="#6c757d" />
          <Text style={styles.timeText}>
            Check-in: {visitor.checkInTime ? new Date(visitor.checkInTime.seconds * 1000).toLocaleTimeString() : 'N/A'}
          </Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>Checked In</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const QuickActionButton = ({ title, icon, color, onPress }) => (
    <TouchableOpacity
      style={[styles.quickActionButton, { backgroundColor: color }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons name={icon} size={24} color="#fff" />
      <Text style={styles.quickActionText}>{title}</Text>
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
            title="Total Visitors"
            value={visitorStats.totalVisitors}
            icon="people"
            color="#667eea"
            onPress={() => handleVisitorAction('history')}
          />
          
          <StatCard
            title="Currently Checked In"
            value={visitorStats.currentlyCheckedIn}
            icon="person-add"
            color="#28a745"
          />
          
          <StatCard
            title="Today's Visitors"
            value={visitorStats.todayVisitors}
            icon="today"
            color="#ffc107"
          />
          
          <StatCard
            title="This Week Visitors" 
            value={visitorStats.thisWeekVisitors}
            icon="calendar"
            color="#dc3545"
          />
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <View style={styles.quickActionsGrid}>
          <QuickActionButton
            title="Add Visitor"
            icon="person-add"
            color="#667eea"
            onPress={() => handleVisitorAction('add')}
          />
          
          <QuickActionButton
            title="View History"
            icon="time"
            color="#28a745"
            onPress={() => handleVisitorAction('history')}
          />
          
          <QuickActionButton
            title="Visitor Logs"
            icon="document-text"
            color="#ffc107"
            onPress={() => handleVisitorAction('logs')}
          />
        </View>
      </View>
      </>
      )}



      {/* List Header */}
      <View style={styles.listHeaderContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Currently Checked In</Text>
          <Text style={styles.visitorCount}>
            {filteredVisitors.length} visitor{filteredVisitors.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>
    </>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="people-outline" size={64} color="#c5cee0" />
      <Text style={styles.emptyStateTitle}>
        {searchQuery ? 'No visitors found' : 'No visitors checked in'}
      </Text>
      <Text style={styles.emptyStateSubtitle}>
        {searchQuery 
          ? 'Try adjusting your search terms' 
          : 'Add a new visitor to get started'
        }
      </Text>
      {!searchQuery && (
        <TouchableOpacity
          style={styles.addVisitorButton}
          onPress={() => handleVisitorAction('add')}
        >
          <Text style={styles.addVisitorButtonText}>Add Visitor</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar moved OUTSIDE FlatList */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#6c757d" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search check-in visitors by name, phone, flat..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
            autoCapitalize="none"
            clearButtonMode="while-editing"
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#6c757d" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <FlatList
        data={filteredVisitors}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <VisitorCard visitor={item} />}
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
      <AddVisitorModal
        visible={addVisitorModalVisible}
        onClose={() => setAddVisitorModalVisible(false)}
        onSuccess={() => {
          setAddVisitorModalVisible(false);
          loadVisitorData();
        }}
        userData={userData}
      />

      <VisitorDetailsModal
        visible={visitorDetailsModalVisible}
        onClose={() => setVisitorDetailsModalVisible(false)}
        visitor={selectedVisitor}
        onCheckOut={(visitor) => {
          setVisitorDetailsModalVisible(false);
          handleCheckOut(visitor);
        }}
      />

      <VisitorsHistoryModal
              visible={visitorsHistoryModalVisible}
              onClose={() => setVisitorsHistoryModalVisible(false)}
              userData={userData}
              onCheckOut={(visitor) => {
                console.log('VisitorsTab handleCheckOut called from VisitorsHistoryModal:', visitor);
                handleCheckOut(visitor);
              }} // Pass handleCheckOut to history modal
            />

      <VisitorLogsModal
        visible={visitorLogsModalVisible}
        onClose={() => setVisitorLogsModalVisible(false)}
        userData={userData}
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
    paddingBottom: 100, // Add padding to prevent content from being hidden behind bottom bar
  },
  header: {
    padding: 20,
    paddingTop: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2e3a59',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#8f9bb3',
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
    borderRadius: 16,
    padding: 20,
    width: (screenWidth - 60) / 2,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e3a59',
    marginBottom: 4,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e3a59',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0.32,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickActionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
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
  listHeaderContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  visitorCount: {
    fontSize: 14,
    color: '#8f9bb3',
    fontWeight: '500',
  },
  visitorCard: {
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
  visitorCardHeader: {
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
    color: '#2e3a59',
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
  visitorActions: {
    alignItems: 'flex-end',
  },
  checkoutButton: {
    backgroundColor: '#dc3545',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  visitorCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f3f7',
    paddingTop: 12,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: '#6c757d',
    marginLeft: 4,
  },
  statusBadge: {
    backgroundColor: '#d4edda',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#155724',
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
  addVisitorButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addVisitorButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
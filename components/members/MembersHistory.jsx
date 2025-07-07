import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { membersService } from '../../services/membersService';

const HistoryDetailsModal = ({ historyItem, visible, onClose }) => {
  if (!historyItem) return null;

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      return new Date(timestamp.seconds * 1000).toLocaleString();
    } catch {
      return 'N/A';
    }
  };

  const formatFieldName = (field) => {
    return field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  const renderFieldChanges = () => {
    if (!historyItem.previousData || !historyItem.newData) return null;

    const changes = [];
    const previousData = historyItem.previousData;
    const newData = historyItem.newData;

    Object.keys(newData).forEach(key => {
      if (key === 'updatedAt' || key === 'createdAt') return; // Skip timestamp fields
      
      const oldValue = previousData[key];
      const newValue = newData[key];
      
      if (oldValue !== newValue) {
        changes.push({
          field: key,
          oldValue: oldValue || 'Not set',
          newValue: newValue || 'Not set'
        });
      }
    });

    return changes.map((change, index) => (
      <View key={index} style={styles.changeItem}>
        <Text style={styles.fieldName}>{formatFieldName(change.field)}</Text>
        <View style={styles.valueContainer}>
          <View style={styles.valueBox}>
            <Text style={styles.valueLabel}>Previous</Text>
            <Text style={styles.oldValue}>{change.oldValue}</Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color="#007bff" style={styles.arrowIcon} />
          <View style={styles.valueBox}>
            <Text style={styles.valueLabel}>Updated</Text>
            <Text style={styles.newValue}>{change.newValue}</Text>
          </View>
        </View>
      </View>
    ));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Edit History</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.historyHeader}>
            <View style={styles.historyInfo}>
              <Text style={styles.memberName}>
                {historyItem.previousData?.name || 'Unknown Member'}
              </Text>
              <Text style={styles.editDate}>
                Edited on {formatDate(historyItem.editedAt)}
              </Text>
              <View style={styles.actionBadge}>
                <Text style={styles.actionText}>
                  {historyItem.action?.toUpperCase() || 'UPDATE'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.changesContainer}>
            <Text style={styles.sectionTitle}>Changes Made</Text>
            {renderFieldChanges()}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const HistoryCard = ({ historyItem, onPress }) => {
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      return new Date(timestamp.seconds * 1000).toLocaleString();
    } catch {
      return 'N/A';
    }
  };

  const getChangesCount = () => {
    if (!historyItem.previousData || !historyItem.newData) return 0;
    
    const previousData = historyItem.previousData;
    const newData = historyItem.newData;
    let count = 0;

    Object.keys(newData).forEach(key => {
      if (key === 'updatedAt' || key === 'createdAt') return;
      if (previousData[key] !== newData[key]) count++;
    });

    return count;
  };

  return (
    <TouchableOpacity style={styles.historyCard} onPress={() => onPress(historyItem)}>
      <View style={styles.cardHeader}>
        <View style={styles.memberInfo}>
          <View style={styles.avatarSmall}>
            <Text style={styles.avatarTextSmall}>
              {historyItem.previousData?.name?.charAt(0)?.toUpperCase() || 'M'}
            </Text>
          </View>
          <View style={styles.historyCardInfo}>
            <Text style={styles.cardName}>
              {historyItem.previousData?.name || 'Unknown Member'}
            </Text>
            <Text style={styles.cardLocation}>
              Tower {historyItem.previousData?.tower}, Flat {historyItem.previousData?.flatNumber}
            </Text>
            <Text style={styles.cardDate}>{formatDate(historyItem.editedAt)}</Text>
          </View>
        </View>
        <View style={styles.cardRight}>
          <View style={styles.changesCount}>
            <Text style={styles.changesText}>{getChangesCount()} changes</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </View>
      </View>
      <View style={styles.cardFooter}>
        <View style={styles.actionBadge}>
          <Text style={styles.actionText}>
            {historyItem.action?.toUpperCase() || 'UPDATE'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const MembersHistory = ({ onClose }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [detailsVisible, setDetailsVisible] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const result = await membersService.getMemberHistory();
      if (result.success) {
        setHistory(result.data);
      } else {
        Alert.alert('Error', result.error || 'Failed to load history');
      }
    } catch (_error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryPress = (historyItem) => {
    setSelectedHistory(historyItem);
    setDetailsVisible(true);
  };

  const handleRefresh = () => {
    loadHistory();
  };

  const renderHistory = ({ item }) => (
    <HistoryCard historyItem={item} onPress={handleHistoryPress} />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="time-outline" size={64} color="#ccc" />
      <Text style={styles.emptyStateTitle}>No edit history</Text>
      <Text style={styles.emptyStateText}>
        Member edits will appear here once changes are made
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Members History ({history.length})</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Ionicons name="refresh" size={20} color="#007bff" />
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Loading history...</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          renderItem={renderHistory}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}

      <HistoryDetailsModal
        historyItem={selectedHistory}
        visible={detailsVisible}
        onClose={() => {
          setDetailsVisible(false);
          setSelectedHistory(null);
        }}
      />
    </View>
  );
};

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
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
  },
  closeButton: {
    padding: 5,
  },
  actionsContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  refreshText: {
    color: '#007bff',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6c757d',
  },
  listContainer: {
    padding: 15,
    paddingBottom: 80,
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6c757d',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarTextSmall: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  historyCardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  cardLocation: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 2,
  },
  cardDate: {
    fontSize: 12,
    color: '#adb5bd',
  },
  cardRight: {
    alignItems: 'center',
    gap: 8,
  },
  changesCount: {
    backgroundColor: '#fff3cd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  changesText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#856404',
  },
  cardFooter: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f3f4',
  },
  actionBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  actionText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1976d2',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6c757d',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#adb5bd',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    backgroundColor: '#fff',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  historyHeader: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historyInfo: {
    alignItems: 'center',
  },
  memberName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  editDate: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 10,
  },
  changesContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 15,
  },
  changeItem: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  fieldName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 10,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  valueBox: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  valueLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6c757d',
    marginBottom: 4,
  },
  oldValue: {
    fontSize: 14,
    color: '#dc3545',
    fontWeight: '500',
  },
  newValue: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: '500',
  },
  arrowIcon: {
    marginHorizontal: 10,
  },
});

export default MembersHistory;

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';

const STATUS_TABS = ['ALL', 'PENDING', 'APPROVED', 'RETURNED', 'REJECTED'];

const STATUS_COLORS = {
  PENDING: '#FF9800',
  APPROVED: '#4CAF50',
  RETURNED: '#2196F3',
  REJECTED: '#F44336',
  OVERDUE: '#9C27B0',
};

export default function AdminBorrowingRecordsScreen() {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState('ALL');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      const response = await api.get('/borrow/all');
      const data = response.data?.data ?? response.data ?? [];
      setRecords(Array.isArray(data) ? data : data.records ?? []);
    } catch (error) {
      console.error('Error loading borrow records:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRecords();
    setRefreshing(false);
  };

  const handleApprove = (record) => {
    Alert.alert('Approve Borrow', `Approve borrow request for "${record.book?.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Approve',
        onPress: async () => {
          try {
            await api.put(`/borrow/${record.id}/approve`);
            await loadRecords();
          } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to approve.');
          }
        },
      },
    ]);
  };

  const handleReturn = (record) => {
    Alert.alert('Mark as Returned', `Mark "${record.book?.title}" as returned?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: async () => {
          try {
            await api.put(`/borrow/${record.id}/return`);
            await loadRecords();
          } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to mark as returned.');
          }
        },
      },
    ]);
  };

  const handleReject = (record) => {
    Alert.alert('Reject Request', `Reject borrow request for "${record.book?.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.put(`/borrow/${record.id}/reject`);
            await loadRecords();
          } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to reject.');
          }
        },
      },
    ]);
  };

  const filteredRecords =
    activeTab === 'ALL' ? records : records.filter((r) => r.status === activeTab);

  const renderRecord = (record) => {
    const statusColor = STATUS_COLORS[record.status] ?? colors.textSecondary;
    const bookCoverUrl = record.book?.coverUrl;
    
    return (
      <View key={record.id} style={[styles.recordCard, { backgroundColor: colors.card }]}>
        <View style={styles.recordRow}>
          {/* Book Cover */}
          <View style={[styles.recordCover, { backgroundColor: colors.surface }]}>
            {bookCoverUrl ? (
              <Image
                source={{ uri: bookCoverUrl }}
                style={styles.recordCoverImage}
                resizeMode="cover"
              />
            ) : (
              <Ionicons name="book" size={28} color={colors.textSecondary} />
            )}
          </View>

          {/* Book Info */}
          <View style={styles.recordInfo}>
            <View style={styles.recordTitleRow}>
              <Text style={[styles.bookTitle, { color: colors.text }]} numberOfLines={2}>
                {record.book?.title ?? 'Unknown Book'}
              </Text>
            </View>
            <Text style={[styles.bookAuthor, { color: colors.textSecondary }]} numberOfLines={1}>
              {record.book?.author ?? ''}
            </Text>

            <View style={styles.recordMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="person-outline" size={12} color={colors.textSecondary} />
                <Text style={[styles.metaText, { color: colors.textSecondary }]} numberOfLines={1}>
                  {record.user?.fullName ?? record.user?.email ?? 'Unknown'}
                </Text>
              </View>
              {record.borrowDate && (
                <View style={styles.metaItem}>
                  <Ionicons name="calendar-outline" size={12} color={colors.textSecondary} />
                  <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                    {new Date(record.borrowDate).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Status Badge */}
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{record.status}</Text>
          </View>
        </View>

        {/* Action buttons based on status */}
        {record.status === 'PENDING' && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
              onPress={() => handleApprove(record)}
            >
              <Ionicons name="checkmark" size={16} color="#FFF" />
              <Text style={styles.actionButtonText}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#F44336' }]}
              onPress={() => handleReject(record)}
            >
              <Ionicons name="close" size={16} color="#FFF" />
              <Text style={styles.actionButtonText}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}
        {record.status === 'APPROVED' && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
              onPress={() => handleReturn(record)}
            >
              <Ionicons name="return-down-back" size={16} color="#FFF" />
              <Text style={styles.actionButtonText}>Mark Returned</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
          <Ionicons name="school" size={24} color="#FFFFFF" />
        </View>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Records</Text>
        <View style={{ width: 48 }} />
      </View>

      {/* Status Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsScroll}
        contentContainerStyle={styles.tabsContent}
      >
        {STATUS_TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab
                ? { backgroundColor: colors.primary }
                : { backgroundColor: colors.surface },
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === tab ? '#FFF' : colors.textSecondary },
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Records List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
        ) : filteredRecords.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No records found</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {filteredRecords.map(renderRecord)}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 8,
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  tabsScroll: {
    marginBottom: 12,
  },
  tabsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  recordCard: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  recordCover: {
    width: 60,
    height: 84,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginRight: 12,
  },
  recordCoverImage: {
    width: '100%',
    height: '100%',
  },
  recordInfo: {
    flex: 1,
    marginRight: 8,
  },
  recordHeader: {
    marginBottom: 10,
  },
  recordTitleRow: {
    marginBottom: 4,
  },
  bookTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  bookAuthor: {
    fontSize: 13,
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginBottom: 10,
  },
  recordMeta: {
    gap: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  loader: { marginVertical: 40 },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

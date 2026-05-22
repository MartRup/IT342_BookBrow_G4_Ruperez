import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { borrowService } from '../../services/borrowService';

export default function MyBooksScreen() {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState('currently');
  const [currentBooks, setCurrentBooks] = useState([]);
  const [historyBooks, setHistoryBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBorrowRecords();
  }, []);

  const loadBorrowRecords = async () => {
    try {
      const activeResponse = await borrowService.getActiveBorrows();
      const historyResponse = await borrowService.getBorrowHistory();

      const activeRecords = activeResponse.data?.borrowRecords || [];
      const allRecords = historyResponse.data?.borrowRecords || [];

      setCurrentBooks(
        activeRecords.filter(
          (record) => record.status === 'ACTIVE' || record.borrowStatus === 'APPROVED'
        )
      );
      setHistoryBooks(
        allRecords.filter(
          (record) => record.status !== 'ACTIVE' && record.borrowStatus !== 'APPROVED'
        )
      );
    } catch (error) {
      console.error('Error loading borrow records:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBorrowRecords();
    setRefreshing(false);
  };

  const renderEmptyState = (type) => (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIcon, { borderColor: colors.border }]}>
        <Ionicons name="book-outline" size={64} color={colors.textSecondary} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        {type === 'currently' ? 'No books borrowed' : 'No books in history'}
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Start exploring the library
      </Text>
      <TouchableOpacity style={[styles.browseButton, { backgroundColor: colors.primary }]}>
        <Text style={styles.browseButtonText}>Browse Books</Text>
      </TouchableOpacity>
    </View>
  );

  const renderBookItem = (record) => (
    <View key={record.id} style={[styles.bookItem, { backgroundColor: colors.surface }]}>
      <View style={[styles.bookItemCover, { backgroundColor: colors.border }]}>
        {record.bookCoverUrl ? (
          <Image source={{ uri: record.bookCoverUrl }} style={styles.bookItemCoverImage} />
        ) : (
          <Ionicons name="book" size={32} color={colors.textSecondary} />
        )}
      </View>
      <View style={styles.bookItemInfo}>
        <Text style={[styles.bookItemTitle, { color: colors.text }]} numberOfLines={2}>
          {record.bookTitle || 'Unknown Title'}
        </Text>
        <Text style={[styles.bookItemAuthor, { color: colors.textSecondary }]} numberOfLines={1}>
          {record.bookAuthor || 'Unknown Author'}
        </Text>
        <View style={styles.bookItemMeta}>
          <Text style={[styles.bookItemDate, { color: colors.textSecondary }]}>
            Due: {new Date(record.dueDate).toLocaleDateString()}
          </Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  record.status === 'ACTIVE' || record.borrowStatus === 'APPROVED'
                    ? '#4CAF50'
                    : record.status === 'PENDING'
                    ? '#FF9800'
                    : '#F44336',
              },
            ]}
          >
            <Text style={styles.statusText}>{record.status}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
          <Ionicons name="school" size={24} color="#FFFFFF" />
        </View>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Books</Text>
        <TouchableOpacity style={[styles.profileButton, { backgroundColor: colors.primary }]}>
          <Ionicons name="person" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'currently' && { backgroundColor: colors.background },
          ]}
          onPress={() => setActiveTab('currently')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'currently' ? colors.text : colors.textSecondary },
            ]}
          >
            Currently ({currentBooks.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'history' && { backgroundColor: colors.background },
          ]}
          onPress={() => setActiveTab('history')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'history' ? colors.text : colors.textSecondary },
            ]}
          >
            History ({historyBooks.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
        ) : activeTab === 'currently' ? (
          currentBooks.length === 0 ? (
            renderEmptyState('currently')
          ) : (
            <View style={styles.booksList}>
              {currentBooks.map(renderBookItem)}
            </View>
          )
        ) : historyBooks.length === 0 ? (
          renderEmptyState('history')
        ) : (
          <View style={styles.booksList}>
            {historyBooks.map(renderBookItem)}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 15,
    marginBottom: 28,
  },
  browseButton: {
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  browseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  booksList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  bookItem: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  bookItemCover: {
    width: 70,
    height: 95,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    overflow: 'hidden',
  },
  bookItemCoverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bookItemInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  bookItemTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 5,
  },
  bookItemAuthor: {
    fontSize: 13,
    marginBottom: 10,
  },
  bookItemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookItemDate: {
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  loader: {
    marginVertical: 40,
  },
});

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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function AdminDashboardScreen({ navigation }) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBooks: 0,
    activeLoans: 0,
    overDue: 0,
  });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchingCovers, setFetchingCovers] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Fetch stats
      const statsRes = await api.get('/admin/stats');
      const statsData = statsRes.data?.data || statsRes.data || {};
      setStats({
        totalUsers: statsData.totalUsers || 0,
        totalBooks: statsData.totalBooks || 0,
        activeLoans: statsData.activeLoans || 0,
        overDue: statsData.overDue || 0,
      });

      // Fetch logs
      const logsRes = await api.get('/admin/logs');
      const logsData = logsRes.data?.data || logsRes.data || [];
      setLogs(logsData.slice(0, 10)); // Show only recent 10 logs
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleFetchCovers = () => {
    Alert.alert(
      'Fetch Book Covers',
      'Fetch cover images from Google Books for all books without covers?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Fetch',
          onPress: async () => {
            setFetchingCovers(true);
            try {
              const response = await api.post('/books/fetch-all-covers');
              Alert.alert('Success', response.data?.data?.message || 'Covers updated.');
              await loadDashboardData();
            } catch (error) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to fetch covers.');
            } finally {
              setFetchingCovers(false);
            }
          },
        },
      ]
    );
  };

  const StatCard = ({ icon, label, value, color }) => (
    <View style={[styles.statCard, { backgroundColor: colors.card }]}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
            <Ionicons name="school" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Admin Dashboard</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              Welcome back, {user?.fullName || 'Admin'}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.profileButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('AdminMenu')}
          >
            <Ionicons name="person" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            icon="people"
            label="Total Users"
            value={stats.totalUsers}
            color="#4CAF50"
          />
          <StatCard
            icon="book"
            label="Total Books"
            value={stats.totalBooks}
            color="#2196F3"
          />
          <StatCard
            icon="library"
            label="Active Loans"
            value={stats.activeLoans}
            color="#FF9800"
          />
          <StatCard
            icon="alert-circle"
            label="Overdue"
            value={stats.overDue}
            color="#F44336"
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: colors.card }]}
              onPress={() => navigation.navigate('AdminBooks')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#2196F3' + '20' }]}>
                <Ionicons name="book" size={24} color="#2196F3" />
              </View>
              <Text style={[styles.actionLabel, { color: colors.text }]}>Manage Books</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: colors.card }]}
              onPress={() => navigation.navigate('AdminRecords')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#4CAF50' + '20' }]}>
                <Ionicons name="people" size={24} color="#4CAF50" />
              </View>
              <Text style={[styles.actionLabel, { color: colors.text }]}>Manage Users</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: colors.card }]}
              onPress={() => navigation.navigate('AdminRecords')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#FF9800' + '20' }]}>
                <Ionicons name="list" size={24} color="#FF9800" />
              </View>
              <Text style={[styles.actionLabel, { color: colors.text }]}>Borrow Records</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: colors.card }]}
              onPress={() => navigation.navigate('AdminMenu')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#9C27B0' + '20' }]}>
                <Ionicons name="settings" size={24} color="#9C27B0" />
              </View>
              <Text style={[styles.actionLabel, { color: colors.text }]}>Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: colors.card }]}
              onPress={handleFetchCovers}
              disabled={fetchingCovers}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#00BCD4' + '20' }]}>
                {fetchingCovers ? (
                  <ActivityIndicator size="small" color="#00BCD4" />
                ) : (
                  <Ionicons name="cloud-download" size={24} color="#00BCD4" />
                )}
              </View>
              <Text style={[styles.actionLabel, { color: colors.text }]}>Fetch Covers</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
          <View style={[styles.logsContainer, { backgroundColor: colors.card }]}>
            {logs.length === 0 ? (
              <View style={styles.emptyLogs}>
                <Ionicons name="document-text-outline" size={48} color={colors.textSecondary} />
                <Text style={[styles.emptyLogsText, { color: colors.textSecondary }]}>
                  No recent activity
                </Text>
              </View>
            ) : (
              logs.map((log, index) => (
                <View
                  key={log.id || index}
                  style={[
                    styles.logItem,
                    index !== logs.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                  ]}
                >
                  <View style={styles.logContent}>
                    <Text style={[styles.logUser, { color: colors.text }]}>
                      {log.performedBy || 'System'}
                    </Text>
                    <Text style={[styles.logDescription, { color: colors.textSecondary }]}>
                      {log.description || 'System action performed'}
                    </Text>
                  </View>
                  <Text style={[styles.logTime, { color: colors.textSecondary }]}>
                    {log.timeAgo || 'Just now'}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
  headerTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    marginTop: 8,
  },
  statCard: {
    width: '47%',
    marginHorizontal: '1.5%',
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '47%',
    marginHorizontal: '1.5%',
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  logsContainer: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyLogs: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyLogsText: {
    marginTop: 12,
    fontSize: 14,
  },
  logItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  logContent: {
    flex: 1,
    marginRight: 12,
  },
  logUser: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  logDescription: {
    fontSize: 13,
  },
  logTime: {
    fontSize: 11,
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';

export default function AdminMenuScreen() {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const { user, logout, updateUser } = useAuth();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editMode, setEditMode] = useState('personal');

  const [firstName, setFirstName] = useState(user?.fullName?.split(' ')[0] || '');
  const [lastName, setLastName] = useState(user?.fullName?.split(' ').slice(1).join(' ') || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const handleSavePersonalInfo = async () => {
    try {
      const fullName = `${firstName} ${lastName}`.trim();
      await userService.updateProfile({ fullName, email });
      await updateUser({ fullName, email });
      Alert.alert('Success', 'Profile updated successfully');
      setShowEditProfile(false);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    try {
      await userService.changePassword(currentPassword, newPassword);
      Alert.alert('Success', 'Password changed successfully');
      setShowEditProfile(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to change password');
    }
  };

  const getInitials = () => {
    if (!user?.fullName) return 'A';
    return user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const roleLabel = user?.role === 'ADMIN' ? 'Admin' : user?.role === 'LIBRARIAN' ? 'Librarian' : user?.role ?? 'Staff';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
            <Ionicons name="school" size={24} color="#FFFFFF" />
          </View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>More</Text>
          <View style={{ width: 48 }} />
        </View>

        {/* Profile */}
        <View style={styles.profileSection}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{getInitials()}</Text>
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>{user?.fullName || 'Staff'}</Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user?.email}</Text>
          <View style={[styles.roleBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.roleText}>{roleLabel}</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: colors.surface }]}
            onPress={() => setShowEditProfile(true)}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="person-outline" size={22} color={colors.primary} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>Edit Profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={[styles.menuItem, { backgroundColor: colors.surface }]}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="moon-outline" size={22} color={colors.primary} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>Dark Mode</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.surface }]}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="help-circle-outline" size={22} color={colors.primary} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>Help & Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.primary }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={22} color="#FFFFFF" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditProfile}
        animationType="slide"
        transparent
        onRequestClose={() => setShowEditProfile(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowEditProfile(false)}>
                <Ionicons name="arrow-back" size={24} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Profile</Text>
              <View style={{ width: 24 }} />
            </View>

            <View style={styles.modalTabs}>
              {['personal', 'password'].map((mode) => (
                <TouchableOpacity
                  key={mode}
                  style={[styles.modalTab, editMode === mode && { backgroundColor: colors.surface }]}
                  onPress={() => setEditMode(mode)}
                >
                  <Text style={[styles.modalTabText, { color: editMode === mode ? colors.text : colors.textSecondary }]}>
                    {mode === 'personal' ? 'Personal Info' : 'Change Password'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <ScrollView style={styles.modalBody}>
              {editMode === 'personal' ? (
                <>
                  {[
                    { label: 'First Name', value: firstName, setter: setFirstName, placeholder: 'First Name' },
                    { label: 'Last Name', value: lastName, setter: setLastName, placeholder: 'Last Name' },
                    { label: 'Email', value: email, setter: setEmail, placeholder: 'Email', keyboard: 'email-address' },
                  ].map(({ label, value, setter, placeholder, keyboard }) => (
                    <View key={label}>
                      <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{label}</Text>
                      <TextInput
                        style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                        value={value}
                        onChangeText={setter}
                        placeholder={placeholder}
                        placeholderTextColor={colors.textSecondary}
                        keyboardType={keyboard ?? 'default'}
                        autoCapitalize={keyboard === 'email-address' ? 'none' : 'words'}
                      />
                    </View>
                  ))}
                  <View style={styles.modalActions}>
                    <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#4CAF50' }]} onPress={handleSavePersonalInfo}>
                      <Text style={styles.modalButtonText}>Save Changes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.modalButton, { backgroundColor: colors.error }]} onPress={() => setShowEditProfile(false)}>
                      <Text style={styles.modalButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  {[
                    { label: 'Current Password', value: currentPassword, setter: setCurrentPassword },
                    { label: 'New Password', value: newPassword, setter: setNewPassword },
                    { label: 'Confirm New Password', value: confirmPassword, setter: setConfirmPassword },
                  ].map(({ label, value, setter }) => (
                    <View key={label}>
                      <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{label}</Text>
                      <TextInput
                        style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                        value={value}
                        onChangeText={setter}
                        placeholder={label}
                        placeholderTextColor={colors.textSecondary}
                        secureTextEntry
                      />
                    </View>
                  ))}
                  <TouchableOpacity
                    style={[styles.updatePasswordButton, { backgroundColor: colors.text }]}
                    onPress={handleChangePassword}
                  >
                    <Text style={[styles.updatePasswordText, { color: colors.background }]}>Update Password</Text>
                  </TouchableOpacity>
                </>
              )}
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  headerTitle: { fontSize: 20, fontWeight: 'bold', letterSpacing: 0.5 },
  profileSection: { alignItems: 'center', paddingVertical: 28 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 4,
  },
  avatarText: { color: '#FFF', fontSize: 34, fontWeight: 'bold' },
  userName: { fontSize: 22, fontWeight: 'bold', marginBottom: 6 },
  userEmail: { fontSize: 14, marginBottom: 12 },
  roleBadge: { paddingHorizontal: 18, paddingVertical: 7, borderRadius: 18 },
  roleText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  menuSection: { paddingHorizontal: 20, marginBottom: 24 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    elevation: 2,
  },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center' },
  menuItemText: { fontSize: 15, marginLeft: 14, fontWeight: '600' },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 14,
    marginBottom: 32,
    elevation: 4,
    gap: 8,
  },
  logoutText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 20, maxHeight: '90%' },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  modalTabs: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 20, gap: 8 },
  modalTab: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  modalTabText: { fontSize: 13, fontWeight: '700' },
  modalBody: { paddingHorizontal: 20 },
  inputLabel: { fontSize: 13, marginBottom: 6, marginTop: 12, fontWeight: '600' },
  input: { borderRadius: 10, padding: 14, fontSize: 15 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 24 },
  modalButton: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  modalButtonText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  updatePasswordButton: { paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 24 },
  updatePasswordText: { fontSize: 15, fontWeight: '700' },
});

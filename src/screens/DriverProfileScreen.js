import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Color from '../constants/Color';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DriverProfileScreen = ({ navigation, route }) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);

  const totaldeliveries = route?.params?.totaldeliveries;

  // ================= FETCH DRIVER (lightweight query, no blocking UI) =================
  const fetchDriverProfile = useCallback(async () => {
    try {
      const driverId = await AsyncStorage.getItem('driver_id');
      if (!driverId) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('drivers')
        .select('id, driver_name, email, phone_number')
        .eq('id', driverId)
        .single();

      if (error) {
        console.log('Driver fetch error:', error);
      } else {
        setDriver(data);
      }
    } catch (err) {
      console.log('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDriverProfile();
  }, [fetchDriverProfile]);

  // ================= INITIALS =================
  const getInitials = name => {
    if (!name) return 'DR';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  // ================= LOGOUT =================
  const handleConfirmLogout = async () => {
    try {
      await AsyncStorage.multiRemove([
        'token',
        'driver_id',
        'franchise_id',
        'driver_email',
      ]);

      await supabase.auth.signOut();
      setShowLogoutModal(false);

      navigation.reset({
        index: 0,
        routes: [{ name: 'AuthStack' }],
      });
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  // Show profile layout immediately; only driver details show loading state (no blank screen)
  return (
    <View style={styles.container}>
      {/* Header - always visible */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-back" size={26} color="#fff" />
        </TouchableOpacity>

        <View style={styles.avatarWrapper}>
          <View style={styles.avatar}>
            {loading ? (
              <ActivityIndicator size="small" color="#4AA3DF" />
            ) : (
              <Text style={styles.avatarText}>
                {getInitials(driver?.driver_name)}
              </Text>
            )}
          </View>
        </View>

        <Text style={styles.name}>
          {loading ? 'Loading...' : driver?.driver_name || 'Driver'}
        </Text>

        {/* <View style={styles.verified}>
          <Icon name="checkmark-circle" size={14} color="#22C55E" />
          <Text style={styles.verifiedText}> Verified Driver</Text>
        </View> */}
      </View>

      {/* Stats - use route params (no fetch needed, already available) */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#4AA3DF' }]}>
            <Icon name="cube-outline" size={20} color="#fff" />
          </View>
          <Text style={styles.statValue}>
            {totaldeliveries?.totalompleted ?? '-'}
          </Text>
          <Text style={styles.statLabel}>Total Deliveries</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#22C55E' }]}>
            <Icon name="trending-up" size={20} color="#fff" />
          </View>
          <Text style={styles.statValue}>
            {totaldeliveries?.todaycompleted ?? '-'}
          </Text>
          <Text style={styles.statLabel}>Today</Text>
        </View>
      </View>

      {/* Driver Info - show placeholders while loading */}
      <View style={styles.infoCard}>
        <View style={styles.infoHeader}>
          <Icon name="person-outline" size={18} color="#4AA3DF" />
          <Text style={styles.infoTitle}> Driver Information</Text>
          {loading && (
            <ActivityIndicator
              size="small"
              color="#4AA3DF"
              style={styles.infoLoader}
            />
          )}
        </View>

        <View style={styles.infoRow}>
          <Icon name="person-outline" size={18} color="#6B7280" />
          <View style={styles.infoText}>
            <Text style={styles.infoLabel}>Full Name</Text>
            <Text style={styles.infoValue}>
              {loading ? '...' : driver?.driver_name || '-'}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Icon name="mail-outline" size={18} color="#6B7280" />
          <View style={styles.infoText}>
            <Text style={styles.infoLabel}>Email Address</Text>
            <Text style={styles.infoValue}>
              {loading ? '...' : driver?.email || '-'}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Icon name="call-outline" size={18} color="#6B7280" />
          <View style={styles.infoText}>
            <Text style={styles.infoLabel}>Phone Number</Text>
            <Text style={styles.infoValue}>
              {loading ? '...' : driver?.phone_number || '-'}
            </Text>
          </View>
        </View>
      </View>

      {/* Terms & Privacy - side by side */}
      <View style={styles.legalRow}>
        <TouchableOpacity
          style={styles.legalBtn}
          onPress={() => navigation.navigate('TermsAndConditionsScreen')}
        >
          <Icon name="document-text-outline" size={18} color="#4AA3DF" />
          <Text style={styles.legalBtnText}>Terms & Conditions</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.legalBtn}
          onPress={() => navigation.navigate('PrivacyPolicyScreen')}
        >
          <Icon name="shield-checkmark-outline" size={18} color="#4AA3DF" />
          <Text style={styles.legalBtnText}>Privacy Policy</Text>
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={() => setShowLogoutModal(true)}
      >
        <Icon name="log-out-outline" size={18} color="#EF4444" />
        <Text style={styles.logoutText}> Logout</Text>
      </TouchableOpacity>

      <Text style={styles.version}>CoconutStock Driver App v1.0.0</Text>

      {/* LOGOUT MODAL */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Icon name="log-out-outline" size={42} color={Color.PRIMARY} />

            <Text style={styles.modalTitle}>Confirm Logout</Text>

            <Text style={styles.modalText}>
              Are you sure you want to logout from your account?
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={handleConfirmLogout}
              >
                <Text style={styles.confirmText}>Yes, Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default DriverProfileScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },

  header: {
    backgroundColor: '#4FA3E3',
    paddingTop: 45,
    paddingBottom: 90,
    alignItems: 'center',
  },

  backBtn: {
    position: 'absolute',
    left: 16,
    top: 60,
  },

  avatarWrapper: {
    marginTop: 10,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#4AA3DF',
  },

  cameraIcon: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    padding: 6,
    borderRadius: 20,
  },

  name: {
    marginTop: 10,
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },

  verified: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 6,
  },

  verifiedText: {
    color: '#fff',
    fontSize: 12,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: -55,
  },

  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    elevation: 4,
  },

  statIcon: {
    backgroundColor: '#E0F2FE',
    padding: 10,
    borderRadius: 12,
    marginBottom: 6,
  },

  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
  },

  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },

  infoCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 20,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 30,
  },

  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  infoLoader: {
    marginLeft: 8,
  },

  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },

  infoText: {
    marginLeft: 12,
  },

  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
  },

  infoValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },

  legalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },

  legalBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },

  legalBtnText: {
    fontSize: 12,
    color: '#1F2937',
    fontWeight: '600',
  },

  logoutBtn: {
    borderWidth: 1,
    borderColor: '#EF4444',
    marginHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },

  logoutText: {
    color: '#EF4444',
    fontWeight: '600',
  },

  version: {
    textAlign: 'center',
    marginTop: 14,
    fontSize: 12,
    color: '#9CA3AF',
  },
  /* ===== MODAL ===== */

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalBox: {
    backgroundColor: Color.WHITE,
    width: '85%',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },

  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
  },

  modalText: {
    textAlign: 'center',
    fontSize: 13,
    color: Color.grayText,
    marginVertical: 12,
  },

  modalActions: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 10,
  },

  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Color.BORDER,
    padding: 12,
    borderRadius: 10,
    marginRight: 8,
    alignItems: 'center',
  },

  confirmBtn: {
    flex: 1,
    backgroundColor: Color.PRIMARY,
    padding: 12,
    borderRadius: 10,
    marginLeft: 8,
    alignItems: 'center',
  },

  cancelText: {
    color: Color.grayText,
    fontWeight: '500',
  },

  confirmText: {
    color: Color.WHITE,
    fontWeight: '600',
  },
});

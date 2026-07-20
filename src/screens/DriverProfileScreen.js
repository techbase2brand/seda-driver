import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Color from '../constants/Color';
import { fontFamilyHeading, fontFamilyBody } from '../constants/Fonts';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DriverProfileScreen = ({ navigation, route }) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);

  const totaldeliveries = route?.params?.totaldeliveries;

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

  const getInitials = name => {
    if (!name) return 'DR';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

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

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#4FA3E3" />

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>My Profile</Text>

        {/* empty spacer to center the title */}
        <View style={styles.backBtn} />
      </View>

      {/* ── HERO CARD ── */}
      <View style={styles.heroCard}>
        <View style={styles.avatarWrap}>
          {loading ? (
            <ActivityIndicator size="small" color="#1A6FE8" />
          ) : (
            <Text style={styles.avatarText}>
              {getInitials(driver?.driver_name)}
            </Text>
          )}
          <View style={styles.onlineDot} />
        </View>

        <View style={styles.heroInfo}>
          <Text style={styles.heroName}>
            {loading ? 'Loading...' : driver?.driver_name || 'Driver'}
          </Text>
          <View style={styles.heroSubRow}>
            {/* <Icon name="location-outline" size={13} color="#9CA3AF" /> */}
            {/* <Text style={styles.heroSub}>Mumbai</Text>
            <Text style={styles.heroDot}>·</Text> */}
            <View style={styles.activePill}>
              <View style={styles.activeDotSmall} />
              <Text style={styles.activePillText}>Active</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── STATS ── */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: '#EBF2FF' }]}>
              <Icon name="cube-outline" size={20} color="#1A6FE8" />
            </View>
            <Text style={styles.statNum}>
              {totaldeliveries?.totalompleted ?? '-'}
            </Text>
            <Text style={styles.statLbl}>Total deliveries</Text>
            {/* <View style={styles.trendBadge}>
              <Icon name="trending-up" size={11} color="#1A6FE8" />
              <Text style={styles.trendText}>+12%</Text>
            </View> */}
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: '#E8F8EF' }]}>
              <Icon name="time-outline" size={20} color="#16A34A" />
            </View>
            <Text style={styles.statNum}>
              {totaldeliveries?.todaycompleted ?? '-'}
            </Text>
            <Text style={styles.statLbl}>Completed today</Text>
            {/* <View style={[styles.trendBadge, { backgroundColor: '#E8F8EF' }]}>
              <Text style={[styles.trendText, { color: '#16A34A' }]}>Today</Text>
            </View> */}
          </View>
        </View>

        {/* ── DRIVER INFO ── */}
        <View style={styles.sectionLabel}>
          <Text style={styles.sectionLabelText}>Driver information</Text>
        </View>

        <View style={styles.card}>
          {loading ? (
            <ActivityIndicator
              size="small"
              color="#1A6FE8"
              style={{ paddingVertical: 20 }}
            />
          ) : (
            <>
              <InfoRow
                icon="person-outline"
                label="Full name"
                value={driver?.driver_name || '-'}
              />
              <View style={styles.divider} />
              <InfoRow
                icon="mail-outline"
                label="Email address"
                value={driver?.email || '-'}
              />
              <View style={styles.divider} />
              <InfoRow
                icon="call-outline"
                label="Phone number"
                value={driver?.phone_number || '-'}
                isLast
              />
            </>
          )}
        </View>

        {/* ── MENU ── */}
        <View style={styles.sectionLabel}>
          <Text style={styles.sectionLabelText}>More</Text>
        </View>

        <View style={styles.card}>
          <MenuRow
            icon="lock-closed-outline"
            iconColor="#1A6FE8"
            iconBg="#EBF2FF"
            label="Change password"
            onPress={() => navigation.navigate('ChangePassword')}
          />
          <View style={styles.divider} />
          <MenuRow
            icon="document-text-outline"
            iconColor="#1A6FE8"
            iconBg="#EBF2FF"
            label="Terms and conditions"
            onPress={() => navigation.navigate('TermsAndConditionsScreen')}
          />
          <View style={styles.divider} />
          <MenuRow
            icon="shield-checkmark-outline"
            iconColor="#1A6FE8"
            iconBg="#EBF2FF"
            label="Privacy policy"
            onPress={() => navigation.navigate('PrivacyPolicyScreen')}
            isLast
          />
        </View>

        {/* ── LOGOUT ── */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => setShowLogoutModal(true)}
          activeOpacity={0.8}
        >
          <View style={styles.logoutIconBox}>
            <Icon name="log-out-outline" size={18} color="#EF4444" />
          </View>
          <Text style={styles.logoutText}>Logout</Text>
          <Icon name="chevron-forward" size={16} color="#EF4444" />
        </TouchableOpacity>

        <Text style={styles.version}>CoconutStock Driver App v1.0.0</Text>
      </ScrollView>

      {/* ── LOGOUT MODAL ── */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalIconWrap}>
              <Icon name="log-out-outline" size={30} color="#EF4444" />
            </View>
            <Text style={styles.modalTitle}>Confirm logout</Text>
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
                <Text style={styles.confirmText}>Yes, logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

/* ── Sub-components ── */

const InfoRow = ({ icon, label, value, isLast }) => (
  <View style={[styles.infoRow, isLast && { marginBottom: 0 }]}>
    <View style={styles.infoIconBox}>
      <Icon name={icon} size={17} color="#1A6FE8" />
    </View>
    <View style={styles.infoText}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

const MenuRow = ({ icon, iconColor, iconBg, label, onPress, isLast }) => (
  <TouchableOpacity
    style={[styles.menuRow, isLast && { marginBottom: 0 }]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[styles.infoIconBox, { backgroundColor: iconBg }]}>
      <Icon name={icon} size={17} color={iconColor} />
    </View>
    <Text style={styles.menuLabel}>{label}</Text>
    <Icon name="chevron-forward" size={16} color="#C4C9D4" />
  </TouchableOpacity>
);

export default DriverProfileScreen;

/* ── Styles ── */
const BLUE = '#1A6FE8';
const BLUE_LIGHT = '#EBF2FF';

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F2F5FA',
  },

  /* header */
  header: {
    backgroundColor: '#4FA3E3',
    paddingTop: Platform.OS === 'ios' ? 54 : 16,
    paddingBottom: 80,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    fontFamily: fontFamilyHeading,
    letterSpacing: 0.2,
  },

  /* hero card */
  heroCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: -60,
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    elevation: 6,
    shadowColor: '#1A6FE8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  avatarWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: BLUE_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: BLUE,
    fontFamily: fontFamilyHeading,
  },
  onlineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22C55E',
    borderWidth: 2.5,
    borderColor: '#fff',
    position: 'absolute',
    bottom: -2,
    right: -2,
  },
  heroInfo: {
    flex: 1,
  },
  heroName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    fontFamily: fontFamilyHeading,
    letterSpacing: -0.3,
  },
  heroSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    gap: 4,
  },
  heroSub: {
    fontSize: 13,
    color: '#9CA3AF',
    fontFamily: fontFamilyBody,
  },
  heroDot: {
    fontSize: 13,
    color: '#9CA3AF',
    fontFamily: fontFamilyBody,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F8EF',
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 3,
    gap: 4,
  },
  activeDotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  activePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
    fontFamily: fontFamilyBody,
  },

  /* scroll */
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 30 },

  /* stats */
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    alignItems: 'flex-start',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  statIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statNum: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
    fontFamily: fontFamilyHeading,
    letterSpacing: -1,
  },
  statLbl: {
    fontSize: 11,
    color: '#9CA3AF',
    fontFamily: fontFamilyBody,
    marginTop: 2,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BLUE_LIGHT,
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginTop: 8,
    gap: 3,
  },
  trendText: {
    fontSize: 10,
    fontWeight: '700',
    color: BLUE,
    fontFamily: fontFamilyBody,
  },

  /* section label */
  sectionLabel: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 8,
  },
  sectionLabelText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontFamily: fontFamilyBody,
  },

  /* card */
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  divider: {
    height: 0.5,
    backgroundColor: '#F3F4F6',
    marginLeft: 52,
  },

  /* info row */
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 14,
  },
  infoIconBox: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: BLUE_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: { flex: 1 },
  infoLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontFamily: fontFamilyBody,
  },
  infoValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
    marginTop: 2,
    fontFamily: fontFamilyBody,
  },

  /* menu row */
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 14,
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
    fontFamily: fontFamilyBody,
  },

  /* logout */
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 15,
    gap: 14,
    borderWidth: 0.5,
    borderColor: '#FCA5A5',
  },
  logoutIconBox: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#EF4444',
    fontFamily: fontFamilyBody,
  },

  /* version */
  version: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 11,
    color: '#C4C9D4',
    fontFamily: fontFamilyBody,
  },

  /* modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    width: '85%',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  modalIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    fontFamily: fontFamilyHeading,
  },
  modalText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#6B7280',
    marginTop: 8,
    marginBottom: 20,
    lineHeight: 20,
    fontFamily: fontFamilyBody,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelText: {
    color: '#6B7280',
    fontWeight: '600',
    fontSize: 14,
    fontFamily: fontFamilyBody,
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: '#EF4444',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    fontFamily: fontFamilyBody,
  },
});




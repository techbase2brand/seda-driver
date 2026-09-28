import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Colors from '../constants/Color';
import { fontFamilyHeading, fontFamilyBody } from '../constants/Fonts';
import { isSameCalendarDay } from '../utils';
import LinearGradient from 'react-native-linear-gradient';

const StatCard = ({ icon, value, label, gradient, active, onPress }) => (
  <TouchableOpacity
    activeOpacity={0.8}
    onPress={onPress}
    style={[styles.card, active && styles.cardActive]}
  >
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.iconBox}
    >
      <Icon name={icon} size={20} color="#fff" />
    </LinearGradient>
    <Text style={styles.value}>{value}</Text>
    <Text style={styles.label}>{label}</Text>
  </TouchableOpacity>
);

/**
 * Three tappable tabs that both summarise and filter the order list below.
 *
 * Replaces the old "Total Orders" card, which counted every order ever
 * assigned to the driver (the query has no date filter - see
 * DeliveriesScreen.fetchOrders) next to "In Progress" and "Delivered" -
 * a lifetime total sitting beside same-day numbers read as confusing and
 * wrong. Today's Orders / Delivered Orders / Tomorrow's Orders keeps the
 * date scope explicit in the label itself.
 */
const DeliveryStats = ({ orders, selectedTab, onSelectTab }) => {
  const normalize = status => (status || '').toLowerCase().trim();
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayCount = orders?.filter(item =>
    isSameCalendarDay(item?.delivery_date, today),
  )?.length || 0;

  const tomorrowCount = orders?.filter(item =>
    isSameCalendarDay(item?.delivery_date, tomorrow),
  )?.length || 0;

  // Lifetime, on purpose - unlike Today's/Tomorrow's this one is meant to
  // answer "how many has this driver delivered", not "how many today".
  const deliveredCount = orders?.filter(
    item => normalize(item?.deliveryStatus) === 'completed',
  )?.length || 0;

  return (
    <View style={styles.row}>
      <StatCard
        icon="today-outline"
        value={todayCount}
        label="Today's Orders"
        gradient={['#0a24a7ff', '#305FFD']}
        active={selectedTab === 'today'}
        onPress={() => onSelectTab('today')}
      />
      <StatCard
        icon="checkmark-circle-outline"
        value={deliveredCount}
        label="Delivered Orders"
        gradient={['#0FA958', '#63ab70ff']}
        active={selectedTab === 'delivered'}
        onPress={() => onSelectTab('delivered')}
      />
      <StatCard
        icon="calendar-outline"
        value={tomorrowCount}
        label="Tomorrow's Orders"
        gradient={['#84b9dcff', '#4AA3DF']}
        active={selectedTab === 'tomorrow'}
        onPress={() => onSelectTab('tomorrow')}
      />
    </View>
  );
};

export default DeliveryStats;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  card: {
    width: '30%',
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: Colors.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  cardActive: {
    borderColor: Colors.PRIMARY,
    backgroundColor: Colors.WHITE,
  },
  iconBox: {
    height: 40,
    width: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  value: {
    fontWeight: '600',
    fontSize: 18,
    marginTop: 8,
    fontFamily: fontFamilyHeading,
  },
  label: {
    color: Colors.textGray,
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
    fontFamily: fontFamilyBody,
  },
});

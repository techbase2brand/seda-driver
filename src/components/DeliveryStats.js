import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Colors from '../constants/Color';
import { fontFamilyHeading, fontFamilyBody } from '../constants/Fonts';
import { DELIVERY_SUMMARY } from '../constants/Constants';
import LinearGradient from 'react-native-linear-gradient';

const StatCard = ({ icon, value, label, bg, gradient }) => (
  <View style={styles.card}>
    {/* <LinearGradient
  //   colors={gradient}
  //   start={{ x: 0, y: 0 }}
  //   end={{ x: 1, y: 1 }}
  //   style={styles.card}
  // > */}

    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.iconBox}
    >
      {/* <View style={[styles.iconBox, { backgroundColor: bg }]}> */}
      <Icon name={icon} size={20} color="#fff" />
      {/* </View> */}
    </LinearGradient>
    <Text style={styles.value}>{value}</Text>
    <Text style={styles.label}>{label}</Text>
    {/* // </LinearGradient> */}
  </View>
);

const DeliveryStats = ({ orders }) => {
  const normalize = status => (status || '').toLowerCase().trim();

  const completedOrdersCount = orders?.filter(
    item => normalize(item?.deliveryStatus) === 'completed',
  )?.length;
  const inProgressCount = orders?.filter(
    item => normalize(item?.deliveryStatus) === 'in transit',
  )?.length;
  // "Total Orders" must mean every order for the day. It used to exclude
  // completed, undelivered AND in-transit orders, so the moment a driver
  // tapped "Mark All In Transit" the total dropped to 0 while the orders were
  // still sitting in the list.
  const totalOrdersCount = orders?.length || 0;

  return (
    <View style={styles.row}>
      <StatCard
        icon="cube-outline"
        value={totalOrdersCount}
        label="Total Orders"
        bg="#0A4DFF"
        gradient={['#0a24a7ff', '#305FFD']}
      />
      <StatCard
        icon="trending-up-outline"
        value={inProgressCount}
        label="In Progress"
        bg="#4AA3DF"
        gradient={['#84b9dcff', '#4AA3DF']}
      />
      <StatCard
        icon="checkmark-circle-outline"
        value={completedOrdersCount}
        label="Delivered"
        bg="#16A34A"
        gradient={['#0FA958', '#63ab70ff']}
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
    shadowColor: Colors.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
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
    color: Colors.grayText,
    fontSize: 12,
    marginTop: 2,
    fontFamily: fontFamilyBody,
  },
});

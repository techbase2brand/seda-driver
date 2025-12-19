import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Colors from '../constants/Color';
import { DELIVERY_SUMMARY } from '../constants/Constants';

const StatCard = ({ icon, value, label, bg }) => (
  <View style={styles.card}>
    <View style={[styles.iconBox, { backgroundColor: bg }]}>
      <Icon name={icon} size={20} color="#fff" />
    </View>
    <Text style={styles.value}>{value}</Text>
    <Text style={styles.label}>{label}</Text>
  </View>
);

const DeliveryStats = ({ orders }) => {
  return (
    <View style={styles.row}>
      <StatCard
        icon="cube-outline"
        value={orders}
        label="Assigned"
        bg="#0A4DFF"
      />
      <StatCard
        icon="trending-up-outline"
        value={DELIVERY_SUMMARY.inProgress}
        label="In Progress"
        bg="#4AA3DF"
      />
      <StatCard
        icon="checkmark-circle-outline"
        value={DELIVERY_SUMMARY.delivered}
        label="Delivered"
        bg="#16A34A"
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
    fontWeight: '700',
    fontSize: 18,
    marginTop: 8,
  },
  label: {
    color: Colors.grayText,
    fontSize: 12,
    marginTop: 2,
  },
});

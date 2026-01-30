import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Colors from '../constants/Color';
import { fontFamilyHeading, fontFamilyBody } from '../constants/Fonts';

const InfoRow = ({ label, value, icon }) => (
  <View style={styles.row}>
    {icon && <Icon name={icon} size={16} color={Colors.textGray} />}
    <View style={{ marginLeft: icon ? 8 : 0 }}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  </View>
);

const InfoCard = ({ title, children }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.heading}>{title}</Text>
      {children}
    </View>
  );
};

export { InfoCard, InfoRow };

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.WHITE,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  heading: {
    fontWeight: '600',
    marginBottom: 12,
    fontFamily: fontFamilyHeading,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    color: Colors.textGray,
    fontFamily: fontFamilyBody,
  },
  value: {
    fontSize: 14,
    color: Colors.TEXT,
    marginTop: 2,
    fontWeight: '600',
    fontFamily: fontFamilyBody,
  },
});

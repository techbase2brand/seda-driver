import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import Colors from '../constants/Color';
import { fontFamilyBody } from '../constants/Fonts';

const ActionButton = ({ title, icon, colors, onPress }) => {
  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.gradient}
    >
      <TouchableOpacity onPress={onPress} style={styles.btn}>
        <Icon name={icon} size={18} color={Colors.WHITE} />
        <Text style={styles.text}>{title}</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

export default ActionButton;

const styles = StyleSheet.create({
  gradient: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  btn: {
    height: 44,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: Colors.WHITE,
    marginLeft: 8,
    fontWeight: '600',
    fontFamily: fontFamilyBody,
  },
});

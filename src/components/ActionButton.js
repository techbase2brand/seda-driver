import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import Colors from '../constants/Color';
import { fontFamilyBody } from '../constants/Fonts';

const ActionButton = ({ title, icon, colors, onPress, disabled }) => {
  const tint = disabled ? Colors.textGray : Colors.WHITE;

  return (
    <LinearGradient
      colors={disabled ? [Colors.DISABLED, Colors.DISABLED] : colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.gradient}
    >
      <TouchableOpacity
        onPress={onPress}
        style={styles.btn}
        disabled={disabled}
      >
        <Icon name={icon} size={18} color={tint} />
        <Text style={[styles.text, { color: tint }]}>{title}</Text>
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

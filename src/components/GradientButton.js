// import React from 'react';
// import {Text, TouchableOpacity, StyleSheet} from 'react-native';
// import LinearGradient from 'react-native-linear-gradient';
// import Colors from '../constants/Color';

// const GradientButton = ({title, colors, onPress, icon}) => {
//   return (
//     <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
//       <LinearGradient colors={colors} style={styles.btn}>
//         {icon}
//         <Text style={styles.text}>{title}</Text>
//       </LinearGradient>
//     </TouchableOpacity>
//   );
// };

// export default GradientButton;

// const styles = StyleSheet.create({
//   btn: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 12,
//     borderRadius: 10,
//   },
//   text: {
//     color: Colors.WH,
//     fontWeight: '600',
//     marginLeft: 6,
//   },
// });
import React from 'react';
import { Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../constants/Color';

const GradientButton = ({ title, colors, onPress, icon, disabled ,font}) => {
  return (
    <LinearGradient
      colors={disabled ? [Colors.textGray, Colors.textGray] : colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.gradient, disabled && { opacity: 0.6 }]}
    >
      <TouchableOpacity
        onPress={disabled ? null : onPress}
        activeOpacity={disabled ? 1 : 0.8}
        style={styles.btn}
        disabled={disabled}
      >
        {icon}
        <Text style={[styles.text, { fontSize: font ? 13 : 14 }]}>{title}</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

export default GradientButton;
const styles = StyleSheet.create({
  gradient: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    height: 48,
    paddingHorizontal: 16,

    borderRadius: 14,
  },
  text: {
    color: Colors.WHITE,
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 14,
  },
});

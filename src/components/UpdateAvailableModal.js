import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Colors from '../constants/Color';
import { fontFamilyHeading, fontFamilyBody } from '../constants/Fonts';

/**
 * App's own update prompt, shown instead of a native Alert.
 * Used on iOS only — Android runs Google Play's in-app update flow, which
 * renders Play's own dialog.
 */
const UpdateAvailableModal = ({ visible, storeVersion, onUpdate, onLater }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onLater}
    >
      <View style={styles.overlay}>
        <View style={styles.box}>
          <View style={styles.iconWrap}>
            <Icon
              name="cloud-download-outline"
              size={30}
              color={Colors.PRIMARY}
            />
          </View>

          <Text style={styles.title}>Update Available</Text>

          {!!storeVersion && (
            <View style={styles.versionPill}>
              <Text style={styles.versionText}>Version {storeVersion}</Text>
            </View>
          )}

          <Text style={styles.text}>
            A new version of Coconut Driver is available. Please update to
            continue using the latest features.
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.laterBtn}
              onPress={onLater}
              activeOpacity={0.8}
            >
              <Text style={styles.laterText}>Later</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.updateBtn}
              onPress={onUpdate}
              activeOpacity={0.8}
            >
              <Text style={styles.updateText}>Install</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default UpdateAvailableModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    backgroundColor: Colors.WHITE,
    width: '85%',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#EBF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.TEXT,
    fontFamily: fontFamilyHeading,
  },
  versionPill: {
    backgroundColor: '#EBF2FF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 8,
  },
  versionText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.PRIMARY,
    fontFamily: fontFamilyBody,
  },
  text: {
    textAlign: 'center',
    fontSize: 13,
    color: Colors.textGray,
    marginTop: 10,
    marginBottom: 20,
    lineHeight: 20,
    fontFamily: fontFamilyBody,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  laterBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },
  laterText: {
    color: Colors.textGray,
    fontWeight: '600',
    fontSize: 14,
    fontFamily: fontFamilyBody,
  },
  updateBtn: {
    flex: 1,
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },
  updateText: {
    color: Colors.WHITE,
    fontWeight: '700',
    fontSize: 14,
    fontFamily: fontFamilyBody,
  },
});

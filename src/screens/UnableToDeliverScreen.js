import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

const COLORS = {
  RED: '#FF0033',
  RED_LIGHT: '#FFE6EA',
  BACKGROUND: '#F2F4F6',
  WHITE: '#FFFFFF',
  TEXT: '#1C1C1C',
  PLACEHOLDER: '#9E9E9E',
  BORDER: '#E0E0E0',
  ERROR: '#FF0033',
  DISABLED: '#E0E0E0',
};

export default function UnableToDeliverScreen({ navigation }) {
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState(null);

  /* ========== IMAGE PICKERS ========== */

  const openCamera = () => {
    launchCamera({ mediaType: 'photo', quality: 0.7 }, response => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('Camera Error', response.errorMessage);
        return;
      }
      setPhoto(response.assets[0]);
    });
  };

  const openGallery = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.7 }, response => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('Gallery Error', response.errorMessage);
        return;
      }
      setPhoto(response.assets[0]);
    });
  };

  const isSubmitEnabled = reason.trim().length > 0;

  return (
    <View style={styles.container}>
      {/* HEADER */}
        <View style={{ position: 'relative', marginBottom: 40 }}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={22} color={COLORS.WHITE} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Unable to Deliver</Text>
          <Text style={styles.headerSub}>ORD-2025-004</Text>
        </View>
      </View>

      {/* DELIVERY INFO */}
        <View style={styles.card}>
          <View style={styles.iconBox}>
            <Icon name="alert-circle-outline" size={20} color={COLORS.WHITE} />
          </View>
          <View>
            <Text style={styles.smallLabel}>Unable to deliver to</Text>
            <Text style={styles.boldText}>Sunset Restaurant Group</Text>
            <Text style={styles.smallText}>Sarah Johnson</Text>
          </View>
        </View>
        </View>

      <ScrollView contentContainerStyle={styles.content}>
        

        {/* WARNING */}
        <View style={styles.warningBox}>
          <Icon name="alert-circle-outline" size={18} color={COLORS.ERROR} />
          <View style={{ marginLeft: 8 }}>
            <Text style={styles.warningTitle}>Unable to Complete Delivery</Text>
            <Text style={styles.warningText}>
              Please provide a detailed reason why the delivery could not be
              completed
            </Text>
          </View>
        </View>

        {/* REASON */}
        <Text style={styles.sectionTitle}>Reason for Unable to Deliver</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Explain why delivery could not be completed..."
          placeholderTextColor={COLORS.PLACEHOLDER}
          multiline
          value={reason}
          onChangeText={setReason}
        />
        <Text style={styles.helperText}>
          E.g. "Customer not available", "Wrong address", "Business closed"
        </Text>

        {/* PHOTO OPTIONAL */}
        <Text style={styles.sectionTitle}>Photo (Optional)</Text>
        <View style={styles.photoBox}>
          {photo ? (
            <Image source={{ uri: photo.uri }} style={styles.previewImage} />
          ) : (
            <>
              <Icon
                name="camera-outline"
                size={32}
                color={COLORS.PLACEHOLDER}
              />
              <Text style={styles.noPhotoText}>No photo uploaded</Text>
              <Text style={styles.helperText}>Optional supporting photo</Text>
            </>
          )}
        </View>

        <View style={styles.photoActions}>
          <TouchableOpacity style={styles.outlineBtn} onPress={openCamera}>
            <Icon name="camera-outline" size={16} />
            <Text> Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.outlineBtn} onPress={openGallery}>
            <Icon name="image-outline" size={16} />
            <Text> Upload</Text>
          </TouchableOpacity>
        </View>

        {/* NOTES */}
        <Text style={styles.sectionTitle}>Additional Notes (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Add any additional comments..."
          placeholderTextColor={COLORS.PLACEHOLDER}
          multiline
          value={notes}
          onChangeText={setNotes}
        />

        {/* SUBMIT */}
        <TouchableOpacity
          disabled={!isSubmitEnabled}
          style={[styles.submitBtn, !isSubmitEnabled && styles.submitDisabled]}
        >
          <Text
            style={{
              color: isSubmitEnabled ? COLORS.WHITE : COLORS.PLACEHOLDER,
            }}
          >
            Submit Unable to Deliver Report
          </Text>
        </TouchableOpacity>

        {!isSubmitEnabled && (
          <Text style={styles.errorText}>
            * Please provide a reason for unable to deliver
          </Text>
        )}

        <Text style={styles.footerNote}>
          Once submitted, the customer and location admin will be notified
        </Text>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND },

  header: {
    backgroundColor: COLORS.RED,
    padding: 20,
    paddingTop: 60,
    paddingBottom: 55,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
   
  },
  headerTitle: {
    color: COLORS.WHITE,
    fontSize: 18,
    fontWeight: '600',
  },
  headerSub: { color: COLORS.WHITE, fontSize: 12 },

  content: { padding: 16 },

  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.WHITE,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    alignSelf: 'center',
    position: 'absolute',
    top: '75%',
    width: '94%',
    marginHorizontal: 20,
  },
  iconBox: {
    backgroundColor: COLORS.RED,
    padding: 10,
    borderRadius: 10,
    marginRight: 12,
  },

  warningBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.RED_LIGHT,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  warningTitle: {
    color: COLORS.ERROR,
    fontWeight: '600',
  },
  warningText: {
    fontSize: 12,
    color: COLORS.ERROR,
    marginTop: 2,
  },

  sectionTitle: { fontWeight: '600', marginBottom: 8 },

  input: {
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 8,
    padding: 10,
    backgroundColor: COLORS.WHITE,
  },

  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },

  helperText: {
    fontSize: 11,
    color: COLORS.PLACEHOLDER,
    marginTop: 6,
    marginBottom: 12,
  },

  photoBox: {
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.BORDER,
    borderRadius: 10,
    alignItems: 'center',
    padding: 20,
  },

  previewImage: {
    width: '100%',
    height: 180,
    borderRadius: 10,
  },

  noPhotoText: { marginTop: 6, fontWeight: '500' },

  photoActions: {
    flexDirection: 'row',
    marginVertical: 12,
  },

  outlineBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginHorizontal: 4,
    flexDirection: 'row',
    justifyContent: 'center',
  },

  submitBtn: {
    backgroundColor: COLORS.RED,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },

  submitDisabled: { backgroundColor: COLORS.DISABLED },

  errorText: {
    color: COLORS.ERROR,
    fontSize: 11,
    marginVertical: 6,
  },

  footerNote: {
    textAlign: 'center',
    fontSize: 11,
    color: COLORS.PLACEHOLDER,
    marginTop: 16,
  },

  smallLabel: { fontSize: 11, color: COLORS.PLACEHOLDER },
  boldText: { fontWeight: '600' },
  smallText: { fontSize: 12, color: COLORS.PLACEHOLDER },
});

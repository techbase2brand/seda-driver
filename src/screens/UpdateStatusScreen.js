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
import COLORS from '../constants/Color';

// const COLORS = {
//   PRIMARY: '#4FA3E3',
//   BACKGROUND: '#F2F4F6',
//   WHITE: '#FFFFFF',
//   TEXT: '#1C1C1C',
//   PLACEHOLDER: '#9E9E9E',
//   ERROR: '#FF3B30',
//   BORDER: '#E0E0E0',
//   DISABLED: '#E0E0E0',
// };

export default function UpdateStatusScreen({ navigation }) {
  const [recipient, setRecipient] = useState('');
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState(null);

  /* ================= IMAGE PICKERS ================= */

  const openCamera = () => {
    launchCamera(
      {
        mediaType: 'photo',
        quality: 0.7,
        saveToPhotos: true,
      },
      response => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert('Camera Error', response.errorMessage);
          return;
        }
        setPhoto(response.assets[0]);
      },
    );
  };

  const openGallery = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.7,
        selectionLimit: 1,
      },
      response => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert('Gallery Error', response.errorMessage);
          return;
        }
        setPhoto(response.assets[0]);
      },
    );
  };

  const isSubmitEnabled = !!photo;

  /* ================= UI ================= */

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={{ position: 'relative', marginBottom: 40 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={22} color={COLORS.WHITE} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Update Status</Text>
            <Text style={styles.headerSub}>ORD-2025-005</Text>
          </View>
        </View>
        {/* DELIVERY INFO */}
        <View style={styles.card}>
          <View style={styles.iconBox}>
            <Icon name="cube-outline" size={20} color={COLORS.WHITE} />
          </View>
          <View>
            <Text style={styles.smallLabel}>Delivering to</Text>
            <Text style={styles.boldText}>Martinez Trading Co.</Text>
            <Text style={styles.smallText}>John Martinez</Text>
          </View>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {/* RECIPIENT */}
        <Text style={styles.sectionTitle}>Recipient Name (Optional)</Text>
        <View style={styles.inputBox}>
          <Text style={styles.inputLabel}>Who received the delivery?</Text>
          <TextInput
            placeholder="Enter recipient's full name"
            placeholderTextColor={COLORS.PLACEHOLDER}
            style={styles.input}
            value={recipient}
            onChangeText={setRecipient}
          />
          <Text style={styles.helperText}>
            Name of the person who accepted the delivery
          </Text>
        </View>

        {/* PHOTO */}
        <Text style={styles.sectionTitle}>Photo of Signed Invoice</Text>

        <View style={styles.photoBox}>
          {photo ? (
            <Image source={{ uri: photo.uri }} style={styles.previewImage} />
          ) : (
            <>
              <Icon
                name="camera-outline"
                size={34}
                color={COLORS.PLACEHOLDER}
              />
              <Text style={styles.noPhotoText}>No photo uploaded</Text>
              <Text style={styles.helperText}>
                Take a photo or upload from gallery
              </Text>
            </>
          )}
        </View>

        <View style={styles.photoActions}>
          <TouchableOpacity style={styles.outlineBtn} onPress={openCamera}>
            <Icon name="camera-outline" size={16} color={COLORS.PRIMARY} />
            <Text style={styles.outlineText}> Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.outlineBtn, { borderColor: COLORS.PRIMARY_LOW }]}
            onPress={openGallery}
          >
            <Icon name="image-outline" size={16} color={COLORS.PRIMARY_LOW} />
            <Text style={[styles.outlineText, { color: COLORS.PRIMARY_LOW }]}>
              {' '}
              Upload
            </Text>
          </TouchableOpacity>
        </View>

        {/* NOTES */}
        <Text style={styles.sectionTitle}>Delivery Notes (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Add any delivery notes or comments..."
          placeholderTextColor={COLORS.PLACEHOLDER}
          multiline
          value={notes}
          onChangeText={setNotes}
        />
        <Text style={styles.helperText}>
          E.g. "Left at front door", "Delivered to receptionist"
        </Text>

        {/* SUBMIT */}
        <TouchableOpacity
          disabled={!isSubmitEnabled}
          style={[styles.submitBtn, ]}
        >
          <Text
            style={{
              color:COLORS.WHITE ,
            }}
          >
            Submit Proof of Delivery
          </Text>
        </TouchableOpacity>

        {!photo && (
          <Text style={styles.errorText}>
            * Please upload a photo of the signed invoice
          </Text>
        )}

        {/* UNABLE TO DELIVER */}
        <TouchableOpacity style={styles.unableBtn} onPress={()=> navigation.navigate("UnableToDeliverScreen")}>
          <Icon name="alert-circle-outline" size={18} color={COLORS.ERROR} />
          <Text style={styles.unableText}> Unable to Deliver</Text>
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          Once submitted, the customer and location admin will be notified
        </Text>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },

  header: {
    backgroundColor: COLORS.PRIMARY,
    padding: 20,
    paddingTop: 50,
    paddingBottom: 55,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    // borderBottomLeftRadius: 20,
    // borderBottomRightRadius: 20,
  },
  headerTitle: {
    color: COLORS.WHITE,
    fontSize: 18,
    fontWeight: '600',
  },
  headerSub: {
    color: COLORS.WHITE,
    fontSize: 12,
    marginTop: 2,
  },

  content: {
    padding: 16,
    position: 'relative',
  },

  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.WHITE,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    alignSelf: 'center',
    position: 'absolute',
    top: '75%',
    width: '94%',
    marginHorizontal: 20,
  },
  iconBox: {
    backgroundColor: COLORS.PRIMARY,
    padding: 10,
    borderRadius: 10,
    marginRight: 12,
  },

  sectionTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },

  inputBox: {
    backgroundColor: COLORS.WHITE,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    color: COLORS.TEXT,
  },

  input: {
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
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

  noPhotoText: {
    marginTop: 6,
    fontWeight: '500',
  },

  photoActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
  },

  outlineBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginHorizontal: 4,
    flexDirection: 'row',
    justifyContent: 'center',
  },

  outlineText: {
    color: COLORS.PRIMARY,
    fontWeight: '500',
  },

  submitBtn: {
    backgroundColor: COLORS.PRIMARY,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },

  submitDisabled: {
    backgroundColor: COLORS.DISABLED,
  },

  errorText: {
    color: COLORS.ERROR,
    fontSize: 11,
    marginVertical: 6,
  },

  unableBtn: {
    borderWidth: 1,
    borderColor: COLORS.ERROR,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },

  unableText: {
    color: COLORS.ERROR,
    fontWeight: '600',
  },

  footerNote: {
    textAlign: 'center',
    fontSize: 11,
    color: COLORS.PLACEHOLDER,
    marginTop: 16,
  },

  smallLabel: {
    fontSize: 11,
    color: COLORS.PLACEHOLDER,
  },
  boldText: {
    fontWeight: '600',
  },
  smallText: {
    fontSize: 12,
    color: COLORS.PLACEHOLDER,
  },
});

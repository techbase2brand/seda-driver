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
  Platform,
  PermissionsAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import COLORS from '../constants/Color';
import { supabase } from '../lib/supabase';

export default function UpdateStatusScreen({ navigation, route }) {
  const [recipient, setRecipient] = useState('');
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  const order = route?.params?.order;
  const OrderId = order?.id;

  const customer =
    typeof order?.customer_details === 'string'
      ? JSON.parse(order.customer_details)
      : order?.customer_details;

  /* ================= IMAGE PICKERS ================= */

  // const openCamera = () => {
  //   launchCamera({ mediaType: 'photo', quality: 0.7 }, res => {
  //     if (res.didCancel || res.errorCode) return;
  //     setPhoto(res.assets[0]);
  //   });
  // };

  // import { PermissionsAndroid, Platform } from 'react-native';

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const openCamera = async () => {
    const ok = await requestCameraPermission();
    if (!ok) return;

    launchCamera(
      {
        mediaType: 'photo',
        quality: 0.7,
        saveToPhotos: true,
      },
      response => {
        if (response.didCancel || response.errorCode) return;
        setPhoto(response.assets?.[0]);
      },
    );
  };

  const openGallery = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.7 }, res => {
      if (res.didCancel || res.errorCode) return;
      setPhoto(res.assets[0]);
    });
  };

  /* ================= HELPERS ================= */

  const uriToArrayBuffer = async uri => {
    const response = await fetch(uri);
    return await response.arrayBuffer();
  };

  /* ================= SUBMIT ================= */
  const handleSubmitAndroid = async () => {
    if (!photo) {
      Alert.alert('Error', 'Please upload delivery photo');
      return;
    }

    try {
      setLoading(true);

      const ext =
        photo.fileName?.split('.').pop() || photo.uri.split('.').pop() || 'jpg';

      const fileName = `order-${OrderId}-${Date.now()}.${ext}`;
      const filePath = `deliveries/${fileName}`;

      // ✅ ANDROID SAFE: file uri → blob
      const response = await fetch(photo.uri);
      const fileBlob = await response.blob();

      const { error: uploadError } = await supabase.storage
        .from('order-proofs')
        .upload(filePath, fileBlob, {
          contentType: photo.type || 'image/jpeg',
          upsert: true,
        });

      if (uploadError) {
        console.log('ANDROID UPLOAD ERROR:', uploadError);
        Alert.alert('Error', 'Image upload failed (Android)');
        return;
      }

      const { data } = supabase.storage
        .from('order-proofs')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('orders')
        .update({
          recipient_name: recipient || null,
          delivery_note: notes || null,
          delivery_proof_image: data.publicUrl,
          deliveryStatus: 'completed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', OrderId);

      if (updateError) {
        console.log('ANDROID UPDATE ERROR:', updateError);
        Alert.alert('Error', 'Order update failed (Android)');
        return;
      }

      Alert.alert('Success', 'Order marked as delivered');
      navigation.goBack();
    } catch (err) {
      console.log('ANDROID CATCH ERROR:', err);
      Alert.alert('Error', 'Network error on Android');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitIOS = async () => {
    if (!photo) {
      Alert.alert('Error', 'Please upload delivery photo');
      return;
    }

    try {
      setLoading(true);

      // iOS SAFE filename (fileName mostly null on iOS)
      const ext =
        photo.fileName?.split('.').pop() || photo.uri.split('.').pop() || 'jpg';

      const fileName = `order-${OrderId}-${Date.now()}.${ext}`;
      const filePath = `deliveries/${fileName}`;

      const fileBuffer = await uriToArrayBuffer(photo.uri);

      const { error: uploadError } = await supabase.storage
        .from('order-proofs')
        .upload(filePath, fileBuffer, {
          contentType: photo.type || 'image/jpeg',
          upsert: true,
        });

      if (uploadError) {
        console.log('UPLOAD ERROR:', uploadError);
        Alert.alert('Error', 'Image upload failed');
        return;
      }

      const { data } = supabase.storage
        .from('order-proofs')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('orders')
        .update({
          recipient_name: recipient || null,
          delivery_note: notes || null,
          delivery_proof_image: data.publicUrl,
          deliveryStatus: 'completed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', OrderId);

      if (updateError) {
        console.log('UPDATE ERROR:', updateError);
        Alert.alert('Error', 'Order update failed');
        return;
      }

      Alert.alert('Success', 'Order marked as delivered');
      navigation.goBack();
    } catch (err) {
      console.log('CATCH ERROR:', err);
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (Platform.OS === 'android') {
      handleSubmitAndroid();
    } else {
      handleSubmitIOS();
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ position: 'relative', marginBottom: 40 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={22} color={COLORS.WHITE} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Update Status</Text>
            <Text style={styles.headerSub}>{order?.order_name}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.iconBox}>
            <Icon name="cube-outline" size={20} color={COLORS.WHITE} />
          </View>
          <View>
            <Text style={styles.smallLabel}>Delivering to</Text>
            <Text style={styles.boldText}>{customer?.company_name}</Text>
            <Text style={styles.smallText}>{customer?.first_name}</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
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
              Upload
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Delivery Notes (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Add any delivery notes or comments..."
          placeholderTextColor={COLORS.PLACEHOLDER}
          multiline
          value={notes}
          onChangeText={setNotes}
        />

        <TouchableOpacity
          disabled={!photo || loading}
          style={[
            styles.submitBtn,
            (!photo || loading) && styles.submitDisabled,
          ]}
          onPress={handleSubmit}
        >
          <Text style={{ color: COLORS.WHITE }}>
            {loading ? 'Submitting...' : 'Submit Proof of Delivery'}
          </Text>
        </TouchableOpacity>

        {!photo && (
          <Text style={styles.errorText}>
            * Please upload a photo of the signed invoice
          </Text>
        )}

        <TouchableOpacity
          style={styles.unableBtn}
          onPress={() =>
            navigation.navigate('UnableToDeliverScreen', { orderId: OrderId })
          }
        >
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

/* ================= STYLES UNCHANGED ================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  header: {
    backgroundColor: COLORS.PRIMARY,
    padding: 20,
    paddingTop: 50,
    paddingBottom: 55,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: { color: COLORS.WHITE, fontSize: 18, fontWeight: '600' },
  headerSub: { color: COLORS.WHITE, fontSize: 12, marginTop: 2 },
  content: { padding: 16 },
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
  },
  iconBox: {
    backgroundColor: COLORS.PRIMARY,
    padding: 10,
    borderRadius: 10,
    marginRight: 12,
  },
  sectionTitle: { fontWeight: '600', marginBottom: 8 },
  inputBox: {
    backgroundColor: COLORS.WHITE,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  inputLabel: { fontSize: 12, color: COLORS.TEXT },
  input: {
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
    backgroundColor: COLORS.WHITE,
  },
  textArea: { height: 90, textAlignVertical: 'top' },
  helperText: { fontSize: 11, color: COLORS.PLACEHOLDER, marginTop: 6 },
  photoBox: {
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.BORDER,
    borderRadius: 10,
    alignItems: 'center',
    padding: 20,
  },
  previewImage: { width: '100%', height: 180, borderRadius: 10 },
  noPhotoText: { marginTop: 6, fontWeight: '500' },
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
  outlineText: { color: COLORS.PRIMARY, fontWeight: '500' },
  submitBtn: {
    backgroundColor: COLORS.PRIMARY,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  submitDisabled: { backgroundColor: COLORS.DISABLED },
  errorText: { color: COLORS.ERROR, fontSize: 11, marginVertical: 6 },
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
  unableText: { color: COLORS.ERROR, fontWeight: '600' },
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

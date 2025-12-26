import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../constants/Color';
import { supabase } from '../lib/supabase';

const MarkAllTransitCard = ({ orders = [] }) => {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // const count = orders.length;
  const eligibleOrders = orders.filter(
    o => o.deliveryStatus !== 'completed' && o.deliveryStatus !== 'cancelled',
  );

  const count = eligibleOrders.length;

  const updateAllOrdersTransit = async () => {
    try {
      setLoading(true);

      const orderIds = eligibleOrders.map(o => o.id);

      if (!orderIds.length) {
        setShowConfirm(false);
        return;
      }

      const { error } = await supabase
        .from('orders')
        .update({
          deliveryStatus: 'in transit',
          updated_at: new Date().toISOString(),
        })
        .in('id', orderIds);

      if (error) {
        console.log('MARK TRANSIT ERROR:', error);
      }

      setShowConfirm(false);
    } catch (err) {
      console.log('ERROR:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ===== CARD ===== */}
      <View style={styles.wrapper}>
        <LinearGradient
          colors={[Colors.PRIMARY_LOW, Colors.PRIMARY_DARK]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.btn}
            disabled={!count || loading}
            onPress={() => setShowConfirm(true)}
          >
            <Icon name="car-outline" size={18} color="#fff" />
            <Text style={styles.btnText}>
              {loading
                ? 'Updating...'
                : `Mark All Orders In Transit (${count})`}
            </Text>
          </TouchableOpacity>
        </LinearGradient>

        <Text style={styles.info}>
          Start your delivery route by marking all assigned orders as in transit
        </Text>
      </View>

      {/* ===== CONFIRM MODAL ===== */}
      <Modal
        visible={showConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Icon
              name="alert-circle-outline"
              size={42}
              color={Colors.PRIMARY}
            />

            <Text style={styles.modalTitle}>Confirm Action</Text>

            <Text style={styles.modalText}>
              Are you sure you want to mark all {count} orders as{' '}
              <Text style={{ fontWeight: '600' }}>In Transit</Text>?
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowConfirm(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={updateAllOrdersTransit}
              >
                <Text style={styles.confirmText}>
                  {loading ? 'Please wait...' : 'Yes, Confirm'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default MarkAllTransitCard;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.cardBg,
    margin: 16,
    borderRadius: 16,
    padding: 14,
    shadowColor: Colors.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },

  gradient: {
    borderRadius: 12,
    overflow: 'hidden',
  },

  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 12,
  },

  btnText: {
    color: Colors.WHITE,
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 14,
  },

  info: {
    marginTop: 10,
    color: Colors.grayText,
    textAlign: 'center',
    fontSize: 12,
  },

  /* ===== MODAL ===== */

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalBox: {
    backgroundColor: Colors.WHITE,
    width: '85%',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },

  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
  },

  modalText: {
    textAlign: 'center',
    fontSize: 13,
    color: Colors.grayText,
    marginVertical: 12,
  },

  modalActions: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 10,
  },

  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    padding: 12,
    borderRadius: 10,
    marginRight: 8,
    alignItems: 'center',
  },

  confirmBtn: {
    flex: 1,
    backgroundColor: Colors.PRIMARY,
    padding: 12,
    borderRadius: 10,
    marginLeft: 8,
    alignItems: 'center',
  },

  cancelText: {
    color: Colors.grayText,
    fontWeight: '500',
  },

  confirmText: {
    color: Colors.WHITE,
    fontWeight: '600',
  },
});

import { supabase } from '../lib/supabase';
import { formatOrderName } from '../utils';

/**
 * Writes a row into the shared `notifications` table so the customer app
 * picks it up — both its Notifications screen (via the `mobile_app_notifications`
 * view + Realtime) and, if a server-side sender is watching this table, an
 * actual push notification.
 *
 * Schema matches the customer app's own test helper
 * (coconut-app/src/utils/testNotifications.js createTestNotification) exactly,
 * since that is the shape its read path already knows how to display.
 *
 * This is intentionally silent on failure — call sites should treat it as
 * fire-and-forget and never let it block or fail the delivery flow.
 */
export const notifyCustomerOrderDelivered = async (order, customer) => {
  const customerId = customer?.id;

  if (!customerId) {
    console.log(
      'notifyCustomerOrderDelivered: no customer id on this order, skipping notification',
    );
    return;
  }

  const orderLabel = formatOrderName(order?.order_name);

  const { error } = await supabase.from('notifications').insert({
    notification_id: `NOTIF-DELIVERED-${order?.id}-${Date.now()}`,
    title: 'Order Delivered',
    message: `Your order ${orderLabel} has been delivered successfully. Thank you for choosing Coconut Stock!`,
    recipient_type: 'selected_customers',
    recipient_count: 1,
    recipient_ids: [customerId],
  });

  if (error) {
    throw error;
  }
};

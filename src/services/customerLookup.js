import { supabase } from '../lib/supabase';
import { parseCustomerDetails } from '../utils';

/**
 * Backfills missing customer info on orders.
 *
 * Confirmed against real data: an order placed through the customer app's
 * "reorder" flow gets a real `customer_id` and a top-level `delivery_address`,
 * but its embedded `customer_details` JSON is left null - unlike a normal
 * fresh order, which has both. Since every screen in this app (order card,
 * delivery details, update status, the delivered-notification) reads company
 * name / contact name / phone only from that JSON blob, those orders showed
 * completely blank customer info even though the data exists - just in the
 * `customers` table instead of copied onto the order.
 *
 * `customer_id` is present even when `customer_details` is not, so this
 * looks the row up there and fills in the same shape `parseCustomerDetails`
 * already returns, without needing any other file to change.
 *
 * Only ever selects the specific display columns needed - never `select('*')`
 * on `customers`, which also holds a plaintext `password` column that has no
 * reason to ever pass through the driver app.
 */
export async function fillMissingCustomerDetails(orders) {
  if (!Array.isArray(orders) || orders.length === 0) {
    return orders;
  }

  const missingIds = [
    ...new Set(
      orders
        .filter(
          o => !parseCustomerDetails(o?.customer_details) && o?.customer_id != null,
        )
        .map(o => o.customer_id),
    ),
  ];

  if (missingIds.length === 0) {
    return orders;
  }

  const { data: customers, error } = await supabase
    .from('customers')
    .select('id, company_name, first_name, last_name, phone, email')
    .in('id', missingIds);

  if (error || !customers) {
    console.log('fillMissingCustomerDetails: customer lookup failed', error);
    return orders;
  }

  const customerById = new Map(customers.map(c => [c.id, c]));

  return orders.map(order => {
    if (parseCustomerDetails(order?.customer_details) || order?.customer_id == null) {
      return order;
    }

    const fallback = customerById.get(order.customer_id);
    return fallback ? { ...order, customer_details: fallback } : order;
  });
}

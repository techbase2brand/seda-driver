
import { Dimensions, PixelRatio } from 'react-native';

export const widthPercentageToDP = widthPercent => {
  const screenWidth = Dimensions.get('window').width;
  const elemWidth = parseFloat(widthPercent);
  return PixelRatio.roundToNearestPixel((screenWidth * elemWidth) / 100);
};

export const heightPercentageToDP = heightPercent => {
  const screenHeight = Dimensions.get('window').height;
  const elemHeight = parseFloat(heightPercent);
  return PixelRatio.roundToNearestPixel((screenHeight * elemHeight) / 100);
};

/**
 * Shortens the order number for display: keeps the ORD- prefix and the last
 * 6 characters of what follows.
 *
 * This used to be unconditional (no truncation at all), specifically to fix
 * a mismatch bug: the driver app truncated while the customer app showed a
 * different number for the same order, so the two could not read the same
 * number out to each other on a call. That is still true today - the
 * customer app has not been changed to match - so truncating here again
 * reopens that mismatch. This is a deliberate, informed call to shorten the
 * driver app's own display (reorders can produce a 24+ character
 * `ORD-<timestamp>-<random>` name), not a reversal of the earlier finding.
 * The real fix is still the agreed step 2: a short, stable `order_number`
 * column both apps read from - see the driver-app/customer-app conversation
 * about `orders.order_name` vs a future `orders.order_number`.
 */
export const formatOrderName = (orderName: any): string => {
  if (!orderName) return '-';

  const value = String(orderName).trim();
  const lower = value.toLowerCase();

  if (lower.startsWith('ord-') || lower.startsWith('ord')) {
    const afterOrd = lower.startsWith('ord-') ? value.slice(4) : value.slice(3);
    const rest = afterOrd.startsWith('-') ? afterOrd.slice(1) : afterOrd;
    const shortRest = rest.length > 6 ? rest.slice(-6) : rest;
    return `ORD-${shortRest}`;
  }

  return value.length > 6 ? value.slice(-6) : value;
};

/**
 * Builds one human/geocoder friendly address string.
 * Accepts the shapes the backend actually sends: a plain string, a single
 * { street, city, state, zipCode } object, or an array of those with one
 * marked isSelected. Kept here so the card, the details screen and the map
 * screen can never disagree about how an address is read.
 */
export const buildAddressString = (addr: any): string => {
  if (!addr) return '';

  if (typeof addr === 'string') return addr.trim();

  if (Array.isArray(addr)) {
    const selected = addr.find((item: any) => item?.isSelected === true) || addr[0];
    return buildAddressString(selected);
  }

  if (typeof addr !== 'object') return '';

  const parts = [addr.street, addr.city, addr.state, addr.zipCode]
    .map((part: any) => (part == null ? '' : String(part).trim()))
    .filter(Boolean);

  if (parts.length) return parts.join(', ');

  const fallback = addr.address || addr.delivery_address || '';
  return typeof fallback === 'string' ? fallback.trim() : '';
};

/**
 * customer_details arrives either as a JSON string or as an already-parsed
 * object depending on the column type, and is sometimes empty. Parsing it
 * inline with JSON.parse() threw and took the whole order card down with it,
 * so every screen should come through here instead.
 */
export const parseCustomerDetails = (raw: any): any => {
  if (!raw) return null;
  if (typeof raw === 'object') return raw;

  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw);
    } catch (err) {
      console.log('parseCustomerDetails: could not parse', err);
      return null;
    }
  }

  return null;
};

/** "First Last" from a customer object, or '' when there is no name at all. */
export const buildCustomerName = (customer: any): string => {
  if (!customer) return '';

  return [customer.first_name, customer.last_name]
    .map((part: any) => (part == null ? '' : String(part).trim()))
    .filter(Boolean)
    .join(' ');
};

/**
 * True when two dates fall on the same calendar day, comparing by local
 * year/month/date rather than raw timestamps - `delivery_date` in the
 * database is stored at local midnight, so comparing full Date objects (or
 * their string form) would miss on timezone/millisecond differences that
 * don't actually matter for a "is this today's order" check.
 */
export const isSameCalendarDay = (a: any, b: any): boolean => {
  if (!a || !b) return false;

  const dateA = a instanceof Date ? a : new Date(a);
  const dateB = b instanceof Date ? b : new Date(b);

  if (Number.isNaN(dateA.getTime()) || Number.isNaN(dateB.getTime())) {
    return false;
  }

  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
};

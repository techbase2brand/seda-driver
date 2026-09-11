
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
 * Shows the order number exactly as the backend stores it.
 * This used to cut it down to the last 6 characters, which is why the driver
 * app and the customer app showed different numbers for the same order - the
 * two of them could not read the same number out to each other on a call.
 */
export const formatOrderName = (orderName: any): string => {
  if (!orderName) return '-';
  return String(orderName).trim() || '-';
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


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

/** Keep ORD- prefix; if the rest is longer than 6 chars, show only last 6 */
export const formatOrderName = orderName => {
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



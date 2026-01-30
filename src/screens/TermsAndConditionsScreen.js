/**
 * Terms & Conditions Screen
 * Displays terms and conditions with same design as screenshots
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import Colors from '../constants/Color';
import { fontFamilyHeading, fontFamilyBody } from '../constants/Fonts';

const TermsAndConditionsScreen = ({ navigation }) => {
  return (
    // <SafeAreaView style={styles.container}>
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Main Card Container */}
      <View style={styles.cardContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={20} color={Colors.WHITE} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>Coconut Stock Terms and Conditions</Text>

          {/* Intro */}
          <View style={styles.section}>
            <Text style={styles.sectionText}>
              By choosing to work with Coconut Stock Corporation or buy our
              products, you agree to the terms and conditions below. These rules
              show our commitment to giving you the best custom-branded
              coconuts. Please read and understand these conditions that govern
              your interaction with Coconut Stock Corporation.
            </Text>
          </View>

          {/* Product */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Product</Text>
            <Text style={styles.sectionText}>
              At Coconut Stock Corporation, we specialize in providing fresh,
              young coconuts. The coconuts arrive unopened, ensuring prime
              quality and offering.
            </Text>
            <Text style={styles.sectionText}>
              Each coconut offers refreshing coconut water and creamy white
              flesh. On average, one young coconut contains about 10-14 ounces
              (295-414 ml) of coconut water, with slight variations based on the
              coconut's size and maturity.
            </Text>
            <Text style={styles.sectionText}>
              It's important to note that the size of the coconuts in each case
              may vary. Natural color and flavor differences are influenced by
              harvest time and storage conditions.
            </Text>
            <Text style={styles.sectionText}>
              Upon opening, there's a possibility of the coconut water
              developing a pink hue due to the enzyme polyphenol oxidase (PPO),
              a natural occurrence.
            </Text>
            <Text style={styles.sectionText}>
              To maintain quality control, our team hand-stamps each coconut
              before every delivery. This meticulous process ensures the
              consistency and high standards of our products.
            </Text>
          </View>

          {/* Storage Guidelines */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Storage Guidelines</Text>
            <Text style={styles.sectionText}>
              Coconuts should be maintained at the temperature of 36°F (2°C)
              upon receipt. Avoid exposing them to direct sunlight or room
              temperature storage.
            </Text>
            <Text style={styles.sectionText}>
              Consume products after opening.
            </Text>
          </View>

          {/* Logo Design and Customization */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Logo Design and Customization
            </Text>
            <Text style={styles.sectionText}>
              The required logo formats include EPS (Vector, SVG, AI, PS), and
              the recommended dimensions are 4″W x 3″H.
            </Text>
            <Text style={styles.sectionText}>
              Our design team can incorporate a monogram or initials for the
              logo design fee.
            </Text>
            <Text style={styles.sectionText}>
              We use CNC machinery to create a metal logo. Each stamp is unique
              so after we create the logo we can not make any changes.
            </Text>
            <Text style={styles.sectionText}>
              Our team starts the logo process right after we send the invoice.
              If there is a change or cancellation request it should come before
              you receive the invoice.
            </Text>
            <Text style={styles.sectionText}>
              The deadline for receiving the logo file is set at five days.
              Requests with a timeframe of fewer than three days will be
              considered rush orders, potentially incurring an additional fee
              based on availability.
            </Text>
          </View>

          {/* Delivery */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery</Text>
            <Text style={styles.sectionText}>
              New orders can be scheduled for delivery seven days after we
              receive essential information, including company details, billing
              information, accounting details, a signed agreement, a logo file,
              and the resale certificate.
            </Text>
            <Text style={styles.sectionText}>
              To order custom-branded coconuts, you can contact our team via
              email at sales@coconutstock.com, through text, or by phone at
              786-751-7799.
            </Text>
            <Text style={styles.sectionText}>
              Our delivery services are available from Monday to Saturday,
              excluding Sundays. For next-day deliveries, orders should be
              submitted by 1 pm the day before.
            </Text>
            <Text style={styles.sectionText}>
              We serve locations from South Point Key West to North West Palm
              Beach, including the West Coast Naples. Additionally, our Orlando
              franchise location extends its services to the Orlando, FL area.
            </Text>
            <Text style={styles.sectionText}>
              If the product is delivered as planned, our team will not be held
              responsible for any delays thereafter.
            </Text>
            <Text style={styles.sectionText}>
              Upon delivery of your order for an event, your team is responsible
              for inspecting the product and promptly notifying us of any issues
              with the order.
            </Text>
          </View>

          {/* Return, Damaged Product, Cancellation - Resale */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Return, Damaged Product, Cancellation
            </Text>
            <Text style={styles.subSectionTitle}>Resale</Text>
            <Text style={styles.sectionText}>
              We guarantee swift replacement in the unlikely event of product
              damage during delivery. However, it's important to note that
              coconuts, being perishable items, may exhibit spots or
              discoloration on the outer shell.
            </Text>
            <Text style={styles.sectionText}>
              To enhance the handling of products, please instruct your team to
              consume older items before newer ones.
            </Text>
            <Text style={styles.sectionText}>
              In case of a replacement request, kindly return the damaged
              product to us for examination by our warehouse team. Without the
              actual damaged product, we cannot process the replacement request.
            </Text>
            <Text style={styles.sectionText}>
              In the event that you choose to terminate our services, Coconut
              Stock requests that you provide us with one week's advance notice.
              This allows us the necessary time to ensure the provision of any
              stocked products you may require before discontinuation.
            </Text>
          </View>

          {/* Events */}
          <View style={styles.section}>
            <Text style={styles.subSectionTitle}>Events</Text>
            <Text style={styles.sectionText}>
              If there is an error in the product or an issue in the delivery
              process, we take full responsibility and provide a complete
              refund.
            </Text>
            <Text style={styles.sectionText}>
              If the product has been delivered but remains unused due to
              internal reasons, you must return the product to us to receive the
              refund. We will void the product and employee charges, but the
              customer is responsible for covering the logo fee.
            </Text>
            <Text style={styles.sectionText}>
              In the case of a same-day cancellation upon contract signing, we
              will issue a full refund.
            </Text>
          </View>

          {/* Wholesale */}
          <View style={styles.section}>
            <Text style={styles.subSectionTitle}>Wholesale</Text>
            <Text style={styles.sectionText}>
              For branded coconut purchases, the full payment must be made to
              process the orders.
            </Text>
            <Text style={styles.sectionText}>
              Orders should be placed at least 10-15 days in advance.
            </Text>
            <Text style={styles.sectionText}>
              In the event of a replacement request, please return the damaged
              product for examination by our warehouse team. We cannot process
              replacement requests without the actual damaged product.
            </Text>
            <Text style={styles.sectionText}>
              Coconuts are perishable items, and not all will come in the same
              shape or size.
            </Text>
          </View>

          {/* Packaging */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Packaging</Text>
            <Text style={styles.sectionText}>
              Your coconuts arrive in robust cases, individually wrapped for
              freshness and protection.
            </Text>
          </View>

          {/* Payment Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Options</Text>
            <Text style={styles.sectionText}>
              Accepted methods: Major credit cards (3.5% CC fee), Zelle, Wire &
              ACH, and checks.
            </Text>
          </View>

          {/* Image Sharing and Usage */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Image Sharing and Usage</Text>
            <Text style={styles.sectionText}>
              Customer images may be shared on our social media and website for
              promotional purposes.
            </Text>
            <Text style={styles.sectionText}>
              Opt-out is available if you prefer not to have your images shared.
              Please communicate with our team at events@coconutstock.com.
            </Text>
          </View>

          {/* Closing */}
          <View style={styles.section}>
            <Text style={styles.sectionText}>
              For any further questions or additional information, please don't
              hesitate to contact our dedicated sales team. We are excited to
              serve you and provide you with the ultimate choice in
              custom-branded coconuts!
            </Text>
            <Text style={[styles.sectionText, styles.thankYouText]}>
              Thank you for choosing Coconut Stock.
            </Text>
          </View>
        </View>
      </View>

      {/* Brand Message Box */}
      <View style={styles.brandBox}>
        <Text style={styles.brandText}>
          By choosing to work with Coconut Stock Corporation or buy our
          products, you agree to these Terms and Conditions.
        </Text>
      </View>
    </ScrollView>
    // </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
    // paddingHorizontal: 16,
  },
  cardContainer: {
    backgroundColor: Colors.WHITE,
    overflow: 'hidden',
    marginBottom: 20,
    // borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  header: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 16,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 55 : 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: Colors.WHITE,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  content: {
    padding: 20,
    paddingBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.TEXT,
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: fontFamilyHeading,
  },
  lastUpdated: {
    fontSize: 14,
    color: Colors.textGray,
    marginBottom: 24,
    fontFamily: fontFamilyBody,
  },
  section: {
    marginBottom: 22,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.TEXT,
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER,
    fontFamily: fontFamilyHeading,
  },
  subSectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.TEXT,
    marginTop: 8,
    marginBottom: 8,
    fontFamily: fontFamilyHeading,
  },
  sectionText: {
    fontSize: 15,
    color: Colors.textGray,
    lineHeight: 24,
    marginBottom: 10,
    textAlign: 'left',
    fontFamily: fontFamilyBody,
  },
  bulletList: {
    marginLeft: 4,
    marginTop: 10,
    marginBottom: 4,
    paddingRight: 4,
  },
  bulletPoint: {
    fontSize: 14,
    color: Colors.textGray,
    lineHeight: 22,
    marginBottom: 10,
    paddingLeft: 4,
    textAlign: 'left',
    fontFamily: fontFamilyBody,
  },
  contactInfo: {
    marginTop: 12,
    marginLeft: 8,
  },
  contactText: {
    fontSize: 14,
    color: Colors.textGray,
    lineHeight: 22,
    marginBottom: 6,
    fontFamily: fontFamilyBody,
  },
  thankYouText: {
    marginTop: 8,
    marginBottom: 0,
    fontWeight: '600',
    color: Colors.TEXT,
    fontFamily: fontFamilyHeading,
  },
  brandBox: {
    backgroundColor: Colors.PRIMARY,
    borderRadius: 12,
    padding: 18,
    marginHorizontal: 10,
  },
  brandText: {
    fontSize: 14,
    color: Colors.WHITE,
    lineHeight: 22,
    textAlign: 'center',
    fontFamily: fontFamilyBody,
  },
});

export default TermsAndConditionsScreen;

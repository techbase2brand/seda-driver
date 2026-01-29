/**
 * Privacy Policy Screen
 * Displays privacy policy with same design as screenshots
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import Colors from '../constants/Color';

const PrivacyPolicyScreen = ({ navigation }) => {
  return (
    // <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Main Card Container */}
        <View style={styles.cardContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" size={20} color={Colors.WHITE} />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.title}>Privacy Policy</Text>

            {/* Section 1 - Introduction */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>1. Introduction</Text>
              <Text style={styles.sectionText}>
                Welcome to the Privacy Policy of Coconut Stock Corporation ("we," "our," or "us"). We are dedicated to ensuring the privacy and security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your data when you engage with our services. By accessing or using our website and products, you consent to the practices described herein.
              </Text>
            </View>

            {/* Section 2 - Information We Collect */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>2. Information We Collect</Text>
              <Text style={styles.sectionText}>
                We may collect the following categories of personal information from you:
              </Text>
              <View style={styles.bulletList}>
                <Text style={styles.bulletPoint}>• Contact Information: Your name, address, email address, phone number, and other relevant contact details.</Text>
                <Text style={styles.bulletPoint}>• Payment Information: Details necessary to process transactions, such as credit card information or other payment methods.</Text>
                <Text style={styles.bulletPoint}>• Usage Data: Information about how you interact with our website, products, and services, including browsing patterns, pages viewed, and time spent on our site.</Text>
                <Text style={styles.bulletPoint}>• Log Data: Automatically collected information, including IP address, browser type, operating system, and referring pages.</Text>
              </View>
            </View>

            {/* Section 3 - How We Use Your Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
              <Text style={styles.sectionText}>
                We use your information for various purposes, including but not limited to:
              </Text>
              <View style={styles.bulletList}>
                <Text style={styles.bulletPoint}>• Order Processing: To fulfill your orders, process payments, and deliver products to you.</Text>
                <Text style={styles.bulletPoint}>• Customer Support: To provide assistance and respond to inquiries, concerns, or requests.</Text>
                <Text style={styles.bulletPoint}>• Improvement: To enhance our products, services, and website based on user preferences and feedback.</Text>
                <Text style={styles.bulletPoint}>• Communication: To keep you informed about promotions, offers, updates, and relevant news.</Text>
              </View>
            </View>

            {/* Section 4 - Disclosure of Your Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>4. Disclosure of Your Information</Text>
              <Text style={styles.sectionText}>
                We may share your information under the following circumstances:
              </Text>
              <View style={styles.bulletList}>
                <Text style={styles.bulletPoint}>• Service Providers: We may engage third-party service providers to assist us in various aspects of our operations, such as payment processing, shipping, and customer support.</Text>
                <Text style={styles.bulletPoint}>• Legal Obligations: We may disclose your information in response to legal requests, court orders, government inquiries, or as required to comply with applicable laws.</Text>
                <Text style={styles.bulletPoint}>• Business Transfers: In the event of a merger, acquisition, sale, or transfer of assets, your information may be transferred to the relevant parties.</Text>
              </View>
            </View>

            {/* Section 5 - Your Choices */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>5. Your Choices</Text>
              <Text style={styles.sectionText}>
                You have certain rights regarding your personal information:
              </Text>
              <View style={styles.bulletList}>
                <Text style={styles.bulletPoint}>• Access and Update: You can access and update your personal information by contacting us directly.</Text>
                <Text style={styles.bulletPoint}>• Opt-Out: You have the option to unsubscribe from marketing communications at any time by following the instructions in our emails.</Text>
                <Text style={styles.bulletPoint}>• Object to Processing: You may object to certain processing activities, such as direct marketing.</Text>
              </View>
            </View>

            {/* Section 6 - Security */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>6. Security</Text>
              <Text style={styles.sectionText}>
                We don't collect or share any of your personal information through our website.
              </Text>
            </View>

            {/* Section 7 - Changes to this Privacy Policy */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>7. Changes to this Privacy Policy</Text>
              <Text style={styles.sectionText}>
                We may update this Privacy Policy to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes.
              </Text>
            </View>

            {/* Closing */}
            <View style={styles.section}>
              <Text style={styles.sectionText}>
                At Coconut Stock Corporation, we are committed to maintaining the confidentiality and security of your personal information. Your trust is paramount, and we strive to ensure that your data is handled with the utmost care. If you have any questions or require further clarification about our Privacy Policy, please don't hesitate to reach out to us. We value your partnership and appreciate the opportunity to serve you while safeguarding your privacy.
              </Text>
              <Text style={[styles.sectionText, styles.thankYouText]}>
                Thank you for choosing Coconut Stock Corporation.
              </Text>
            </View>
          </View>
        </View>

        {/* Disclaimer Box */}
        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerText}>
            By accessing or using our website and products, you consent to the practices described in this Privacy Policy.
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop:55
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
    fontSize: 22,
    fontWeight: '700',
    color: Colors.TEXT,
    marginBottom: 20,
    textAlign: 'center',
  },
  lastUpdated: {
    fontSize: 14,
    color: Colors.textGray,
    marginBottom: 24,
  },
  section: {
    marginBottom: 22,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.TEXT,
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER,
  },
  sectionText: {
    fontSize: 15,
    color: Colors.textGray,
    lineHeight: 24,
    marginBottom: 0,
    textAlign: 'left',
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
  },
  thankYouText: {
    marginTop: 12,
    fontWeight: '600',
    color: Colors.TEXT,
  },
  disclaimerBox: {
    backgroundColor: Colors.PRIMARY,
    borderRadius: 12,
    padding: 18,
    marginHorizontal: 10,
  },
  disclaimerText: {
    fontSize: 14,
    color: Colors.WHITE,
    lineHeight: 22,
    textAlign: 'center',
  },
});

export default PrivacyPolicyScreen;


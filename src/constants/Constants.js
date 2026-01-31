export const STRINGS = {
  DRIVER_PORTAL: 'Driver Portal',
  DELIVERY_LOGIN: 'Delivery Login',
  ACCESS_TEXT: 'Access your delivery assignments',
  EMAIL: 'Email',
  PASSWORD: 'Password',
  ENTER_EMAIL: 'Enter your email',
  ENTER_PASSWORD: 'Enter your password',
  LOGIN: 'Login to Driver Portal',
  EMAIL_REQUIRED: 'Email is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  PASSWORD_REQUIRED: 'Password is required',
  FORGOT_PASSWORD: 'Forgot Password?',
  SEND_OTP: 'Send OTP',
  ENTER_OTP: 'Enter 6-digit OTP',
  VERIFY_OTP: 'Verify OTP',
  RESEND_OTP: "Didn't receive OTP? Resend",
  NEW_PASSWORD: 'New Password',
  CONFIRM_PASSWORD: 'Confirm Password',
  RESET_PASSWORD: 'Reset Password',
};


export const ACTIVE_DELIVERIES = [
  {
    id: '1',
    orderNo: 'ORD-2025-005',
    customer: 'Martinez Trading Co.',
    contact: 'John Martinez',
    address: '123 Main Street, Downtown District, City, ST 12345',
    items: 'Fresh Coconuts',
    qty: '150 pcs',
  },
   {
    id: '2',
    orderNo: 'ORD-2025-006',
    customer: 'Martinez Trading Co.',
    contact: 'John Martinez',
    address: '123 Main Street, Downtown District, City, ST 12345',
    items: 'Fresh Coconuts',
    qty: '120 pcs',
  },
];

export const DELIVERY_SUMMARY = {
  area: 'Downtown District',
  date: 'Today',
  assigned: 2,
  inProgress: 1,
  delivered: 0,
};
import { Metadata } from 'next';
import { Shield, Lock, Eye, Database, UserCheck, Mail, Globe, AlertCircle } from 'lucide-react';

export const dynamic = 'force-static';
export const revalidate = 86400; // Revalidate once per day

export const metadata: Metadata = {
  title: 'Privacy Policy | KitchenOfTech',
  description: 'Learn how KitchenOfTech collects, uses, and protects your personal information. Our commitment to your privacy and data security.',
  openGraph: {
    title: 'Privacy Policy | KitchenOfTech',
    description: 'Learn how KitchenOfTech protects your privacy and personal information.',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
            <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Last Updated: February 4, 2026
          </p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Effective Date: February 4, 2026
          </p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-8">
          
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Globe className="w-6 h-6 text-blue-600" />
              Introduction
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Welcome to KitchenOfTech (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website{' '}
              <a href="https://kitchenoftech.org" className="text-blue-600 hover:underline">
                kitchenoftech.org
              </a>{' '}
              and use our services.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              By using our website and services, you agree to the collection and use of information in accordance with this Privacy Policy. If you do not agree with our policies and practices, please do not use our services.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Database className="w-6 h-6 text-purple-600" />
              Information We Collect
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  1. Personal Information You Provide
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                  We collect information that you voluntarily provide to us when you:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li>Register for an account or sign in using Facebook Login</li>
                  <li>Submit contact forms or meeting requests</li>
                  <li>Enroll in educational courses or services</li>
                  <li>Submit articles or content to our platform</li>
                  <li>Subscribe to newsletters or communications</li>
                  <li>Participate in surveys or promotions</li>
                  <li>Contact our support team</li>
                </ul>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
                  This may include:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li><strong>Contact Information:</strong> Name, email address, phone number</li>
                  <li><strong>Account Credentials:</strong> Username, password (encrypted)</li>
                  <li><strong>Facebook Data:</strong> Facebook ID, public profile information, email address (when using Facebook Login)</li>
                  <li><strong>Profile Information:</strong> Bio, profile picture, professional information</li>
                  <li><strong>Payment Information:</strong> Billing address, payment card details (processed securely through third-party payment processors)</li>
                  <li><strong>Educational Data:</strong> Course enrollments, progress, assignments, certifications</li>
                  <li><strong>Content:</strong> Articles, comments, reviews, portfolio items you submit</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  2. Information Automatically Collected
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                  When you visit our website, we automatically collect certain information about your device and browsing behavior:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li><strong>Device Information:</strong> IP address, browser type and version, device type, operating system</li>
                  <li><strong>Usage Data:</strong> Pages visited, time spent on pages, click data, referring URLs</li>
                  <li><strong>Cookies and Tracking:</strong> Session cookies, authentication tokens, analytics data</li>
                  <li><strong>Analytics:</strong> Google Analytics data, page views, user interactions</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  3. Information from Third Parties
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li><strong>Facebook:</strong> When you use Facebook Login, we receive your public profile information, email address, and Facebook ID</li>
                  <li><strong>Payment Processors:</strong> Transaction confirmation and payment status</li>
                  <li><strong>Service Providers:</strong> Data from email services, analytics providers, and hosting services</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-green-600" />
              How We Use Your Information
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              We use the information we collect for the following purposes:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li><strong>Service Delivery:</strong> Provide and maintain our services, process transactions, deliver courses and content</li>
              <li><strong>Authentication:</strong> Verify your identity and secure your account using Facebook Login or traditional authentication</li>
              <li><strong>Communication:</strong> Send you important updates, newsletters, promotional materials, and respond to inquiries</li>
              <li><strong>Personalization:</strong> Customize your experience, recommend relevant content and services</li>
              <li><strong>Analytics:</strong> Analyze usage patterns, improve our services, and understand user behavior</li>
              <li><strong>Security:</strong> Protect against fraud, unauthorized access, and security threats</li>
              <li><strong>Legal Compliance:</strong> Comply with legal obligations, resolve disputes, enforce our agreements</li>
              <li><strong>Marketing:</strong> Send promotional emails about new services, courses, or special offers (you can opt-out anytime)</li>
              <li><strong>Content Management:</strong> Display your authored articles, manage comments, and moderate user-generated content</li>
            </ul>
          </section>

          {/* Facebook Login Specific */}
          <section className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook Login & Data Usage
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              When you sign in with Facebook, we use Facebook&apos;s OAuth 2.0 authentication. Here&apos;s what happens:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li><strong>Data We Receive:</strong> Your public profile (name, profile picture), email address, and unique Facebook ID</li>
              <li><strong>Permissions Requested:</strong> public_profile, email</li>
              <li><strong>How We Use Facebook Data:</strong>
                <ul className="list-circle list-inside ml-6 mt-2 space-y-1">
                  <li>Create and authenticate your account</li>
                  <li>Display your name and profile picture on your articles and comments</li>
                  <li>Send you important account notifications via email</li>
                  <li>Associate your content (articles, comments) with your identity</li>
                </ul>
              </li>
              <li><strong>Data Storage:</strong> Your Facebook ID is stored securely in our database to maintain your account connection</li>
              <li><strong>No Posting:</strong> We do NOT post anything to your Facebook timeline or access your friends list</li>
              <li><strong>Facebook&apos;s Privacy:</strong> Facebook&apos;s own privacy policy governs how they handle your data. Review it at{' '}
                <a href="https://www.facebook.com/privacy/policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  facebook.com/privacy/policy
                </a>
              </li>
            </ul>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Eye className="w-6 h-6 text-orange-600" />
              How We Share Your Information
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              We may share your information in the following situations:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li><strong>Service Providers:</strong> Third-party vendors who help us operate our services (hosting, email, payments, analytics)</li>
              <li><strong>Payment Processors:</strong> To process payments securely</li>
              <li><strong>Legal Requirements:</strong> When required by law, court order, or government request</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, sale, or acquisition of our business</li>
              <li><strong>Public Content:</strong> Articles, comments, and profiles you choose to make public are visible to all users</li>
              <li><strong>With Your Consent:</strong> When you explicitly authorize us to share your information</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4 font-semibold">
              We do NOT sell your personal information to third parties.
            </p>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Lock className="w-6 h-6 text-red-600" />
              Data Security
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              We implement industry-standard security measures to protect your information:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li><strong>Encryption:</strong> SSL/TLS encryption for data in transit, encrypted storage for sensitive data</li>
              <li><strong>Authentication:</strong> Secure OAuth 2.0 with Facebook, JWT tokens for session management</li>
              <li><strong>Access Controls:</strong> Restricted access to personal data, role-based permissions</li>
              <li><strong>Regular Audits:</strong> Periodic security assessments and updates</li>
              <li><strong>Secure Infrastructure:</strong> Hosted on secure cloud platforms with regular backups</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              However, no method of transmission over the Internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
            </p>
          </section>

          {/* Cookies and Tracking */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
              Cookies and Tracking Technologies
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              We use cookies and similar tracking technologies to enhance your experience:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li><strong>Essential Cookies:</strong> Required for authentication and basic functionality</li>
              <li><strong>Analytics Cookies:</strong> Google Analytics to understand site usage</li>
              <li><strong>Advertising Cookies:</strong> Google AdSense for article monetization</li>
              <li><strong>Session Cookies:</strong> To maintain your login state (30-day duration)</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              You can control cookies through your browser settings. However, disabling cookies may limit functionality.
            </p>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-indigo-600" />
              Your Privacy Rights
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              Depending on your location, you may have the following rights:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal requirements)</li>
              <li><strong>Data Portability:</strong> Request transfer of your data to another service</li>
              <li><strong>Opt-Out:</strong> Unsubscribe from marketing emails at any time</li>
              <li><strong>Object:</strong> Object to processing of your information for certain purposes</li>
              <li><strong>Withdraw Consent:</strong> Withdraw consent for data processing where applicable</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              To exercise these rights, contact us at{' '}
              <a href="mailto:privacy@kitchenoftech.com" className="text-blue-600 hover:underline">
                privacy@kitchenoftech.com
              </a>
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Children&apos;s Privacy
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe we have collected information from a child under 13, please contact us immediately.
            </p>
          </section>

          {/* International Users */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              International Data Transfers
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy and applicable laws.
            </p>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Data Retention
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this Privacy Policy. When you delete your account, we will delete or anonymize your personal information, except where we are required to retain it for legal or legitimate business purposes.
            </p>
          </section>

          {/* Third-Party Links */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Third-Party Links
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies before providing any information.
            </p>
          </section>

          {/* Updates */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Changes to This Privacy Policy
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new Privacy Policy on this page and updating the &quot;Last Updated&quot; date. Continued use of our services after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Mail className="w-6 h-6 text-blue-600" />
              Contact Us
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="space-y-2 text-gray-700 dark:text-gray-300">
              <p><strong>Email:</strong>{' '}
                <a href="mailto:privacy@kitchenoftech.com" className="text-blue-600 hover:underline">
                  privacy@kitchenoftech.com
                </a>
              </p>
              <p><strong>Website:</strong>{' '}
                <a href="https://kitchenoftech.org" className="text-blue-600 hover:underline">
                  kitchenoftech.org
                </a>
              </p>
              <p><strong>Address:</strong> KitchenOfTech, [Your Business Address]</p>
            </div>
          </section>

          {/* GDPR / CCPA Notice */}
          <section className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Additional Information for EU/EEA Users (GDPR)
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              If you are located in the European Union or European Economic Area, you have additional rights under the General Data Protection Regulation (GDPR), including the right to lodge a complaint with your local data protection authority.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              <strong>Legal Basis for Processing:</strong> We process your data based on consent, contractual necessity, legal obligations, and legitimate interests.
            </p>
          </section>

          <section className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              California Residents (CCPA)
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              California residents have specific rights under the California Consumer Privacy Act (CCPA), including the right to know what personal information is collected, the right to delete personal information, and the right to opt-out of the sale of personal information. We do not sell personal information.
            </p>
          </section>

        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Read our{' '}
            <a href="/terms" className="text-blue-600 hover:underline font-semibold">
              Terms of Service
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

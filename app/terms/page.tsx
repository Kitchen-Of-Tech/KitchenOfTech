import { Metadata } from 'next';
import { FileText, Scale, Users, ShieldAlert, Ban, DollarSign, AlertTriangle, Mail } from 'lucide-react';

export const dynamic = 'force-static';
export const revalidate = 86400; // Revalidate once per day

export const metadata: Metadata = {
  title: 'Terms of Service | KitchenOfTech',
  description: 'Read the Terms of Service for KitchenOfTech. Understand your rights, responsibilities, and our policies when using our platform and services.',
  openGraph: {
    title: 'Terms of Service | KitchenOfTech',
    description: 'Terms of Service and user agreement for KitchenOfTech platform.',
  },
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-4">
            <Scale className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Terms of Service
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
              <FileText className="w-6 h-6 text-purple-600" />
              Agreement to Terms
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Welcome to KitchenOfTech! These Terms of Service (&quot;Terms&quot;, &quot;Agreement&quot;) govern your access to and use of the KitchenOfTech website, services, and applications (collectively, the &quot;Service&quot;) operated by KitchenOfTech (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;).
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of these Terms, you may not access the Service.
            </p>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Important:</strong> Please read these Terms carefully before using our Service. Your continued use of the Service constitutes acceptance of these Terms and any future modifications.
              </p>
            </div>
          </section>

          {/* Accounts */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              Account Registration and Use
            </h2>
            
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              1. Account Creation
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>You must be at least 13 years old to create an account</li>
              <li>You may create an account using Facebook Login or traditional registration</li>
              <li>You must provide accurate, current, and complete information</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials</li>
              <li>You are responsible for all activities that occur under your account</li>
              <li>You must notify us immediately of any unauthorized use of your account</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              2. Facebook Login
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              When you use Facebook Login:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>You authorize us to access certain Facebook account information (public profile, email)</li>
              <li>You agree to Facebook&apos;s Terms of Service and Privacy Policy</li>
              <li>Your Facebook ID will be associated with your KitchenOfTech account</li>
              <li>We will use your Facebook profile picture and name for your account</li>
              <li>You can disconnect your Facebook account at any time through account settings</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              3. Account Termination
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              We reserve the right to suspend or terminate your account if:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>You violate these Terms</li>
              <li>You engage in fraudulent or illegal activities</li>
              <li>You abuse or harass other users</li>
              <li>Your account has been inactive for an extended period</li>
              <li>We are required to do so by law</li>
            </ul>
          </section>

          {/* User Content */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6 text-green-600" />
              User Content and Conduct
            </h2>
            
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              1. Your Content
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              You may submit articles, comments, reviews, and other content (&quot;User Content&quot;) to our Service. By submitting User Content:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>You retain ownership of your content</li>
              <li>You grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, publish, and distribute your content</li>
              <li>You represent that you have all necessary rights to submit the content</li>
              <li>You are responsible for the accuracy and legality of your content</li>
              <li>We may review, edit, or remove content that violates these Terms</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              2. Prohibited Content
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              You agree NOT to submit content that:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>Is illegal, harmful, threatening, abusive, harassing, or defamatory</li>
              <li>Infringes on intellectual property rights of others</li>
              <li>Contains viruses, malware, or harmful code</li>
              <li>Is spam, advertising, or promotional without authorization</li>
              <li>Contains hate speech, discrimination, or violence</li>
              <li>Is sexually explicit or pornographic</li>
              <li>Violates privacy rights of others</li>
              <li>Impersonates any person or entity</li>
              <li>Contains false or misleading information</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              3. Content Moderation
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We reserve the right to review, monitor, edit, or remove any User Content at our sole discretion. We may also ban users who repeatedly violate content policies.
            </p>
          </section>

          {/* Services */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-yellow-600" />
              Services and Payments
            </h2>
            
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              1. Service Offerings
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              KitchenOfTech offers various services including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>Educational courses and training programs</li>
              <li>Web development and technology services</li>
              <li>Team member hiring and collaboration</li>
              <li>Article publishing platform</li>
              <li>Portfolio showcase and networking</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              2. Payments and Pricing
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>Some services require payment as specified on our website</li>
              <li>All prices are in the currency displayed at checkout</li>
              <li>Payments are processed securely through third-party payment processors</li>
              <li>You are responsible for all applicable taxes</li>
              <li>We reserve the right to change pricing with reasonable notice</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              3. Refunds and Cancellations
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              Our refund policy varies by service:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li><strong>Educational Courses:</strong> Refunds available within 7 days of purchase if less than 20% completed</li>
              <li><strong>Services:</strong> Refund eligibility depends on project stage and agreement terms</li>
              <li><strong>Subscriptions:</strong> Cancel anytime; no refunds for partial periods</li>
              <li>Contact us at support@kitchenoftech.com for refund requests</li>
            </ul>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-red-600" />
              Intellectual Property Rights
            </h2>
            
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              1. Our Content
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              The Service and its original content (excluding User Content), features, and functionality are owned by KitchenOfTech and are protected by:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>Copyright, trademark, patent, trade secret, and other intellectual property laws</li>
              <li>You may not copy, modify, distribute, sell, or lease any part of our Service</li>
              <li>You may not reverse engineer or attempt to extract source code</li>
              <li>Our trademarks and logos may not be used without written permission</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              2. Copyright Infringement
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              If you believe your work has been copied in a way that constitutes copyright infringement, please contact us at{' '}
              <a href="mailto:copyright@kitchenoftech.com" className="text-blue-600 hover:underline">
                copyright@kitchenoftech.com
              </a>{' '}
              with detailed information.
            </p>
          </section>

          {/* Disclaimers */}
          <section className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              Disclaimers and Limitations
            </h2>
            
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              1. Service &quot;As Is&quot;
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>Warranties of merchantability, fitness for a particular purpose</li>
              <li>Non-infringement or course of performance</li>
              <li>Uninterrupted, timely, secure, or error-free access</li>
              <li>Accuracy, reliability, or quality of any content or information</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">
              2. Limitation of Liability
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, KITCHENOFTECH SHALL NOT BE LIABLE FOR:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>Indirect, incidental, special, consequential, or punitive damages</li>
              <li>Loss of profits, revenue, data, or use</li>
              <li>Damages resulting from unauthorized access or alteration of data</li>
              <li>Statements or conduct of any third party on the Service</li>
              <li>Any other matter relating to the Service</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
              Our total liability shall not exceed the amount you paid us in the past 12 months, or $100, whichever is greater.
            </p>
          </section>

          {/* Third Parties */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Third-Party Services
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              Our Service may contain links to third-party websites, services, or integrations including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>Facebook Login and authentication</li>
              <li>Payment processors (Stripe, PayPal, etc.)</li>
              <li>Analytics services (Google Analytics)</li>
              <li>Advertising networks (Google AdSense)</li>
              <li>Email services</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              We are not responsible for the content, privacy policies, or practices of third-party services. Your use of third-party services is at your own risk.
            </p>
          </section>

          {/* Prohibited Uses */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Ban className="w-6 h-6 text-red-600" />
              Prohibited Uses
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              You agree NOT to use the Service to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>Violate any applicable laws or regulations</li>
              <li>Impersonate or misrepresent affiliation with any person or entity</li>
              <li>Upload viruses, malware, or other malicious code</li>
              <li>Spam, phish, or send unsolicited messages</li>
              <li>Scrape, crawl, or harvest data without permission</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Bypass security measures or authentication</li>
              <li>Engage in any automated use without written permission</li>
              <li>Collect or track personal information of other users</li>
              <li>Use the Service for any illegal or unauthorized purpose</li>
            </ul>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Termination
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>Breach of these Terms</li>
              <li>Request by law enforcement or government agency</li>
              <li>Discontinuation or modification of the Service</li>
              <li>Unexpected technical or security issues</li>
              <li>Extended periods of inactivity</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              Upon termination, your right to use the Service will immediately cease. All provisions that should survive termination shall survive, including ownership provisions, warranty disclaimers, and limitations of liability.
            </p>
          </section>

          {/* Indemnification */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Indemnification
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              You agree to defend, indemnify, and hold harmless KitchenOfTech, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including attorneys&apos; fees) arising from:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4 mt-3">
              <li>Your use of the Service</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any rights of another party</li>
              <li>Your User Content</li>
            </ul>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Governing Law and Dispute Resolution
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to conflict of law provisions.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              Any disputes arising from these Terms or the Service shall be resolved through:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li><strong>Informal Resolution:</strong> We encourage you to contact us first to resolve disputes informally</li>
              <li><strong>Arbitration:</strong> If informal resolution fails, disputes will be resolved through binding arbitration</li>
              <li><strong>Class Action Waiver:</strong> You agree to resolve disputes individually, not as part of a class action</li>
            </ul>
          </section>

          {/* Changes */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Changes to Terms
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify users of significant changes by:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4 mt-3">
              <li>Posting the new Terms on this page</li>
              <li>Updating the &quot;Last Updated&quot; date</li>
              <li>Sending an email notification (for material changes)</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              Your continued use of the Service after changes constitutes acceptance of the modified Terms.
            </p>
          </section>

          {/* Severability */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Severability and Waiver
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              <strong>Severability:</strong> If any provision of these Terms is held to be invalid or unenforceable, the remaining provisions will continue in full force and effect.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              <strong>Waiver:</strong> Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
            </p>
          </section>

          {/* Entire Agreement */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Entire Agreement
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              These Terms, together with our Privacy Policy and any other legal notices published by us, constitute the entire agreement between you and KitchenOfTech regarding the Service and supersede all prior agreements and understandings.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Mail className="w-6 h-6 text-purple-600" />
              Contact Information
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              If you have questions about these Terms, please contact us:
            </p>
            <div className="space-y-2 text-gray-700 dark:text-gray-300">
              <p><strong>Email:</strong>{' '}
                <a href="mailto:legal@kitchenoftech.com" className="text-blue-600 hover:underline">
                  legal@kitchenoftech.com
                </a>
              </p>
              <p><strong>Support:</strong>{' '}
                <a href="mailto:support@kitchenoftech.com" className="text-blue-600 hover:underline">
                  support@kitchenoftech.com
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

          {/* Acknowledgment */}
          <section className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Acknowledgment
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              BY USING THE SERVICE, YOU ACKNOWLEDGE THAT YOU HAVE READ THESE TERMS OF SERVICE AND AGREE TO BE BOUND BY THEM.
            </p>
          </section>

        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Read our{' '}
            <a href="/privacy" className="text-blue-600 hover:underline font-semibold">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

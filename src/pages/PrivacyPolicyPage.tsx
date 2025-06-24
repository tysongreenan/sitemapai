import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Mail, Globe } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors">
              <ArrowLeft size={20} />
              <span className="font-medium">Back to Home</span>
            </Link>
            <div className="flex items-center gap-2">
              <Shield size={20} className="text-gray-600" />
              <span className="text-sm text-gray-600">Last updated: December 2024</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-12">
          {/* Title */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
            <p className="text-xl text-gray-600">
              How we collect, use, and protect your information
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Effective Date: December 1, 2024</h3>
              <p className="text-blue-800 text-sm">
                This Privacy Policy describes how SiteMapAI ("we," "our," or "us") collects, uses, and shares your personal information when you use our AI-powered marketing platform.
              </p>
            </div>

            <h2>1. Information We Collect</h2>
            
            <h3>1.1 Information You Provide</h3>
            <ul>
              <li><strong>Account Information:</strong> Email address, password, and profile information</li>
              <li><strong>Content Data:</strong> Projects, marketing content, brand voice settings, and knowledge base uploads</li>
              <li><strong>Communication:</strong> Messages sent through our support channels</li>
              <li><strong>Payment Information:</strong> Billing details processed through secure third-party payment processors</li>
            </ul>

            <h3>1.2 Information We Collect Automatically</h3>
            <ul>
              <li><strong>Usage Data:</strong> How you interact with our platform, features used, and time spent</li>
              <li><strong>Device Information:</strong> Browser type, operating system, IP address, and device identifiers</li>
              <li><strong>Analytics Data:</strong> Performance metrics and user behavior patterns</li>
              <li><strong>Cookies:</strong> Small data files stored on your device to enhance functionality</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            
            <p>We use your information to:</p>
            <ul>
              <li>Provide and improve our AI marketing platform services</li>
              <li>Generate personalized content based on your brand voice and preferences</li>
              <li>Process payments and manage your account</li>
              <li>Send important updates about our services</li>
              <li>Provide customer support and respond to inquiries</li>
              <li>Analyze usage patterns to enhance user experience</li>
              <li>Ensure platform security and prevent fraud</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2>3. AI Content Processing</h2>
            
            <p>Our AI systems process your content to:</p>
            <ul>
              <li>Generate marketing materials based on your inputs</li>
              <li>Learn your brand voice and writing style</li>
              <li>Provide personalized content recommendations</li>
              <li>Improve our AI models (using anonymized data only)</li>
            </ul>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 my-6">
              <p className="text-yellow-800 text-sm">
                <strong>Important:</strong> We do not use your proprietary content to train AI models for other users. Your brand voice and knowledge base remain private to your account.
              </p>
            </div>

            <h2>4. Information Sharing</h2>
            
            <p>We may share your information with:</p>
            <ul>
              <li><strong>Service Providers:</strong> Third-party vendors who help us operate our platform (hosting, analytics, payment processing)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
              <li><strong>Business Transfers:</strong> In connection with mergers, acquisitions, or asset sales</li>
            </ul>
            
            <p><strong>We do not sell your personal information to third parties.</strong></p>

            <h2>5. Data Security</h2>
            
            <p>We implement industry-standard security measures including:</p>
            <ul>
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security audits and monitoring</li>
              <li>Access controls and authentication requirements</li>
              <li>Secure data centers with physical security measures</li>
            </ul>

            <h2>6. Data Retention</h2>
            
            <p>We retain your information for as long as:</p>
            <ul>
              <li>Your account remains active</li>
              <li>Necessary to provide our services</li>
              <li>Required by law or for legitimate business purposes</li>
            </ul>
            
            <p>You can request deletion of your account and associated data at any time.</p>

            <h2>7. Your Rights</h2>
            
            <p>Depending on your location, you may have the right to:</p>
            <ul>
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Delete your personal information</li>
              <li>Restrict or object to processing</li>
              <li>Data portability</li>
              <li>Withdraw consent</li>
            </ul>

            <h2>8. International Data Transfers</h2>
            
            <p>Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with applicable laws.</p>

            <h2>9. Children's Privacy</h2>
            
            <p>Our services are not intended for children under 13. We do not knowingly collect personal information from children under 13. If we become aware of such collection, we will delete the information immediately.</p>

            <h2>10. Changes to This Policy</h2>
            
            <p>We may update this Privacy Policy periodically. We will notify you of material changes by email or through our platform. Your continued use of our services after changes become effective constitutes acceptance of the updated policy.</p>

            <h2>11. Contact Us</h2>
            
            <p>If you have questions about this Privacy Policy or our data practices, please contact us:</p>
            
            <div className="bg-gray-50 rounded-lg p-6 mt-6">
              <div className="flex items-center gap-3 mb-4">
                <Mail className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">Contact Information</span>
              </div>
              <ul className="space-y-2 text-gray-700">
                <li><strong>Email:</strong> privacy@sitemapai.com</li>
                <li><strong>Address:</strong> SiteMapAI Privacy Team, [Your Business Address]</li>
                <li><strong>Data Protection Officer:</strong> dpo@sitemapai.com</li>
              </ul>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="text-sm text-gray-600">
                This policy is effective as of December 1, 2024
              </div>
              <div className="flex gap-3">
                <Button variant="outline" as={Link} to="/terms-of-service">
                  View Terms of Service
                </Button>
                <Button variant="primary" as={Link} to="/signup">
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
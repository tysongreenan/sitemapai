import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function TermsOfServicePage() {
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
              <FileText size={20} className="text-gray-600" />
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
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
            <p className="text-xl text-gray-600">
              Your agreement to use our AI marketing platform
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Effective Date: December 1, 2024</h3>
              <p className="text-blue-800 text-sm">
                These Terms of Service ("Terms") govern your use of SiteMapAI's AI-powered marketing platform. By using our services, you agree to these Terms.
              </p>
            </div>

            <h2>1. Acceptance of Terms</h2>
            
            <p>By accessing or using SiteMapAI ("Service," "Platform," "we," "us," or "our"), you agree to be bound by these Terms. If you disagree with any part of these Terms, you may not access the Service.</p>

            <h2>2. Description of Service</h2>
            
            <p>SiteMapAI is an AI-powered marketing platform that provides:</p>
            <ul>
              <li>AI content generation for marketing materials</li>
              <li>Brand voice customization and management</li>
              <li>Marketing project organization and collaboration</li>
              <li>Integration with marketing platforms and analytics</li>
              <li>Knowledge base management for AI training</li>
            </ul>

            <h2>3. User Accounts</h2>
            
            <h3>3.1 Account Creation</h3>
            <ul>
              <li>You must provide accurate and complete information</li>
              <li>You are responsible for maintaining account security</li>
              <li>You must be at least 18 years old to create an account</li>
              <li>One person or entity may not maintain multiple accounts</li>
            </ul>

            <h3>3.2 Account Responsibilities</h3>
            <ul>
              <li>Keep your login credentials secure</li>
              <li>Notify us immediately of unauthorized access</li>
              <li>You are responsible for all activities under your account</li>
              <li>Provide accurate billing and contact information</li>
            </ul>

            <h2>4. Acceptable Use</h2>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 my-6">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">Permitted Uses</span>
              </div>
              <ul className="text-green-800 text-sm space-y-1">
                <li>• Creating marketing content for legitimate business purposes</li>
                <li>• Collaborating with team members on marketing projects</li>
                <li>• Integrating with your existing marketing tools and platforms</li>
                <li>• Using AI-generated content in your marketing campaigns</li>
              </ul>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-6">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="font-medium text-red-900">Prohibited Uses</span>
              </div>
              <ul className="text-red-800 text-sm space-y-1">
                <li>• Creating harmful, illegal, or misleading content</li>
                <li>• Violating intellectual property rights</li>
                <li>• Attempting to reverse engineer our AI models</li>
                <li>• Sharing account credentials with unauthorized users</li>
                <li>• Using the service to compete with SiteMapAI</li>
                <li>• Generating spam or unsolicited communications</li>
                <li>• Creating content that violates applicable laws</li>
              </ul>
            </div>

            <h2>5. Content and Intellectual Property</h2>
            
            <h3>5.1 Your Content</h3>
            <ul>
              <li>You retain ownership of content you upload or create</li>
              <li>You grant us license to process your content to provide our services</li>
              <li>You are responsible for ensuring you have rights to uploaded content</li>
              <li>You warrant that your content doesn't violate third-party rights</li>
            </ul>

            <h3>5.2 AI-Generated Content</h3>
            <ul>
              <li>You own the AI-generated content created through our platform</li>
              <li>AI-generated content is provided "as is" without warranties</li>
              <li>You are responsible for reviewing and editing AI-generated content</li>
              <li>We recommend fact-checking all AI-generated information</li>
            </ul>

            <h3>5.3 Our Intellectual Property</h3>
            <ul>
              <li>SiteMapAI platform, AI models, and technology remain our property</li>
              <li>You may not copy, modify, or distribute our proprietary technology</li>
              <li>Our trademarks and branding are protected intellectual property</li>
            </ul>

            <h2>6. Payment Terms</h2>
            
            <h3>6.1 Subscription Plans</h3>
            <ul>
              <li>Subscription fees are billed in advance</li>
              <li>All fees are non-refundable unless required by law</li>
              <li>We may change pricing with 30 days notice</li>
              <li>Taxes may apply based on your location</li>
            </ul>

            <h3>6.2 Free Trial</h3>
            <ul>
              <li>Free trials are limited to one per user/organization</li>
              <li>Trial limitations may apply to features or usage</li>
              <li>Trials automatically convert to paid plans unless cancelled</li>
            </ul>

            <h2>7. Privacy and Data Protection</h2>
            
            <p>Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information. By using our Service, you agree to our Privacy Policy.</p>

            <h2>8. Service Availability</h2>
            
            <ul>
              <li>We strive for 99.9% uptime but cannot guarantee uninterrupted service</li>
              <li>Scheduled maintenance will be announced in advance when possible</li>
              <li>We are not liable for service interruptions beyond our control</li>
              <li>AI response times may vary based on system load</li>
            </ul>

            <h2>9. Limitation of Liability</h2>
            
            <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW:</p>
            <ul>
              <li>Our liability is limited to the amount you paid in the last 12 months</li>
              <li>We are not liable for indirect, incidental, or consequential damages</li>
              <li>You use our service at your own risk</li>
              <li>We provide the service "as is" without warranties</li>
            </ul>

            <h2>10. Indemnification</h2>
            
            <p>You agree to indemnify and hold us harmless from claims arising from:</p>
            <ul>
              <li>Your use of our service</li>
              <li>Your content or AI-generated content</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of third-party rights</li>
            </ul>

            <h2>11. Termination</h2>
            
            <h3>11.1 By You</h3>
            <ul>
              <li>You may cancel your subscription at any time</li>
              <li>Cancellation takes effect at the end of your billing period</li>
              <li>You can export your data before termination</li>
            </ul>

            <h3>11.2 By Us</h3>
            <ul>
              <li>We may suspend or terminate accounts for Terms violations</li>
              <li>We may discontinue the service with 30 days notice</li>
              <li>We will provide data export opportunities when possible</li>
            </ul>

            <h2>12. Dispute Resolution</h2>
            
            <p>Any disputes will be resolved through:</p>
            <ul>
              <li>Good faith negotiations first</li>
              <li>Binding arbitration if negotiations fail</li>
              <li>Arbitration conducted under [Applicable Arbitration Rules]</li>
              <li>Governing law: [Your Jurisdiction]</li>
            </ul>

            <h2>13. Changes to Terms</h2>
            
            <p>We may modify these Terms at any time. We will:</p>
            <ul>
              <li>Notify you of material changes via email or platform notice</li>
              <li>Provide at least 30 days notice for significant changes</li>
              <li>Post the effective date of any changes</li>
              <li>Consider continued use as acceptance of new Terms</li>
            </ul>

            <h2>14. Contact Information</h2>
            
            <p>For questions about these Terms, please contact us:</p>
            
            <div className="bg-gray-50 rounded-lg p-6 mt-6">
              <div className="space-y-2 text-gray-700">
                <p><strong>Email:</strong> legal@sitemapai.com</p>
                <p><strong>Address:</strong> SiteMapAI Legal Department, [Your Business Address]</p>
                <p><strong>Support:</strong> support@sitemapai.com</p>
              </div>
            </div>

            <h2>15. Severability</h2>
            
            <p>If any provision of these Terms is found unenforceable, the remaining provisions will continue in full force and effect.</p>
          </div>

          {/* Footer Actions */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="text-sm text-gray-600">
                These terms are effective as of December 1, 2024
              </div>
              <div className="flex gap-3">
                <Button variant="outline" as={Link} to="/privacy-policy">
                  View Privacy Policy
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
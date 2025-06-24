import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trash2, AlertTriangle, CheckCircle, Mail, Shield, Clock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function UserDataDeletionPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    email: user?.email || '',
    reason: '',
    confirmEmail: '',
    confirmDeletion: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.email || !formData.confirmEmail) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (formData.email !== formData.confirmEmail) {
      toast.error('Email addresses do not match');
      return;
    }
    
    if (!formData.confirmDeletion) {
      toast.error('Please confirm that you understand the consequences of data deletion');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // In a real implementation, this would send the deletion request to your backend
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would typically:
      // 1. Send an email to the user confirming the request
      // 2. Create a deletion request in your database
      // 3. Start the data deletion process (usually with a grace period)
      
      setIsSubmitted(true);
      toast.success('Data deletion request submitted successfully');
    } catch (error) {
      toast.error('Failed to submit deletion request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <Link to="/" className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors">
              <ArrowLeft size={20} />
              <span className="font-medium">Back to Home</span>
            </Link>
          </div>
        </div>

        {/* Success Content */}
        <div className="max-w-2xl mx-auto px-6 py-12">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Data Deletion Request Submitted
            </h1>
            
            <p className="text-gray-600 mb-6">
              We have received your request to delete your personal data. Here's what happens next:
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6 text-left">
              <h3 className="font-semibold text-blue-900 mb-4">Next Steps:</h3>
              <div className="space-y-3 text-blue-800 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-900 text-xs font-bold">1</span>
                  </div>
                  <div>
                    <strong>Email Confirmation (Within 24 hours)</strong>
                    <p>You'll receive a confirmation email at {formData.email}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-900 text-xs font-bold">2</span>
                  </div>
                  <div>
                    <strong>Grace Period (30 days)</strong>
                    <p>Your account will be deactivated but data preserved in case you change your mind</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-900 text-xs font-bold">3</span>
                  </div>
                  <div>
                    <strong>Permanent Deletion (After 30 days)</strong>
                    <p>All your personal data will be permanently deleted from our systems</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-yellow-900">Important</span>
              </div>
              <p className="text-yellow-800 text-sm">
                You can cancel this request within 30 days by contacting our support team at support@sitemapai.com
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" as={Link} to="/">
                Return to Home
              </Button>
              <Button variant="primary" as={Link} to="/privacy-policy">
                View Privacy Policy
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              <Trash2 size={20} className="text-gray-600" />
              <span className="text-sm text-gray-600">Data Deletion Request</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {/* Title */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Trash2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Delete My Data</h1>
            <p className="text-lg text-gray-600">
              Request permanent deletion of your personal information
            </p>
          </div>

          {/* Warning */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 mb-2">Important: This action cannot be undone</h3>
                <div className="text-red-800 text-sm space-y-2">
                  <p>Submitting this request will permanently delete:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Your account and profile information</li>
                    <li>All projects and marketing content</li>
                    <li>Brand voice settings and knowledge base</li>
                    <li>Usage history and analytics data</li>
                    <li>Any saved preferences or settings</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email address"
                required
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                This must match the email address associated with your account
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Email Address
              </label>
              <Input
                type="email"
                value={formData.confirmEmail}
                onChange={(e) => handleInputChange('confirmEmail', e.target.value)}
                placeholder="Confirm your email address"
                required
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Deletion (Optional)
              </label>
              <Textarea
                value={formData.reason}
                onChange={(e) => handleInputChange('reason', e.target.value)}
                placeholder="Help us improve by telling us why you're deleting your data..."
                rows={4}
                className="w-full"
              />
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">What happens after you submit this request:</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-start gap-2">
                  <span className="font-medium text-blue-600">1.</span>
                  <span>We'll send a confirmation email within 24 hours</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium text-blue-600">2.</span>
                  <span>Your account will be immediately deactivated</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium text-blue-600">3.</span>
                  <span>You'll have 30 days to cancel this request if you change your mind</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium text-blue-600">4.</span>
                  <span>After 30 days, all your data will be permanently deleted</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="confirmDeletion"
                checked={formData.confirmDeletion}
                onChange={(e) => handleInputChange('confirmDeletion', e.target.checked)}
                className="mt-1"
                required
              />
              <label htmlFor="confirmDeletion" className="text-sm text-gray-700">
                I understand that this action will permanently delete all my data and cannot be undone. 
                I acknowledge that I have read and understand the consequences of this request.
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.history.back()}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                className="flex-1 bg-red-600 hover:bg-red-700 focus:ring-red-500"
                disabled={!formData.confirmDeletion}
              >
                {isSubmitting ? 'Submitting Request...' : 'Delete My Data'}
              </Button>
            </div>
          </form>

          {/* Contact Info */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <Mail className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">Need Help?</span>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              If you have questions about data deletion or need assistance, contact our privacy team:
            </p>
            <div className="text-sm text-gray-700">
              <p><strong>Email:</strong> privacy@sitemapai.com</p>
              <p><strong>Data Protection Officer:</strong> dpo@sitemapai.com</p>
            </div>
          </div>

          {/* Legal Links */}
          <div className="mt-6 pt-4 border-t border-gray-200 text-center">
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link to="/privacy-policy" className="text-indigo-600 hover:text-indigo-800">
                Privacy Policy
              </Link>
              <Link to="/terms-of-service" className="text-indigo-600 hover:text-indigo-800">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { X, Copy, Download, Edit3 } from 'lucide-react';
import { Button } from '../ui/Button';
import ReactMarkdown from 'react-markdown';
import { toast } from 'react-toastify';

interface ContentDisplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

export function ContentDisplayModal({ isOpen, onClose, title, content }: ContentDisplayModalProps) {
  if (!isOpen) return null;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    toast.success('Content copied to clipboard!');
  };

  const downloadContent = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Content downloaded!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold text-gray-900 truncate">{title}</h2>
            <p className="text-sm text-gray-600 mt-1">
              {content.length} characters • {Math.ceil(content.split(' ').length / 200)} min read
            </p>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              leftIcon={<Copy size={16} />}
            >
              Copy
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadContent}
              leftIcon={<Download size={16} />}
            >
              Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info('Edit functionality coming soon!')}
              leftIcon={<Edit3 size={16} />}
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2"
            >
              <X size={20} />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="prose prose-lg max-w-none">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            Use the buttons above to copy, download, or edit this content
          </div>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { useProject } from '../../context/ProjectContext';
import { AuthModal } from '../auth/AuthModal';
import { validateUrl, validateDescription } from '../../lib/validation';
import { AppErrorHandler } from '../../lib/errorHandling';

type FormValues = {
  description: string;
  url?: string;
};

export function HeroSection() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createProject } = useProject();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, setError } = useForm<FormValues>({
    defaultValues: {
      description: '',
      url: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    // Validate inputs
    const urlValidation = validateUrl(data.url || '');
    if (!urlValidation.isValid) {
      setError('url', { message: urlValidation.error });
      return;
    }

    const descValidation = validateDescription(data.description);
    if (!descValidation.isValid) {
      setError('description', { message: descValidation.error });
      return;
    }

    setIsLoading(true);
    try {
      const title = data.url 
        ? `Sitemap for ${data.url}` 
        : `New Sitemap ${new Date().toLocaleDateString()}`;
      
      const project = await createProject(title, data.description);
      
      if (project) {
        navigate(`/editor/${project.id}`);
      }
    } catch (error) {
      AppErrorHandler.handle(error, { 
        context: 'HeroSection.onSubmit',
        formData: data 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center py-20 px-4 sm:px-6 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white"></div>
        <div className="absolute top-1/3 -right-24 w-80 h-80 rounded-full bg-white"></div>
        <div className="absolute -bottom-24 left-1/3 w-72 h-72 rounded-full bg-white"></div>
      </div>

      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col items-center text-center mb-12">
          <div className="animate-float">
            <Globe size={64} className="text-white mb-6" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Websites designed & built faster with AI
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-4xl">
            Transform your ideas into professional sitemaps in seconds. 
            Get started with a simple description or website URL.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 max-w-4xl mx-auto transform transition-all duration-500 hover:shadow-3xl">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Describe your website
                </label>
                <Textarea
                  id="description"
                  placeholder="A portfolio website for a digital artist featuring galleries, bio, and contact form..."
                  className="min-h-[120px]"
                  error={errors.description?.message}
                  {...register('description', { 
                    required: 'Description is required',
                    minLength: { 
                      value: 10, 
                      message: 'Description should be at least 10 characters'
                    } 
                  })}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                  Or enter an existing website URL
                </label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com"
                  leftIcon={<Globe size={18} />}
                  error={errors.url?.message}
                  {...register('url')}
                />
                
                <div className="mt-4 pt-2">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    isLoading={isLoading}
                  >
                    Generate Sitemap
                  </Button>
                </div>
                
                <p className="text-sm text-gray-500 mt-4 text-center">
                  700k+ Designers & Developers trust our platform
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </section>
  );
}
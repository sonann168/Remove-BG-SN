import React, { useState, useCallback, useMemo } from 'react';
import { ImageUpload } from '@/components/ImageUpload';
import { ImageComparison } from '@/components/ImageComparison';
import { ProcessingStatus } from '@/components/ProcessingStatus';
import { FloatingPixels } from '@/components/FloatingPixels';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useLanguageContext, getAnimationClass } from '@/contexts/LanguageContext';
import { trpc } from '@/lib/trpc';
import { Download, History, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { getTranslation } from '@/lib/i18n';

interface ProcessingImage {
  id: string;
  originalUrl: string;
  processedUrl?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  errorMessage?: string;
  processingTime?: number;
  fileName: string;
}

export default function Home() {
  const [processingImages, setProcessingImages] = useState<ProcessingImage[]>([]);
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side'>('slider');
  const [showHistory, setShowHistory] = useState(false);
  const { language, isTransitioning, animationType } = useLanguageContext();

  const t = useMemo(() => {
    return (key: keyof typeof getTranslation.arguments[1]) => {
      return getTranslation(language, key as any);
    };
  }, [language]);

  const uploadOriginalMutation = trpc.image.uploadOriginal.useMutation();
  const removeBackgroundMutation = trpc.image.removeBackground.useMutation();
  const historyQuery = trpc.image.getHistory.useQuery({ limit: 20 });

  const handleUpload = useCallback(async (files: File[]) => {
    for (const file of files) {
      const fileId = Math.random().toString(36).substring(7);
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        
        // Add to processing queue with preview
        setProcessingImages(prev => [...prev, {
          id: fileId,
          originalUrl: dataUrl,
          status: 'processing',
          progress: 10,
          fileName: file.name,
        }]);

        let progressInterval: NodeJS.Timeout | null = null;
        try {
          // Step 1: Upload original image to S3
          let progress = 20;
          progressInterval = setInterval(() => {
            progress = Math.min(progress + Math.random() * 15, 50);
            setProcessingImages(prev => 
              prev.map(img => 
                img.id === fileId ? { ...img, progress: Math.round(progress) } : img
              )
            );
          }, 300);

          const uploadResult = await uploadOriginalMutation.mutateAsync({
            base64Data: dataUrl,
            fileName: file.name,
            mimeType: file.type || 'image/jpeg',
          });

          if (!uploadResult.success) {
            throw new Error('Failed to upload image to storage');
          }

          progress = 55;
          setProcessingImages(prev => 
            prev.map(img => 
              img.id === fileId ? { ...img, progress: Math.round(progress) } : img
            )
          );

          // Step 2: Process image with background removal
          progress = 60;
          const result = await removeBackgroundMutation.mutateAsync({
            imageUrl: uploadResult.url,
            imageKey: uploadResult.key,
            format: 'png',
            mimeType: file.type || 'image/jpeg',
          });

          if (progressInterval) clearInterval(progressInterval);

          setProcessingImages(prev =>
            prev.map(img =>
              img.id === fileId
                ? {
                    ...img,
                    status: 'completed',
                    processedUrl: result.processedImageUrl,
                    progress: 100,
                    processingTime: result.processingTime,
                  }
                : img
            )
          );

          toast.success(`✓ Image processed successfully!`);
        } catch (error) {
          if (progressInterval) clearInterval(progressInterval);
          
          const errorMessage = error instanceof Error ? error.message : 'Failed to process image';
          
          setProcessingImages(prev =>
            prev.map(img =>
              img.id === fileId
                ? {
                    ...img,
                    status: 'failed',
                    errorMessage,
                  }
                : img
            )
          );

          toast.error(`✗ ${errorMessage}`);
        }
      };

      reader.readAsDataURL(file);
    }
  }, [uploadOriginalMutation, removeBackgroundMutation]);

  const handleDownload = async (imageId: string, format: 'png' | 'jpg') => {
    const image = processingImages.find(img => img.id === imageId);
    if (!image?.processedUrl) return;

    try {
      const response = await fetch(image.processedUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bg-removed-${imageId}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('✓ Download started!');
    } catch (error) {
      toast.error('✗ Download failed');
    }
  };

  const completedImages = processingImages.filter(img => img.status === 'completed');
  const isProcessing = uploadOriginalMutation.isPending || removeBackgroundMutation.isPending;

  return (
    <div className={`min-h-screen bg-background text-foreground overflow-hidden transition-all duration-300 ${isTransitioning ? `opacity-75 ${getAnimationClass(animationType)}` : 'opacity-100'}`}>
      <FloatingPixels />

      {/* Header */}
      <header className="relative z-10 container mx-auto px-4 py-8 md:py-12">
        <div className="flex justify-between items-start mb-8">
          <div className="flex-1 text-center">
            <h1 className="text-4xl md:text-6xl font-bold arcade-glow mb-2 md:mb-4">
              {language === 'km' ? 'ឧបករណ៍លុបផ្ទៃខាងក្រោយ' : language === 'zh' ? '背景移除工具' : 'BG REMOVER'}
            </h1>
            <p className="text-lg md:text-2xl arcade-glow-cyan mb-2">
              {language === 'km' ? 'ឧបករណ៍លុបផ្ទៃខាងក្រោយដោយប្រើបច្ចេកវិទ្យា AI' : language === 'zh' ? '人工智能驱动的背景移除' : 'AI POWERED BACKGROUND REMOVAL'}
            </p>
            <p className="text-xs md:text-sm text-muted-foreground">
              {language === 'km' ? 'លុបផ្ទៃខាងក្រោយរូបភាពបានលឿនដោយប្រើបច្ចេកវិទ្យា AI ឈានលើគេ' : language === 'zh' ? '使用先进的人工智能技术快速移除背景' : 'Remove backgrounds instantly with advanced AI technology'}
            </p>
          </div>
          <div className="ml-4">
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-8 md:py-12">
        {/* Upload Section */}
        <div className="mb-12">
          <div className="card-arcade mb-6">
            <h2 className="text-2xl md:text-3xl font-bold arcade-glow mb-6 text-center">
              {language === 'km' ? 'ផ្ទុករូបភាព' : language === 'zh' ? '上传图像' : 'UPLOAD IMAGE'}
            </h2>
            <ImageUpload 
              onUpload={handleUpload}
              isLoading={isProcessing}
              multiple={true}
            />
          </div>
        </div>

        {/* Processing Status */}
        {processingImages.length > 0 && (
          <div className="mb-12 space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold arcade-glow text-center">
              {language === 'km' ? 'ជួរដេកដំណើរការ' : language === 'zh' ? '处理队列' : 'PROCESSING QUEUE'}
            </h2>

            {processingImages.map((image) => (
              <div key={image.id} className="card-arcade-cyan">
                <ProcessingStatus
                  status={image.status}
                  progress={image.progress}
                  errorMessage={image.errorMessage}
                  processingTime={image.processingTime}
                  fileName={image.fileName}
                />

                {/* Comparison View */}
                {image.status === 'completed' && image.processedUrl && (
                  <div className="mt-6 space-y-4">
                    <ImageComparison
                      beforeImage={image.originalUrl}
                      afterImage={image.processedUrl}
                      beforeLabel="ORIGINAL"
                      afterLabel="PROCESSED"
                      viewMode={viewMode}
                      onViewModeChange={setViewMode}
                    />

                    {/* Download Options */}
                    <div className="flex flex-wrap gap-3 justify-center">
                      <button
                        onClick={() => handleDownload(image.id, 'png')}
                        className="btn-arcade flex items-center gap-2 text-sm md:text-base"
                      >
                        <Download size={16} />
                        PNG
                      </button>
                      <button
                        onClick={() => handleDownload(image.id, 'jpg')}
                        className="btn-arcade-magenta flex items-center gap-2 text-sm md:text-base"
                      >
                        <Download size={16} />
                        JPG
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Features Section */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold arcade-glow text-center mb-8">
            {language === 'km' ? 'លក្ខណៈពិសេស' : language === 'zh' ? '功能' : 'FEATURES'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: Zap, label: 'INSTANT', desc: 'Fast AI processing' },
              { icon: Download, label: 'EXPORT', desc: 'PNG & JPG formats' },
              { icon: History, label: 'HISTORY', desc: 'Track all edits' },
            ].map((feature, i) => (
              <div key={i} className="pixel-border-magenta p-4 text-center">
                <feature.icon size={32} className="mx-auto mb-3 text-magenta-400" />
                <h3 className="font-bold text-lg arcade-glow-magenta mb-1">
                  {feature.label}
                </h3>
                <p className="text-xs text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* History Section */}
        {completedImages.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-bold arcade-glow">
                {language === 'km' ? 'ការកែសម្រួលថ្មីៗ' : language === 'zh' ? '最近编辑' : 'RECENT EDITS'}
              </h2>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="btn-arcade-cyan text-sm"
              >
                {showHistory ? (language === 'km' ? 'លាក់' : language === 'zh' ? '隐藏' : 'HIDE') : (language === 'km' ? 'បង្ហាញ' : language === 'zh' ? '显示' : 'SHOW')}
              </button>
            </div>

            {showHistory && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {completedImages.map((image) => (
                  <div key={image.id} className="pixel-border p-2">
                    <img
                      src={image.processedUrl}
                      alt={image.fileName}
                      className="w-full aspect-square object-cover"
                    />
                    <p className="text-xs text-muted-foreground mt-2 truncate">
                      {image.fileName}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Developer API Section */}
        <section className="mb-12">
          <div className="card-arcade-magenta text-center">
            <h2 className="text-2xl md:text-3xl font-bold arcade-glow-magenta mb-3">
              {language === 'km' ? 'API សម្រាប់អ្នកអភិវឌ្ឍ' : language === 'zh' ? '开发者 API' : 'DEVELOPER API'}
            </h2>
            <p className="text-sm md:text-base text-muted-foreground mb-4">
              {language === 'km' ? 'ដាក់បញ្ចូលលុបផ្ទៃខាងក្រោយទៅក្នុងកម្មវិធីរបស់អ្នក' : language === 'zh' ? '将背景移除集成到您的应用程序中' : 'Integrate background removal into your applications'}
            </p>
            <button className="btn-arcade-magenta">
              {language === 'km' ? 'ទទួលបានលទ្ធិប្រើប្រាស់ API' : language === 'zh' ? '获取 API 访问权限' : 'GET API ACCESS'}
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t-4 border-primary py-6 text-center text-sm text-muted-foreground">
        <p>
          {language === 'km' ? '© 2026 ឧបករណ៍លុបផ្ទៃខាងក្រោយ AI • ដំណើរការដោយបច្ចេកវិទ្យាដំណើរការរូបភាពឈានលើគេ' : language === 'zh' ? '© 2026 背景移除工具 AI • 由先进的图像处理技术提供支持' : '© 2026 BG Remover AI • Powered by Advanced Image Processing'}
        </p>
      </footer>
    </div>
  );
}

import React, { useRef, useState } from 'react';
import { Upload, AlertCircle, CheckCircle } from 'lucide-react';

const ALLOWED_FORMATS = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface ImageUploadProps {
  onUpload: (files: File[]) => void;
  isLoading?: boolean;
  multiple?: boolean;
}

interface ValidationError {
  message: string;
  type: 'format' | 'size' | 'count';
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ 
  onUpload, 
  isLoading = false,
  multiple = true 
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFiles = (files: File[]): { valid: File[]; errors: ValidationError[] } => {
    const validFiles: File[] = [];
    const newErrors: ValidationError[] = [];

    if (!multiple && files.length > 1) {
      newErrors.push({
        message: 'Only one image can be uploaded at a time',
        type: 'count',
      });
      return { valid: [], errors: newErrors };
    }

    files.forEach((file) => {
      // Check format
      if (!ALLOWED_FORMATS.includes(file.type)) {
        newErrors.push({
          message: `${file.name}: Invalid format. Allowed: PNG, JPG, JPEG, WebP`,
          type: 'format',
        });
        return;
      }

      // Check size
      if (file.size > MAX_FILE_SIZE) {
        newErrors.push({
          message: `${file.name}: File size exceeds 10MB limit`,
          type: 'size',
        });
        return;
      }

      validFiles.push(file);
    });

    return { valid: validFiles, errors: newErrors };
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    const { valid, errors } = validateFiles(files);

    if (errors.length > 0) {
      setErrors(errors);
      return;
    }

    setErrors([]);
    setSelectedFiles(valid);
    onUpload(valid);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const { valid, errors } = validateFiles(files);

    if (errors.length > 0) {
      setErrors(errors);
      return;
    }

    setErrors([]);
    setSelectedFiles(valid);
    onUpload(valid);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          relative p-8 md:p-12 border-4 border-dashed transition-all duration-200 cursor-pointer
          ${isDragActive 
            ? 'pixel-border-cyan bg-slate-800 scale-105' 
            : 'pixel-border hover:border-cyan-400'
          }
          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={ALLOWED_FORMATS.join(',')}
          onChange={handleChange}
          disabled={isLoading}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="relative">
            <Upload 
              size={48} 
              className="text-primary animate-pixel-pulse"
              style={{
                filter: 'drop-shadow(0 0 10px rgb(0 255 0 / 0.8))',
              }}
            />
          </div>

          <div>
            <h3 className="text-xl md:text-2xl font-bold arcade-glow mb-2">
              DROP YOUR IMAGE HERE
            </h3>
            <p className="text-sm md:text-base text-muted-foreground">
              or click to browse
            </p>
            <p className="text-xs md:text-sm text-muted-foreground mt-2">
              PNG, JPG, JPEG, WebP • Max 10MB
            </p>
          </div>

          {selectedFiles.length > 0 && (
            <div className="mt-4 flex items-center gap-2 text-green-400">
              <CheckCircle size={20} />
              <span className="text-sm font-bold">
                {selectedFiles.length} image{selectedFiles.length !== 1 ? 's' : ''} ready
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="mt-4 space-y-2">
          {errors.map((error, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 bg-red-900 border-2 border-red-500 pixel-border"
              style={{
                boxShadow: '0 0 10px rgb(239 68 68 / 0.5)',
              }}
            >
              <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-red-200">{error.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

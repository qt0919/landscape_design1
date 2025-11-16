import React, { useState, useCallback } from 'react';
import { fileToBase64 } from '../utils/fileUtils';
import { ImageState } from '../types';
import { UploadIcon } from './icons';

interface ImageUploaderProps {
  onImageUpload: (image: ImageState) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file.');
        return;
      }
      setError(null);
      try {
        const base64 = await fileToBase64(file);
        onImageUpload({ base64, mimeType: file.type });
      } catch (err) {
        setError('Failed to read the image file.');
        console.error(err);
      }
    }
  };
  
  const handleDragOver = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
  }, []);

  const handleDrop = useCallback(async (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
       if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file.');
        return;
      }
      setError(null);
      try {
        const base64 = await fileToBase64(file);
        onImageUpload({ base64, mimeType: file.type });
      } catch (err) {
        setError('Failed to read the image file.');
        console.error(err);
      }
    }
  }, [onImageUpload]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-green-100/50 border-2 border-dashed border-green-300 rounded-2xl p-8">
      <label onDragOver={handleDragOver} onDrop={handleDrop} className="cursor-pointer flex flex-col items-center justify-center text-center">
        <UploadIcon className="w-16 h-16 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-green-800">Upload Your Garden Photo</h2>
        <p className="text-green-600 mt-2">Drag & drop an image here, or click to select a file.</p>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </label>
      {error && <p className="mt-4 text-red-500">{error}</p>}
    </div>
  );
};

export default ImageUploader;
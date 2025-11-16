
import React from 'react';
import { ImageState } from '../types';
import Loader from './Loader';

interface ImageDisplayProps {
  originalImage: ImageState | null;
  generatedImage: ImageState | null;
  isLoading: boolean;
}

const ImageCard: React.FC<{ image: ImageState | null; title: string; children?: React.ReactNode }> = ({ image, title, children }) => (
    <div className="w-full md:w-1/2 p-2">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden h-full">
            <h3 className="text-center font-bold text-lg py-2 bg-gray-50 text-gray-700">{title}</h3>
            <div className="aspect-w-16 aspect-h-9 relative">
                {image ? (
                    <img src={`data:${image.mimeType};base64,${image.base64}`} alt={title} className="object-cover w-full h-full" />
                ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">Your image will appear here</span>
                    </div>
                )}
                {children}
            </div>
        </div>
    </div>
);


const ImageDisplay: React.FC<ImageDisplayProps> = ({ originalImage, generatedImage, isLoading }) => {
  return (
    <div className="w-full flex flex-col md:flex-row">
      <ImageCard image={originalImage} title="Before" />
      <ImageCard image={generatedImage} title="After">
        {isLoading && <Loader message="Generating design..." />}
      </ImageCard>
    </div>
  );
};

export default ImageDisplay;

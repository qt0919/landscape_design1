import React from 'react';
import { DesignHistoryItem } from '../types';

interface HistoryTrayProps {
  history: DesignHistoryItem[];
  onSelect: (item: DesignHistoryItem) => void;
  isLoading: boolean;
}

const HistoryTray: React.FC<HistoryTrayProps> = ({ history, onSelect, isLoading }) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-md border border-green-200">
      <h3 className="text-xl font-bold text-green-900 mb-4">Design History</h3>
      <div className="flex overflow-x-auto space-x-4 pb-4 -mb-4">
        {history.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            disabled={isLoading}
            className="flex-shrink-0 w-48 bg-white rounded-lg shadow-md overflow-hidden group focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-transform transform hover:-translate-y-1"
            title={`Prompt: "${item.prompt}"\n\nClick to use this image as a base for a new design.`}
          >
            <img
              src={`data:${item.generatedImage.mimeType};base64,${item.generatedImage.base64}`}
              alt={`Generated design with prompt: ${item.prompt}`}
              className="w-full h-32 object-cover"
            />
            <div className="p-2 text-left">
              <p className="text-sm text-gray-700 font-medium truncate group-hover:whitespace-normal group-hover:overflow-visible">
                {item.prompt}
              </p>
            </div>
          </button>
        ))}
      </div>
       <p className="text-xs text-gray-500 mt-4 text-center">Click a design to edit it further.</p>
    </div>
  );
};

export default HistoryTray;


import React, { useState } from 'react';
import { SparklesIcon } from './icons';
import { PREDEFINED_PROMPTS } from '../constants';

interface ControlsProps {
  onGenerate: (prompt: string) => void;
  isLoading: boolean;
  hasImage: boolean;
}

const Controls: React.FC<ControlsProps> = ({ onGenerate, isLoading, hasImage }) => {
  const [prompt, setPrompt] = useState('');

  const handleGenerateClick = () => {
    if (prompt.trim() && !isLoading && hasImage) {
      onGenerate(prompt);
    }
  };

  const handlePromptSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
    if (!isLoading && hasImage) {
        onGenerate(suggestion);
    }
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-green-200 flex flex-col gap-4">
      <div>
        <label htmlFor="prompt" className="block text-xl font-bold text-green-900 mb-2">
          Describe Your Dream Garden
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., 'Add a stone path and plant colorful wildflowers.' or 'Remove the old shed and add a vegetable patch.'"
          className="w-full h-32 p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-shadow duration-200"
          disabled={!hasImage || isLoading}
        />
      </div>
      <div>
        <h4 className="text-lg font-semibold text-green-800 mb-2">Or get inspired:</h4>
        <div className="flex flex-wrap gap-2">
          {PREDEFINED_PROMPTS.map((p) => (
            <button
              key={p.name}
              onClick={() => handlePromptSuggestionClick(p.prompt)}
              disabled={!hasImage || isLoading}
              className="px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-medium hover:bg-green-200 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>
      <button
        onClick={handleGenerateClick}
        disabled={!prompt.trim() || isLoading || !hasImage}
        className="w-full flex items-center justify-center mt-2 px-6 py-4 bg-green-600 text-white font-bold text-lg rounded-lg hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
      >
        <SparklesIcon className="w-6 h-6 mr-2" />
        {isLoading ? 'Generating...' : 'Generate Design'}
      </button>
      {!hasImage && <p className="text-center text-sm text-yellow-700 mt-2">Please upload an image to enable controls.</p>}
    </div>
  );
};

export default Controls;

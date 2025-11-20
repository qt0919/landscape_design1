import React, { useState, useCallback, useEffect } from 'react';
import { ImageState, Plant, DesignHistoryItem, DesignSession } from './types';
import { generateLandscapeDesign, identifyPlantsInImage } from './services/geminiService';
import ImageUploader from './components/ImageUploader';
import ImageDisplay from './components/ImageDisplay';
import Controls from './components/Controls';
import PlantList from './components/PlantList';
import ChatWidget from './components/ChatWidget';
import HistoryTray from './components/HistoryTray';
import AllHistoryModal from './components/AllHistoryModal';
import { UploadIcon } from './components/icons';

const SESSIONS_STORAGE_KEY = 'gardenDesignSessions';
const ACTIVE_SESSION_ID_STORAGE_KEY = 'gardenDesignActiveSessionId';


const App: React.FC = () => {
  // Load sessions and active ID from localStorage first, with error handling.
  const [sessions, setSessions] = useState<DesignSession[]>(() => {
    try {
      const saved = localStorage.getItem(SESSIONS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Could not load sessions from localStorage:", e);
      return [];
    }
  });

  const [activeSessionId, setActiveSessionId] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem(ACTIVE_SESSION_ID_STORAGE_KEY);
      const parsedId = saved ? JSON.parse(saved) : null;
      // Ensure the active session we're loading still exists.
      if (parsedId && sessions.some(s => s.id === parsedId)) {
        return parsedId;
      }
      return null;
    } catch (e) {
      console.error("Could not load active session ID from localStorage:", e);
      return null;
    }
  });

  // Now, derive the initial view state from the loaded sessions and ID.
  const activeSessionOnLoad = sessions.find(s => s.id === activeSessionId);
  const lastHistoryItemOnLoad = activeSessionOnLoad?.history?.[activeSessionOnLoad.history.length - 1];

  const [originalImage, setOriginalImage] = useState<ImageState | null>(activeSessionOnLoad?.baseImage || null);
  const [generatedImage, setGeneratedImage] = useState<ImageState | null>(lastHistoryItemOnLoad?.generatedImage || null);
  
  const [plants, setPlants] = useState<Plant[]>([]);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Effect to save sessions to localStorage whenever they change.
  useEffect(() => {
    try {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.error("Could not save sessions to localStorage:", e);
    }
  }, [sessions]);

  // Effect to save the active session ID when it changes.
  useEffect(() => {
    try {
      if (activeSessionId) {
        localStorage.setItem(ACTIVE_SESSION_ID_STORAGE_KEY, JSON.stringify(activeSessionId));
      } else {
        localStorage.removeItem(ACTIVE_SESSION_ID_STORAGE_KEY);
      }
    } catch (e) {
      console.error("Could not save active session ID to localStorage:", e);
    }
  }, [activeSessionId]);


  const activeSession = sessions.find(s => s.id === activeSessionId);
  const designHistory = activeSession ? activeSession.history : [];

  const handleImageUpload = useCallback((image: ImageState) => {
    setOriginalImage(image);
    setGeneratedImage(null);
    setPlants([]);
    setError(null);

    const newSession: DesignSession = {
      id: Date.now(),
      baseImage: image,
      history: [],
    };
    setSessions(prev => [...prev, newSession]);
    setActiveSessionId(newSession.id);
  }, []);

  const handleStartOver = useCallback(() => {
    setOriginalImage(null);
    setGeneratedImage(null);
    setPlants([]);
    setError(null);
    setActiveSessionId(null);
  }, []);

  const handleGenerateDesign = async (prompt: string) => {
    if (!originalImage || activeSessionId === null) {
      setError('Please upload an image first.');
      return;
    }

    setIsGenerating(true);
    setIsIdentifying(true);
    setError(null);
    setGeneratedImage(null);
    setPlants([]);

    try {
      const newImage = await generateLandscapeDesign(originalImage.base64, originalImage.mimeType, prompt);
      setGeneratedImage(newImage);
      
      const newHistoryItem: DesignHistoryItem = {
        id: Date.now(),
        originalImage: originalImage,
        prompt: prompt,
        generatedImage: newImage,
      };
      
      setSessions(prevSessions => 
        prevSessions.map(session => 
          session.id === activeSessionId 
            ? { ...session, history: [...session.history, newHistoryItem] }
            : session
        )
      );

      try {
          const identifiedPlants = await identifyPlantsInImage(newImage.base64, newImage.mimeType);
          setPlants(identifiedPlants);
      } catch (plantError) {
          console.error(plantError);
          setError("Could not identify plants, but here's your new garden!");
      } finally {
        setIsIdentifying(false);
      }

    } catch (generationError) {
      const err = generationError as Error;
      setError(err.message || 'An unknown error occurred during image generation.');
      setGeneratedImage(null);
      setIsIdentifying(false);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleLoadHistoryItemForEditing = useCallback((item: DesignHistoryItem) => {
    const sessionOfItem = sessions.find(s => s.history.some(h => h.id === item.id));
    if (sessionOfItem) {
      setActiveSessionId(sessionOfItem.id);
    }
    setOriginalImage(item.generatedImage);
    setGeneratedImage(null);
    setPlants([]);
    setError(null);
    setIsHistoryModalOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [sessions]);

  const handleSelectSession = useCallback((sessionId: number) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setActiveSessionId(session.id);
      setOriginalImage(session.baseImage);
      setGeneratedImage(session.history[session.history.length - 1]?.generatedImage || null);
      setPlants([]);
      setError(null);
      setIsHistoryModalOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [sessions]);


  return (
    <div className="min-h-screen bg-green-50/50">
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="text-center flex-grow">
                <h1 className="text-4xl font-extrabold text-green-800 tracking-tight">Garden Landscape Designer AI</h1>
                <p className="mt-2 text-lg text-green-600">Bring your dream garden to life with the power of AI.</p>
            </div>
             {sessions.length > 0 && (
                <button 
                    onClick={() => setIsHistoryModalOpen(true)}
                    className="ml-4 flex-shrink-0 px-4 py-2 bg-green-100 text-green-800 font-semibold rounded-lg hover:bg-green-200 transition-colors shadow-sm"
                    aria-label="View all design history"
                >
                    View All History
                </button>
            )}
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column: Controls */}
          <div className="lg:w-1/3 flex flex-col gap-8">
            <Controls onGenerate={handleGenerateDesign} isLoading={isGenerating} hasImage={!!originalImage} />
            <PlantList plants={plants} isLoading={isIdentifying} />
          </div>

          {/* Right Column: Image Display & History */}
          <div className="lg:w-2/3 flex flex-col gap-8">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            {originalImage ? (
              <>
                <div className="flex justify-end">
                  <button
                    onClick={handleStartOver}
                    className="inline-flex items-center px-4 py-2 bg-white border border-green-300 text-green-800 font-semibold rounded-lg hover:bg-green-100 transition-colors shadow-sm"
                  >
                    <UploadIcon className="w-5 h-5 mr-2" />
                    Upload New Photo
                  </button>
                </div>
                <ImageDisplay originalImage={originalImage} generatedImage={generatedImage} isLoading={isGenerating} />
              </>
            ) : (
              <ImageUploader onImageUpload={handleImageUpload} />
            )}
            {designHistory.length > 0 && (
              <HistoryTray history={designHistory} onSelect={handleLoadHistoryItemForEditing} isLoading={isGenerating} />
            )}
          </div>
        </div>
      </main>
      <ChatWidget />
      {isHistoryModalOpen && (
        <AllHistoryModal
            sessions={sessions}
            onClose={() => setIsHistoryModalOpen(false)}
            onSelectSession={handleSelectSession}
            onSelectHistoryItem={handleLoadHistoryItemForEditing}
        />
      )}
    </div>
  );
};

export default App;
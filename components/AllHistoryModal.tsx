import React from 'react';
import { DesignSession, DesignHistoryItem } from '../types';
import { CloseIcon } from './icons';

interface AllHistoryModalProps {
  sessions: DesignSession[];
  onClose: () => void;
  onSelectSession: (sessionId: number) => void;
  onSelectHistoryItem: (item: DesignHistoryItem) => void;
}

const AllHistoryModal: React.FC<AllHistoryModalProps> = ({ sessions, onClose, onSelectSession, onSelectHistoryItem }) => {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
      <div className="bg-green-50 rounded-2xl shadow-xl w-full max-w-5xl h-[90vh] flex flex-col">
        <header className="flex items-center justify-between p-4 border-b border-green-200 sticky top-0 bg-green-50 z-10">
          <h2 className="text-2xl font-bold text-green-800">All Design History</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-green-200" aria-label="Close history">
            <CloseIcon className="w-6 h-6 text-green-700" />
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-6 space-y-8">
          {sessions.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500">You haven't created any designs yet.</p>
            </div>
          ) : (
            [...sessions].reverse().map((session) => (
              <div key={session.id} className="bg-white p-4 rounded-lg shadow-md border border-green-100">
                <h3 className="text-lg font-semibold text-green-900 mb-3">
                  Session from: {new Date(session.id).toLocaleString()}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Base Image Column */}
                  <div className="flex flex-col">
                    <h4 className="font-bold text-gray-600 mb-2 text-center">Base Image</h4>
                    <img
                      src={`data:${session.baseImage.mimeType};base64,${session.baseImage.base64}`}
                      alt="Base design"
                      className="w-full h-48 object-cover rounded-md shadow-sm"
                    />
                    <button
                      onClick={() => onSelectSession(session.id)}
                      className="mt-3 w-full px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Resume Session
                    </button>
                  </div>
                  
                  {/* Generated Designs Column */}
                  <div className="md:col-span-2">
                     <h4 className="font-bold text-gray-600 mb-2">Generated Designs ({session.history.length})</h4>
                     {session.history.length > 0 ? (
                        <div className="flex overflow-x-auto space-x-4 pb-2">
                           {session.history.map((item) => (
                             <button
                               key={item.id}
                               onClick={() => onSelectHistoryItem(item)}
                               className="flex-shrink-0 w-48 bg-white rounded-lg shadow-sm overflow-hidden group focus:outline-none focus:ring-2 focus:ring-green-500"
                               title={`Prompt: "${item.prompt}"\n\nClick to use this image as a base for a new design.`}
                             >
                               <img
                                 src={`data:${item.generatedImage.mimeType};base64,${item.generatedImage.base64}`}
                                 alt={`Generated design with prompt: ${item.prompt}`}
                                 className="w-full h-32 object-cover"
                               />
                               <div className="p-2 text-left">
                                 <p className="text-xs text-gray-700 font-medium truncate group-hover:whitespace-normal group-hover:overflow-visible">
                                   {item.prompt}
                                 </p>
                               </div>
                             </button>
                           ))}
                        </div>
                     ) : (
                        <div className="flex items-center justify-center h-full bg-gray-100 rounded-md">
                            <p className="text-gray-500">No designs generated in this session yet.</p>
                        </div>
                     )}
                  </div>
                </div>
              </div>
            ))
          )}
        </main>
      </div>
    </div>
  );
};

export default AllHistoryModal;


import React from 'react';
import { Plant } from '../types';
import { LeafIcon } from './icons';

interface PlantListProps {
  plants: Plant[];
  isLoading: boolean;
}

const PlantList: React.FC<PlantListProps> = ({ plants, isLoading }) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-md border border-green-200">
      <h3 className="text-xl font-bold text-green-900 mb-4">Plants in Your New Garden</h3>
      {isLoading ? (
        <div className="flex items-center text-gray-500">
            <div className="w-5 h-5 border-2 border-green-300 border-t-transparent rounded-full animate-spin mr-2"></div>
            <span>Identifying plants...</span>
        </div>
      ) : plants.length > 0 ? (
        <ul className="space-y-3">
          {plants.map((plant, index) => (
            <li key={index} className="flex items-center text-green-800">
              <LeafIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
              <span>{plant.name}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 italic">No plants identified yet. Generate a design to see the plant list!</p>
      )}
    </div>
  );
};

export default PlantList;

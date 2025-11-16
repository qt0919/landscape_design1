
import React from 'react';

const Loader = ({ message }: { message: string }) => {
  return (
    <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center z-10">
      <div className="w-12 h-12 border-4 border-green-400 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-lg font-semibold text-green-800">{message}</p>
    </div>
  );
};

export default Loader;

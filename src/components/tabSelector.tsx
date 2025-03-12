// components/TabSelector.tsx
import React from 'react';
import { Youtube, ThumbsUp, UserCheck, Eye } from 'lucide-react';
import { TabType } from '../types';

interface TabSelectorProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const TabSelector: React.FC<TabSelectorProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="bg-gray-800 rounded-xl shadow-lg p-4 mb-6 border border-gray-700">
      <div className="flex justify-center gap-2">
        <button
          onClick={() => setActiveTab('views')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'views'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <Youtube className="w-5 h-5" />
          İzlenmeler
        </button>
        <button
          onClick={() => setActiveTab('likes')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'likes'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <ThumbsUp className="w-5 h-5" />
          Beğeniler
        </button>
        <button
          onClick={() => setActiveTab('subscribers')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'subscribers'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <UserCheck className="w-5 h-5" />
          Aboneler
        </button>
        <button
          onClick={() => setActiveTab('embed')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'embed'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <Eye className="w-5 h-5" />
          Embed Kontrolü
        </button>
      </div>
    </div>
  );
};

export default TabSelector;
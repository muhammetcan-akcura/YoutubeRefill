// components/ApiKeyInput.tsx
import React, { useState, useEffect } from 'react';
import { AlertCircle, ChevronDown } from 'lucide-react';

interface ApiKey {
  id: string;
  value: string;
  label: string;
}

interface ApiKeyInputProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  apiKeys?: ApiKey[]; // Varsayılan olarak böyle bir prop gönderilmeyebilir
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ apiKey, setApiKey, apiKeys = [] }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedKeyLabel, setSelectedKeyLabel] = useState<string>('');
  
  // API anahtarını maskeleme fonksiyonu
  const maskApiKey = (key: string) => {
    if (!key) return '';
    if (key.length <= 4) return key;
    
    const lastFourChars = key.slice(-4);
    const maskedPart = '*'.repeat(key.length - 4);
    return `${maskedPart}${lastFourChars}`;
  };
  
  // API key değiştiğinde label'ı güncelle
  useEffect(() => {
    const selectedKey = apiKeys.find(key => key.value === apiKey);
    if (selectedKey) {
      setSelectedKeyLabel(selectedKey.label);
    } else {
      setSelectedKeyLabel('');
    }
  }, [apiKey, apiKeys]);
  
  // Anahtarı manuel olarak girme opsiyonu varsa
  const hasManualInput = apiKeys.length === 0;
  
  return (
    <div className="bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-700">
      <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-yellow-500" />
        YouTube API Anahtarı
      </h2>
      
      {hasManualInput ? (
        // Manuel API anahtarı girişi
        <input
          type="text"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="YouTube API Anahtarınızı Girin"
          className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      ) : (
        // API anahtarı seçimi
        <div className="relative">
          <div 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white flex justify-between items-center cursor-pointer hover:bg-gray-800"
          >
            <div>
              {apiKey ? (
                <div className="flex flex-col">
                  <span className="text-sm text-gray-400">{selectedKeyLabel}</span>
                  <span>{maskApiKey(apiKey)}</span>
                </div>
              ) : (
                <span className="text-gray-400">API Anahtarı Seçin</span>
              )}
            </div>
            <ChevronDown className={`w-5 h-5 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`} />
          </div>
          
          {isDropdownOpen && (
            <div className="absolute z-10 w-full mt-1 bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
              {apiKeys.map((key) => (
                <div 
                  key={key.id}
                  onClick={() => {
                    setApiKey(key.value);
                    setIsDropdownOpen(false);
                  }}
                  className="px-4 py-2 hover:bg-gray-800 cursor-pointer"
                >
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-400">{key.label}</span>
                    <span className="text-white">{maskApiKey(key.value)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ApiKeyInput;
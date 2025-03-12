import React from 'react';
import { AlertCircle, Download } from 'lucide-react';
import { TabType } from '../types';

interface ResultsPanelProps {
  showResults: boolean;
  logs: string[];
  refillContent: string;
  downloadRefillFile: () => void;
  activeTab: TabType;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({ 
  showResults, 
  logs, 
  refillContent, 
  downloadRefillFile,
  activeTab
}) => {
  if (!showResults) {
    return (
      <div className="bg-gray-800 rounded-xl shadow-lg p-6 h-full border border-gray-700 flex flex-col items-center justify-center text-center">
        <div className="text-gray-400 mb-4">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold text-gray-300 mb-2">Sonuçlar Burada Görünecek</h3>
          <p className="text-sm">
            Sol taraftaki siparişleri kontrol ettiğinizde sonuçlar ve refill bilgileri burada gösterilecektir.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg p-6 h-full border border-gray-700">
      <h2 className="text-xl font-semibold text-white mb-4">Sonuçlar</h2>
      
      {/* Log Çıktıları */}
      <div className="bg-gray-900 rounded-lg p-4 mb-4 h-64 overflow-y-auto font-mono text-sm">
        {logs.map((log, index) => (
          <div 
            key={index} 
            className={`${
              log.includes('Başarılı') ? 'text-green-400' :
              log.includes('Başarısız') ? 'text-red-400' :
              log.includes('Kontrol ediliyor') ? 'text-yellow-400 font-bold mt-2' :
              log.includes('Bot başlatılıyor') || log.includes('İşlem tamamlandı') 
                ? 'text-blue-400 font-bold' 
                : 'text-gray-300'
            }`}
          >
            {log}
          </div>
        ))}
      </div>
      
     
      {refillContent && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Sonuçlar</h3>
          <textarea
            value={refillContent}
            readOnly
            rows={6}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white mb-4 font-mono"
          />
          
          <button
            onClick={downloadRefillFile}
            className="w-full px-6 py-3 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Download className="w-5 h-5" />
            sonuçlar.txt İndir
          </button>
        </div>
      )}
    </div>
  );
};

export default ResultsPanel;

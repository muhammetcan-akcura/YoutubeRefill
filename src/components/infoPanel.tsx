import React from 'react';
import { AlertCircle, Youtube, ThumbsUp, UserCheck, Eye } from 'lucide-react';

const InfoPanel: React.FC = () => {
  return (
    <div className="bg-gray-800 rounded-xl shadow-lg p-6 mt-6 border border-gray-700">
      <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-yellow-500" />
        Kullanım Bilgileri
      </h2>
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-gray-900 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <Youtube className="w-5 h-5 text-red-500 mr-2" />
            <h3 className="font-semibold text-white">İzlenme Kontrolü</h3>
          </div>
          <p className="text-gray-300 text-sm">
            Video URL'sini kullanarak izlenme sayısını kontrol eder ve eksik izlenmeleri tespit eder.
          </p>
        </div>
        <div className="bg-gray-900 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <ThumbsUp className="w-5 h-5 text-blue-500 mr-2" />
            <h3 className="font-semibold text-white">Beğeni Kontrolü</h3>
          </div>
          <p className="text-gray-300 text-sm">
            Video URL'sini kullanarak beğeni sayısını kontrol eder ve eksik beğenileri tespit eder.
          </p>
        </div>
        <div className="bg-gray-900 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <UserCheck className="w-5 h-5 text-green-500 mr-2" />
            <h3 className="font-semibold text-white">Abone Kontrolü</h3>
          </div>
          <p className="text-gray-300 text-sm">
            Kanal URL'sini kullanarak abone sayısını kontrol eder ve eksik aboneleri tespit eder.
          </p>
        </div>
        <div className="bg-gray-900 p-4 rounded-lg">
  <div className="flex items-center mb-2">
    <Eye className="w-5 h-5 text-purple-500 mr-2" />
    <h3 className="font-semibold text-white">Embed Kontrolü</h3>
  </div>
  <p className="text-gray-300 text-sm">
    Video URL'sini kullanarak videonun erişilebilir olup olmadığını kontrol eder (açık, kapalı, kaldırılmış).
  </p>
</div>
      </div>
    </div>
  );
};

export default InfoPanel;
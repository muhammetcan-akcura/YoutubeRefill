import React from 'react';
import { Youtube } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <div className="text-center mb-8">
      <div className="flex items-center justify-center mb-4">
        <Youtube className="w-12 h-12 text-red-500" />
      </div>
      <h1 className="text-3xl font-bold text-white mb-2">YouTube İstatistik Kontrol Aracı</h1>
      <p className="text-gray-300">YouTube API kullanarak video izlenme, beğeni ve abone sayılarını kontrol edin</p>
    </div>
  );
};

export default Header;


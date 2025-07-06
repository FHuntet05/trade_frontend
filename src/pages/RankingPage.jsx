// frontend/src/pages/RankingPage.jsx
import React, { useState, useEffect } from 'react';
import RankingList from '../components/ranking/RankingList';
import UserSummaryCard from '../components/ranking/UserSummaryCard';
import api from '../api/axiosConfig';

const RankingPage = () => {

  const [activeTab, setActiveTab] = useState('individual');
  const [rankingData, setRankingData] = useState({ ranking: [], userSummary: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRanking = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/ranking?type=${activeTab}`);
        setRankingData(response.data);
      } catch (err) {
        setError('No se pudo cargar la clasificación.');
      } finally {
        setLoading(false);
      }
    };
    fetchRanking();
  }, [activeTab]);

  return (
     <div className="flex flex-col h-full space-y-6 animate-fade-in">
    <div className="space-y-6">
      {/* Pestañas / Tabs */}
      <div className="flex bg-gray-800/50 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('individual')}
          className={`w-1/2 py-2.5 text-sm font-bold rounded-lg transition-colors ${
            activeTab === 'individual' ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' : 'text-gray-400'
          }`}
        >
          Mantener la clasificación
        </button>
        <button
          onClick={() => setActiveTab('team')}
          className={`w-1/2 py-2.5 text-sm font-bold rounded-lg transition-colors ${
            activeTab === 'team' ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' : 'text-gray-400'
          }`}
        >
          Clasificación de equipos
        </button>
      </div>

      <UserSummaryCard summary={rankingData.userSummary} type={activeTab} />
      
      <RankingList 
        data={rankingData.ranking} 
        loading={loading} 
        error={error}
        type={activeTab} 
      />
    </div>
    </div>
  );
};
export default RankingPage;
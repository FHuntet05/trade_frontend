// frontend/src/pages/RankingPage.jsx (v1.1 - i18n)
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import RankingList from '../components/ranking/RankingList';
import UserSummaryCard from '../components/ranking/UserSummaryCard';
import Loader from '../components/common/Loader';
import api from '../api/axiosConfig';

const RankingPage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('global');
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
        setError(t('rankingPage.error'));
        setRankingData({ ranking: [], userSummary: {} });
      } finally {
        setLoading(false);
      }
    };
    fetchRanking();
  }, [activeTab, t]);

  return (
    <div className="flex flex-col h-full space-y-6 animate-fade-in">
      <div className="flex bg-dark-secondary p-1 rounded-xl">
        <button onClick={() => setActiveTab('global')} className={`w-1/2 py-2.5 text-sm font-bold rounded-lg transition-colors ${activeTab === 'global' ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' : 'text-text-secondary'}`}>
          {t('rankingPage.tabs.global')}
        </button>
        <button onClick={() => setActiveTab('team')} className={`w-1/2 py-2.5 text-sm font-bold rounded-lg transition-colors ${activeTab === 'team' ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' : 'text-text-secondary'}`}>
          {t('rankingPage.tabs.team')}
        </button>
      </div>
      {!loading && !error && <UserSummaryCard summary={rankingData.userSummary} />}
      <div className="flex-grow">
        {loading ? ( <Loader text={t('rankingPage.loading')} /> ) 
         : error ? ( <div className="text-center text-red-400">{error}</div> ) 
         : ( <RankingList data={rankingData.ranking} isScoreNtx={activeTab === 'global'} /> )}
      </div>
    </div>
  );
};
export default RankingPage;
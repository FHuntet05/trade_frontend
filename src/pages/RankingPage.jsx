// frontend/src/pages/RankingPage.jsx (Lógica de pestañas corregida)
import React, { useState, useEffect } from 'react';
import RankingList from '../components/ranking/RankingList';
import UserSummaryCard from '../components/ranking/UserSummaryCard';
import Loader from '../components/common/Loader'; // Importamos el Loader
import api from '../api/axiosConfig';

const RankingPage = () => {
  // --- CAMBIO: El estado inicial ahora es 'global' ---
  const [activeTab, setActiveTab] = useState('global');
  const [rankingData, setRankingData] = useState({ ranking: [], userSummary: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRanking = async () => {
      setLoading(true);
      setError(null);
      try {
        // La petición ahora usa el 'activeTab' ('global' o 'team')
        const response = await api.get(`/ranking?type=${activeTab}`);
        setRankingData(response.data);
      } catch (err) {
        setError('No se pudo cargar la clasificación.');
        // Limpiamos los datos en caso de error
        setRankingData({ ranking: [], userSummary: {} });
      } finally {
        setLoading(false);
      }
    };
    fetchRanking();
  }, [activeTab]); // El efecto se dispara cada vez que cambia la pestaña

  return (
    <div className="flex flex-col h-full space-y-6 animate-fade-in">
      {/* Pestañas / Tabs */}
      <div className="flex bg-dark-secondary p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('global')}
          className={`w-1/2 py-2.5 text-sm font-bold rounded-lg transition-colors ${
            activeTab === 'global' ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' : 'text-text-secondary'
          }`}
        >
          Mantener la clasificación
        </button>
        <button
          onClick={() => setActiveTab('team')}
          className={`w-1/2 py-2.5 text-sm font-bold rounded-lg transition-colors ${
            activeTab === 'team' ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' : 'text-text-secondary'
          }`}
        >
          Clasificación de equipos
        </button>
      </div>

      {/* Tarjeta de Resumen del Usuario */}
      {/* La información (label) ahora viene del backend, simplificando el componente */}
      {!loading && !error && <UserSummaryCard summary={rankingData.userSummary} />}
      
      {/* Lista del Ranking */}
      <div className="flex-grow">
        {loading ? (
          <Loader text="Cargando clasificación..." />
        ) : error ? (
          <div className="text-center text-red-400">{error}</div>
        ) : (
          <RankingList 
            data={rankingData.ranking}
            // --- CAMBIO: Se pasa un booleano para indicar si es ranking de NTX ---
            isScoreNtx={activeTab === 'global'}
          />
        )}
      </div>
    </div>
  );
};

export default RankingPage;
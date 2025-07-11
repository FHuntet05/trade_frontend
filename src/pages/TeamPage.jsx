// frontend/src/pages/TeamPage.jsx (REDiseñado con nuevo layout y botón de compartir)
import React, { useState, useEffect } from 'react';
import useUserStore from '../store/userStore';
import useTeamStore from '../store/teamStore';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';

import TeamStatCard from '../components/team/TeamStatCard';
import TeamLevelCard from '../components/team/TeamLevelCard';
import Loader from '../components/common/Loader';
import TeamLevelDetailsModal from '../components/team/TeamLevelDetailsModal';

import { HiUsers, HiArrowDownTray, HiArrowUpTray, HiBanknotes } from 'react-icons/hi2';
import { motion, AnimatePresence } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 120 } },
};

const TeamPage = () => {
  const { user } = useUserStore();
  const { stats, loading, error, fetchTeamStats } = useTeamStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [levelUsers, setLevelUsers] = useState([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  
  const referralLink = `https://t.me/ntx_miner_bot?start=${user?.telegramId}`;

  useEffect(() => {
    fetchTeamStats();
  }, [fetchTeamStats]);

  const handleShowDetails = async (level) => {
    setSelectedLevel(level);
    setIsModalOpen(true);
    setIsLoadingDetails(true);
    try {
      const response = await api.get(`/team/level-details/${level}`);
      setLevelUsers(response.data);
    } catch (err) {
      toast.error('No se pudieron cargar los detalles del equipo.');
      setLevelUsers([]);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setSelectedLevel(null);
      setLevelUsers([]);
    }, 300);
  };

  // --- NUEVA FUNCIÓN PARA COMPARTIR ---
  const handleShare = () => {
    const shareText = "¡Únete a NEURO LINK y empieza a ganar NTX! Usa mi enlace para obtener un bono de bienvenida.";
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`;
    
    // Usamos la API de Telegram para una experiencia nativa
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.openTelegramLink(shareUrl);
    } else {
      // Fallback para desarrollo en navegador
      navigator.clipboard.writeText(referralLink);
      toast.success('¡Enlace de referido copiado al portapapeles!');
    }
  };

  return (
    <div className="flex flex-col h-full p-4">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loader"><Loader text="Cargando equipo..." /></motion.div>
        ) : error ? (
          <motion.div key="error" className="text-center text-red-400 py-8">{error}</motion.div>
        ) : (
          // --- CONTENEDOR PRINCIPAL CON FLEX-COL ---
          <motion.div
            key="team-content"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col h-full space-y-6"
          >
            {/* Tarjetas de estadísticas (sin cambios) */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
               <TeamStatCard label="Miembros del Equipo" value={stats.totalTeamMembers} icon={<HiUsers size={20} />} />
               <TeamStatCard label="Comisión Total" value={stats.totalCommission} isCurrency icon={<HiBanknotes size={20} />} />
               <TeamStatCard label="Recargas del Equipo" value={stats.totalTeamRecharge} isCurrency icon={<HiArrowDownTray size={20} />} />
               <TeamStatCard label="Retiros del Equipo" value={stats.totalWithdrawals} isCurrency icon={<HiArrowUpTray size={20} />} />
            </motion.div>

            {/* --- NUEVO LAYOUT HORIZONTAL PARA NIVELES --- */}
            <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3">
              {stats.levels.map(levelInfo => (
                <TeamLevelCard
                  key={levelInfo.level}
                  level={levelInfo.level}
                  members={levelInfo.members}
                  onShowDetails={handleShowDetails}
                />
              ))}
            </motion.div>
            
            {/* Contenedor que empuja el botón hacia abajo */}
            <div className="flex-grow"></div>

            {/* --- NUEVO BOTÓN DE COMPARTIR --- */}
            <motion.div variants={itemVariants}>
              <button
                onClick={handleShare}
                className="w-full py-4 bg-gradient-to-r from-accent-start to-accent-end text-white text-lg font-bold rounded-full shadow-glow transform active:scale-95 transition-all"
              >
                COMPARTIR CON AMIGOS
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal (sin cambios) */}
      <AnimatePresence>
        {isModalOpen && (
          <TeamLevelDetailsModal 
            level={selectedLevel}
            users={levelUsers}
            isLoading={isLoadingDetails}
            onClose={handleCloseModal}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeamPage;
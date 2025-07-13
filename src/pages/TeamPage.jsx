// --- START OF FILE frontend/src/pages/TeamPage.jsx ---

// frontend/src/pages/TeamPage.jsx (REESTRUCTURADO: Con sección de referido y botón fijo)
import React, { useState, useEffect } from 'react';
import useUserStore from '../store/userStore';
import useTeamStore from '../store/teamStore';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';

import TeamStatCard from '../components/team/TeamStatCard';
import TeamLevelCard from '../components/team/TeamLevelCard';
import Loader from '../components/common/Loader';
import TeamLevelDetailsModal from '../components/team/TeamLevelDetailsModal';

import { HiUsers, HiArrowDownTray, HiArrowUpTray, HiBanknotes, HiClipboardDocument } from 'react-icons/hi2';
import { FaTelegramPlane, FaWhatsapp } from "react-icons/fa";
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
  const shareText = "¡Únete a NEURO LINK y empieza a ganar NTX! Usa mi enlace para obtener un bono de bienvenida.";

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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(user?.telegramId);
    toast.success('¡Código de referido copiado!');
  };

  const handleShare = (platform) => {
    const encodedLink = encodeURIComponent(referralLink);
    const encodedText = encodeURIComponent(shareText);
    let shareUrl = '';

    switch (platform) {
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodedLink}&text=${encodedText}`;
        if (window.Telegram?.WebApp) {
          window.Telegram.WebApp.openTelegramLink(shareUrl);
        } else {
          window.open(shareUrl, '_blank');
        }
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedText}%20${encodedLink}`;
        window.open(shareUrl, '_blank');
        break;
      default:
        navigator.clipboard.writeText(referralLink);
        toast.success('¡Enlace de referido copiado!');
        break;
    }
  };

  return (
    <>
      <div className="flex flex-col h-full">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loader"><Loader text="Cargando equipo..." /></motion.div>
          ) : error ? (
            <motion.div key="error" className="text-center text-red-400 py-8">{error}</motion.div>
          ) : (
            <motion.div
              key="team-content"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col h-full space-y-6"
            >
              <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
                <TeamStatCard label="Miembros del Equipo" value={stats.totalTeamMembers} icon={<HiUsers size={20} />} />
                <TeamStatCard label="Comisión Total" value={`$${stats.totalCommission.toFixed(2)}`} icon={<HiBanknotes size={20} />} />
                <TeamStatCard label="Recargas del Equipo" value={`$${stats.totalTeamRecharge.toFixed(2)}`} icon={<HiArrowDownTray size={20} />} />
                <TeamStatCard label="Retiros del Equipo" value={`$${stats.totalWithdrawals.toFixed(2)}`} icon={<HiArrowUpTray size={20} />} />
              </motion.div>
              
              {/* --- CAMBIO: SECCIÓN DE REFERIDO RESTAURADA Y MEJORADA --- */}
              <motion.div variants={itemVariants} className="bg-dark-secondary p-4 rounded-xl border border-white/10 space-y-3">
                  <p className="text-sm text-text-secondary text-center">Tu código de invitación</p>
                  <div className="flex items-center justify-between bg-black/30 p-2 rounded-lg">
                      <span className="text-lg font-mono text-white">{user?.telegramId}</span>
                      <button onClick={copyToClipboard} className="p-2 rounded-md hover:bg-white/20 active:bg-white/10 transition-colors">
                          <HiClipboardDocument size={22} className="text-white"/>
                      </button>
                  </div>
                  <div className="flex justify-center space-x-4 pt-2">
                      <button onClick={() => handleShare('telegram')} className="flex items-center space-x-2 bg-blue-500/20 text-blue-300 px-4 py-2 rounded-lg hover:bg-blue-500/40 transition-colors">
                          <FaTelegramPlane size={20} /> <span>Telegram</span>
                      </button>
                      <button onClick={() => handleShare('whatsapp')} className="flex items-center space-x-2 bg-green-500/20 text-green-300 px-4 py-2 rounded-lg hover:bg-green-500/40 transition-colors">
                          <FaWhatsapp size={20} /> <span>WhatsApp</span>
                      </button>
                  </div>
              </motion.div>

              {/* --- CAMBIO: CUADRÍCULA DE NIVELES MÁS GRANDE (2 COLUMNAS) --- */}
              <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
                {stats.levels.map(levelInfo => (
                  <TeamLevelCard
                    key={levelInfo.level}
                    level={levelInfo.level}
                    members={levelInfo.members}
                    onShowDetails={handleShowDetails}
                  />
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* --- CAMBIO: BOTÓN DE COMPARTIR AHORA ES FIJO Y ESTÁ FUERA DEL SCROLL --- */}
      {/* Se posiciona 100px desde abajo para dejar espacio a la barra de navegación principal */}
      <div className="fixed bottom-[100px] left-0 right-0 max-w-lg mx-auto px-4 z-40">
        <button
          onClick={() => handleShare('telegram')} // Acción principal es compartir en Telegram
          className="w-full py-4 bg-gradient-to-r from-accent-start to-accent-end text-white text-lg font-bold rounded-full shadow-glow transform active:scale-95 transition-all"
        >
          COMPARTIR CON AMIGOS
        </button>
      </div>

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
    </>
  );
};

export default TeamPage;
// --- END OF FILE frontend/src/pages/TeamPage.jsx ---
// frontend/src/pages/TeamPage.jsx (VERSIÓN FINAL CON MODAL DE DETALLES INTEGRADO)
import React, { useState, useEffect } from 'react';
import useUserStore from '../store/userStore';
import useTeamStore from '../store/teamStore';
import api from '../api/axiosConfig'; // Importamos axios
import toast from 'react-hot-toast'; // Importamos toast para errores

import TeamStatCard from '../components/team/TeamStatCard';
import TeamLevelCard from '../components/team/TeamLevelCard';
import SocialShare from '../components/team/SocialShare';
import Loader from '../components/common/Loader';
import TeamLevelDetailsModal from '../components/team/TeamLevelDetailsModal'; // Importamos el modal

import { HiOutlineClipboardDocument, HiUsers, HiArrowDownTray, HiArrowUpTray, HiBanknotes } from 'react-icons/hi2';
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
  
  // --- ESTADO PARA EL MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [levelUsers, setLevelUsers] = useState([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  
  const [copySuccess, setCopySuccess] = useState('');
  const referralLink = `https://t.me/ntx_miner_bot?start=${user?.telegramId}`; // Usamos telegramId que es el correcto

  useEffect(() => {
    fetchTeamStats();
  }, [fetchTeamStats]);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopySuccess('¡Copiado!');
    setTimeout(() => setCopySuccess(''), 2000);
  };
  
  // --- FUNCIÓN PARA MOSTRAR LOS DETALLES ---
  const handleShowDetails = async (level) => {
    setSelectedLevel(level);
    setIsModalOpen(true);
    setIsLoadingDetails(true);
    try {
      const response = await api.get(`/team/level-details/${level}`);
      setLevelUsers(response.data);
    } catch (err) {
      toast.error('No se pudieron cargar los detalles del equipo.');
      setLevelUsers([]); // Limpiamos en caso de error
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Pequeño delay para que la animación de cierre termine antes de limpiar los datos
    setTimeout(() => {
      setSelectedLevel(null);
      setLevelUsers([]);
    }, 300);
  };

  return (
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
               <TeamStatCard label="Comisión Total" value={stats.totalCommission} isCurrency icon={<HiBanknotes size={20} />} />
               <TeamStatCard label="Recargas del Equipo" value={stats.totalTeamRecharge} isCurrency icon={<HiArrowDownTray size={20} />} />
               <TeamStatCard label="Retiros del Equipo" value={stats.totalWithdrawals} isCurrency icon={<HiArrowUpTray size={20} />} />
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/10 space-y-3">
              <div className="flex w-full max-w-md mx-auto">
                <input type="text" value={referralLink} readOnly className="w-full bg-black/20 border border-r-0 border-white/20 rounded-l-lg px-4 text-sm outline-none text-gray-300" />
                <button onClick={handleCopy} className="bg-purple-600 px-4 py-2 rounded-r-lg font-semibold text-sm flex-shrink-0 text-white">
                  {copySuccess || <HiOutlineClipboardDocument size={20} />}
                </button>
              </div>
              <SocialShare referralLink={referralLink} />
            </motion.div>

            <motion.h2 variants={itemVariants} className="text-lg font-bold text-white text-center pt-2">
              Mis Referidos
            </motion.h2>

            {stats.levels.map(levelInfo => (
              <motion.div key={levelInfo.level} variants={itemVariants}>
                <TeamLevelCard
                  level={levelInfo.level}
                  members={levelInfo.members}
                  commission={levelInfo.commission}
                  onShowDetails={handleShowDetails} // Pasamos la función al componente hijo
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- RENDERIZADO CONDICIONAL DEL MODAL --- */}
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
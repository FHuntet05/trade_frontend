// frontend/src/pages/TeamPage.jsx (VERSIÓN CON LAYOUT REORDENADO)
import React, { useState, useEffect } from 'react';
import useUserStore from '../store/userStore';
import useTeamStore from '../store/teamStore';
import TeamStatCard from '../components/team/TeamStatCard';
import TeamLevelCard from '../components/team/TeamLevelCard';
import SocialShare from '../components/team/SocialShare';
import Loader from '../components/common/Loader';
import { HiOutlineClipboardDocument, HiUsers, HiArrowDownTray, HiArrowUpTray, HiBanknotes } from 'react-icons/hi2';
import { motion, AnimatePresence } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 120 },
  },
};

const TeamPage = () => {
  const { user } = useUserStore();
  const { stats, loading, error, fetchTeamStats } = useTeamStore();
  const [copySuccess, setCopySuccess] = useState('');

  const referralLink = `https://t.me/ntx_miner_bot?start=${user?.referralCode}`;

  useEffect(() => {
    fetchTeamStats();
  }, [fetchTeamStats]);

  const handleCopy = () => {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(referralLink);
        setCopySuccess('¡Copiado!');
        setTimeout(() => setCopySuccess(''), 2000);
    }
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
            {/* 1. Bloque de Estadísticas (sin cambios) */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
               <TeamStatCard label="Miembros del Equipo" value={stats.totalTeamMembers} icon={<HiUsers size={20} />} />
               <TeamStatCard label="Comisión Total" value={stats.totalCommission} isCurrency icon={<HiBanknotes size={20} />} />
               <TeamStatCard label="Recargas del Equipo" value={stats.totalTeamRecharge} isCurrency icon={<HiArrowDownTray size={20} />} />
               <TeamStatCard label="Retiros del Equipo" value={stats.totalWithdrawals} isCurrency icon={<HiArrowUpTray size={20} />} />
            </motion.div>

            {/* --- 2. EL BLOQUE DE COMPARTIR AHORA ESTÁ AQUÍ --- */}
            <motion.div variants={itemVariants} className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/10 space-y-3">
              <div className="flex w-full max-w-md mx-auto">
                <input
                  type="text"
                  value={referralLink}
                  readOnly
                  className="w-full bg-black/20 border border-r-0 border-white/20 rounded-l-lg px-4 text-sm outline-none text-gray-300"
                />
                <button
                  onClick={handleCopy}
                  className="bg-purple-600 px-4 py-2 rounded-r-lg font-semibold text-sm flex-shrink-0 text-white"
                >
                  {copySuccess || <HiOutlineClipboardDocument size={20} />}
                </button>
              </div>
              <SocialShare referralLink={referralLink} />
            </motion.div>

            {/* --- 3. EL BLOQUE DE NIVELES AHORA ESTÁ DESPUÉS --- */}
            <motion.h2 variants={itemVariants} className="text-lg font-bold text-white text-center pt-2">
              Mis Referidos
            </motion.h2>

            {stats.levels.map(levelInfo => (
              <motion.div key={levelInfo.level} variants={itemVariants}>
                <TeamLevelCard
                  level={levelInfo.level}
                  members={levelInfo.members}
                  commission={levelInfo.commission}
                />
              </motion.div>
            ))}

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeamPage;
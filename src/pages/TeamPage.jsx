// frontend/src/pages/TeamPage.jsx (COMPLETO Y REPARADO v21.20)

import React, { useState, useEffect } from 'react';
import useUserStore from '../store/userStore';
import useTeamStore from '../store/teamStore';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

import TeamStatCard from '../components/team/TeamStatCard';
import TeamLevelCard from '../components/team/TeamLevelCard';
import Loader from '../components/common/Loader';
import TeamLevelDetailsModal from '../components/team/TeamLevelDetailsModal';
import { triggerImpactHaptic, triggerNotificationHaptic } from '../utils/haptics';

import { FaTelegramPlane } from "react-icons/fa"; 
import { FaXTwitter, FaFacebookF, FaLinkedinIn, FaWhatsapp, FaInstagram, FaTiktok } from "react-icons/fa6";
import { HiUsers, HiBanknotes, HiArrowDownTray, HiArrowUpTray } from 'react-icons/hi2';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

const TeamPage = () => {
  const { user } = useUserStore();
  const { stats, loading, error, fetchTeamStats } = useTeamStore(state => ({
    stats: state.stats || { totalTeamMembers: 0, totalCommission: 0, totalTeamRecharge: 0, totalWithdrawals: 0, levels: [] },
    loading: state.loading,
    error: state.error,
    fetchTeamStats: state.fetchTeamStats,
  }));
  
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
    triggerImpactHaptic('medium');
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

  const copyLink = () => {
    triggerImpactHaptic('light');
    navigator.clipboard.writeText(referralLink);
    toast.success('¡Enlace copiado!');
    triggerNotificationHaptic('success');
  };
  
  const handleShare = (platform) => {
    triggerImpactHaptic('light');
    const encodedLink = encodeURIComponent(referralLink);
    const encodedText = encodeURIComponent(shareText);
    let shareUrl = '';

    switch (platform) {
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodedLink}&text=${encodedText}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedText}%20${encodedLink}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedLink}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}`;
        break;
      default:
        copyLink();
        return;
    }
    
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  const socialIcons = [
    { Icon: FaXTwitter, name: 'twitter' }, { Icon: FaFacebookF, name: 'facebook' },
    { Icon: FaTelegramPlane, name: 'telegram' }, { Icon: FaLinkedinIn, name: 'linkedin' },
    { Icon: FaWhatsapp, name: 'whatsapp' }, { Icon: FaInstagram, name: 'instagram' },
    { Icon: FaTiktok, name: 'tiktok' },
  ];

  return (
    <>
      <div className="flex flex-col h-full overflow-y-auto pb-32 p-4">
        <AnimatePresence mode="wait">
          {loading && !stats.totalTeamMembers ? (
            <motion.div key="loader" className="flex justify-center items-center h-full">
              <Loader />
            </motion.div>
          ) : error ? (
            <motion.div key="error" className="text-center text-red-400 p-8">
              {error}
            </motion.div>
          ) : (
            <motion.div 
              key="content" 
              initial="hidden" 
              animate="visible" 
              variants={containerVariants}
              className="flex flex-col space-y-6"
            >
              
              {/* --- INICIO DE LA CORRECCIÓN DE UI --- */}
              {/* Pasamos los valores numéricos en bruto y usamos la prop 'isCurrency' */}
              <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
                <TeamStatCard label="Miembros del Equipo" value={stats.totalTeamMembers} icon={<HiUsers size={20} />} />
                <TeamStatCard label="Comisión Total" value={stats.totalCommission} icon={<HiBanknotes size={20} />} isCurrency={true} />
                <TeamStatCard label="Recargas del Equipo" value={stats.totalTeamRecharge} icon={<HiArrowDownTray size={20} />} isCurrency={true} />
                <TeamStatCard label="Retiros del Equipo" value={stats.totalWithdrawals} icon={<HiArrowUpTray size={20} />} isCurrency={true} />
              </motion.div>
              {/* --- FIN DE LA CORRECCIÓN DE UI --- */}

              <motion.div variants={itemVariants} className="bg-dark-secondary p-4 rounded-xl border border-white/10 space-y-4">
                <div className="flex items-center space-x-2">
                  <p className="flex-1 bg-black/30 text-text-secondary p-3 rounded-lg truncate">{referralLink}</p>
                  <button onClick={copyLink} className="bg-gradient-to-r from-accent-start to-accent-end text-white font-bold py-3 px-6 rounded-lg active:scale-95 transition-transform">Copiar</button>
                </div>
                <h3 className="text-base font-semibold text-white pt-2">Compartir en</h3>
                <div className="grid grid-cols-7 gap-2">
                  {socialIcons.map(({ Icon, name }) => (
                    <button 
                      key={name} 
                      onClick={() => handleShare(name)} 
                      className="bg-black/30 aspect-square rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors active:scale-90"
                    >
                      <Icon size={20} />
                    </button>
                  ))}
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3">
                {(stats.levels || []).map(levelInfo => (
                  <TeamLevelCard
                    key={levelInfo.level}
                    level={levelInfo.level}
                    totalMembers={levelInfo.totalMembers}
                    validMembers={levelInfo.validMembers}
                    onShowDetails={handleShowDetails}
                  />
                ))}
              </motion.div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="fixed bottom-[100px] left-0 right-0 w-full max-w-lg mx-auto px-4 z-40">
        <button
          onClick={() => {
            triggerImpactHaptic('heavy');
            handleShare('telegram');
          }}
          className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-lg font-bold rounded-full shadow-lg shadow-purple-500/40 transform active:scale-95 transition-all"
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
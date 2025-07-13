import React, { useState, useEffect } from 'react';
import useUserStore from '../store/userStore';
import useTeamStore from '../store/teamStore';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

import TeamLevelCard from '../components/team/TeamLevelCard';
import Loader from '../components/common/Loader';
import TeamLevelDetailsModal from '../components/team/TeamLevelDetailsModal';
import { triggerImpactHaptic, triggerNotificationHaptic } from '../utils/haptics';

// --- CAMBIO CLAVE: Se han separado las importaciones de iconos ---
// FaTelegramPlane pertenece a 'react-icons/fa' (Font Awesome 5)
import { FaTelegramPlane } from "react-icons/fa"; 
// El resto de iconos sí pertenecen a 'react-icons/fa6' (Font Awesome 6)
import { FaXTwitter, FaFacebookF, FaLinkedinIn, FaWhatsapp, FaInstagram, FaTiktok } from "react-icons/fa6";

const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };
  const TeamPage = () => {
  const { user } = useUserStore();
  const { stats, loading, error, fetchTeamStats } = useTeamStore(state => ({
    stats: state.stats || { levels: [] }, // Estado inicial seguro
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

   const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('¡Enlace copiado!');
    triggerNotificationHaptic('success');
  };

  const socialIcons = [
    { Icon: FaXTwitter, name: 'twitter' }, { Icon: FaFacebookF, name: 'facebook' },
    { Icon: FaTelegramPlane, name: 'telegram' }, { Icon: FaLinkedinIn, name: 'linkedin' },
    { Icon: FaWhatsapp, name: 'whatsapp' }, { Icon: FaInstagram, name: 'instagram' },
    { Icon: FaTiktok, name: 'tiktok' },
  ];

     return (
    <>
      <div className="flex flex-col h-full space-y-6 overflow-y-auto pb-24">
        <AnimatePresence mode="wait">
          {loading && stats.levels.length === 0 ? (
            <motion.div key="loader"><Loader /></motion.div>
          ) : error ? (
            <motion.div key="error" className="text-center text-red-400">{error}</motion.div>
          ) : (
            <motion.div key="content" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
              
              <motion.div variants={itemVariants} className="bg-dark-secondary p-4 rounded-xl border border-white/10 space-y-4">
                <h2 className="text-lg font-bold text-white">Comparte tu enlace y empieza a ganar dinero</h2>
                <div className="flex items-center space-x-2">
                  <p className="flex-1 bg-black/30 text-text-secondary p-3 rounded-lg truncate">{referralLink}</p>
                  <button onClick={copyLink} className="bg-gradient-to-r from-accent-start to-accent-end text-white font-bold py-3 px-6 rounded-lg">Copiar</button>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="bg-dark-secondary p-4 rounded-xl border border-white/10 space-y-3">
                <h3 className="text-base font-semibold text-white">Compartir en</h3>
                <div className="grid grid-cols-7 gap-2">
                  {socialIcons.map(({ Icon, name }) => (
                    <button key={name} onClick={() => triggerImpactHaptic()} className="bg-black/30 aspect-square rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors">
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

              <motion.div variants={itemVariants}>
                 <button onClick={() => triggerImpactHaptic('heavy')} className="w-full py-4 bg-pink-500 text-white text-lg font-bold rounded-xl shadow-lg shadow-pink-500/30 transform active:scale-95 transition-all">
                    COMPARTIR CON AMIGOS
                 </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isModalOpen && ( <TeamLevelDetailsModal level={selectedLevel} onClose={handleCloseModal} /*...etc*/ /> )}
      </AnimatePresence>
    </>
  );
};

export default TeamPage;
// --- END OF FILE src/pages/TeamPage.jsx ---
// RUTA: frontend/src/pages/HomePage.jsx (v4.7 - BUILD FIX FINALÍSIMO)

import React from 'react';
import { useTranslation } from 'react-i18next';
import useUserStore from '../store/userStore';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

// --- INICIO DE LA CORRECCIÓN CRÍTICA 2 ---
// Se importan los componentes que SÍ EXISTEN en su proyecto,
// basándonos en la evidencia de su sistema de archivos.
import ToolCard from '../components/tools/ToolCard'; 
import NotificationFeed from '../components/home/NotificationFeed'; // Reemplaza al inexistente ActivityTicker
// --- FIN DE LA CORRECCIÓN CRÍTICA 2 ---

import TaskCenter from '../components/home/TaskCenter';
import Loader from '../components/common/Loader';

const UserHeader = ({ user }) => {
    const balance = user?.balance?.usdt || 0;
    
    return (
        <div className="flex items-center gap-4 p-4 bg-card/70 backdrop-blur-md rounded-2xl border border-border shadow-medium">
            <img 
                src={user?.photoUrl || '/assets/images/user-avatar-placeholder.png'} 
                alt="Avatar"
                className="w-16 h-16 rounded-full object-cover border-2 border-accent-primary/50"
            />
            <div className="flex-1">
                <p className="text-lg font-bold text-text-primary">{user?.username || 'Usuario'}</p>
                <p className="text-xs text-text-secondary font-mono">ID: {user?.telegramId}</p>
            </div>
            <div className="text-right">
                <p className="font-bold text-accent-primary text-xl">{balance.toFixed(2)}</p>
                <p className="text-xs text-text-secondary">USDT</p>
            </div>
        </div>
    );
};

const FactoryAnimation = () => {
    const { t } = useTranslation();
    const [isVideoLoading, setVideoLoading] = React.useState(true);
    return (
        <div className="relative w-full max-w-sm mx-auto aspect-square rounded-3xl overflow-hidden bg-black/5 border border-white/10 shadow-medium">
            {isVideoLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <Loader text={t('homePage.loadingAnimation', 'Cargando animación...')} />
                </div>
            )}
            <video
                src="/animations/factory-animation.mp4"
                autoPlay
                loop
                muted
                playsInline
                onLoadedData={() => setVideoLoading(false)}
                className={`w-full h-full object-cover transition-opacity duration-500 ${isVideoLoading ? 'opacity-0' : 'opacity-100'}`}
            />
        </div>
    );
};

const HomePage = () => {
    const { t } = useTranslation();
    const { user, setUser } = useUserStore();

    const handleClaim = async (purchasedFactoryId) => {
        toast.loading(t('homePage.toasts.claiming'), { id: 'claim_request' });
        try {
            const response = await api.post('/wallet/claim-production', { purchasedFactoryId });
            setUser(response.data.user);
            toast.success(response.data.message, { id: 'claim_request' });
        } catch (error) {
            toast.error(error.response?.data?.message || t('common.error'), { id: 'claim_request' });
        }
    };

    if (!user) {
        return <div className="flex items-center justify-center h-full"><Loader text={t('common.loadingUser')} /></div>;
    }

    const purchasedFactories = user?.purchasedFactories || [];
    
    return (
        <div className="relative min-h-full">
            <div className="absolute inset-0 z-[-1] bg-home-background bg-cover bg-center bg-no-repeat"></div>
            
            <motion.div 
                className="flex flex-col gap-6 p-4 pt-6 pb-28" 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <UserHeader user={user} />
                
                {/* --- INICIO DE LA CORRECCIÓN CRÍTICA 2 --- */}
                {/* Se renderiza el componente correcto: <NotificationFeed /> */}
                <NotificationFeed />
                {/* --- FIN DE LA CORRECCIÓN CRÍTICA 2 --- */}
                
                <FactoryAnimation />
                <div>
                    <h2 className="text-xl font-bold text-text-primary mb-3">{t('homePage.myFactories')}</h2>
                    {purchasedFactories.length > 0 ? (
                        <div className="space-y-4">
                            {purchasedFactories.map(pf => (
                                <ToolCard 
                                    key={pf._id} 
                                    tool={pf}
                                    onClaim={handleClaim}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-card/70 backdrop-blur-md rounded-2xl p-8 text-center text-text-secondary border border-border shadow-medium">
                            <p>{t('homePage.noFactories')}</p>
                            <p className="text-sm mt-2">{t('homePage.goToStore')}</p>
                        </div>
                    )}
                </div>
                 <div>
                    <h2 className="text-xl font-bold text-text-primary mb-3">{t('homePage.tasks')}</h2>
                    <TaskCenter />
                </div>
            </motion.div>
        </div>
    );
};

export default HomePage;
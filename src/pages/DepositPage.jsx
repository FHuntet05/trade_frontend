// RUTA: frontend/src/pages/DepositPage.jsx
// --- INICIO DE LA CORRECCIÓN DE RENDERIZADO ---

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
// Se importan los iconos que faltaban y se unifican. Se eliminan los no usados.
import { CopyIcon } from '@/components/icons/AppIcons';
import { HiChevronLeft, HiExclamationTriangle } from 'react-icons/hi2';
import { FaCheck } from 'react-icons/fa'; // Se usa un icono estándar para el checkmark.
import api from '../api/axiosConfig';

const DepositPage = () => {
  const { t } = useTranslation();
  // El parámetro en la ruta es `networkId`, se debe usar consistentemente.
  const { networkId } = useParams(); 
  const navigate = useNavigate();
  
  const [depositInfo, setDepositInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState('');

  useEffect(() => {
    // Se corrige el nombre del parámetro en la llamada a la API.
    api.get(`/wallet/deposit-address?network=${networkId}`)
      .then(res => setDepositInfo(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [networkId]);

  const handleCopy = () => {
    if (depositInfo?.address) {
      navigator.clipboard.writeText(depositInfo.address);
      setCopySuccess(t('common.copied'));
      setTimeout(() => setCopySuccess(''), 2000);
    }
  };
  
  // Se añade un console.log para verificar el montaje del componente.
  console.log('Renderizando DepositPage');

  return (
    // La estructura JSX se mantiene, pero ahora los iconos están definidos.
    <div className="flex flex-col h-full space-y-6 animate-fade-in p-4 bg-system-background">
      <div className="text-white space-y-6">
        <header className="flex items-center justify-between">
          <button onClick={() => navigate(-1)}><HiChevronLeft size={28} /></button>
          <h1 className="text-xl font-bold">{t('depositPage.title')}</h1>
          <div className="w-7"></div>
        </header>
        
        {loading && <div className="text-center py-10">{t('depositPage.loadingAddress')}</div>}
        
        {!loading && depositInfo && (
          <main className="flex flex-col items-center space-y-6">
            <div className="bg-white p-2 rounded-lg">
              <img src={depositInfo.qrCodeUrl} alt="QR de depósito" className="w-40 h-40" />
            </div>
            
            <p className="text-sm text-gray-400">{t('depositPage.addressLabel', { network: depositInfo.network.toUpperCase() })}</p>
            
            <div className="w-full bg-gray-900/50 border border-white/20 rounded-lg p-2 flex items-center gap-2">
              <span className="text-sm break-all flex-grow px-2">{depositInfo.address}</span>
              <button onClick={handleCopy} className="bg-pink-500 rounded p-2 flex-shrink-0">
                {copySuccess ? <FaCheck className="w-5 h-5" /> : <CopyIcon className="w-5 h-5" />}
              </button>
            </div>

            <button className="w-full py-3 font-bold text-white rounded-lg bg-gradient-to-r from-pink-500 to-purple-600">
              {t('depositPage.rechargeCompleteButton')}
            </button>

            <div className="w-full text-sm text-gray-300 space-y-2">
              <h3 className="flex items-center gap-2 font-semibold"><HiExclamationTriangle />{t('depositPage.reminder.title')}</h3>
              <ul className="list-decimal list-inside space-y-1 text-gray-400">
                <li>{t('depositPage.reminder.item1')}</li>
                <li>{t('depositPage.reminder.item2', { network: depositInfo.network.toUpperCase() })}</li>
                <li>{t('depositPage.reminder.item3')}</li>
                <li>{t('depositPage.reminder.item4')}</li>
              </ul>
            </div>
          </main>
        )}
      </div>
    </div>
  );
};
export default DepositPage;

// --- FIN DE LA CORRECCIÓN DE RENDERIZADO ---
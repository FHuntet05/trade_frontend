// frontend/src/pages/DepositPage.jsx (i18n)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // i18n
import { HiChevronLeft, HiOutlineClipboardDocument, HiExclamationTriangle } from 'react-icons/hi2';
import api from '../api/axiosConfig';

const DepositPage = () => {
  const { t } = useTranslation(); // i18n
  const { networkId } = useParams();
  const navigate = useNavigate();
  
  const [depositInfo, setDepositInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState('');

  useEffect(() => {
    api.get(`/wallet/deposit-address?network=${networkId}`)
      .then(res => setDepositInfo(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [networkId]);

  const handleCopy = () => {
    if (depositInfo?.address) {
      navigator.clipboard.writeText(depositInfo.address);
      setCopySuccess(t('common.copied')); // i18n
      setTimeout(() => setCopySuccess(''), 2000);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6 animate-fade-in">
      <div className="text-white space-y-6">
        <header className="flex items-center justify-between">
          <button onClick={() => navigate(-1)}><HiChevronLeft size={28} /></button>
          <h1 className="text-xl font-bold">{t('depositPage.title')}</h1> {/* i18n */}
          <div className="w-7"></div>
        </header>
        
        {loading && <div className="text-center py-10">{t('depositPage.loadingAddress')}</div>} {/* i18n */}
        
        {!loading && depositInfo && (
          <main className="flex flex-col items-center space-y-6">
            <div className="bg-white p-2 rounded-lg">
              <img src={depositInfo.qrCodeUrl} alt="QR de depósito" className="w-40 h-40" />
            </div>
            
            <p className="text-sm text-gray-400">{t('depositPage.addressLabel', { network: depositInfo.network.toUpperCase() })}</p> {/* i18n */}
            
            <div className="w-full bg-gray-900/50 border border-white/20 rounded-lg p-2 flex items-center gap-2">
              <span className="text-sm break-all flex-grow px-2">{depositInfo.address}</span>
              <button onClick={handleCopy} className="bg-pink-500 rounded p-2 flex-shrink-0">
                {copySuccess ? 'OK' : <HiOutlineClipboardDocument />}
              </button>
            </div>

            <button className="w-full py-3 font-bold text-white rounded-lg bg-gradient-to-r from-pink-500 to-purple-600">
              {t('depositPage.rechargeCompleteButton')} {/* i18n */}
            </button>

            <div className="w-full text-sm text-gray-300 space-y-2">
              <h3 className="flex items-center gap-2 font-semibold"><HiExclamationTriangle />{t('depositPage.reminder.title')}</h3> {/* i18n */}
              <ul className="list-decimal list-inside space-y-1 text-gray-400">
                <li>{t('depositPage.reminder.item1')}</li> {/* i18n */}
                <li>{t('depositPage.reminder.item2', { network: depositInfo.network.toUpperCase() })}</li> {/* i18n */}
                <li>{t('depositPage.reminder.item3')}</li> {/* i18n */}
                <li>{t('depositPage.reminder.item4')}</li> {/* i18n */}
              </ul>
            </div>
          </main>
        )}
      </div>
    </div>
  );
};
export default DepositPage;
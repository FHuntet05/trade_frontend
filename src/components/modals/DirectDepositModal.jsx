// frontend/src/components/modals/DirectDepositModal.jsx (i18n)

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { useTranslation } from 'react-i18next'; // i18n
import { HiXMark, HiOutlineClipboardDocument, HiOutlineClipboardDocumentCheck } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
const modalVariants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 200, damping: 25 } },
  exit: { scale: 0.9, opacity: 0, transition: { duration: 0.2 } },
};

const useCopy = () => {
  const { t } = useTranslation(); // i18n
  const [isCopied, setIsCopied] = useState(false);
  
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    toast.success(t('common.copied')); // i18n
    setTimeout(() => setIsCopied(false), 2000);
  };
  
  return [isCopied, handleCopy];
};

const DirectDepositModal = ({ paymentInfo, onClose }) => {
  const { t } = useTranslation(); // i18n
  const [addressCopied, copyAddress] = useCopy();
  const [amountCopied, copyAmount] = useCopy();
  const [timeLeft, setTimeLeft] = useState(30 * 60);

  useEffect(() => {
    if (timeLeft === 0) return;
    const intervalId = setInterval(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);
    return () => clearInterval(intervalId);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4"
      variants={backdropVariants} initial="hidden" animate="visible" exit="hidden" onClick={onClose}
    >
      <motion.div
        className="relative bg-dark-primary rounded-2xl border border-white/10 w-full max-w-md text-white flex flex-col max-h-[90vh]"
        variants={modalVariants} onClick={(e) => e.stopPropagation()}
      >
        <header className="flex-shrink-0 flex justify-between items-center p-6 pb-4">
          <h2 className="text-xl font-bold">{t('directDepositModal.title')}</h2> {/* i18n */}
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 transition-colors">
            <HiXMark className="w-6 h-6" />
          </button>
        </header>

        <div className="flex-grow overflow-y-auto px-6">
          <div className="flex flex-col items-center space-y-4">
            <p className="text-center text-text-secondary">
              {t('directDepositModal.instruction')} {/* i18n */}
            </p>

            <div className="bg-white p-4 rounded-lg">
              <QRCodeSVG value={paymentInfo.paymentAddress} size={160} />
            </div>

            <div className="text-center text-lg font-mono text-red-400">
              {`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
            </div>

            <div className="w-full bg-black/20 p-3 rounded-lg text-left">
              <label className="text-sm text-text-secondary">{t('directDepositModal.amountLabel')}</label> {/* i18n */}
              <div className="flex justify-between items-center">
                <p className="text-lg font-bold text-accent-start break-all">{paymentInfo.paymentAmount}</p>
                <button onClick={() => copyAmount(paymentInfo.paymentAmount)} className="p-2">
                  {amountCopied ? <HiOutlineClipboardDocumentCheck className="w-5 h-5 text-green-400" /> : <HiOutlineClipboardDocument className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="w-full bg-black/20 p-3 rounded-lg text-left">
              <label className="text-sm text-text-secondary">{t('directDepositModal.addressLabel', { currency: paymentInfo.currency })}</label> {/* i18n */}
              <div className="flex justify-between items-center">
                <p className="text-sm font-mono break-all pr-2">{paymentInfo.paymentAddress}</p>
                <button onClick={() => copyAddress(paymentInfo.paymentAddress)} className="p-2">
                  {addressCopied ? <HiOutlineClipboardDocumentCheck className="w-5 h-5 text-green-400" /> : <HiOutlineClipboardDocument className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="w-full text-xs text-center text-yellow-400/80 bg-yellow-400/10 p-3 rounded-lg">
              <strong>{t('directDepositModal.warning', { currency: paymentInfo.currency })}</strong> {/* i18n */}
            </div>
          </div>
        </div>
        
        <div className="flex-shrink-0 p-6 pt-4">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-accent-start to-accent-end text-white text-lg font-bold rounded-full"
          >
            {t('directDepositModal.paidButton')} {/* i18n */}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DirectDepositModal;
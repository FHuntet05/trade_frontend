// src/components/tools/CryptoInvoiceModal.jsx (DISEÑO MEJORADO)
import React from 'react';
import { motion } from 'framer-motion';
import { HiXMark, HiOutlineClipboardDocument } from 'react-icons/hi2';
import QRCode from 'react-qr-code';
import toast from 'react-hot-toast';

const CryptoInvoiceModal = ({ tool, invoiceData, onClose }) => {
  if (!invoiceData) return null;

  const handleCopy = (text, entity) => {
    navigator.clipboard.writeText(text);
    toast.success(`¡${entity} copiado al portapapeles!`);
  };

  // Extraemos la URL de pago para más claridad.
  const paymentUrl = invoiceData.pay_url;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4" onClick={onClose}>
      <motion.div
        className="bg-dark-secondary border border-white/10 rounded-2xl w-full max-w-sm text-white p-6 relative flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <button className="absolute top-4 right-4 text-text-secondary hover:text-white" onClick={onClose}><HiXMark className="w-6 h-6" /></button>
        
        <h2 className="text-xl font-bold text-center">Finalizar Compra</h2>
        <p className="text-sm text-text-secondary text-center mt-1 mb-4">Escanea el código o usa la URL para pagar</p>
        
        {/* --- Sección de Cantidad a Pagar --- */}
        <div className="w-full bg-dark-primary p-4 rounded-lg text-center my-2">
            <p className="text-sm text-text-secondary">Cantidad a enviar</p>
            <p className="text-3xl font-bold text-accent-start">{invoiceData.amount} <span className="text-xl">{invoiceData.currency}</span></p>
        </div>

        {/* --- Sección del Código QR --- */}
        <div className="bg-white p-3 rounded-lg mt-4">
          <QRCode value={paymentUrl} size={180} />
        </div>

        {/* --- Sección de la URL de Pago --- */}
        <div className="w-full bg-dark-primary p-2 pl-4 rounded-lg flex items-center justify-between gap-2 mt-4">
          <span className="text-xs text-text-secondary overflow-hidden text-ellipsis whitespace-nowrap">{paymentUrl}</span>
          <button onClick={() => handleCopy(paymentUrl, 'URL de pago')} className="p-2 text-text-secondary hover:text-white flex-shrink-0">
            <HiOutlineClipboardDocument className="w-5 h-5" />
          </button>
        </div>
        
        <a 
          href={paymentUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block w-full text-center mt-6 py-3 bg-gradient-to-r from-accent-start to-accent-end text-white font-bold rounded-full shadow-glow"
        >
          IR A PAGAR
        </a>
      </motion.div>
    </div>
  );
};

export default CryptoInvoiceModal;
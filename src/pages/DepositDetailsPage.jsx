// RUTA: frontend/src/pages/DepositDetailsPage.jsx (VERSIÓN "NEXUS DEPOSIT FLOW - CLEAN QR & CONDITIONAL UI")
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react'; // [NEXUS DEPOSIT FLOW] Usamos la librería base para un QR limpio.
import toast from 'react-hot-toast';
import { HiOutlineClipboardDocument, HiCheckCircle } from 'react-icons/hi2';
import StaticPageLayout from '../components/layout/StaticPageLayout';

const DepositDetailsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [copied, setCopied] = useState(false);

  if (!location.state || !location.state.option) {
    return (
      <StaticPageLayout title="Error">
        <div className="text-center p-8 text-red-400">
          <h2 className="text-xl font-bold mb-2">Error de Flujo de Pago</h2>
          <p className="text-text-secondary">No se recibieron los datos necesarios. Por favor, inicia el proceso de depósito de nuevo.</p>
          <button onClick={() => navigate('/crypto-selection')} className="mt-6 px-4 py-2 bg-accent-start rounded-lg font-semibold text-white">
            Volver a la Selección
          </button>
        </div>
      </StaticPageLayout>
    );
  }

  const { option, amountToSend } = location.state;

  const handleCopy = (textToCopy) => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success('¡Copiado al portapapeles!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <StaticPageLayout title={`Depositar ${option.name}`}>
      <div className="flex flex-col items-center text-center p-4 space-y-6">
        
        {/* [NEXUS DEPOSIT FLOW] - Paso 3: QR Code limpio.
            - Cambiamos a QRCodeCanvas de 'qrcode.react'.
            - Eliminamos todas las propiedades de logo para un QR limpio y escaneable.
        */}
        <div className="p-4 bg-white rounded-lg">
          <QRCodeCanvas 
            value={option.address} 
            size={200}
            bgColor={"#ffffff"}
            fgColor={"#000000"}
            level={"H"} // Nivel de corrección de errores alto
          />
        </div>

        {/* [NEXUS DEPOSIT FLOW] - Paso 4: Visualización de Monto Condicional. */}
        {amountToSend ? (
          // Si amountToSend tiene un valor, mostramos el monto exacto.
          <div className="w-full">
            <p className="text-sm text-text-secondary">Monto exacto a enviar:</p>
            <div 
              onClick={() => handleCopy(parseFloat(amountToSend).toFixed(8))}
              className="w-full mt-2 p-3 bg-dark-secondary rounded-lg border border-white/10 flex items-center justify-between cursor-pointer"
            >
                <p className="text-xl font-mono font-bold text-accent-start break-all">{parseFloat(amountToSend).toFixed(8)} {option.chain}</p>
                <HiOutlineClipboardDocument className="w-6 h-6 text-text-secondary flex-shrink-0 ml-2" />
            </div>
          </div>
        ) : (
          // Si amountToSend es null, mostramos un mensaje para depósito manual.
          <div className="w-full text-center">
             <p className="text-sm text-text-secondary">Envía la cantidad que desees a la siguiente dirección.</p>
          </div>
        )}

        {/* Dirección de la Billetera */}
        <div className="w-full">
          <p className="text-sm text-text-secondary mb-2">Dirección de depósito:</p>
          <div 
            onClick={() => handleCopy(option.address)} 
            className="w-full p-3 bg-dark-secondary rounded-lg border border-white/10 flex items-center justify-between cursor-pointer"
          >
            <span className="font-mono text-sm break-all text-left">{option.address}</span>
            {copied 
              ? <HiCheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 ml-2" />
              : <HiOutlineClipboardDocument className="w-6 h-6 text-text-secondary flex-shrink-0 ml-2" />
            }
          </div>
        </div>

        {/* Advertencia de Red */}
        <div className="w-full p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-300 text-sm">
          <p className="font-bold">¡Atención!</p>
          <p>{option.warning}</p>
        </div>
        
      </div>
    </StaticPageLayout>
  );
};

export default DepositDetailsPage;
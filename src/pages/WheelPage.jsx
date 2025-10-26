// RUTA: frontend/src/pages/WheelPage.jsx
// --- VERSIÓN DEFINITIVA CON LIBRERÍA PROFESIONAL Y LAYOUT CORREGIDO ---

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Wheel } from "react-custom-roulette";

import useUserStore from "@/store/userStore";
import { IOSButton, IOSCard } from "../components/ui/IOSComponents";
import { FiCopy, FiGift } from "react-icons/fi";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";
import api from "@/api/axiosConfig";

// Recompensas con tamaños de imagen estandarizados
const rewards = [
  { text: "$1.00", image: { uri: "/assets/images/USDT.png", sizeMultiplier: 0.6 } },
  { option: "🎁 +1 Giro" },
  { text: "$0.10", image: { uri: "/assets/images/USDT.png", sizeMultiplier: 0.6 } },
  { text: "$5.00", image: { uri: "/assets/images/USDT.png", sizeMultiplier: 0.6 } },
  { option: "🎁 +2 Giros" },
  { text: "$0.50", image: { uri: "/assets/images/USDT.png", sizeMultiplier: 0.6 } },
  { option: "😢 NADA" },
  { text: "$10.00", image: { uri: "/assets/images/USDT.png", sizeMultiplier: 0.6 } }
];

const WheelPage = () => {
  const { user, updateUserBalances } = useUserStore();
  const availableSpins = user?.balance?.spins || 0;
  
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);

  const handleSpinClick = async () => {
    if (availableSpins > 0 && !mustSpin) {
      try {
        const response = await api.post("/api/wheel/spin");
        const { resultIndex } = response.data;
        
        setPrizeNumber(resultIndex);
        setMustSpin(true);
      } catch (error) {
        toast.error("Error al obtener el premio.");
      }
    }
  };

  const handleStopSpinning = async () => {
    setMustSpin(false);
    
    // Volvemos a llamar para confirmar el premio y obtener los saldos actualizados
    try {
        const res = await api.post("/api/wheel/spin");
        const { newBalances, prize } = res.data;
        
        updateUserBalances(newBalances);
        toast.success(`¡Ganaste ${prize.text}! 🎉`);
        confetti({ particleCount: 120, spread: 85, origin: { y: 0.6 } });
    } catch (error) {
        toast.error("Error al confirmar el premio.");
    }
  };

  const copyLink = () => {
    const bot = import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'YOUR_BOT_USERNAME';
    const link = `https://t.me/${bot}?start=${user.referralCode}`;
    navigator.clipboard.writeText(link);
    toast.success("Enlace de referido copiado ✅");
  };
  
  // Transformamos los datos para la ruleta
  const rouletteData = rewards.map(reward => ({
    ...reward,
    option: reward.text || reward.option,
  }));

  return (
    <div className="min-h-screen bg-system-background px-4 pt-6 flex flex-col items-center pb-24">
      <h1 className="text-2xl font-ios-display font-bold text-text-primary mb-1">Ruleta de Premios</h1>
      <p className="text-text-secondary mb-4">Invita y gana más giros.</p>

      <IOSCard className="w-full mb-6">
        <div className="flex justify-between items-center">
          <span className="text-text-secondary">Giros disponibles</span>
          <span className="text-3xl font-bold text-ios-green">{availableSpins}</span>
        </div>
      </IOSCard>

      <div className="relative w-80 h-80 md:w-96 md:h-96 mb-6 flex items-center justify-center">
        {/* PUNTERO EXTERNO (el que determina el premio) */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 w-10 h-10 z-20">
            <div 
                className="w-full h-full bg-ios-green" 
                style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }}
            ></div>
        </div>

        <Wheel
            mustStartSpinning={mustSpin}
            prizeNumber={prizeNumber}
            data={rouletteData}
            onStopSpinning={handleStopSpinning}
            
            // --- ESTILOS CLAVE PARA LOGRAR EL DISEÑO ---
            perpendicularText={true} // <-- LA PROP MÁS IMPORTANTE PARA EL LAYOUT
            textDistance={60}
            fontSize={12}
            fontFamily="Helvetica"
            
            backgroundColors={['#FFFFFF', '#F2F2F7']}
            textColors={['#333333']}
            outerBorderColor={"#E2E2E2"}
            outerBorderWidth={5}
            innerRadius={20} // Crea un círculo en el centro
            innerBorderColor={"#E2E2E2"}
            innerBorderWidth={5}
            radiusLineColor={"#E2E2E2"}
            radiusLineWidth={1}
          />
        
        {/* TRIÁNGULO DECORATIVO CENTRAL */}
        <div className="absolute w-8 h-8 bg-ios-green z-10" 
             style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}>
        </div>
      </div>

      <IOSButton
        variant="primary"
        onClick={handleSpinClick}
        disabled={mustSpin || availableSpins <= 0}
        className="w-full mb-8"
      >
        {mustSpin ? "Girando..." : availableSpins > 0 ? "Girar Ruleta" : "Sin Giros"}
      </IOSButton>

      <IOSCard className="w-full">
        <h3 className="font-semibold text-lg mb-2 text-text-primary">Gana más giros</h3>
        <p className="text-sm text-text-secondary mb-3">
          Gana un giro por cada amigo invitado.
        </p>
        <motion.button
          whileTap={{ scale: 0.97 }}
          className="w-full bg-ios-green/10 text-ios-green py-3 rounded-ios-card flex justify-center items-center gap-2"
          onClick={copyLink}
        >
          <FiCopy/> Copiar enlace de referido
        </motion.button>
      </IOSCard>
    </div>
  );
};

export default WheelPage;
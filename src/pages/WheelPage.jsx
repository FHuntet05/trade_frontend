// RUTA: frontend/src/pages/WheelPage.jsx
// --- VERSIÓN DEFINITIVA CON DEPURACIÓN VISUAL Y AJUSTE DE PRECISIÓN ---

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Wheel } from "react-custom-roulette";
import useUserStore from "@/store/userStore";
import { IOSButton, IOSCard } from "../components/ui/IOSComponents";
import { FiCopy } from "react-icons/fi";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";
import api from "@/api/axiosConfig";

// Datos con estructura unificada para la librería, con tamaños consistentes
const rewardsData = [
  { option: "$1.00", image: { uri: "/assets/images/USDT.png", sizeMultiplier: 0.5 } },
  { option: "🎁 +1 Giro" },
  { option: "$0.10", image: { uri: "/assets/images/USDT.png", sizeMultiplier: 0.5 } },
  { option: "$5.00", image: { uri: "/assets/images/USDT.png", sizeMultiplier: 0.5 } },
  { option: "🎁 +2 Giros" },
  { option: "$0.50", image: { uri: "/assets/images/USDT.png", sizeMultiplier: 0.5 } },
  { option: "😢 NADA" },
  { option: "$10.00", image: { uri: "/assets/images/USDT.png", sizeMultiplier: 0.5 } }
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
        setPrizeNumber(response.data.resultIndex);
        setMustSpin(true);
      } catch (error) { toast.error("Error al iniciar el giro."); }
    }
  };

  const handleStopSpinning = async () => {
    setMustSpin(false);
    try {
        const res = await api.post("/api/wheel/spin");
        updateUserBalances(res.data.newBalances);
        toast.success(`¡Ganaste ${rewardsData[prizeNumber].option}! 🎉`);
        confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
    } catch (error) { toast.error("Error al confirmar el premio."); }
  };
  
  const copyLink = () => {
    const bot = import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'YOUR_BOT';
    const link = `https://t.me/${bot}?start=${user.referralCode}`;
    navigator.clipboard.writeText(link);
    toast.success("Enlace de referido copiado");
  };

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

      {/* CONTENEDOR DE LA RULETA Y SU PUNTERO ÚNICO */}
      <div className="relative w-80 h-80 md:w-96 md:h-96 mb-6 flex items-center justify-center">
        
        {/* 1. ÚNICO PUNTERO SUPERIOR (TIPO GOTA) - NINGÚN OTRO DEBE EXISTIR */}
        <div 
            className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-3 w-10 h-12 z-20" 
            style={{ clipPath: 'path("M20 0C8.954 0 0 8.954 0 20C0 24.418 1.582 28.435 4.186 31.814L20 48L35.814 31.814C38.418 28.435 40 24.418 40 20C40 8.954 31.046 0 20 0Z")' }}
        >
            <div className="w-full h-full bg-red-500"></div>
        </div>

        <Wheel
            mustStartSpinning={mustSpin}
            prizeNumber={prizeNumber}
            data={rewardsData}
            onStopSpinning={handleStopSpinning}
            
            // --- AJUSTES FINALES DE PRECISIÓN ---
            perpendicularText={true}   // 3. ASEGURA LA ORIENTACIÓN CORRECTA DEL TEXTO
            textDistance={75}          // Ajusta la distancia del texto desde el centro
            fontSize={14}
            
            backgroundColors={['#FFFFFF', '#F2F2F7']}
            textColors={['#333333']}
            outerBorderColor={"#E2E2E2"}
            outerBorderWidth={5}
            innerRadius={15}           // 2. CÍRCULO CENTRAL REDUCIDO
            innerBorderColor={"#E2E2E2"}
            innerBorderWidth={3}
            radiusLineColor={"#E2E2E2"}
            radiusLineWidth={1}
          />
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
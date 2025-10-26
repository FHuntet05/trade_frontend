// RUTA: frontend/src/pages/WheelPage.jsx
// --- VERSIÓN CON CORRECCIÓN DE CRASH POR IMPORTACIÓN FALTANTE ---

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Wheel } from "react-custom-roulette";

import useUserStore from "@/store/userStore";
import { IOSButton, IOSCard } from "../components/ui/IOSComponents";
// --- INICIO DE LA CORRECCIÓN CRÍTICA ---
import { FiCopy, FiGift } from "react-icons/fi"; // <<< LÍNEA AÑADIDA PARA CORREGIR EL CRASH
// --- FIN DE LA CORRECCIÓN CRÍTICA ---
import toast from "react-hot-toast";
import confetti from "canvas-confetti";
import api from "@/api/axiosConfig";

// La definición de las recompensas no necesita cambios.
const rewards = [
  { text: "$1.00", type: 'image', value: "/assets/images/USDT.png" },
  { text: "+1 Giro", type: 'emoji', value: "🎁" },
  { text: "$0.10", type: 'image', value: "/assets/images/USDT.png" },
  { text: "$5.00", type: 'image', value: "/assets/images/USDT.png" },
  { text: "+2 Giros", type: 'emoji', value: "🎁" },
  { text: "$0.50", type: 'image', value: "/assets/images/USDT.png" },
  { text: "NADA", type: 'emoji', value: "😢" },
  { text: "$10.00", type: 'image', value: "/assets/images/USDT.png" }
];

const WheelPage = () => {
  const { user, updateUserBalances } = useUserStore();
  const availableSpins = user?.balance?.spins || 0;
  
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [rouletteData, setRouletteData] = useState([]);

  useEffect(() => {
    const data = rewards.map(reward => {
      if (reward.type === 'image') {
        return { 
          option: reward.text,
          image: { uri: reward.value, sizeMultiplier: 0.6 }
        };
      }
      return { option: `${reward.value} ${reward.text}` };
    });
    setRouletteData(data);
  }, []);

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

  return (
    <div className="min-h-screen bg-system-background px-4 pt-6 flex flex-col items-center pb-12">
      <h1 className="text-2xl font-ios-display font-bold text-text-primary mb-1">Ruleta de Premios</h1>
      <p className="text-text-secondary mb-4">Invita y gana más giros.</p>

      <IOSCard className="w-full mb-6">
        <div className="flex justify-between items-center">
          <span className="text-text-secondary">Giros disponibles</span>
          <span className="text-3xl font-bold text-ios-green">{availableSpins}</span>
        </div>
      </IOSCard>

      <div className="relative w-80 h-80 md:w-96 md:h-96 mb-6">
        {rouletteData.length > 0 && (
          <Wheel
            mustStartSpinning={mustSpin}
            prizeNumber={prizeNumber}
            data={rouletteData}
            onStopSpinning={handleStopSpinning}
            backgroundColors={['#FFFFFF', '#F2F2F7']}
            textColors={['#333333']}
            outerBorderColor={"#E2E2E2"}
            outerBorderWidth={5}
            innerBorderColor={"#E2E2E2"}
            innerBorderWidth={10}
            radiusLineColor={"#E2E2E2"}
            radiusLineWidth={1}
            fontSize={12}
            textDistance={75}
          />
        )}
         <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-10"
            style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }}
         >
             <div className="w-8 h-8 bg-ios-green"></div>
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
          {/* El error ocurría aquí porque FiCopy no estaba importado */}
          <FiCopy/> Copiar enlace de referido
        </motion.button>
      </IOSCard>
    </div>
  );
};

export default WheelPage;
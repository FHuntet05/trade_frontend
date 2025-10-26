import React, { useState } from "react";
import { motion, useAnimation } from "framer-motion";
import useUserStore from "@/store/userStore";
import { IOSButton, IOSCard } from "../components/ui/IOSComponents";
import { FiCopy, FiGift } from "react-icons/fi";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";
import api from "@/api/axiosConfig";

// Recompensas bien definidas
const rewards = [
  { text: "$1.00", icon: <img src="/assets/images/USDT.png" className="w-7 h-7" /> },
  { text: "+1 Giro", icon: <FiGift className="w-6 h-6 text-yellow-500" /> },
  { text: "$0.10", icon: <img src="/assets/images/USDT.png" className="w-6 h-6" /> },
  { text: "$5.00", icon: <img src="/assets/images/USDT.png" className="w-7 h-7" /> },
  { text: "+2 Giros", icon: <FiGift className="w-6 h-6 text-yellow-500" /> },
  { text: "$0.50", icon: <img src="/assets/images/USDT.png" className="w-6 h-6" /> },
  { text: "NADA", icon: <span className="text-xl">😢</span> },
  { text: "$10.00", icon: <img src="/assets/images/USDT.png" className="w-7 h-7" /> }
];

const SEGMENT_COUNT = rewards.length;
const SEGMENT_ANGLE = 360 / SEGMENT_COUNT;

const WheelPage = () => {
  const { user, updateUserBalances } = useUserStore();
  const availableSpins = user?.balance?.spins || 0;
  const [isSpinning, setIsSpinning] = useState(false);
  const wheelControl = useAnimation();

  const spinWheel = async () => {
    if (isSpinning || availableSpins <= 0) return;
    
    setIsSpinning(true);
    try {
      const res = await api.post("/api/wheel/spin");
      const { resultIndex, newBalances, prize } = res.data;

      const finalAngle = 
        5 * 360 +
        (360 - resultIndex * SEGMENT_ANGLE - SEGMENT_ANGLE / 2);

      await wheelControl.start({
        rotate: finalAngle,
        transition: { duration: 5.5, ease: "easeOut" }
      });

      confetti({ particleCount: 120, spread: 85 });
      updateUserBalances(newBalances);
      toast.success(`¡Ganaste ${prize.text}! 🎉`);

    } catch {
      toast.error("Error al girar la ruleta");
    }
    setIsSpinning(false);
  };

  const copyLink = () => {
    const bot = import.meta.env.VITE_TELEGRAM_BOT_USERNAME;
    const link = `https://t.me/${bot}?start=${user.referralCode}`;
    navigator.clipboard.writeText(link);
    toast.success("Enlace de referido copiado ✅");
  };

  return (
    <div className="min-h-screen px-4 pt-6 flex flex-col items-center">
      
      <h1 className="text-2xl font-bold mb-1">Ruleta de Premios</h1>
      <p className="text-gray-500 mb-4">Invita y gana más giros.</p>

      <IOSCard className="w-full mb-6">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Giros disponibles</span>
          <span className="text-3xl font-bold text-ios-green">{availableSpins}</span>
        </div>
      </IOSCard>

      {/* ✅ RUEDA REAL */}
      <div className="relative w-80 h-80 mb-6">
        {/* Flecha */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
          <div className="w-7 h-7 bg-ios-green clip-triangle"></div>
        </div>

        <motion.div animate={wheelControl} className="wheel">
          {rewards.map((reward, i) => (
            <div
              key={i}
              className="segment"
              style={{ transform: `rotate(${i * SEGMENT_ANGLE}deg)` }}
            >
              <div
                className="segment-content"
                style={{
                  transform: `rotate(${SEGMENT_ANGLE / 2}deg) translate(65px) rotate(${
                    -(i * SEGMENT_ANGLE + SEGMENT_ANGLE / 2)
                  }deg)`
                }}
              >
                <p className="text-xs font-bold">{reward.text}</p>
                {reward.icon}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      <IOSButton
        variant="primary"
        onClick={spinWheel}
        disabled={isSpinning || availableSpins <= 0}
        className="w-full mb-8"
      >
        {isSpinning ? "Girando..." : availableSpins > 0 ? "Girar Ruleta" : "Sin Giros"}
      </IOSButton>

      <IOSCard className="w-full">
        <h3 className="font-semibold text-lg mb-2">Gana más giros</h3>
        <p className="text-sm text-gray-500 mb-3">
          Gana un giro por cada amigo invitado.
        </p>
        <motion.button
          whileTap={{ scale: 0.97 }}
          className="w-full bg-ios-green/10 text-ios-green py-3 rounded-lg flex justify-center items-center gap-2"
          onClick={copyLink}
        >
          Copiar enlace de referido
        </motion.button>
      </IOSCard>

    </div>
  );
};

export default WheelPage;

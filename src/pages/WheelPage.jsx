// ✅ RUTA: frontend/src/pages/WheelPage.jsx
import React, { useState } from "react";
import { motion, useAnimation } from "framer-motion";
import useUserStore from "@/store/userStore";
import { IOSButton, IOSCard } from "../components/ui/IOSComponents";
import { FiCopy, FiGift } from "react-icons/fi";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";
import api from "@/api/axiosConfig";

// ✅ Recompensas limpias y claras
const rewards = [
  { text: "$1.00", icon: "/assets/images/USDT.png" },
  { text: "+1 Giro", icon: "gift" },
  { text: "$0.10", icon: "/assets/images/USDT.png" },
  { text: "$5.00", icon: "/assets/images/USDT.png" },
  { text: "+2 Giros", icon: "gift" },
  { text: "$0.50", icon: "/assets/images/USDT.png" },
  { text: "NADA", icon: "sad" },
  { text: "$10.00", icon: "/assets/images/USDT.png" },
];

const SEGMENT_COUNT = rewards.length;
const SEGMENT_ANGLE = 360 / SEGMENT_COUNT;

const WheelPage = () => {
  const { user, updateUserBalances } = useUserStore();
  const [isSpinning, setIsSpinning] = useState(false);
  const wheelControl = useAnimation();
  const availableSpins = user?.balance?.spins || 0;

  const triggerConfetti = () =>
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
    });

  const spinWheel = async () => {
    if (isSpinning || availableSpins <= 0) return;

    setIsSpinning(true);

    try {
      const res = await api.post("/api/wheel/spin");
      const { resultIndex, newBalances, prize } = res.data;

      const finalAngle =
        (5 * 360) +
        (360 - (resultIndex * SEGMENT_ANGLE) - SEGMENT_ANGLE / 2);

      await wheelControl.start({
        rotate: finalAngle,
        transition: { duration: 5.5, ease: "easeOut" },
      });

      triggerConfetti();
      updateUserBalances(newBalances);
      toast.success(`¡Ganaste ${prize.text}!`);

    } catch {
      toast.error("Ocurrió un error al girar.");
    }

    setIsSpinning(false);
  };

  const handleCopyReferralLink = () => {
    const bot = import.meta.env.VITE_TELEGRAM_BOT_USERNAME;
    const link = `https://t.me/${bot}?start=${user.referralCode}`;
    navigator.clipboard.writeText(link);
    toast.success("Enlace copiado ✅");
  };

  return (
    <div className="min-h-screen bg-system-background pb-20 px-4 flex flex-col items-center pt-6">
      <h1 className="text-2xl font-bold text-text-primary mb-2">Ruleta de Premios</h1>
      <p className="text-text-secondary mb-4">Invita y gana más giros.</p>

      <IOSCard className="w-full mb-6">
        <div className="flex justify-between items-center">
          <span className="text-text-secondary">Giros disponibles</span>
          <span className="text-3xl font-bold text-ios-green">{availableSpins}</span>
        </div>
      </IOSCard>

      <div className="relative w-80 h-80 mb-6">

  {/* Flecha */}
  <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
    <div className="w-6 h-6 bg-ios-green clip-triangle shadow-md" />
  </div>

  <motion.div
    animate={wheelControl}
    initial={{ rotate: 0 }}
    className="wheel"
  >
    {rewards.map((reward, index) => {
      const rotation = index * SEGMENT_ANGLE;
      return (
        <div
          key={index}
          className="segment"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <div
            className="segment-content"
            style={{
              transform: `rotate(${SEGMENT_ANGLE / 2}deg) translate(70px) rotate(${-(rotation + SEGMENT_ANGLE / 2)}deg)`,
            }}
          >
            <span className="text-xs font-bold mb-1">{reward.text}</span>

            {reward.icon === "gift" ? (
              <FiGift className="text-xl text-yellow-500" />
            ) : reward.icon === "sad" ? (
              <span className="text-xl">😢</span>
            ) : (
              <img src={reward.icon} className="w-6 h-6" />
            )}
          </div>
        </div>
      );
    })}
  </motion.div>
</div>


      {/* Botón Spin */}
      <IOSButton
        variant="primary"
        onClick={spinWheel}
        disabled={isSpinning || availableSpins <= 0}
        className="w-full mb-8"
      >
        {isSpinning ? "Girando..." : availableSpins > 0 ? "Girar Ruleta" : "Sin Giros"}
      </IOSButton>

      {/* Referidos */}
      <IOSCard className="w-full">
        <h3 className="text-lg font-semibold mb-3">Gana más giros</h3>
        <p className="text-sm text-text-secondary mb-4">
          Ganas un giro por cada amigo que se una con tu enlace.
        </p>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleCopyReferralLink}
          className="w-full bg-ios-green/10 text-ios-green py-3 rounded-ios flex items-center justify-center gap-2"
        >
          <FiCopy /> Copiar enlace
        </motion.button>
      </IOSCard>
    </div>
  );
};

export default WheelPage;

// RUTA: frontend/src/pages/WheelPage.jsx

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Wheel } from "react-custom-roulette";
import { FiCopy, FiExternalLink, FiCheckCircle } from "react-icons/fi";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";
import api from "@/api/axiosConfig";
import useUserStore from "@/store/userStore";
import useTeamStore from "@/store/teamStore";
import { IOSButton, IOSCard } from "../components/ui/IOSComponents";

const FALLBACK_SEGMENTS = [
  { option: "$1.00", image: { uri: "/assets/images/USDT.png", sizeMultiplier: 0.5, offsetY: 25 } },
  { option: "+1 Giro 🎁" },
  { option: "$0.10", image: { uri: "/assets/images/USDT.png", sizeMultiplier: 0.5, offsetY: 25 } },
  { option: "$5.00", image: { uri: "/assets/images/USDT.png", sizeMultiplier: 0.5, offsetY: 25 } },
  { option: "+2 Giros 🎁" },
  { option: "$0.50", image: { uri: "/assets/images/USDT.png", sizeMultiplier: 0.5, offsetY: 25 } },
  { option: "Sin premio" },
  { option: "$10.00", image: { uri: "/assets/images/USDT.png", sizeMultiplier: 0.5, offsetY: 25 } }
];

const MILESTONE_TASKS = [
  {
    id: "milestone_100",
    title: "Invita 100 referidos válidos",
    description: "Cuando 100 amigos completen su primer depósito recibes 100 giros extra.",
    target: 100,
    rewardSpins: 100,
  },
  {
    id: "milestone_200",
    title: "Invita 200 referidos válidos",
    description: "Duplica tu red y obtén 250 giros adicionales para seguir ganando.",
    target: 200,
    rewardSpins: 250,
  },
  {
    id: "milestone_300",
    title: "Invita 300 referidos válidos",
    description: "Consolida tu equipo y desbloquea 400 giros extra.",
    target: 300,
    rewardSpins: 400,
  },
];

const SPECIAL_TASKS = [
  {
    id: "telegram_group",
    title: "Únete al grupo oficial de Telegram",
    description: "Participa en la comunidad y consigue 10 giros extra.",
    rewardSpins: 10,
    envKey: "VITE_TELEGRAM_GROUP_URL",
  },
  {
    id: "telegram_channel",
    title: "Sigue el canal de anuncios",
    description: "Mantente al día con las novedades y suma 10 giros adicionales.",
    rewardSpins: 10,
    envKey: "VITE_TELEGRAM_CHANNEL_URL",
  },
];

const WheelPage = () => {
  const { user, updateUserBalances } = useUserStore();
  const { stats: teamStats, fetchTeamStats } = useTeamStore((state) => ({
    stats: state.stats,
    fetchTeamStats: state.fetchTeamStats,
  }));

  const [segments, setSegments] = useState(FALLBACK_SEGMENTS);
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [pendingSpinResult, setPendingSpinResult] = useState(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);

  const availableSpins = user?.balance?.spins ?? 0;

  useEffect(() => {
    const loadWheelConfig = async () => {
      try {
  const { data } = await api.get("/wheel/config");
        const apiSegments = data?.data?.segments || [];
        if (apiSegments.length) {
          const mappedSegments = apiSegments.map((segment) => ({
            option: segment.text,
            image: segment.imageUrl
              ? { uri: segment.imageUrl, sizeMultiplier: 0.5, offsetY: 25 }
              : undefined,
          }));
          setSegments(mappedSegments);
        }
      } catch (error) {
        console.error("wheel/config", error);
        toast.error("No se pudo cargar la ruleta. Usando configuración predeterminada.");
      } finally {
        setIsLoadingConfig(false);
      }
    };

    loadWheelConfig();
  }, []);

  useEffect(() => {
    fetchTeamStats?.();
  }, [fetchTeamStats]);

  const totalReferrals = useMemo(() => {
    return teamStats?.levels?.[0]?.totalMembers ?? 0;
  }, [teamStats]);

  const validReferrals = useMemo(() => {
    return teamStats?.levels?.[0]?.validMembers ?? 0;
  }, [teamStats]);

  const milestoneData = useMemo(() => {
    return MILESTONE_TASKS.map((task) => ({
      ...task,
      progress: validReferrals,
      completed: validReferrals >= task.target,
    }));
  }, [validReferrals]);

  const specialTasks = useMemo(() => {
    return SPECIAL_TASKS.map((task) => ({
      ...task,
      link: import.meta.env?.[task.envKey] || "",
    }));
  }, []);

  const referralLink = useMemo(() => {
    const botUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME || "blocksphere_bot";
    const referralCode = user?.referralCode || user?.telegramId || user?._id || "";
    return `https://t.me/${botUsername}?start=${referralCode}`;
  }, [user]);

  const shareReferralOnTelegram = () => {
    const encodedLink = encodeURIComponent(referralLink);
    const shareText = encodeURIComponent("Únete y obtén beneficios con mi enlace de Blocksphere");
    window.open(`https://t.me/share/url?url=${encodedLink}&text=${shareText}`, "_blank", "noopener,noreferrer");
  };

  const copyLink = () => {
    if (!referralLink) {
      toast.error("No pudimos generar tu enlace de referido.");
      return;
    }
    navigator.clipboard.writeText(referralLink);
    toast.success("Enlace de referido copiado ✅");
  };

  const handleSpinClick = async () => {
    if (mustSpin || availableSpins <= 0) {
      return;
    }

    try {
  const { data } = await api.post("/wheel/spin");
      if (!data?.success) {
        throw new Error(data?.message || "No se pudo iniciar el giro");
      }

      const resultIndex = typeof data.resultIndex === "number" ? data.resultIndex : 0;
      setPrizeNumber(Math.max(0, Math.min(resultIndex, segments.length - 1)));
      setPendingSpinResult(data);
      setMustSpin(true);
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Error al iniciar el giro.";
      toast.error(message);
    }
  };

  const handleStopSpinning = () => {
    setMustSpin(false);

    if (!pendingSpinResult) {
      return;
    }

    updateUserBalances(pendingSpinResult.newBalances || {});

    const winnerText = pendingSpinResult.prize?.text || segments[prizeNumber]?.option || "tu premio";
    toast.success(`¡Ganaste ${winnerText}! 🎉`);
    confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });

    setPendingSpinResult(null);
  };

  const handleSpecialTask = (link) => {
    if (!link) {
      toast("Muy pronto disponible", { icon: "⏳" });
      return;
    }
    window.open(link, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-system-background px-4 pt-6 flex flex-col items-center pb-24">
      <div className="w-full max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-ios-display font-bold text-text-primary mb-1">Ruleta de Premios</h1>
          <p className="text-text-secondary">Haz girar, invita y amplía tus recompensas.</p>
        </div>

        <IOSCard className="w-full">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-text-secondary text-sm">Giros disponibles</span>
              <h2 className="text-3xl font-bold text-ios-green">{availableSpins}</h2>
            </div>
            <p className="text-xs text-text-tertiary text-right max-w-[12rem]">
              Los premios en USDT se acreditan directo a tu saldo retirable.
            </p>
          </div>
        </IOSCard>

        <div className="relative w-80 h-80 md:w-96 md:h-96 mx-auto flex items-center justify-center">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 w-10 h-12 z-20"
            style={{
              clipPath:
                'path("M20 0C8.954 0 0 8.954 0 20C0 24.418 1.582 28.435 4.186 31.814L20 48L35.814 31.814C38.418 28.435 40 24.418 40 20C40 8.954 31.046 0 20 0Z")',
            }}
          >
            <div className="w-full h-full bg-red-500" />
          </div>

          <Wheel
            mustStartSpinning={mustSpin}
            prizeNumber={prizeNumber}
            data={segments}
            onStopSpinning={handleStopSpinning}
            perpendicularText={false}
            textDistance={75}
            fontSize={14}
            backgroundColors={["#FFFFFF", "#F2F2F7"]}
            textColors={["#333333"]}
            outerBorderColor={"#E2E2E2"}
            outerBorderWidth={5}
            innerRadius={15}
            innerBorderColor={"#E2E2E2"}
            innerBorderWidth={3}
            radiusLineColor={"transparent"}
            radiusLineWidth={0}
            pointerAngle={0}
            pointerProps={{ style: { display: "none" } }}
            disableInitialAnimation={true}
            showWinnerBorder={false}
          />
        </div>

        <IOSButton
          variant="primary"
          onClick={handleSpinClick}
          disabled={mustSpin || availableSpins <= 0 || isLoadingConfig || !!pendingSpinResult}
          className="w-full"
        >
          {mustSpin ? "Girando..." : availableSpins > 0 ? "Girar ruleta" : "Sin giros disponibles"}
        </IOSButton>

        <IOSCard className="w-full space-y-4">
          <div>
            <h3 className="font-semibold text-lg text-text-primary">Multiplica tus giros</h3>
            <p className="text-sm text-text-secondary">
              Cada referido válido (con su primer depósito) te otorga 1 giro automático. Comparte tu enlace y deja claro a tu equipo que deben recargar para generar giros.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-black/5 rounded-ios-card p-3 text-sm">
              <p className="text-text-tertiary uppercase tracking-wide">Referidos totales</p>
              <p className="text-lg font-semibold text-text-primary">{totalReferrals}</p>
            </div>
            <div className="bg-black/5 rounded-ios-card p-3 text-sm">
              <p className="text-text-tertiary uppercase tracking-wide">Referidos válidos</p>
              <p className="text-lg font-semibold text-text-primary">{validReferrals}</p>
            </div>
            <div className="bg-black/5 rounded-ios-card p-3 text-sm">
              <p className="text-text-tertiary uppercase tracking-wide">Giros generados</p>
              <p className="text-lg font-semibold text-text-primary">{validReferrals}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={copyLink}
              className="flex-1 bg-ios-green/10 text-ios-green py-3 rounded-ios-card flex justify-center items-center gap-2"
            >
              <FiCopy /> Copiar enlace de referido
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={shareReferralOnTelegram}
              className="flex-1 bg-blue-500/10 text-blue-500 py-3 rounded-ios-card flex justify-center items-center gap-2"
            >
              <FiExternalLink /> Compartir en Telegram
            </motion.button>
          </div>
        </IOSCard>

        <IOSCard className="w-full space-y-5">
          <div>
            <h3 className="font-semibold text-lg text-text-primary">Misiones para giros extra</h3>
            <p className="text-sm text-text-secondary">
              Completa los hitos y misiones especiales para desbloquear paquetes de giros adicionales. Se acreditan en cuanto se validen los requisitos.
            </p>
          </div>

          <section className="space-y-3">
            <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">Hitos de invitación</h4>
            <div className="space-y-3">
              {milestoneData.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start justify-between bg-black/5 rounded-ios-card px-4 py-3"
                >
                  <div className="pr-3">
                    <p className="font-medium text-text-primary">{task.title}</p>
                    <p className="text-sm text-text-secondary">{task.description}</p>
                    <p className="text-xs text-text-tertiary mt-2">Progreso: {task.progress}/{task.target}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xs font-semibold text-ios-green bg-ios-green/10 px-2 py-1 rounded-full">+{task.rewardSpins} giros</span>
                    {task.completed ? (
                      <span className="flex items-center gap-1 text-xs text-ios-green">
                        <FiCheckCircle /> Completado
                      </span>
                    ) : (
                      <span className="text-xs text-text-secondary">{task.progress}/{task.target}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h4 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">Misiones especiales</h4>
            <div className="space-y-3">
              {specialTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-black/5 rounded-ios-card px-4 py-3 gap-3"
                >
                  <div>
                    <p className="font-medium text-text-primary">{task.title}</p>
                    <p className="text-sm text-text-secondary">{task.description}</p>
                    <span className="text-xs font-semibold text-ios-green bg-ios-green/10 px-2 py-1 rounded-full inline-block mt-2">+{task.rewardSpins} giros</span>
                  </div>
                  <motion.button
                    whileTap={{ scale: task.link ? 0.97 : 1 }}
                    onClick={() => handleSpecialTask(task.link)}
                    disabled={!task.link}
                    className={`w-full sm:w-auto px-4 py-2 rounded-ios-card border text-sm font-medium transition-colors ${
                      task.link
                        ? "border-blue-500 text-blue-500 hover:bg-blue-500/10"
                        : "border-gray-400 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {task.link ? "Ir ahora" : "Próximamente"}
                  </motion.button>
                </div>
              ))}
            </div>
          </section>
        </IOSCard>
      </div>
    </div>
  );
};

export default WheelPage;

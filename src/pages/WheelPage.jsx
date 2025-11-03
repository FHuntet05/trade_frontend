// RUTA: frontend/src/pages/WheelPage.jsx

import React, { useEffect, useMemo, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Wheel } from "react-custom-roulette";
import { FiCopy, FiExternalLink, FiCheckCircle, FiAlertTriangle } from "react-icons/fi";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";
import api from "@/api/axiosConfig";
import useUserStore from "@/store/userStore";
import useTeamStore from "@/store/teamStore";
import { IOSButton, IOSCard } from "../components/ui/IOSComponents";

const SPIN_TOTAL_DURATION_MS = 2600 + 750 + 8000; // match library's timing phases
const TICK_COUNT = 48;
const MIN_TICK_INTERVAL_MS = 50;
const MAX_TICK_INTERVAL_MS = 400;

const createTickSchedule = (
  durationMs,
  tickCount = TICK_COUNT,
  minInterval = MIN_TICK_INTERVAL_MS,
  maxInterval = MAX_TICK_INTERVAL_MS
) => {
    if (!tickCount || tickCount <= 0 || durationMs <= 0) {
      return [];
    }

    const intervals = [];
    for (let index = 0; index < tickCount; index += 1) {
      const progress = tickCount === 1 ? 0 : index / (tickCount - 1);
      const eased = Math.cos(progress * Math.PI);
      const weight = eased * eased;
      const interval = minInterval + (maxInterval - minInterval) * weight;
      intervals.push(Math.max(12, interval));
    }

    const totalRaw = intervals.reduce((sum, value) => sum + value, 0);
    const scale = totalRaw > 0 ? durationMs / totalRaw : 1;
    const timeline = [];
    let elapsed = 0;
    for (const interval of intervals) {
      elapsed += interval * scale;
      timeline.push(Math.round(elapsed));
    }

    return timeline;
  };

const FALLBACK_SEGMENTS = [
  { option: "$1.00", text: "$1.00", type: "usdt", value: 1, weight: 1, isActive: true, image: { uri: "/assets/images/USDT.png", sizeMultiplier: 0.26, offsetY: -6, offsetX: 0 } },
  { option: "+1 Giro 🎁", text: "+1 Giro 🎁", type: "spins", value: 1, weight: 1, isActive: true },
  { option: "$0.10", text: "$0.10", type: "usdt", value: 0.1, weight: 1, isActive: true, image: { uri: "/assets/images/USDT.png", sizeMultiplier: 0.26, offsetY: -6, offsetX: 0 } },
  { option: "$5.00", text: "$5.00", type: "usdt", value: 5, weight: 1, isActive: true, image: { uri: "/assets/images/USDT.png", sizeMultiplier: 0.26, offsetY: -6, offsetX: 0 } },
  { option: "+2 Giros 🎁", text: "+2 Giros 🎁", type: "spins", value: 2, weight: 1, isActive: true },
  { option: "$0.50", text: "$0.50", type: "usdt", value: 0.5, weight: 1, isActive: true, image: { uri: "/assets/images/USDT.png", sizeMultiplier: 0.26, offsetY: -6, offsetX: 0 } },
  { option: "Sin premio", text: "Sin premio", type: "none", value: 0, weight: 1, isActive: true },
  { option: "$10.00", text: "$10.00", type: "usdt", value: 10, weight: 1, isActive: true, image: { uri: "/assets/images/USDT.png", sizeMultiplier: 0.26, offsetY: -6, offsetX: 0 } }
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
  const { user, updateUserBalances, updateUser } = useUserStore();
  const { stats: teamStats, fetchTeamStats } = useTeamStore((state) => ({
    stats: state.stats,
    fetchTeamStats: state.fetchTeamStats,
  }));

  const [segments, setSegments] = useState(FALLBACK_SEGMENTS);
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [pendingSpinResult, setPendingSpinResult] = useState(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [configMessage, setConfigMessage] = useState("");
  const [isWheelDisabled, setIsWheelDisabled] = useState(false);

  const tickTimeoutsRef = useRef([]);
  const audioContextRef = useRef(null);

  const availableSpins = user?.balance?.spins ?? 0;

  const ensureAudioContext = () => {
    if (typeof window === "undefined") {
      return null;
    }

    const ContextClass = window.AudioContext || window.webkitAudioContext;
    if (!ContextClass) {
      return null;
    }

    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new ContextClass();
      } catch (error) {
        return null;
      }
    }

    return audioContextRef.current;
  };

  const clearTickFeedback = () => {
    if (!tickTimeoutsRef.current?.length) {
      return;
    }

    if (typeof window !== "undefined") {
      tickTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    }

    tickTimeoutsRef.current = [];
  };

  const triggerTickFeedback = () => {
    if (typeof window !== "undefined" && typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate?.(18);
      } catch (error) {
        // ignore vibration errors (e.g., unsupported devices)
      }
    }

    const context = ensureAudioContext();
    if (!context) {
      return;
    }

    if (context.state === "suspended") {
      context.resume?.().catch(() => null);
    }

    try {
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = "triangle";
      oscillator.frequency.value = 880;
      gain.gain.value = 0.06;

      oscillator.connect(gain);
      gain.connect(context.destination);

      const now = context.currentTime;
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

      oscillator.start(now);
      oscillator.stop(now + 0.09);

      oscillator.onended = () => {
        oscillator.disconnect();
        gain.disconnect();
      };
    } catch (error) {
      // silently ignore audio errors
    }
  };

  const startTickFeedback = (durationMs = SPIN_TOTAL_DURATION_MS) => {
    if (typeof window === "undefined") {
      return;
    }

    clearTickFeedback();
    triggerTickFeedback();
    const schedule = createTickSchedule(durationMs);
    if (!schedule.length) {
      return;
    }

    tickTimeoutsRef.current = schedule.map((delay) =>
      window.setTimeout(() => {
        triggerTickFeedback();
      }, delay)
    );
  };

  const playWinSound = () => {
    const context = ensureAudioContext();
    if (!context) {
      return;
    }

    if (context.state === "suspended") {
      context.resume?.().catch(() => null);
    }

    try {
      const now = context.currentTime;
      const gain = context.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.22, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);
      gain.connect(context.destination);

      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, now);
        oscillator.connect(gain);

        const startTime = now + index * 0.05;
        const stopTime = startTime + 0.6;

        oscillator.start(startTime);
        oscillator.stop(stopTime);
        oscillator.onended = () => {
          oscillator.disconnect();
        };
      });

      if (typeof window !== "undefined") {
        const cleanupDelay = Math.ceil((notes.length * 0.05 + 0.7) * 1000);
        window.setTimeout(() => {
          gain.disconnect();
        }, cleanupDelay);
      }
    } catch (error) {
      // ignore win sound errors
    }
  };

  useEffect(() => {
    const loadWheelConfig = async () => {
      try {
        const { data } = await api.get("/wheel/config");
        const apiSegments = data?.data?.segments || [];
        if (apiSegments.length) {
          const normalizedSegments = apiSegments.map((segment, index) => {
            const type = ["usdt", "spins", "none"].includes(segment.type) ? segment.type : "none";
            const hasImage = Boolean(segment.imageUrl);
            const numericValue = Number(segment.value ?? 0);
            const normalizedValue = Number.isFinite(numericValue) ? numericValue : 0;
            const fallbackLabel = segment.text?.trim()
              || (type === "usdt"
                ? `${normalizedValue.toFixed(2)} USDT`
                : type === "spins"
                ? `${normalizedValue} giros`
                : "Sin premio");
            const label = fallbackLabel || `Premio ${index + 1}`;

            return {
              option: label,
              text: fallbackLabel,
              type,
              value: normalizedValue,
              weight: Number(segment.weight ?? 1) || 1,
              isActive: segment.isActive !== false,
              image: hasImage
                ? { uri: segment.imageUrl, sizeMultiplier: 0.26, offsetY: -6, offsetX: 0 }
                : undefined,
            };
          });

          setSegments(normalizedSegments);
          setIsWheelDisabled(false);
          setConfigMessage("");
        } else {
          setSegments(FALLBACK_SEGMENTS);
          setConfigMessage("La ruleta aún no tiene premios activos. Comunícate con soporte para configurarla.");
          setIsWheelDisabled(true);
        }
      } catch (error) {
        console.error("wheel/config", error);
        setSegments(FALLBACK_SEGMENTS);
        const backendMessage = error.response?.data?.message;
        if (error.response?.status === 404) {
          setConfigMessage(backendMessage || "La ruleta aún no ha sido configurada por el administrador.");
        } else {
          setConfigMessage("No pudimos cargar los premios de la ruleta. Inténtalo de nuevo en unos minutos.");
        }
        setIsWheelDisabled(true);
      } finally {
        setIsLoadingConfig(false);
      }
    };

    loadWheelConfig();
  }, []);
  useEffect(() => {
    fetchTeamStats?.();
  }, [fetchTeamStats]);

  useEffect(() => {
    return () => {
      clearTickFeedback();
      if (audioContextRef.current) {
        try {
          audioContextRef.current.close?.();
        } catch (error) {
          // ignore audio context close failures
        }
        audioContextRef.current = null;
      }
    };
  }, []);

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
      progressPercent: task.target === 0 ? 0 : Math.min(100, Math.round((validReferrals / task.target) * 100)),
    }));
  }, [validReferrals]);

  const specialTasks = useMemo(() => {
    return SPECIAL_TASKS.map((task) => ({
      ...task,
      link: import.meta.env?.[task.envKey] || "",
      claimKey: `wheel:special:${task.id}`,
      claimed: Boolean(user?.claimedTasks?.[`wheel:special:${task.id}`])
    }));
  }, [user]);

  const referralLink = useMemo(() => {
    const botUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME || "AiBrokTradePro_bot";
    const referralCode = user?.referralCode || user?.telegramId || user?._id || "";
    return `https://t.me/${botUsername}?start=${referralCode}`;
  }, [user]);

  const shareReferralOnTelegram = () => {
    const encodedLink = encodeURIComponent(referralLink);
    const shareText = encodeURIComponent("Únete y obtén beneficios con mi enlace de AiBrokTradePro");
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
    if (mustSpin || availableSpins <= 0 || isWheelDisabled) {
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
      const context = ensureAudioContext();
      if (context?.state === "suspended") {
        try {
          await context.resume();
        } catch (error) {
          // ignore resume failure
        }
      }
  startTickFeedback(SPIN_TOTAL_DURATION_MS);
      setMustSpin(true);
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Error al iniciar el giro.";
      toast.error(message);
      if (message?.toLowerCase().includes("no está configurada")) {
        setConfigMessage(message);
        setIsWheelDisabled(true);
      }
      clearTickFeedback();
    }
  };

  const handleStopSpinning = () => {
    setMustSpin(false);

    clearTickFeedback();

    if (!pendingSpinResult) {
      return;
    }

    updateUserBalances(pendingSpinResult.newBalances || {});

    const prizeInfo = pendingSpinResult.prize || segments[prizeNumber] || {};
    const winnerText = prizeInfo.text || segments[prizeNumber]?.option || "tu premio";
    const prizeType = (prizeInfo.type || segments[prizeNumber]?.type || "").toLowerCase();
    const isNoPrize = prizeType === "none" || /sin premio/i.test(winnerText || "");

    if (isNoPrize) {
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        try {
          navigator.vibrate?.([30, 40, 30]);
        } catch (error) {
          // ignore vibration errors
        }
      }

      toast(`😔 Sin premio`, {
        icon: "😔",
      });
    } else {
      playWinSound();

      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        try {
          navigator.vibrate?.([80, 120, 60]);
        } catch (error) {
          // ignore vibration errors
        }
      }

      toast.success(`¡Ganaste ${winnerText}! 🎉`);
      confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
    }

    setPendingSpinResult(null);
  };

  const handleSpecialTask = async (task) => {
    if (!task?.link) {
      toast("Muy pronto disponible", { icon: "⏳" });
      return;
    }
    try {
      // 1) Reclamar en backend
      const { data } = await api.post('/wheel/claim-special', { taskId: task.id });

      if (data?.success) {
        // 2) Actualizar saldo de giros
        if (data?.newBalances) {
          updateUserBalances(data.newBalances);
        } else {
          // Si el backend no devuelve newBalances, aplicamos suma local optimista
          const currentBalances = user?.balance || {};
          const currentSpins = Number(currentBalances.spins || 0);
          const added = Number(task?.rewardSpins || 0);
          updateUserBalances({ ...currentBalances, spins: currentSpins + added });
        }

        // 3) Marcar la misión como reclamada
        updateUser({
          ...user,
          claimedTasks: {
            ...(user?.claimedTasks || {}),
            [task.claimKey]: true,
          },
        });

        toast.success('Recompensa reclamada ✅');
      }
    } catch (error) {
      const msg = error?.response?.data?.message || '';
      // Si el backend reporta que ya estaba reclamada, sincronizamos el flag local igualmente
      if (/ya|reclamad/i.test(msg)) {
        updateUser({
          ...user,
          claimedTasks: {
            ...(user?.claimedTasks || {}),
            [task.claimKey]: true,
          },
        });
        toast('Ya reclamado anteriormente');
      } else {
        toast.error('No se pudo reclamar la recompensa');
      }
    } finally {
      // 4) Abrir el enlace solicitado
      window.open(task.link, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f5f7fb] px-4 py-6 md:px-8">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-ios-display font-bold text-slate-900">Ruleta de Premios</h1>
          <p className="text-sm md:text-base text-slate-600">
            Consigue giros diarios, invita a tu equipo y convierte los premios en <span className="font-semibold text-slate-800">saldo retirable USDT</span>.
          </p>
        </header>

        {configMessage && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            <FiAlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Ruleta no disponible temporalmente</p>
              <p>{configMessage}</p>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <IOSCard className="bg-white p-6 shadow-lg">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Giros disponibles</p>
                    <p className="text-4xl font-bold text-emerald-500">{availableSpins}</p>
                  </div>
                  <div className="hidden h-12 w-px bg-slate-200 md:block" />
                  <div className="max-w-xs text-xs md:text-sm text-slate-600">
                    <span className="font-semibold text-slate-800">Recuerda:</span> cada premio en USDT se carga automáticamente a tu saldo retirable.
                  </div>
                </div>
                <div className="text-xs text-right text-slate-500">
                  {isLoadingConfig ? "Sincronizando premios..." : isWheelDisabled ? "En espera de configuración" : "Premios listos"}
                </div>
              </div>

              <div className="relative mx-auto flex flex-col items-center">
                <div className="flex h-[18rem] w-[18rem] items-center justify-center md:h-[20rem] md:w-[20rem]">
                  <Wheel
                    mustStartSpinning={mustSpin}
                    prizeNumber={prizeNumber}
                    data={segments}
                    onStopSpinning={handleStopSpinning}
                    // Mantener texto perpendicular al eje central (tangente al círculo)
                    perpendicularText={false}
                    textDistance={68}
                    fontSize={14}
                    backgroundColors={["#FFFFFF", "#F2F2F7"]}
                    textColors={["#1f2937"]}
                    outerBorderColor={"#e2e8f0"}
                    outerBorderWidth={5}
                    innerRadius={15}
                    innerBorderColor={"#e2e8f0"}
                    innerBorderWidth={3}
                    radiusLineColor={"transparent"}
                    radiusLineWidth={0}
                    pointerProps={{
                      style: {
                        width: "16%",
                        right: "6px",
                        top: "10px",
                        filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.25))",
                      },
                    }}
                    disableInitialAnimation={true}
                    showWinnerBorder={false}
                  />
                </div>

                <div className="mt-6 flex justify-center">
                  <IOSButton
                    variant="primary"
                    onClick={handleSpinClick}
                    disabled={mustSpin || availableSpins <= 0 || isLoadingConfig || !!pendingSpinResult || isWheelDisabled}
                  >
                    {mustSpin
                      ? "Girando..."
                      : isWheelDisabled
                      ? "Ruleta en configuración"
                      : availableSpins > 0
                      ? "Girar ruleta"
                      : "Sin giros disponibles"}
                  </IOSButton>
                </div>

                {availableSpins <= 0 && !isWheelDisabled && (
                  <p className="mt-3 text-xs text-slate-500">Gana más giros completando las misiones de invitación o las tareas especiales.</p>
                )}
              </div>
            </div>
          </IOSCard>

          <div className="flex flex-col gap-6">
            <IOSCard className="bg-white p-6 shadow-lg">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Multiplica tus giros</h3>
                    <p className="text-sm text-slate-600">
                      <span className="font-semibold text-slate-800">Cada referido válido</span> (con depósito confirmado) suma un giro automático a tu saldo.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[{
                    label: "Referidos totales",
                    value: totalReferrals,
                    helper: "Invitaciones directas registradas.",
                  }, {
                    label: "Referidos válidos",
                    value: validReferrals,
                    helper: "Solo los que ya depositaron.",
                  }, {
                    label: "Giros generados",
                    value: validReferrals,
                    helper: "1 giro por cada referido válido.",
                  }].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                        <p className="text-xs text-slate-500">{item.helper}</p>
                      </div>
                      <span className="text-2xl font-bold text-slate-900">{item.value}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={copyLink}
                    className="flex-1 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-600 shadow-sm"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <FiCopy />
                      Copiar enlace de referido
                    </div>
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={shareReferralOnTelegram}
                    className="flex-1 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-600 shadow-sm"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <FiExternalLink />
                      Compartir en Telegram
                    </div>
                  </motion.button>
                </div>
              </div>
            </IOSCard>

            <IOSCard className="bg-white p-6 shadow-lg">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Misiones para giros extra</h3>
                  <p className="text-sm text-slate-600">Completa hitos y misiones especiales para desbloquear paquetes de giros al instante.</p>
                </div>

                <section className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Hitos de invitación</h4>
                  <div className="space-y-3">
                    {milestoneData.map((task) => (
                      <div
                        key={task.id}
                        className="rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3 shadow-sm"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-slate-900">{task.title}</p>
                            <p className="text-xs text-slate-600">{task.description}</p>
                          </div>
                          <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-600">+{task.rewardSpins} giros</span>
                        </div>
                        <div className="mt-3 flex items-center gap-3">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                            <div
                              className={`h-full ${task.completed ? "bg-emerald-500" : "bg-emerald-400"}`}
                              style={{ width: `${task.progressPercent}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-slate-700">{task.progress}/{task.target}</span>
                          {task.completed && (
                            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                              <FiCheckCircle /> Completado
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Misiones especiales</h4>
                  <div className="space-y-3">
                    {specialTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{task.title}</p>
                          <p className="text-xs text-slate-600">{task.description}</p>
                          <span className="mt-2 inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-600">+{task.rewardSpins} giros</span>
                        </div>
                        <motion.button
                          whileTap={{ scale: task.link && !task.claimed ? 0.97 : 1 }}
                          onClick={() => handleSpecialTask(task)}
                          disabled={!task.link || task.claimed}
                          className={`w-full rounded-xl px-4 py-2 text-sm font-semibold transition-colors sm:w-auto ${
                            task.claimed
                              ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                              : task.link
                              ? "bg-blue-500 text-white shadow-md hover:bg-blue-600"
                              : "bg-slate-200 text-slate-500 cursor-not-allowed"
                          }`}
                        >
                          {task.claimed ? "Reclamado" : task.link ? "Ir ahora" : "Próximamente"}
                        </motion.button>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </IOSCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WheelPage;

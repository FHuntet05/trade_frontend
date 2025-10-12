import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { IOSLayout, IOSButton, IOSInput, IOSCard } from '../components/ui/IOSComponents';
import useUserStore from '../store/userStore';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';

const AuthPage = () => {
  const navigate = useNavigate();
  const { user, login } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);
  const [code, setCode] = useState('');
  const [showTutorial, setShowTutorial] = useState(false);
  const [countryCode, setCountryCode] = useState('');
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState('phone'); // phone, code, biometric

  useEffect(() => {
    if (user) {
      navigate('/home');
    }
  }, [user, navigate]);

  const handleSendCode = async () => {
    if (!phone || !countryCode) {
      toast.error('Por favor ingresa un número válido');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/send-code', {
        phone: `${countryCode}${phone}`
      });
      
      setStep('code');
      toast.success('Código enviado correctamente');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al enviar código');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code) {
      toast.error('Por favor ingresa el código');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/auth/verify-code', {
        phone: `${countryCode}${phone}`,
        code
      });
      
      login(response.data.token);
      navigate('/home');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Código inválido');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricAuth = async () => {
    try {
      const response = await api.post('/auth/biometric');
      login(response.data.token);
      navigate('/home');
    } catch (error) {
      setStep('phone');
    }
  };

  const Tutorial = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
    >
      <IOSCard className="max-w-md w-full p-6 space-y-4">
        <h2 className="text-xl font-ios-display font-bold">
          Cómo Funciona
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">📱</span>
            <p className="text-sm">
              1. Ingresa tu número de teléfono para recibir un código
            </p>
          </div>
          
          <div className="flex items-start space-x-3">
            <span className="text-2xl">✉️</span>
            <p className="text-sm">
              2. Recibirás un SMS con un código de verificación
            </p>
          </div>
          
          <div className="flex items-start space-x-3">
            <span className="text-2xl">🔐</span>
            <p className="text-sm">
              3. Ingresa el código para acceder a tu cuenta
            </p>
          </div>
          
          <div className="flex items-start space-x-3">
            <span className="text-2xl">👆</span>
            <p className="text-sm">
              4. La próxima vez podrás usar tu huella digital
            </p>
          </div>
        </div>

        <IOSButton
          variant="primary"
          className="w-full"
          onClick={() => setShowTutorial(false)}
        >
          Entendido
        </IOSButton>
      </IOSCard>
    </motion.div>
  );

  return (
    <IOSLayout>
      <div className="min-h-screen bg-system-background p-4">
        <div className="flex flex-col items-center justify-center min-h-screen">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md space-y-6"
          >
            {/* Logo y título */}
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-ios-green rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <span className="text-4xl">📈</span>
              </div>
              <h1 className="text-2xl font-ios-display font-bold">
                Trade Bot
              </h1>
              <p className="text-text-secondary mt-2">
                Inicia sesión para continuar
              </p>
            </div>

            {/* Formulario de autenticación */}
            <IOSCard className="p-6 space-y-4">
              {step === 'phone' && (
                <>
                  <div className="flex space-x-2">
                    <IOSInput
                      type="text"
                      placeholder="País"
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="w-1/4"
                    />
                    <IOSInput
                      type="tel"
                      placeholder="Número de teléfono"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                  <IOSButton
                    variant="primary"
                    onClick={handleSendCode}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? 'Enviando...' : 'Enviar Código'}
                  </IOSButton>
                </>
              )}

              {step === 'code' && (
                <>
                  <IOSInput
                    type="text"
                    placeholder="Código de verificación"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="text-center text-2xl tracking-widest"
                    maxLength={6}
                  />
                  <IOSButton
                    variant="primary"
                    onClick={handleVerifyCode}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? 'Verificando...' : 'Verificar'}
                  </IOSButton>
                  <button
                    onClick={() => setStep('phone')}
                    className="text-ios-green text-sm w-full mt-2"
                  >
                    Cambiar número
                  </button>
                </>
              )}

              {step === 'biometric' && (
                <div className="text-center space-y-4">
                  <div className="text-6xl">👆</div>
                  <p className="text-lg font-ios-display">
                    Usa tu huella digital para iniciar sesión
                  </p>
                  <IOSButton
                    variant="primary"
                    onClick={handleBiometricAuth}
                    className="w-full"
                  >
                    Autenticar
                  </IOSButton>
                </div>
              )}
            </IOSCard>

            {/* Botón de ayuda */}
            <button
              onClick={() => setShowTutorial(true)}
              className="text-text-secondary text-sm w-full text-center mt-4"
            >
              ¿Cómo funciona? ℹ️
            </button>
          </motion.div>
        </div>

        {showTutorial && <Tutorial />}
      </div>
    </IOSLayout>
  );
};

export default AuthPage;
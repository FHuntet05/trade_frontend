// frontend/src/pages/admin/AdminSecurityPage.jsx (COMPLETO)
import React, { useState } from 'react';
import useAdminStore from '../../store/adminStore';
import api from '../../api/axiosConfig';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';
import { HiShieldCheck } from 'react-icons/hi2';

const AdminSecurityPage = () => {
  const { admin, setTwoFactorEnabled } = useAdminStore();
  const [setupData, setSetupData] = useState(null); // Para QR y secreto
  const [verificationToken, setVerificationToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateSecret = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.post('/admin/2fa/generate');
      setSetupData(data);
    } catch (error) {
      toast.error('No se pudo generar el secreto 2FA.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndEnable = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await api.post('/admin/2fa/verify', { token: verificationToken });
      toast.success(data.message);
      setTwoFactorEnabled(true); // Actualizamos el estado global
      setSetupData(null); // Limpiamos la UI de setup
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al verificar el token.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-dark-secondary p-6 rounded-lg border border-white/10 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Configuración de Seguridad</h1>
      {admin?.isTwoFactorEnabled ? (
        <div className="bg-green-500/20 text-green-300 p-4 rounded-lg flex items-center gap-3">
          <HiShieldCheck className="w-8 h-8 flex-shrink-0" />
          <div>
            <h3 className="font-bold">Autenticación de Dos Factores (2FA) Habilitada</h3>
            <p className="text-sm">Tu cuenta está protegida con una capa adicional de seguridad.</p>
          </div>
        </div>
      ) : (
        <div>
          {!setupData ? (
            <div>
              <p className="text-text-secondary mb-4">Aumenta la seguridad de tu cuenta habilitando 2FA. Necesitarás una aplicación de autenticación como Google Authenticator o Authy.</p>
              <button onClick={handleGenerateSecret} disabled={isLoading} className="px-6 py-2 font-bold text-white bg-accent-start rounded-lg">
                {isLoading ? <Loader small /> : 'Habilitar 2FA'}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold">1. Escanea el Código QR</h3>
                <p className="text-sm text-text-secondary mb-4">Usa tu aplicación de autenticación para escanear esta imagen.</p>
                <div className="bg-white p-4 rounded-lg inline-block">
                  <img src={setupData.qrCodeUrl} alt="QR Code para 2FA" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold">2. O introduce el código manualmente</h3>
                <p className="text-sm text-text-secondary mb-2">Si no puedes escanear el QR, introduce esta clave en tu app:</p>
                <p className="font-mono bg-black/20 p-3 rounded-md text-accent-start tracking-widest">{setupData.secret}</p>
              </div>
              <form onSubmit={handleVerifyAndEnable}>
                <h3 className="text-lg font-semibold">3. Verifica el código</h3>
                <p className="text-sm text-text-secondary mb-2">Introduce el código de 6 dígitos que aparece en tu aplicación para finalizar la configuración.</p>
                <div className="flex gap-4">
                  <input type="text" value={verificationToken} onChange={(e) => setVerificationToken(e.target.value)} maxLength="6" className="w-48 p-2 text-center text-2xl tracking-[.5em] bg-black/20 rounded-md" required />
                  <button type="submit" disabled={isLoading} className="px-6 py-2 font-bold text-white bg-green-600 rounded-lg">Verificar y Activar</button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminSecurityPage;
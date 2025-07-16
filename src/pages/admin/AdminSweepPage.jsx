// frontend/src/pages/admin/AdminSweepPage.jsx (NUEVO ARCHIVO v15.0)
import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axiosConfig';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';
import useAdminStore from '../../store/adminStore';
import { SiBinance, SiTether, SiTron } from 'react-icons/si';

const getCurrencyIcon = (currency) => {
  const props = { className: 'w-6 h-6' };
  switch (currency) {
    case 'BNB': return <SiBinance {...props} color="#F3BA2F" />;
    case 'USDT_BSC': return <SiTether {...props} color="#26A17B" />;
    case 'TRX': return <SiTron {...props} color="#FF060A" />;
    case 'USDT_TRON': return <SiTether {...props} color="#58B9BF" />;
    default: return null;
  }
};

const WalletRow = ({ wallet }) => {
  // Una wallet puede tener múltiples balances (ej. BNB y USDT_BSC a la vez)
  return (
    <>
      {wallet.balances.map((balance, index) => (
        <tr key={`${wallet._id}-${balance.currency}`} className="bg-dark-primary border-b border-dark-secondary hover:bg-white/5">
          <td className="p-4">
            <div className="flex items-center gap-3">
              {getCurrencyIcon(balance.currency)}
              <span className="font-semibold">{balance.currency}</span>
            </div>
          </td>
          <td className="p-4">
            <div className="flex flex-col">
              <span className="font-semibold">{wallet.user}</span>
              <span className="text-xs text-text-secondary font-mono">{wallet.address}</span>
            </div>
          </td>
          <td className="p-4 font-mono text-right">{parseFloat(balance.amount).toFixed(6)}</td>
          <td className="p-4">
            <span className="px-2 py-1 text-xs font-semibold text-green-300 bg-green-500/20 rounded-full">
              Listo para Barrer
            </span>
          </td>
          <td className="p-4 text-right">
            <button
              onClick={() => toast.error('Función de barrido individual no implementada.')}
              className="px-4 py-1.5 font-bold text-sm text-white bg-accent-start rounded-lg hover:opacity-90 transition-opacity"
            >
              Barrer
            </button>
          </td>
        </tr>
      ))}
    </>
  );
};

const AdminSweepPage = () => {
  const [wallets, setWallets] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { adminInfo } = useAdminStore();

  const fetchSweepableWallets = useCallback(async (currentPage) => {
    if (!adminInfo?.token) return;
    setIsLoading(true);
    try {
      const { data } = await api.get('/api/treasury/sweepable-wallets', {
        headers: { Authorization: `Bearer ${adminInfo.token}` },
        params: { page: currentPage, limit: 10 }
      });
      setWallets(data.wallets);
      setPage(data.page);
      setPages(data.pages);
      setTotal(data.total);
    } catch (error) {
      toast.error('No se pudieron cargar las wallets para barrido.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [adminInfo]);

  useEffect(() => {
    fetchSweepableWallets(page);
  }, [page, fetchSweepableWallets]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pages) {
      setPage(newPage);
    }
  };

  return (
    <div className="bg-dark-secondary p-6 rounded-lg border border-white/10 text-white">
      <h1 className="text-2xl font-semibold mb-2">Barrido de Wallets de Depósito</h1>
      <p className="text-text-secondary mb-6">
        Aquí se listan todas las wallets de depósito de usuarios que han recibido fondos. Desde aquí puedes iniciar el proceso de barrido para consolidarlos en la hot wallet.
      </p>

      {isLoading ? (
        <Loader text="Buscando fondos en wallets de depósito..." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-text-secondary uppercase bg-dark-primary">
              <tr>
                <th className="p-4">Activo</th>
                <th className="p-4">Usuario / Wallet</th>
                <th className="p-4 text-right">Cantidad</th>
                <th className="p-4">Estado</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {wallets.length > 0 ? (
                wallets.map(wallet => <WalletRow key={wallet._id} wallet={wallet} />)
              ) : (
                <tr>
                  <td colSpan="5" className="text-center p-8 text-text-secondary">
                    No se encontraron wallets con saldo para barrer.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          
          {/* Paginación */}
          <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-text-secondary">
              Mostrando {wallets.length} de {total} wallets con saldo. Página {page} de {pages}.
            </span>
            <div className="flex gap-2">
              <button onClick={() => handlePageChange(page - 1)} disabled={page <= 1} className="px-3 py-1 bg-dark-primary rounded disabled:opacity-50">Anterior</button>
              <button onClick={() => handlePageChange(page + 1)} disabled={page >= pages} className="px-3 py-1 bg-dark-primary rounded disabled:opacity-50">Siguiente</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSweepPage;
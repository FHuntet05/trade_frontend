import { create } from 'zustand';
import { toast } from 'react-hot-toast';
import api from '../api/axiosConfig';

const usePackageStore = create((set, get) => ({
  packages: [],
  loading: false,
  error: null,

  fetchPackages: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/admin/packages');
      set({ packages: response.data, loading: false });
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al cargar los paquetes';
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
    }
  },

  addPackage: async (packageData) => {
    try {
      const response = await api.post('/admin/packages', packageData);
      set(state => ({
        packages: [...state.packages, response.data]
      }));
      toast.success('Paquete creado exitosamente');
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al crear el paquete';
      toast.error(errorMessage);
      return false;
    }
  },

  updatePackage: async (id, packageData) => {
    try {
      const response = await api.put(`/admin/packages/${id}`, packageData);
      set(state => ({
        packages: state.packages.map(pkg => 
          pkg.id === id ? response.data : pkg
        )
      }));
      toast.success('Paquete actualizado exitosamente');
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al actualizar el paquete';
      toast.error(errorMessage);
      return false;
    }
  },

  deletePackage: async (id) => {
    try {
      await api.delete(`/admin/packages/${id}`);
      set(state => ({
        packages: state.packages.filter(pkg => pkg.id !== id)
      }));
      toast.success('Paquete eliminado exitosamente');
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al eliminar el paquete';
      toast.error(errorMessage);
      return false;
    }
  },

  togglePackage: async (id, enabled) => {
    try {
      const response = await api.patch(`/admin/packages/${id}/toggle`, { enabled });
      set(state => ({
        packages: state.packages.map(pkg => 
          pkg.id === id ? { ...pkg, enabled: response.data.enabled } : pkg
        )
      }));
      toast.success(`Paquete ${enabled ? 'activado' : 'desactivado'} exitosamente`);
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al cambiar el estado del paquete';
      toast.error(errorMessage);
      return false;
    }
  }
}));
// src/app/(admin)/admin/config/loan-types/page.tsx
'use client';

import { useState, useEffect } from 'react';

interface LoanType {
  id_credito?: number;
  nombre: string;
  descripcion: string;
  tipo: string;
  interes: number;
  tiempo: string;
  solca: boolean;
  gravamen: boolean;
  informacion: string;
  estado: boolean;
  imagen: string;
}

export default function LoanTypesPage() {
  const [loanTypes, setLoanTypes] = useState<LoanType[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingLoan, setEditingLoan] = useState<LoanType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Estado inicial para nuevo crédito
  const emptyLoan: LoanType = {
    nombre: '',
    descripcion: '',
    tipo: '',
    interes: 0,
    tiempo: '',
    solca: false,
    gravamen: false,
    informacion: '',
    estado: true,
    imagen: ''
  };

  const [formData, setFormData] = useState<LoanType>(emptyLoan);

  // Cargar tipos de crédito
  useEffect(() => {
    loadLoanTypes();
  }, []);

  const loadLoanTypes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/loan-types');
      if (response.ok) {
        const data = await response.json();
        setLoanTypes(data);
      }
    } catch (error) {
      console.error('Error cargando tipos de crédito:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = '/api/admin/loan-types';
      const method = editingLoan ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await loadLoanTypes();
        setShowForm(false);
        setEditingLoan(null);
        setFormData(emptyLoan);
      } else {
        throw new Error('Error al guardar');
      }
    } catch (error) {
      console.error('Error guardando tipo de crédito:', error);
      alert('Error al guardar el tipo de crédito');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id_credito: number) => {
    try {
      const loan = loanTypes.find(l => l.id_credito === id_credito);
      if (!loan) return;

      const updatedLoan = { ...loan, estado: !loan.estado };
      
      const response = await fetch('/api/admin/loan-types', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedLoan),
      });

      if (response.ok) {
        await loadLoanTypes();
      }
    } catch (error) {
      console.error('Error actualizando estado:', error);
    }
  };

  const handleEdit = (loan: LoanType) => {
    setEditingLoan(loan);
    setFormData(loan);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingLoan(null);
    setFormData(emptyLoan);
    setShowForm(true);
  };

  const handleFormChange = (field: keyof LoanType, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tipos de Crédito</h1>
          <p className="text-gray-600">Gestiona los diferentes tipos de crédito disponibles</p>
        </div>
        <button
          onClick={handleAddNew}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          + Agregar Tipo
        </button>
      </div>

      {/* Lista de Tipos de Crédito - SOLO CAMPOS BÁSICOS */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tasa de Interés
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tiempo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loanTypes.map((loan) => (
              <tr key={loan.id_credito}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{loan.nombre}</div>
                  <div className="text-sm text-gray-500">{loan.tipo}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{loan.interes}%</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{loan.tiempo}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    onClick={() => toggleActive(loan.id_credito!)}
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer ${
                      loan.estado
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {loan.estado ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button 
                    onClick={() => handleEdit(loan)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Editar
                  </button>
                  <button className="text-red-600 hover:text-red-900">
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Formulario para agregar/editar - TODOS LOS CAMPOS */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingLoan ? 'Editar Tipo de Crédito' : 'Nuevo Tipo de Crédito'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Información Básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Crédito *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => handleFormChange('nombre', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Préstamo Personal"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.tipo}
                    onChange={(e) => handleFormChange('tipo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Personal, Hipotecario, Automotriz"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => handleFormChange('descripcion', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descripción del tipo de crédito"
                  rows={3}
                />
              </div>

              {/* Configuración Financiera */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tasa de Interés (%) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.interes}
                    onChange={(e) => handleFormChange('interes', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: 12.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiempo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.tiempo}
                    onChange={(e) => handleFormChange('tiempo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: 6-60 meses"
                  />
                </div>
              </div>

              {/* Opciones Adicionales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.solca}
                    onChange={(e) => handleFormChange('solca', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Incluye SOLCA
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.gravamen}
                    onChange={(e) => handleFormChange('gravamen', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Incluye Gravamen
                  </label>
                </div>
              </div>

              {/* Información Adicional */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Información Adicional
                </label>
                <textarea
                  value={formData.informacion}
                  onChange={(e) => handleFormChange('informacion', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Información adicional sobre el crédito"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL de Imagen
                </label>
                <input
                  type="url"
                  value={formData.imagen}
                  onChange={(e) => handleFormChange('imagen', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.estado}
                  onChange={(e) => handleFormChange('estado', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Crédito Activo
                </label>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingLoan(null);
                    setFormData(emptyLoan);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : (editingLoan ? 'Actualizar' : 'Crear')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
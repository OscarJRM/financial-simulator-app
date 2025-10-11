'use client';

import { useState, useEffect } from 'react';

interface LoanType {
  id_credito?: number;
  nombre: string;
  descripcion: string;
  tipo: string;
  interes: number;
  plazo_min: number;
  plazo_max: number;
  informacion: string;
  estado: boolean; // Frontend usa boolean
  cobros_indirectos?: Array<{
    id_indirecto: number;
    nombre: string;
    tipo: string;
    interes: number;
    tipo_interes: string;
  }>;
}

interface Indirect {
  id_indirecto: number;
  nombre: string;
  tipo: string;
  interes: number;
  tipo_interes: 'porcentaje' | 'desembolso';
}

export default function LoanTypesPage() {
  const [loanTypes, setLoanTypes] = useState<LoanType[]>([]);
  const [indirects, setIndirects] = useState<Indirect[]>([]);
  const [selectedIndirects, setSelectedIndirects] = useState<number[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingLoan, setEditingLoan] = useState<LoanType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');

  const emptyLoan: LoanType = {
    nombre: '',
    descripcion: '',
    tipo: '',
    interes: 0,
    plazo_min: 1,
    plazo_max: 12,
    informacion: '',
    estado: true,
    cobros_indirectos: [],
  };

  const [formData, setFormData] = useState<LoanType>(emptyLoan);

  // Carga inicial
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadLoanTypes(), loadIndirects()]);
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const loadLoanTypes = async () => {
    try {
      setError('');
      const res = await fetch('/api/admin/loan-types');
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al cargar los tipos de crédito');
      }

      const data: any[] = await res.json();
      
      // ✅ CORRECCIÓN: Normalizar consistentemente el estado
      const normalizedData = data.map(loan => ({
        ...loan,
        estado: Boolean(loan.estado) // Asegurar boolean
      }));

      setLoanTypes(normalizedData);
    } catch (error: any) {
      console.error('Error cargando tipos de crédito:', error);
      setError(error.message);
      throw error;
    }
  };

  const loadIndirects = async () => {
    try {
      const res = await fetch('/api/admin/indirects');
      if (res.ok) {
        const data: Indirect[] = await res.json();
        setIndirects(data);
      } else {
        throw new Error('Error al cargar cobros indirectos');
      }
    } catch (error: any) {
      console.error('Error cargando cobros indirectos:', error);
      setError('Error al cargar cobros indirectos');
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const url = '/api/admin/loan-types';
      const method = editingLoan ? 'PUT' : 'POST';

      // ✅ CORRECCIÓN: Preparar datos para enviar - convertir estado boolean a número
      const payload = {
        ...formData,
        estado: formData.estado ? 1 : 0, // Convertir boolean a número para el backend
        cobros_indirectos: selectedIndirects,
        ...(editingLoan && { id_credito: editingLoan.id_credito })
      };

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok) {
        await loadLoanTypes(); // Recargar los datos
        resetForm();
      } else {
        throw new Error(result.error || `Error al ${editingLoan ? 'actualizar' : 'crear'} el crédito`);
      }
    } catch (error: any) {
      console.error('Error guardando tipo de crédito:', error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (loan: LoanType) => {
    setEditingLoan(loan);
    setFormData({ 
      ...loan,
      estado: Boolean(loan.estado) // ✅ CORRECCIÓN: Asegurar que sea boolean
    });
    setSelectedIndirects(loan.cobros_indirectos?.map(ci => ci.id_indirecto) || []);
    setShowForm(true);
    setError('');
  };

  const handleDelete = async (id_credito: number) => {
    if (!confirm('¿Estás seguro de eliminar este tipo de crédito?')) return;
    
    try {
      setError('');
      const res = await fetch(`/api/admin/loan-types?id=${id_credito}`, { 
        method: 'DELETE' 
      });
      
      const result = await res.json();
      
      if (res.ok) {
        await loadLoanTypes();
        alert('Tipo de crédito eliminado correctamente');
      } else {
        throw new Error(result.error || 'Error al eliminar');
      }
    } catch (error: any) {
      console.error('Error eliminando crédito:', error);
      setError(error.message);
    }
  };

  const handleFormChange = (field: keyof LoanType, value: any) => {
    setFormData(prev => ({ 
      ...prev, 
      [field]: value 
    }));
  };

  const handleNumberChange = (field: keyof LoanType, value: string) => {
    const numValue = value === '' ? 0 : Number(value);
    handleFormChange(field, numValue);
  };

  const toggleIndirectSelection = (id: number) => {
    setSelectedIndirects(prev =>
      prev.includes(id) 
        ? prev.filter(x => x !== id) 
        : [...prev, id]
    );
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingLoan(null);
    setFormData(emptyLoan);
    setSelectedIndirects([]);
    setError('');
  };

  const getIndirectDisplayText = (ind: Indirect) => {
    return `${ind.nombre} (${ind.tipo_interes === 'porcentaje' ? `${ind.interes}%` : `$${ind.interes}`})`;
  };

  // El resto del JSX permanece igual...
  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-lg">Cargando tipos de crédito...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tipos de Crédito</h1>
          <p className="text-gray-600 mt-1">Gestiona los diferentes tipos de crédito del sistema</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium"
        >
          + Agregar Tipo
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Interés
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Plazo
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
            {loanTypes.map(loan => (
              <tr key={loan.id_credito} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{loan.nombre}</div>
                  {loan.descripcion && (
                    <div className="text-sm text-gray-500 mt-1 line-clamp-2">{loan.descripcion}</div>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {loan.tipo}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                  {loan.interes}%
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {loan.plazo_min} - {loan.plazo_max} meses
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    loan.estado 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {loan.estado ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium space-x-3">
                  <button 
                    onClick={() => handleEdit(loan)} 
                    className="text-blue-600 hover:text-blue-900 transition-colors"
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => loan.id_credito && handleDelete(loan.id_credito)} 
                    className="text-red-600 hover:text-red-900 transition-colors"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {loanTypes.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center">
                  <div className="text-gray-500">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                    </svg>
                    <p className="mt-2 text-sm font-medium">No hay tipos de crédito registrados</p>
                    <p className="text-xs mt-1">Comienza agregando tu primer tipo de crédito</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingLoan ? 'Editar Crédito' : 'Nuevo Crédito'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información Básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre *
                  </label>
                  <input 
                    type="text" 
                    value={formData.nombre} 
                    onChange={e => handleFormChange('nombre', e.target.value)} 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                    required 
                    placeholder="Ej: Crédito Personal"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo *
                  </label>
                  <input 
                    type="text" 
                    value={formData.tipo} 
                    onChange={e => handleFormChange('tipo', e.target.value)} 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                    required 
                    placeholder="Ej: Personal, Hipotecario, etc."
                  />
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea 
                  value={formData.descripcion} 
                  onChange={e => handleFormChange('descripcion', e.target.value)} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                  rows={2}
                  placeholder="Breve descripción del tipo de crédito..."
                />
              </div>

              {/* Interés y Plazos */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interés Anual (%) *
                  </label>
                  <input 
                    type="number" 
                    step="0.01" 
                    min="0"
                    value={formData.interes} 
                    onChange={e => handleNumberChange('interes', e.target.value)} 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plazo Mínimo (meses) *
                  </label>
                  <input 
                    type="number" 
                    min="1"
                    value={formData.plazo_min} 
                    onChange={e => handleNumberChange('plazo_min', e.target.value)} 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plazo Máximo (meses) *
                  </label>
                  <input 
                    type="number" 
                    min="1"
                    value={formData.plazo_max} 
                    onChange={e => handleNumberChange('plazo_max', e.target.value)} 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                    required 
                  />
                </div>
              </div>

              {/* Información Adicional */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Información Adicional
                </label>
                <textarea 
                  value={formData.informacion} 
                  onChange={e => handleFormChange('informacion', e.target.value)} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                  rows={3}
                  placeholder="Información adicional, requisitos, condiciones especiales..."
                />
              </div>

              {/* Cobros Indirectos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Cobros Indirectos Asociados
                </label>
                <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto space-y-2 bg-gray-50">
                  {indirects.map(ind => (
                    <label key={ind.id_indirecto} className="flex items-center space-x-3 p-2 hover:bg-white rounded-lg transition-colors cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={selectedIndirects.includes(ind.id_indirecto)} 
                        onChange={() => toggleIndirectSelection(ind.id_indirecto)} 
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                      />
                      <span className="text-sm text-gray-700 flex-1">
                        {getIndirectDisplayText(ind)}
                      </span>
                    </label>
                  ))}
                  {indirects.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No hay cobros indirectos disponibles
                    </p>
                  )}
                </div>
              </div>

              {/* Estado */}
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={formData.estado} 
                  onChange={e => handleFormChange('estado', e.target.checked)} 
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                />
                <label className="ml-2 text-sm text-gray-700 font-medium">
                  Crédito activo y disponible
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={saving} 
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {saving ? 'Guardando...' : (editingLoan ? 'Actualizar' : 'Crear Crédito')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
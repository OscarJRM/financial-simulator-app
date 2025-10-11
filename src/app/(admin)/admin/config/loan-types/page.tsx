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

// Tipos de crédito predefinidos
const PREDEFINED_LOAN_TYPES = {
  hipotecario: {
    nombre: 'Crédito Hipotecario',
    descripcion: 'Se destina a la compra, construcción o remodelación de un bien inmueble.',
    tipo: 'Hipotecario',
    interes: 8.5,
    tiempo: '60-360 meses',
    solca: true,
    gravamen: true,
    informacion: 'Requiere garantía hipotecaria. Tasas preferenciales para vivienda.',
    estado: true,
    imagen: ''
  },
  automotriz: {
    nombre: 'Crédito Automotriz',
    descripcion: 'Se utiliza para la compra de vehículos nuevos o usados.',
    tipo: 'Automotriz',
    interes: 10.5,
    tiempo: '12-84 meses',
    solca: true,
    gravamen: false,
    informacion: 'Financiamiento para automóviles, motos y vehículos comerciales.',
    estado: true,
    imagen: ''
  },
  consumo: {
    nombre: 'Crédito de Consumo',
    descripcion: 'Cubre necesidades de bienes y servicios. Incluye tarjetas de crédito, crédito de nómina y crédito personal.',
    tipo: 'Consumo',
    interes: 15.0,
    tiempo: '3-60 meses',
    solca: false,
    gravamen: false,
    informacion: 'Ideal para gastos imprevistos, viajes, electrodomésticos y compras puntuales.',
    estado: true,
    imagen: ''
  },
  educativo: {
    nombre: 'Crédito Educativo',
    descripcion: 'Dirigido a financiar estudios universitarios, de posgrado o estancias de investigación.',
    tipo: 'Educativo',
    interes: 6.5,
    tiempo: '12-120 meses',
    solca: false,
    gravamen: false,
    informacion: 'Periodo de gracia durante los estudios. Tasas especiales para educación.',
    estado: true,
    imagen: ''
  },
  empresarial: {
    nombre: 'Crédito Empresarial',
    descripcion: 'Orientado a iniciar o hacer crecer un negocio. Incluye microcréditos para microempresas, pequeñas, medianas y grandes empresas.',
    tipo: 'Empresarial',
    interes: 12.0,
    tiempo: '6-84 meses',
    solca: true,
    gravamen: true,
    informacion: 'Capital de trabajo, maquinaria, equipos y expansión empresarial.',
    estado: true,
    imagen: ''
  },
  prendario: {
    nombre: 'Crédito Prendario',
    descripcion: 'Para la compra de un bien mueble que queda como garantía hasta que se liquide la deuda.',
    tipo: 'Prendario',
    interes: 11.0,
    tiempo: '6-60 meses',
    solca: true,
    gravamen: false,
    informacion: 'Joyas, electrodomésticos, equipos electrónicos como garantía.',
    estado: true,
    imagen: ''
  },
  avio: {
    nombre: 'Crédito de Avío',
    descripcion: 'Específico para la compra de materias primas, materiales y otros insumos relacionados con la producción inmediata.',
    tipo: 'Avío',
    interes: 9.0,
    tiempo: '3-24 meses',
    solca: true,
    gravamen: true,
    informacion: 'Sector agrícola e industrial. Financiamiento para insumos de producción.',
    estado: true,
    imagen: ''
  },
  personalizado: {
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
  }
};

export default function LoanTypesPage() {
  const [loanTypes, setLoanTypes] = useState<LoanType[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingLoan, setEditingLoan] = useState<LoanType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('personalizado'); // ✅ ESTADO AGREGADO

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

  // Cuando se selecciona un template, cargar los datos
  useEffect(() => {
    if (selectedTemplate && selectedTemplate !== 'personalizado') {
      const template = PREDEFINED_LOAN_TYPES[selectedTemplate as keyof typeof PREDEFINED_LOAN_TYPES];
      setFormData(template);
    } else if (selectedTemplate === 'personalizado') {
      setFormData(emptyLoan);
    }
  }, [selectedTemplate]);

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
        setSelectedTemplate('personalizado'); // ✅ RESETEAR TEMPLATE
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
    setSelectedTemplate('personalizado'); // ✅ AL EDITAR, USAR PERSONALIZADO
    setShowForm(true);
  };

  const handleDelete = async (id_credito: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este tipo de crédito?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/loan-types?id=${id_credito}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadLoanTypes();
        alert('Tipo de crédito eliminado correctamente');
      } else {
        throw new Error('Error al eliminar');
      }
    } catch (error) {
      console.error('Error eliminando tipo de crédito:', error);
      alert('Error al eliminar el tipo de crédito');
    }
  };

  const handleAddNew = () => {
    setEditingLoan(null);
    setFormData(emptyLoan);
    setSelectedTemplate('personalizado'); // ✅ INICIAR CON PERSONALIZADO
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
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer ${loan.estado
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
                  <button
                    onClick={() => handleDelete(loan.id_credito!)}
                    className="text-red-600 hover:text-red-900"
                  >
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
            
            {/* ✅ SELECTOR DE PLANTILLAS - SOLO PARA NUEVOS CRÉDITOS */}
            {!editingLoan && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plantilla de crédito
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="personalizado">Personalizado (llenar manualmente)</option>
                  <option value="hipotecario">Crédito Hipotecario</option>
                  <option value="automotriz">Crédito Automotriz</option>
                  <option value="consumo">Crédito de Consumo</option>
                  <option value="educativo">Crédito Educativo</option>
                  <option value="empresarial">Crédito Empresarial</option>
                  <option value="prendario">Crédito Prendario</option>
                  <option value="avio">Crédito de Avío</option>
                </select>
                <p className="text-sm text-gray-600 mt-2">
                  {selectedTemplate !== 'personalizado' && 
                    `Se cargarán los datos del ${PREDEFINED_LOAN_TYPES[selectedTemplate as keyof typeof PREDEFINED_LOAN_TYPES].nombre}`}
                </p>
              </div>
            )}

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
                    setSelectedTemplate('personalizado');
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
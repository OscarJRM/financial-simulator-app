'use client';

import { useState, useEffect } from 'react';

interface LoanType {
  id_indirecto?: number;
  nombre: string;
  tipo: string;
  interes: number; // valor real
  tipo_interes: "porcentaje" | "desembolso"; // % o monto fijo
}

export default function LoanTypesPage() {
  const [loanTypes, setLoanTypes] = useState<LoanType[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingLoan, setEditingLoan] = useState<LoanType | null>(null);
  const [saving, setSaving] = useState(false);

  const emptyLoan: LoanType = {
    nombre: '',
    tipo: '',
    interes: 0,
    tipo_interes: 'porcentaje',
  };

  const [formData, setFormData] = useState<LoanType>(emptyLoan);

  useEffect(() => {
    loadLoanTypes();
  }, []);

  const loadLoanTypes = async () => {
    try {
      const res = await fetch('/api/admin/indirects');
      if (res.ok) {
        const data = await res.json();
        setLoanTypes(data);
      }
    } catch (error) {
      console.error('Error cargando tipos de crédito:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = '/api/admin/indirects';
      const method = editingLoan ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await loadLoanTypes();
        setShowForm(false);
        setEditingLoan(null);
        setFormData(emptyLoan);
      } else throw new Error('Error al guardar');
    } catch (error) {
      console.error(error);
      alert('Error al guardar tipo de crédito');
    } finally {
      setSaving(false);
    }
  };

  const handleFormChange = (field: keyof LoanType, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddNew = () => {
    setEditingLoan(null);
    setFormData(emptyLoan);
    setShowForm(true);
  };

  const handleEdit = (loan: LoanType) => {
    setEditingLoan(loan);
    setFormData(loan);
    setShowForm(true);
  };

  const handleDelete = async (id_indirecto: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este cobro indirecto?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/indirects?id=${id_indirecto}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadLoanTypes();
        alert('Cobro indirecto eliminado correctamente');
      } else {
        throw new Error('Error al eliminar');
      }
    } catch (error) {
      console.error('Error eliminando cobro indirecto:', error);
      alert('Error al eliminar el cobro indirecto');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Cobros Indirectos</h1>
        <button onClick={handleAddNew} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          + Agregar Tipo
        </button>
      </div>

      <table className="min-w-full divide-y divide-gray-200 bg-white rounded-lg shadow overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left">Nombre</th>
            <th className="px-6 py-3 text-left">Tipo</th>
            <th className="px-6 py-3 text-left">Interés</th>
            <th className="px-6 py-3 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {loanTypes.map(loan => (
            <tr key={loan.id_indirecto}>
              <td className="px-6 py-4">{loan.nombre}</td>
              <td className="px-6 py-4">{loan.tipo}</td>
              <td className="px-6 py-4">
                {loan.interes} {loan.tipo_interes === 'porcentaje' ? '%' : 'USD'}
              </td>
              <td className="px-6 py-4">
                <button onClick={() => handleEdit(loan)} className="text-blue-600 hover:text-blue-900 mr-2">Editar</button>
                <button
                  onClick={() => handleDelete(loan.id_indirecto!)}
                  className="text-red-600 hover:text-red-900"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editingLoan ? 'Editar' : 'Nuevo'} Cobro Indirecto</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => handleFormChange('nombre', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tipo</label>
                <input
                  type="text"
                  required
                  value={formData.tipo}
                  onChange={(e) => handleFormChange('tipo', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Interés</label>
                  <input
                    type="number"
                    required
                    value={formData.interes}
                    step={formData.tipo_interes === 'porcentaje' ? 0.01 : 1}
                    onChange={(e) => handleFormChange('interes', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Tipo de Interés</label>
                  <select
                    value={formData.tipo_interes}
                    onChange={(e) => handleFormChange('tipo_interes', e.target.value as "porcentaje" | "desembolso")}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="porcentaje">Porcentaje (%)</option>
                    <option value="desembolso">Desembolso (USD)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setFormData(emptyLoan); }}
                  className="px-4 py-2 border rounded-md"
                >
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  {saving ? 'Guardando...' : editingLoan ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
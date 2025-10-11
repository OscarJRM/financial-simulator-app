// src/app/loans/page.tsx
'use client';

import { useState, useEffect } from 'react';

interface LoanType {
  id_credito: number;
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

interface AmortizationRow {
  mes: number;
  saldoInicial: number;
  pago: number;
  interes: number;
  capital: number;
  saldoFinal: number;
}

interface SimulationResult {
  cuotaMensual: number;
  totalInteres: number;
  totalPagar: number;
  tablaAmortizacion: AmortizationRow[];
}

type TipoAmortizacion = 'frances' | 'aleman';

export default function LoansPage() {
  const [loanTypes, setLoanTypes] = useState<LoanType[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<string>('personalizado');
  const [monto, setMonto] = useState<number>(10000);
  const [tasaInteres, setTasaInteres] = useState<number>(10);
  const [plazo, setPlazo] = useState<number>(80);
  const [tipoAmortizacion, setTipoAmortizacion] = useState<TipoAmortizacion>('frances');
  const [resultado, setResultado] = useState<SimulationResult | null>(null);
  const [calculando, setCalculando] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cargar tipos de crédito desde la base de datos
  useEffect(() => {
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

    loadLoanTypes();
  }, []);

  // Cuando se selecciona un crédito, cargar sus datos
  useEffect(() => {
    if (selectedLoan !== 'personalizado') {
      const loan = loanTypes.find(l => l.id_credito.toString() === selectedLoan);
      if (loan) {
        setTasaInteres(loan.interes);
        // Extraer el número del tiempo (ej: "80 MESES" -> 80)
        const tiempoMatch = loan.tiempo.match(/\d+/);
        if (tiempoMatch) {
          setPlazo(parseInt(tiempoMatch[0]));
        }
      }
    }
  }, [selectedLoan, loanTypes]);

  const calcularAmortizacionFrancesa = (monto: number, tasaMensual: number, plazoMeses: number) => {
    // Fórmula de amortización francesa (cuota constante)
    const cuotaMensual = monto * (tasaMensual * Math.pow(1 + tasaMensual, plazoMeses)) / 
                        (Math.pow(1 + tasaMensual, plazoMeses) - 1);
    
    let saldo = monto;
    const tabla: AmortizationRow[] = [];
    let totalInteres = 0;

    for (let mes = 1; mes <= plazoMeses; mes++) {
      const interes = saldo * tasaMensual;
      const capital = cuotaMensual - interes;
      const saldoFinal = saldo - capital;
      
      totalInteres += interes;

      tabla.push({
        mes,
        saldoInicial: saldo,
        pago: cuotaMensual,
        interes,
        capital,
        saldoFinal: saldoFinal > 0 ? saldoFinal : 0
      });

      saldo = saldoFinal;
    }

    return { cuotaMensual, totalInteres, tabla };
  };

  const calcularAmortizacionAlemana = (monto: number, tasaMensual: number, plazoMeses: number) => {
    // Fórmula de amortización alemana (amortización constante)
    const amortizacionConstante = monto / plazoMeses;
    let saldo = monto;
    const tabla: AmortizationRow[] = [];
    let totalInteres = 0;

    for (let mes = 1; mes <= plazoMeses; mes++) {
      const interes = saldo * tasaMensual;
      const capital = amortizacionConstante;
      const cuotaMensual = interes + capital;
      const saldoFinal = saldo - capital;
      
      totalInteres += interes;

      tabla.push({
        mes,
        saldoInicial: saldo,
        pago: cuotaMensual,
        interes,
        capital,
        saldoFinal: saldoFinal > 0 ? saldoFinal : 0
      });

      saldo = saldoFinal;
    }

    const cuotaMensual = tabla[0]?.pago || 0;
    return { cuotaMensual, totalInteres, tabla };
  };

  const calcularAmortizacion = () => {
    setCalculando(true);
    
    setTimeout(() => {
      // Convertir tasa anual a mensual
      const tasaMensual = tasaInteres / 100 / 12;
      
      let resultadoCalculo;
      
      if (tipoAmortizacion === 'frances') {
        resultadoCalculo = calcularAmortizacionFrancesa(monto, tasaMensual, plazo);
      } else {
        resultadoCalculo = calcularAmortizacionAlemana(monto, tasaMensual, plazo);
      }

      setResultado({
        cuotaMensual: resultadoCalculo.cuotaMensual,
        totalInteres: resultadoCalculo.totalInteres,
        totalPagar: monto + resultadoCalculo.totalInteres,
        tablaAmortizacion: resultadoCalculo.tabla
      });
      setCalculando(false);
    }, 500);
  };

  const exportarPDF = () => {
    alert('Funcionalidad de exportación PDF en desarrollo');
  };

  const exportarExcel = () => {
    alert('Funcionalidad de exportación Excel en desarrollo');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4 mx-auto"></div>
          <div className="h-4 bg-gray-200 rounded w-48 mb-8 mx-auto"></div>
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded w-80"></div>
            <div className="h-10 bg-gray-200 rounded w-80"></div>
            <div className="h-10 bg-gray-200 rounded w-80"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Simulador de Créditos</h1>
          <p className="text-lg text-gray-600 mt-2">
            Calcula tu tabla de amortización y planifica tus pagos
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario de Simulación */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Parámetros del Crédito</h2>
              
              <div className="space-y-4">
                {/* Selector de Tipo de Crédito */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Crédito
                  </label>
                  <select
                    value={selectedLoan}
                    onChange={(e) => setSelectedLoan(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="personalizado">Personalizado</option>
                    {loanTypes.filter(loan => loan.estado).map((loan) => (
                      <option key={loan.id_credito} value={loan.id_credito}>
                        {loan.nombre} ({loan.tipo})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Monto del Crédito */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monto del Crédito ($)
                  </label>
                  <input
                    type="number"
                    value={monto}
                    onChange={(e) => setMonto(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1000"
                    step="1000"
                  />
                </div>

                {/* Tasa de Interés */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tasa de Interés Anual (%)
                  </label>
                  <input
                    type="number"
                    value={tasaInteres}
                    onChange={(e) => setTasaInteres(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="50"
                    step="0.1"
                    disabled={selectedLoan !== 'personalizado'}
                  />
                  {selectedLoan !== 'personalizado' && (
                    <p className="text-xs text-gray-500 mt-1">
                      Tasa definida por el tipo de crédito seleccionado
                    </p>
                  )}
                </div>

                {/* Plazo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plazo (meses)
                  </label>
                  <input
                    type="number"
                    value={plazo}
                    onChange={(e) => setPlazo(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="360"
                    disabled={selectedLoan !== 'personalizado'}
                  />
                  {selectedLoan !== 'personalizado' && (
                    <p className="text-xs text-gray-500 mt-1">
                      Plazo definido por el tipo de crédito seleccionado
                    </p>
                  )}
                </div>

                {/* Tipo de Amortización */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sistema de Amortización
                  </label>
                  <select
                    value={tipoAmortizacion}
                    onChange={(e) => setTipoAmortizacion(e.target.value as TipoAmortizacion)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="frances">Francés (Cuota Constante)</option>
                    <option value="aleman">Alemán (Amortización Constante)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {tipoAmortizacion === 'frances' 
                      ? 'Cuota mensual constante, interés decreciente' 
                      : 'Amortización constante, cuota decreciente'}
                  </p>
                </div>

                {/* Botón Calcular */}
                <button
                  onClick={calcularAmortizacion}
                  disabled={calculando}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {calculando ? 'Calculando...' : 'Calcular Amortización'}
                </button>
              </div>
            </div>

            {/* Resultados Resumen */}
            {resultado && (
              <div className="bg-white rounded-lg shadow p-6 mt-6">
                <h2 className="text-xl font-semibold mb-4">Resumen del Crédito</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sistema:</span>
                    <span className="font-semibold">
                      {tipoAmortizacion === 'frances' ? 'Francés' : 'Alemán'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cuota Mensual:</span>
                    <span className="font-semibold">${resultado.cuotaMensual.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total a Pagar:</span>
                    <span className="font-semibold">${resultado.totalPagar.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Intereses:</span>
                    <span className="font-semibold text-red-600">${resultado.totalInteres.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Plazo Total:</span>
                    <span className="font-semibold">{plazo} meses</span>
                  </div>
                </div>

                {/* Botones de Exportación */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={exportarPDF}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
                  >
                    Exportar PDF
                  </button>
                  <button
                    onClick={exportarExcel}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                  >
                    Exportar Excel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Tabla de Amortización */}
          <div className="lg:col-span-2">
            {resultado ? (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-semibold">Tabla de Amortización - Sistema {tipoAmortizacion === 'frances' ? 'Francés' : 'Alemán'}</h2>
                  <p className="text-gray-600">Detalle de pagos mensuales</p>
                </div>
                
                <div className="overflow-x-auto max-h-96">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Mes
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Saldo Inicial
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Pago
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Interés
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Capital
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Saldo Final
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {resultado.tablaAmortizacion.map((fila) => (
                        <tr key={fila.mes} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {fila.mes}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${fila.saldoInicial.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${fila.pago.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                            ${fila.interes.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                            ${fila.capital.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${fila.saldoFinal.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Simula tu crédito
                </h3>
                <p className="text-gray-600">
                  Selecciona un tipo de crédito o usa personalizado, luego haz clic en "Calcular Amortización".
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
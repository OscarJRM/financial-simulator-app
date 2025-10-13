'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  DollarSign,
  TrendingUp
} from 'lucide-react';
import { MyInvestmentsStats } from '../../types';

interface MyInvestmentsStatsProps {
  stats: MyInvestmentsStats;
}

export function MyInvestmentsStatsCard({ stats }: MyInvestmentsStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const statsCards = [
    {
      title: 'Total Solicitudes',
      value: stats.total.toString(),
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Solicitudes realizadas',
    },
    {
      title: 'Pendientes',
      value: stats.pendientes.toString(),
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'En revisión',
    },
    {
      title: 'Aprobadas',
      value: stats.aprobadas.toString(),
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Inversiones activas',
    },
    {
      title: 'Rechazadas',
      value: stats.rechazadas.toString(),
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      description: 'No aprobadas',
    },
    {
      title: 'Monto Aprobado',
      value: formatCurrency(stats.montoTotalAprobado),
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Capital invertido',
    },
    {
      title: 'Ganancia Estimada',
      value: formatCurrency(stats.gananciaEstimadaTotal),
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      description: 'Retorno esperado',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {statsCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`${stat.bgColor} p-2 rounded-full`}>
                      <Icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  </div>
                  <p className="text-xl font-bold mb-1">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
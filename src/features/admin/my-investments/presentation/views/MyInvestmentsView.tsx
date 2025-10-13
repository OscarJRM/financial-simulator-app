'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  RefreshCw,
  AlertCircle,
  Plus,
  FileText
} from 'lucide-react';
import { useMyInvestments } from '../../hooks/useMyInvestments';
import { MySolicitudCard } from '../components/MySolicitudCard';
import { MyInvestmentsStatsCard } from '../components/MyInvestmentsStatsCard';

interface MyInvestmentsViewProps {
  userId: number;
}

export function MyInvestmentsView({ userId }: MyInvestmentsViewProps) {
  const {
    solicitudes,
    solicitudesPendientes,
    solicitudesAprobadas,
    solicitudesRechazadas,
    estadisticas,
    isLoading,
    error,
    fetchSolicitudes,
  } = useMyInvestments(userId);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('todas');

  // Filtrar solicitudes por búsqueda
  const filterSolicitudes = (solicitudes: any[]) => {
    if (!searchTerm) return solicitudes;
    
    return solicitudes.filter(
      (s) =>
        s.nombre_inversion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.estado.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.empresa?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando mis inversiones...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Mis Solicitudes de Inversión</h1>
          <p className="text-gray-600">
            Revisa el estado de tus solicitudes de inversión y su progreso
          </p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <Button
            onClick={fetchSolicitudes}
            disabled={isLoading}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button
            onClick={() => window.location.href = '/client/investments/solicitar'}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Solicitud
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}


      {/* Filtros y búsqueda */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nombre de inversión, estado o empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mensaje si no hay solicitudes */}
      {solicitudes.length === 0 && !isLoading && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="bg-blue-50 p-4 rounded-full">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">No tienes solicitudes de inversión</h3>
                <p className="text-gray-600 max-w-md">
                  Comienza tu camino hacia el crecimiento financiero creando tu primera solicitud de inversión
                </p>
              </div>
              <Button
                onClick={() => window.location.href = '/client/investments'}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear Primera Solicitud
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs con solicitudes */}
      {solicitudes.length > 0 && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="todas">
              Todas ({estadisticas.total})
            </TabsTrigger>
            <TabsTrigger value="pendientes">
              Pendientes ({estadisticas.pendientes})
            </TabsTrigger>
            <TabsTrigger value="aprobadas">
              Aprobadas ({estadisticas.aprobadas})
            </TabsTrigger>
            <TabsTrigger value="rechazadas">
              Rechazadas ({estadisticas.rechazadas})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="todas">
            <div className="space-y-4">
              {filterSolicitudes(solicitudes).map((solicitud) => (
                <MySolicitudCard
                  key={solicitud.id_solicitud}
                  solicitud={solicitud}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pendientes">
            <div className="space-y-4">
              {filterSolicitudes(solicitudesPendientes).length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-600">No tienes solicitudes pendientes</p>
                  </CardContent>
                </Card>
              ) : (
                filterSolicitudes(solicitudesPendientes).map((solicitud) => (
                  <MySolicitudCard
                    key={solicitud.id_solicitud}
                    solicitud={solicitud}
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="aprobadas">
            <div className="space-y-4">
              {filterSolicitudes(solicitudesAprobadas).length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="space-y-3">
                      <p className="text-gray-600">No tienes solicitudes aprobadas aún</p>
                      <p className="text-sm text-gray-500">
                        Las solicitudes aprobadas aparecerán aquí una vez que el equipo las revise
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                filterSolicitudes(solicitudesAprobadas).map((solicitud) => (
                  <MySolicitudCard
                    key={solicitud.id_solicitud}
                    solicitud={solicitud}
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="rechazadas">
            <div className="space-y-4">
              {filterSolicitudes(solicitudesRechazadas).length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-600">No tienes solicitudes rechazadas</p>
                  </CardContent>
                </Card>
              ) : (
                filterSolicitudes(solicitudesRechazadas).map((solicitud) => (
                  <MySolicitudCard
                    key={solicitud.id_solicitud}
                    solicitud={solicitud}
                  />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  RefreshCw,
  AlertCircle 
} from 'lucide-react';
import { useRequestInvestments } from '../../hooks/useRequestInvestments';
import { SolicitudCard } from '../components/SolicitudCard';
import { StatsCard } from '../components/StatsCard';

export function RequestInvestmentsView() {
  const {
    solicitudes,
    solicitudesPendientes,
    solicitudesAprobadas,
    solicitudesRechazadas,
    estadisticas,
    isLoading,
    error,
    isProcessing,
    fetchSolicitudes,
    gestionarSolicitud,
  } = useRequestInvestments();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('todas');

  // Filtrar solicitudes por búsqueda
  const filterSolicitudes = (solicitudes: any[]) => {
    if (!searchTerm) return solicitudes;
    
    return solicitudes.filter(
      (s) =>
        s.nombre_usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.cedula.includes(searchTerm) ||
        s.nombre_inversion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.empresa?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleGestionar = async (idSolicitud: number, estado: 'Aprobado' | 'Rechazado', observacion?: string) => {
    await gestionarSolicitud({ idSolicitud, nuevoEstado: estado, observacion });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando solicitudes...</p>
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
          <h1 className="text-3xl font-bold mb-2">Gestión de Solicitudes de Inversión</h1>
          <p className="text-gray-600">
            Administra y procesa las solicitudes de inversión de los clientes
          </p>
        </div>
        <Button
          onClick={fetchSolicitudes}
          disabled={isLoading}
          variant="outline"
          className="mt-4 sm:mt-0"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
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

      {/* Estadísticas */}
      <StatsCard stats={estadisticas} />

      {/* Filtros y búsqueda */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nombre, cédula, inversión o empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs con solicitudes */}
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
            {filterSolicitudes(solicitudes).length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-600">No se encontraron solicitudes</p>
                </CardContent>
              </Card>
            ) : (
              filterSolicitudes(solicitudes).map((solicitud) => (
                <SolicitudCard
                  key={solicitud.id_solicitud}
                  solicitud={solicitud}
                  onGestionar={handleGestionar}
                  isProcessing={isProcessing}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="pendientes">
          <div className="space-y-4">
            {filterSolicitudes(solicitudesPendientes).length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-600">No hay solicitudes pendientes</p>
                </CardContent>
              </Card>
            ) : (
              filterSolicitudes(solicitudesPendientes).map((solicitud) => (
                <SolicitudCard
                  key={solicitud.id_solicitud}
                  solicitud={solicitud}
                  onGestionar={handleGestionar}
                  isProcessing={isProcessing}
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
                  <p className="text-gray-600">No hay solicitudes aprobadas</p>
                </CardContent>
              </Card>
            ) : (
              filterSolicitudes(solicitudesAprobadas).map((solicitud) => (
                <SolicitudCard
                  key={solicitud.id_solicitud}
                  solicitud={solicitud}
                  onGestionar={handleGestionar}
                  isProcessing={isProcessing}
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
                  <p className="text-gray-600">No hay solicitudes rechazadas</p>
                </CardContent>
              </Card>
            ) : (
              filterSolicitudes(solicitudesRechazadas).map((solicitud) => (
                <SolicitudCard
                  key={solicitud.id_solicitud}
                  solicitud={solicitud}
                  onGestionar={handleGestionar}
                  isProcessing={isProcessing}
                />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
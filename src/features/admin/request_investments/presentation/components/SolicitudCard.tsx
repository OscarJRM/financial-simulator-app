'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  User, 
  DollarSign, 
  Calendar, 
  Building, 
  FileText, 
  Eye, 
  Check, 
  X,
  TrendingUp,
  Clock
} from 'lucide-react';
import { SolicitudInversion } from '../../types';

interface SolicitudCardProps {
  solicitud: SolicitudInversion;
  onGestionar: (idSolicitud: number, estado: 'Aprobado' | 'Rechazado', observacion?: string) => void;
  isProcessing: boolean;
}

export function SolicitudCard({ solicitud, onGestionar, isProcessing }: SolicitudCardProps) {
  const [observacion, setObservacion] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case 'Pendiente':
        return 'default';
      case 'Aprobado':
        return 'default'; // Verde
      case 'Rechazado':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const handleAprobar = () => {
    onGestionar(solicitud.id_solicitud, 'Aprobado', observacion);
    setObservacion('');
    setDialogOpen(false);
  };

  const handleRechazar = () => {
    onGestionar(solicitud.id_solicitud, 'Rechazado', observacion);
    setObservacion('');
    setDialogOpen(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              {solicitud.nombre_usuario}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Cédula: {solicitud.cedula} • {solicitud.nombre_inversion}
            </p>
          </div>
          <Badge variant={getEstadoBadgeVariant(solicitud.estado)}>
            {solicitud.estado}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Información financiera */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <div>
              <p className="font-semibold">{formatCurrency(solicitud.monto)}</p>
              <p className="text-gray-600">Inversión</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <div>
              <p className="font-semibold">{solicitud.plazo_meses} meses</p>
              <p className="text-gray-600">Plazo</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-purple-600" />
            <div>
              <p className="font-semibold">{solicitud.tasa_anual}%</p>
              <p className="text-gray-600">Tasa</p>
            </div>
          </div>
          
          
        </div>

        {/* Información laboral */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Building className="h-4 w-4" />
            <span className="font-medium text-sm">Información Laboral</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
            <div>
              <span className="font-medium">Empresa:</span> {solicitud.empresa || 'N/A'}
            </div>
            <div>
              <span className="font-medium">RUC:</span> {solicitud.ruc || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Tipo:</span> {solicitud.tipo_empleo || 'N/A'}
            </div>
          </div>
        </div>

        {/* Capacidad financiera */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Ingresos</p>
            <p className="font-semibold text-green-600">
              {solicitud.ingresos ? formatCurrency(solicitud.ingresos) : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Egresos</p>
            <p className="font-semibold text-red-600">
              {solicitud.egresos ? formatCurrency(solicitud.egresos) : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Disponible</p>
            <p className="font-semibold text-blue-600">
              {(solicitud.ingresos && solicitud.egresos) 
                ? formatCurrency(solicitud.ingresos - solicitud.egresos)
                : 'N/A'
              }
            </p>
          </div>
        </div>

        {/* Fecha de solicitud */}
        <div className="text-xs text-gray-500">
          Solicitado: {formatDate(solicitud.fecha_solicitud)}
        </div>

        {/* Observación del admin */}
        {solicitud.observacion_admin && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-blue-800 mb-1">Observación del administrador:</p>
            <p className="text-sm text-blue-700">{solicitud.observacion_admin}</p>
          </div>
        )}

        {/* Acciones */}
        <div className="flex gap-2 pt-2">
          {/* Ver documento */}
          {solicitud.documento_validacion_uri && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(solicitud.documento_validacion_uri, '_blank')}
            >
              <Eye className="h-4 w-4 mr-1" />
              Ver Documento
            </Button>
          )}

          {/* Solo mostrar botones de gestión si está pendiente */}
          {solicitud.estado === 'Pendiente' && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-1" />
                  Gestionar
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Gestionar Solicitud</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">
                      Solicitud de {solicitud.nombre_usuario}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatCurrency(solicitud.monto)} por {solicitud.plazo_meses} meses
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Observación (opcional)</label>
                    <Textarea
                      value={observacion}
                      onChange={(e) => setObservacion(e.target.value)}
                      placeholder="Comentarios sobre la decisión..."
                      className="mt-1"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleAprobar}
                      disabled={isProcessing}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Aprobar
                    </Button>
                    <Button
                      onClick={handleRechazar}
                      disabled={isProcessing}
                      variant="destructive"
                      className="flex-1"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Rechazar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
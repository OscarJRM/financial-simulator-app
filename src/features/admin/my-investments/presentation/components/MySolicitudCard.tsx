'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  Calendar, 
  Building, 
  Eye, 
  TrendingUp,
  Clock,
  Info
} from 'lucide-react';
import { UserSolicitudInversion } from '../../types';
import { MyInvestmentsService } from '../../services/MyInvestmentsService';

interface MySolicitudCardProps {
  solicitud: UserSolicitudInversion;
}

export function MySolicitudCard({ solicitud }: MySolicitudCardProps) {
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

  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case 'Pendiente':
        return 'secondary';
      case 'Aprobada':
        return 'default';
      case 'Rechazada':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              {solicitud.nombre_inversion}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Solicitud #{solicitud.id_solicitud} • {formatDate(solicitud.fecha_solicitud)}
            </p>
          </div>
          <Badge variant={getEstadoBadgeVariant(solicitud.estado)} className="flex items-center gap-1">
            <span>{MyInvestmentsService.getEstadoIcon(solicitud.estado)}</span>
            {solicitud.estado}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Información de la inversión */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Detalles de la Inversión</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div>
                <p className="font-semibold">{formatCurrency(solicitud.monto)}</p>
                <p className="text-gray-600">Monto</p>
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
                <p className="text-gray-600">Tasa Anual</p>
              </div>
            </div>
           
          </div>
        </div>

        {/* Descripción del producto */}
        {solicitud.descripcion_inversion && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4" />
              <span className="font-medium text-sm">Descripción del Producto</span>
            </div>
            <p className="text-sm text-gray-700">{solicitud.descripcion_inversion}</p>
          </div>
        )}

        {/* Información laboral proporcionada */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Building className="h-4 w-4" />
            <span className="font-medium text-sm">Información Proporcionada</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
            <div>
              <span className="font-medium">Empresa:</span> {solicitud.empresa || 'N/A'}
            </div>
            <div>
              <span className="font-medium">RUC:</span> {solicitud.ruc || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Tipo Empleo:</span> {solicitud.tipo_empleo || 'N/A'}
            </div>
          </div>
          
          {(solicitud.ingresos || solicitud.egresos) && (
            <div className="grid grid-cols-3 gap-4 text-sm mt-3 pt-3 border-t border-gray-200">
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
          )}
        </div>

        {/* Observación del admin */}
        {solicitud.observacion_admin && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg">
            <p className="text-sm font-medium text-blue-800 mb-1">Comentario del Administrador:</p>
            <p className="text-sm text-blue-700">{solicitud.observacion_admin}</p>
          </div>
        )}

        {/* Acciones */}
        <div className="flex gap-2 pt-2">
          {/* Ver documento si existe */}
          {solicitud.documento_validacion_uri && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(solicitud.documento_validacion_uri, '_blank')}
            >
              <Eye className="h-4 w-4 mr-1" />
              Ver Documento Enviado
            </Button>
          )}
          
          {/* Mensaje basado en el estado */}
          {solicitud.estado === 'Pendiente' && (
            <div className="flex-1 flex items-center justify-end">
              <span className="text-sm text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                ⏳ En revisión por el equipo administrativo
              </span>
            </div>
          )}
          
          {solicitud.estado === 'Aprobado' && (
            <div className="flex-1 flex items-center justify-end">
              <span className="text-sm text-green-600 bg-green-100 px-3 py-1 rounded-full">
                ✅ ¡Felicitaciones! Su solicitud ha sido aprobada
              </span>
            </div>
          )}
          
          {solicitud.estado === 'Rechazado' && (
            <div className="flex-1 flex items-center justify-end">
              <span className="text-sm text-red-600 bg-red-100 px-3 py-1 rounded-full">
                ❌ Solicitud no aprobada
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
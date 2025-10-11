import { jsPDF } from 'jspdf';
import { utils, writeFile } from 'xlsx';
import { SimulationResult, AmortizationRow, LoanType } from '../types/loanTypes';

interface Institution {
  id_info: number;
  nombre: string;
  logo: string;
  slogan: string;
  color_primario: string;
  color_secundario: string;
  direccion: string;
  pais: string;
  owner: string;
  telefono: string;
  correo: string;
  estado: boolean;
}

/**
 * Obtiene los datos de la institución desde la API
 */
export const getInstitutionData = async (): Promise<Institution | null> => {
  try {
    const response = await fetch('/api/admin/institution');
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error('Error cargando datos de la institución:', error);
    return null;
  }
};

/**
 * Convierte hex color a RGB
 */
const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : [0, 0, 0];
};

/**
 * Agrega marca de agua al PDF
 */
const addWatermark = (pdf: jsPDF, institution: Institution | null) => {
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  
  // Guardar estado actual
  pdf.saveGraphicsState();
  
  // Configurar transparencia
  pdf.setGState(new (pdf as any).GState({ opacity: 0.1 }));
  
  // Configurar texto de marca de agua
  pdf.setFontSize(60);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(200, 200, 200);
  
  const watermarkText = institution?.nombre || 'SIMULACIÓN';
  const textWidth = pdf.getTextWidth(watermarkText);
  
  // Rotar texto 45 grados y posicionar en el centro
  pdf.text(watermarkText, 
    (pageWidth - textWidth) / 2, 
    pageHeight / 2,
    { angle: 45 }
  );
  
  // Restaurar estado
  pdf.restoreGraphicsState();
};

/**
 * Exporta la simulación de crédito a PDF con diseño mejorado
 */
export const exportToPDF = async (
  resultado: SimulationResult,
  loan: LoanType,
  monto: number,
  tasaInteres: number,
  plazo: number,
  tipoAmortizacion: string
) => {
  try {
    const institution = await getInstitutionData();
    const nombreEmpresa = institution?.nombre || 'Institución Financiera';
    const colorPrimario = institution?.color_primario || '#1e40af';
    const colorSecundario = institution?.color_secundario || '#1e3a8a';
    const colorTitulo = '#1f2937'; // Gris oscuro para títulos
    const colorTexto = '#374151'; // Gris medio para texto normal

    const pdf = new jsPDF('p', 'mm', 'a4');
    let yPosition = 20;
    const lineHeight = 7;
    const margin = 20;
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    const [r, g, b] = hexToRgb(colorPrimario);

    // Agregar marca de agua en todas las páginas
    const addWatermarkToAllPages = () => {
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        addWatermark(pdf, institution);
      }
    };

    // Manejo de salto de página
    const checkPageBreak = (requiredHeight: number = lineHeight) => {
      if (yPosition + requiredHeight > pageHeight - 15) {
        pdf.addPage();
        yPosition = 20;
        return true;
      }
      return false;
    };

    // Función para agregar texto al PDF
    const addText = (text: string, fontSize = 12, isBold = false, x = margin, customY?: number, color: string = colorTexto, align: 'left' | 'center' | 'right' = 'left') => {
      if (customY !== undefined) yPosition = customY;
      checkPageBreak();
      
      pdf.setFontSize(fontSize);
      pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
      
      if (color) {
        const [r, g, b] = hexToRgb(color);
        pdf.setTextColor(r, g, b);
      }

      let xPosition = x;
      if (align === 'center') {
        const textWidth = pdf.getTextWidth(text);
        xPosition = (pageWidth - textWidth) / 2;
      } else if (align === 'right') {
        const textWidth = pdf.getTextWidth(text);
        xPosition = pageWidth - margin - textWidth;
      }

      pdf.text(text, xPosition, yPosition);
      pdf.setTextColor(0, 0, 0); // Reset color
      yPosition += lineHeight;
    };

    // Función para dibujar rectángulo con color
    const drawRect = (x: number, y: number, width: number, height: number, color: string) => {
      const [r, g, b] = hexToRgb(color);
      pdf.setFillColor(r, g, b);
      pdf.rect(x, y, width, height, 'F');
    };

    // --- ENCABEZADO CON COLOR ---
    drawRect(0, 0, pageWidth, 45, colorPrimario);
    
    // Logo (si existe) - en esquina superior izquierda
    if (institution?.logo) {
      try {
        // Espacio reservado para logo - implementar si tienes la imagen en base64
        // pdf.addImage(institution.logo, 'PNG', margin, 8, 25, 25);
      } catch (error) {
        console.warn('No se pudo cargar el logo');
      }
    }

    // Título principal centrado - Blanco sobre fondo color
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    const titleWidth = pdf.getTextWidth(nombreEmpresa.toUpperCase());
    pdf.text(nombreEmpresa.toUpperCase(), (pageWidth - titleWidth) / 2, 20);
    
    // Slogan - Blanco sobre fondo color
    if (institution?.slogan) {
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      const sloganWidth = pdf.getTextWidth(institution.slogan);
      pdf.text(institution.slogan, (pageWidth - sloganWidth) / 2, 30);
    }

    // Subtítulo del reporte
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    const subtitleWidth = pdf.getTextWidth('SIMULACIÓN DE CRÉDITO');
    pdf.text('SIMULACIÓN DE CRÉDITO', (pageWidth - subtitleWidth) / 2, 40);

    pdf.setTextColor(0, 0, 0);
    yPosition = 60;

    // --- RESUMEN EN COLUMNAS ---
    addText('RESUMEN DEL CRÉDITO', 16, true, margin, yPosition, colorTitulo, 'center');
    yPosition += 12;

    // Crear dos columnas para el resumen
    const col1X = margin;
    const col2X = pageWidth / 2 + 10;
    let currentCol1Y = yPosition;
    let currentCol2Y = yPosition;

    // Columna 1 - Títulos en negrita y oscuros
    addText(`Tipo de Crédito:`, 10, true, col1X, currentCol1Y, colorTitulo);
    addText(loan.nombre, 10, false, col1X + 40, currentCol1Y);
    currentCol1Y += lineHeight;

    addText(`Sistema:`, 10, true, col1X, currentCol1Y, colorTitulo);
    addText(tipoAmortizacion === 'frances' ? 'Francés' : 'Alemán', 10, false, col1X + 40, currentCol1Y);
    currentCol1Y += lineHeight;

    addText(`Monto:`, 10, true, col1X, currentCol1Y, colorTitulo);
    addText(`$${monto.toLocaleString()}`, 10, false, col1X + 40, currentCol1Y);
    currentCol1Y += lineHeight;

    addText(`Tasa Anual:`, 10, true, col1X, currentCol1Y, colorTitulo);
    addText(`${tasaInteres}%`, 10, false, col1X + 40, currentCol1Y);
    currentCol1Y += lineHeight;

    addText(`Plazo:`, 10, true, col1X, currentCol1Y, colorTitulo);
    addText(`${plazo} meses`, 10, false, col1X + 40, currentCol1Y);
    currentCol1Y += lineHeight;

    // Columna 2 - Títulos en negrita y oscuros
    addText(`Cuota Base:`, 10, true, col2X, currentCol2Y, colorTitulo);
    addText(`$${resultado.cuotaMensual.toFixed(2)}`, 10, false, col2X + 35, currentCol2Y);
    currentCol2Y += lineHeight;

    if (resultado.cobrosIndirectosMensuales > 0) {
      addText(`Cobros Indirectos:`, 10, true, col2X, currentCol2Y, colorTitulo);
      addText(`$${resultado.cobrosIndirectosMensuales.toFixed(2)}`, 10, false, col2X + 35, currentCol2Y);
      currentCol2Y += lineHeight;
    }

    addText(`Cuota Final:`, 10, true, col2X, currentCol2Y, colorSecundario);
    addText(`$${resultado.cuotaFinal.toFixed(2)}`, 10, true, col2X + 35, currentCol2Y, colorSecundario);
    currentCol2Y += lineHeight;

    addText(`Total Intereses:`, 10, true, col2X, currentCol2Y, colorTitulo);
    addText(`$${resultado.totalInteres.toFixed(2)}`, 10, false, col2X + 35, currentCol2Y);
    currentCol2Y += lineHeight;

    addText(`Total a Pagar:`, 10, true, col2X, currentCol2Y, colorSecundario);
    addText(`$${resultado.totalPagar.toFixed(2)}`, 10, true, col2X + 35, currentCol2Y, colorSecundario);

    // Usar la posición más baja de las dos columnas
    yPosition = Math.max(currentCol1Y, currentCol2Y) + 12;

    // --- COBROS INDIRECTOS ---
    if (loan.cobros_indirectos?.length) {
      addText('COBROS INDIRECTOS INCLUIDOS', 12, true, margin, yPosition, colorTitulo);
      yPosition += 8;

      loan.cobros_indirectos.forEach((cobro, index) => {
        addText(`• ${cobro.nombre}:`, 9, true, margin, yPosition, colorTitulo);
        addText(
          `${cobro.tipo_interes === 'porcentaje' ? `${cobro.interes}%` : `$${cobro.interes}`}`,
          9,
          false,
          margin + 50,
          yPosition
        );
        yPosition += lineHeight - 2;
      });
      yPosition += 8;
    }

    // --- TABLA DE AMORTIZACIÓN ---
    checkPageBreak(25);
    addText('TABLA DE AMORTIZACIÓN', 16, true, margin, yPosition, colorTitulo, 'center');
    yPosition += 12;

    // Encabezado de tabla con color oscuro
    const tableTop = yPosition;
    const columns = [
      { header: 'Mes', width: 15 },
      { header: 'Saldo Inicial', width: 25 },
      { header: 'Pago Base', width: 22 },
      { header: 'Interés', width: 20 },
      { header: 'Capital', width: 20 },
      { header: 'Cobros Ind.', width: 22 },
      { header: 'Pago Total', width: 25 },
      { header: 'Saldo Final', width: 25 }
    ];

    // Fondo del encabezado - color oscuro
    drawRect(margin - 2, tableTop - 5, 174, 8, colorTitulo);

    // Texto del encabezado - blanco sobre fondo oscuro
    let xPosition = margin;
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 255, 255);
    
    columns.forEach(col => {
      pdf.text(col.header, xPosition, tableTop);
      xPosition += col.width;
    });

    pdf.setTextColor(0, 0, 0);
    yPosition = tableTop + 8;

    // Función para dibujar fila
    const drawTableRow = (fila: AmortizationRow, isEven: boolean) => {
      checkPageBreak();
      
      // Fondo alternado para filas
      if (isEven) {
        pdf.setFillColor(250, 250, 250);
        pdf.rect(margin - 2, yPosition - 4, 174, 6, 'F');
      }

      xPosition = margin;
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'normal');

      const rowData = [
        { text: fila.mes.toString(), color: colorTexto },
        { text: `$${fila.saldoInicial.toFixed(2)}`, color: colorTexto },
        { text: `$${fila.pago.toFixed(2)}`, color: colorTexto },
        { text: `$${fila.interes.toFixed(2)}`, color: '#dc2626' }, // Rojo para intereses
        { text: `$${fila.capital.toFixed(2)}`, color: '#16a34a' }, // Verde para capital
        { text: `$${fila.cobrosIndirectos.toFixed(2)}`, color: '#ea580c' }, // Naranja para cobros indirectos
        { text: `$${fila.pagoTotal.toFixed(2)}`, color: colorSecundario }, // Color secundario para pago total
        { text: `$${fila.saldoFinal.toFixed(2)}`, color: colorTexto }
      ];

      rowData.forEach((cell, idx) => {
        const [r, g, b] = hexToRgb(cell.color);
        pdf.setTextColor(r, g, b);
        pdf.text(cell.text, xPosition, yPosition);
        xPosition += columns[idx].width;
      });

      pdf.setTextColor(0, 0, 0);
      yPosition += 6;

      // Línea separadora suave
      pdf.setDrawColor(229, 231, 235);
      pdf.line(margin, yPosition - 1, margin + 170, yPosition - 1);
    };

    // Dibujar todas las filas
    resultado.tablaAmortizacion.forEach((fila, index) => {
      drawTableRow(fila, index % 2 === 0);
    });

    // --- PIE DE PÁGINA ---
    checkPageBreak(25);
    
    // Línea separadora con color primario
    pdf.setDrawColor(...hexToRgb(colorPrimario));
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // Información de la institución en columnas
    const footerCol1 = margin;
    const footerCol2 = pageWidth / 2;

    if (institution) {
      // Título del pie de página
      addText('INFORMACIÓN DE CONTACTO', 10, true, margin, yPosition, colorTitulo, 'center');
      yPosition += 8;

      if (institution.direccion) {
        addText('Dirección:', 8, true, footerCol1, yPosition, colorTitulo);
        addText(institution.direccion, 8, false, footerCol1 + 20, yPosition);
      }
      
      if (institution.telefono) {
        addText('Teléfono:', 8, true, footerCol2, yPosition, colorTitulo);
        addText(institution.telefono, 8, false, footerCol2 + 20, yPosition);
        yPosition += 5;
      }
      
      if (institution.correo) {
        addText('Email:', 8, true, footerCol1, yPosition, colorTitulo);
        addText(institution.correo, 8, false, footerCol1 + 20, yPosition);
        yPosition += 5;
      }
    }

    // Fecha de generación
    yPosition += 5;
    addText(`Documento generado el ${new Date().toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`, 8, false, margin, yPosition, '#6b7280', 'center');

    // Agregar marca de agua a todas las páginas
    addWatermarkToAllPages();

    // Guardar PDF
    const fileName = `Simulación_Crédito_${loan.nombre.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().getTime()}.pdf`;
    pdf.save(fileName);

  } catch (error) {
    console.error('Error generando PDF:', error);
    throw new Error('Error al generar el PDF. Por favor, intente nuevamente.');
  }
};
/**
 * Exporta la simulación de crédito a Excel (sin cambios)
 */
export const exportToExcel = async (
  resultado: SimulationResult,
  loan: LoanType,
  monto: number,
  tasaInteres: number,
  plazo: number,
  tipoAmortizacion: string
) => {
  try {
    const institution = await getInstitutionData();
    const nombreEmpresa = institution?.nombre || 'Institución Financiera';

    const datosExcel: any[][] = [
      [nombreEmpresa.toUpperCase()],
      institution?.slogan ? [institution.slogan] : [''],
      ['RESUMEN DE SIMULACIÓN DE CRÉDITO'],
      [''],
      ['RESUMEN DEL CRÉDITO'],
      ['Tipo de Crédito:', loan.nombre],
      ['Sistema:', tipoAmortizacion === 'frances' ? 'Francés' : 'Alemán'],
      ['Monto:', `$${monto.toLocaleString()}`],
      ['Tasa de Interés:', `${tasaInteres}% anual`],
      ['Plazo:', `${plazo} meses`]
    ];

    if (loan.cobros_indirectos?.length) {
      datosExcel.push(['Cobros Indirectos:', '']);
      loan.cobros_indirectos.forEach(cobro => {
        datosExcel.push(['', `${cobro.nombre}: ${cobro.tipo_interes === 'porcentaje' ? `${cobro.interes}%` : `$${cobro.interes}`}`]);
      });
    }

    datosExcel.push(
      ['Cuota Base:', `$${resultado.cuotaMensual.toFixed(2)}`],
      ['Cobros Indirectos Mensuales:', `$${resultado.cobrosIndirectosMensuales.toFixed(2)}`],
      ['Cuota Final:', `$${resultado.cuotaFinal.toFixed(2)}`],
      ['Total Intereses:', `$${resultado.totalInteres.toFixed(2)}`],
      ['Total a Pagar:', `$${resultado.totalPagar.toFixed(2)}`],
      [''],
      ['TABLA DE AMORTIZACIÓN'],
      ['Mes', 'Saldo Inicial', 'Pago Base', 'Interés', 'Capital', 'Cobros Ind.', 'Pago Total', 'Saldo Final']
    );

    resultado.tablaAmortizacion.forEach(fila => {
      datosExcel.push([
        fila.mes.toString(),
        `$${fila.saldoInicial.toFixed(2)}`,
        `$${fila.pago.toFixed(2)}`,
        `$${fila.interes.toFixed(2)}`,
        `$${fila.capital.toFixed(2)}`,
        `$${fila.cobrosIndirectos.toFixed(2)}`,
        `$${fila.pagoTotal.toFixed(2)}`,
        `$${fila.saldoFinal.toFixed(2)}`
      ]);
    });

    // Información de la institución
    datosExcel.push(['']);
    datosExcel.push(['INFORMACIÓN DE LA INSTITUCIÓN']);
    if (institution) {
      if (institution.direccion) datosExcel.push(['Dirección:', institution.direccion]);
      if (institution.telefono) datosExcel.push(['Teléfono:', institution.telefono]);
      if (institution.correo) datosExcel.push(['Email:', institution.correo]);
    }
    datosExcel.push(['Generado el:', new Date().toLocaleDateString()]);

    // Crear libro de trabajo
    const wb = utils.book_new();
    const ws = utils.aoa_to_sheet(datosExcel);

    if (!ws['!cols']) ws['!cols'] = [];
    ws['!cols'] = [
      { width: 12 }, { width: 18 }, { width: 15 }, { width: 15 },
      { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }
    ];

    utils.book_append_sheet(wb, ws, 'Amortización');
    const fileName = `SIMULACION_CREDITO_${loan.nombre.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.xlsx`;
    writeFile(wb, fileName);

  } catch (error) {
    console.error('Error generando Excel:', error);
    throw new Error('Error al generar el Excel');
  }
};
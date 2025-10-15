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
  
  pdf.saveGraphicsState();
  pdf.setGState(new (pdf as any).GState({ opacity: 0.1 }));
  pdf.setFontSize(60);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(200, 200, 200);
  
  const watermarkText = institution?.nombre || 'SIMULACIÓN';
  const textWidth = pdf.getTextWidth(watermarkText);
  
  pdf.text(watermarkText, 
    (pageWidth - textWidth) / 2, 
    pageHeight / 2,
    { angle: 45 }
  );
  
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
    const colorPrimario = institution?.color_primario || '#001f83';
    const colorSecundario = institution?.color_secundario || '#1e3a8a';
    const colorTitulo = '#1f2937'; // Gris oscuro para títulos
    const colorTexto = '#374151'; // Gris medio para texto normal

    const pdf = new jsPDF('p', 'mm', 'a4');
    let yPosition = 20;
    const lineHeight = 7;
    const margin = 20;
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;

    const addWatermarkToAllPages = () => {
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        addWatermark(pdf, institution);
      }
    };

    const checkPageBreak = (requiredHeight: number = lineHeight) => {
      if (yPosition + requiredHeight > pageHeight - 15) {
        pdf.addPage();
        yPosition = 20;
        return true;
      }
      return false;
    };

    const addText = (
      text: string,
      fontSize = 12,
      isBold = false,
      x = margin,
      customY?: number,
      color: string = colorTexto,
      align: 'left' | 'center' | 'right' = 'left'
    ) => {
      if (customY !== undefined) yPosition = customY;
      checkPageBreak();

      pdf.setFontSize(fontSize);
      pdf.setFont('helvetica', isBold ? 'bold' : 'normal');

      const [r, g, b] = hexToRgb(color);
      pdf.setTextColor(r, g, b);

      let xPosition = x;
      if (align === 'center') {
        const textWidth = pdf.getTextWidth(text);
        xPosition = (pageWidth - textWidth) / 2;
      } else if (align === 'right') {
        const textWidth = pdf.getTextWidth(text);
        xPosition = pageWidth - margin - textWidth;
      }

      pdf.text(text, xPosition, yPosition);
      pdf.setTextColor(0, 0, 0);
      yPosition += lineHeight;
    };

    const drawRect = (x: number, y: number, width: number, height: number, color: string) => {
      const [r, g, b] = hexToRgb(color);
      pdf.setFillColor(r, g, b);
      pdf.rect(x, y, width, height, 'F');
    };

    // --- ENCABEZADO ---
    drawRect(0, 0, pageWidth, 45, colorPrimario);

    if (institution?.logo) {
      try {
        // Implementar si tienes la imagen en base64
        // pdf.addImage(institution.logo, 'PNG', margin, 8, 25, 25);
      } catch {
        console.warn('No se pudo cargar el logo');
      }
    }

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    const titleWidth = pdf.getTextWidth(nombreEmpresa.toUpperCase());
    pdf.text(nombreEmpresa.toUpperCase(), (pageWidth - titleWidth) / 2, 20);

    if (institution?.slogan) {
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      const sloganWidth = pdf.getTextWidth(institution.slogan);
      pdf.text(institution.slogan, (pageWidth - sloganWidth) / 2, 30);
    }

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    const subtitleWidth = pdf.getTextWidth('SIMULACIÓN DE CRÉDITO');
    pdf.text('SIMULACIÓN DE CRÉDITO', (pageWidth - subtitleWidth) / 2, 40);

    pdf.setTextColor(0, 0, 0);
    yPosition = 60;

    // --- RESUMEN ---
    addText('RESUMEN DEL CRÉDITO', 16, true, margin, yPosition, colorTitulo, 'center');
    yPosition += 12;

    const col1X = margin;
    const col2X = pageWidth / 2 + 10;
    let currentCol1Y = yPosition;
    let currentCol2Y = yPosition;

    const addRow = (label: string, value: string, colX: number, colY: number, valueOffset = 40) => {
      addText(label, 10, true, colX, colY, colorTitulo);
      addText(value, 10, false, colX + valueOffset, colY);
      return colY + lineHeight;
    };

    currentCol1Y = addRow('Tipo de Crédito:', loan.nombre, col1X, currentCol1Y);
    currentCol1Y = addRow('Sistema:', tipoAmortizacion === 'frances' ? 'Francés' : 'Alemán', col1X, currentCol1Y);
    currentCol1Y = addRow('Monto:', `$${monto.toLocaleString()}`, col1X, currentCol1Y);
    currentCol1Y = addRow('Tasa Anual:', `${tasaInteres}%`, col1X, currentCol1Y);
    currentCol1Y = addRow('Plazo:', `${plazo} meses`, col1X, currentCol1Y);

    currentCol2Y = addRow('Cuota Base:', `$${resultado.cuotaMensual.toFixed(2)}`, col2X, currentCol2Y);
    if (resultado.cobrosIndirectosMensuales > 0) {
      currentCol2Y = addRow('Cobros Indirectos:', `$${resultado.cobrosIndirectosMensuales.toFixed(2)}`, col2X, currentCol2Y);
    }
    currentCol2Y = addRow('Cuota Final:', `$${resultado.cuotaFinal.toFixed(2)}`, col2X, currentCol2Y);
    currentCol2Y = addRow('Total Intereses:', `$${resultado.totalInteres.toFixed(2)}`, col2X, currentCol2Y);
    currentCol2Y = addRow('Total a Pagar:', `$${resultado.totalPagar.toFixed(2)}`, col2X, currentCol2Y);

    yPosition = Math.max(currentCol1Y, currentCol2Y) + 12;

    // --- COBROS INDIRECTOS ---
    if (loan.cobros_indirectos?.length) {
      addText('COBROS INDIRECTOS INCLUIDOS', 12, true, margin, yPosition, colorTitulo);
      yPosition += lineHeight;

      loan.cobros_indirectos.forEach((cobro) => {
        const rowY = yPosition;
        addText(`• ${cobro.nombre}:`, 9, true, margin, rowY, colorTitulo);
        addText(
          cobro.tipo_interes === 'porcentaje' ? `${cobro.interes}%` : `$${cobro.interes}`,
          9,
          false,
          margin + 55,
          rowY,
          colorTexto
        );
        yPosition += lineHeight - 1;
      });

      yPosition += 4;
    }

    // --- TABLA DE AMORTIZACIÓN ---
    checkPageBreak(25);
    addText('TABLA DE AMORTIZACIÓN', 16, true, margin, yPosition, colorTitulo, 'center');
    yPosition += 12;

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

    drawRect(margin - 2, tableTop - 5, 174, 8, colorTitulo);

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

    const drawTableRow = (fila: AmortizationRow, isEven: boolean) => {
      checkPageBreak();
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
        { text: `$${fila.interes.toFixed(2)}`, color: colorTexto },
        { text: `$${fila.capital.toFixed(2)}`, color: colorTexto },
        { text: `$${fila.cobrosIndirectos.toFixed(2)}`, color: colorTexto },
        { text: `$${fila.pagoTotal.toFixed(2)}`, color: '#16a34a' },
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

      pdf.setDrawColor(229, 231, 235);
      pdf.line(margin, yPosition - 1, margin + 170, yPosition - 1);
    };

    resultado.tablaAmortizacion.forEach((fila, index) => {
      drawTableRow(fila, index % 2 === 0);
    });

    // --- PIE DE PÁGINA ---
    checkPageBreak(25);
    pdf.setDrawColor(...hexToRgb(colorPrimario));
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    const footerCol1 = margin;
    const footerCol2 = pageWidth / 2;

    if (institution) {
      addText('INFORMACIÓN DE CONTACTO', 10, true, margin, yPosition, colorTitulo, 'center');
      yPosition += 8;

      if (institution.direccion) yPosition = addRow('Dirección:', institution.direccion, footerCol1, yPosition, 20);
      if (institution.telefono) yPosition = addRow('Teléfono:', institution.telefono, footerCol2, yPosition, 20);
      if (institution.correo) yPosition = addRow('Email:', institution.correo, footerCol1, yPosition, 20);
    }

    yPosition += 5;
    addText(`Documento generado el ${new Date().toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`, 8, false, margin, yPosition, '#6b7280', 'center');

    addWatermarkToAllPages();

    const fileName = `Simulación_Crédito_${loan.nombre.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().getTime()}.pdf`;
    pdf.save(fileName);

  } catch (error) {
    console.error('Error generando PDF:', error);
    throw new Error('Error al generar el PDF. Por favor, intente nuevamente.');
  }
};

/**
 * Exporta la simulación a Excel (igual que antes, ajustando alineación)
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

    const wb = utils.book_new();

    // Resumen
    const resumenData: any[][] = [
      [nombreEmpresa.toUpperCase()],
      institution?.slogan ? [institution.slogan] : [''],
      ['SIMULACIÓN DE CRÉDITO'],
      [''],
      ['RESUMEN DEL CRÉDITO'],
      ['Tipo de Crédito:', loan.nombre],
      ['Sistema de Amortización:', tipoAmortizacion === 'frances' ? 'Francés (Cuota Constante)' : 'Alemán (Amortización Constante)'],
      ['Monto del Crédito:', `$${monto.toLocaleString()}`],
      ['Tasa de Interés Anual:', `${tasaInteres}%`],
      ['Plazo:', `${plazo} meses`],
      [''],
      ['DETALLE DE PAGOS'],
      ['Cuota Base Mensual:', `$${resultado.cuotaMensual.toFixed(2)}`]
    ];

    if (resultado.cobrosIndirectosMensuales > 0) {
      resumenData.push(['Cobros Indirectos Mensuales:', `$${resultado.cobrosIndirectosMensuales.toFixed(2)}`]);
    }

    resumenData.push(
      ['Cuota Final Mensual:', `$${resultado.cuotaFinal.toFixed(2)}`],
      ['Total de Intereses:', `$${resultado.totalInteres.toFixed(2)}`],
      ['Total a Pagar:', `$${resultado.totalPagar.toFixed(2)}`]
    );

    if (loan.cobros_indirectos?.length) {
      resumenData.push(['']);
      resumenData.push(['COBROS INDIRECTOS INCLUIDOS']);
      loan.cobros_indirectos.forEach(cobro => {
        resumenData.push([`${cobro.nombre}:`, `${cobro.tipo_interes === 'porcentaje' ? `${cobro.interes}% del monto` : `$${cobro.interes} fijos`}`]);
      });
    }

    resumenData.push(['']);
    resumenData.push(['INFORMACIÓN DE CONTACTO']);
    if (institution) {
      if (institution.direccion) resumenData.push(['Dirección:', institution.direccion]);
      if (institution.telefono) resumenData.push(['Teléfono:', institution.telefono]);
      if (institution.correo) resumenData.push(['Correo Electrónico:', institution.correo]);
    }
    resumenData.push(['']);
    resumenData.push(['Documento generado el:', new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })]);

    const wsResumen = utils.aoa_to_sheet(resumenData);
    wsResumen['!cols'] = [{ width: 25 }, { width: 35 }];
    if (!wsResumen['!merges']) wsResumen['!merges'] = [];
    wsResumen['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }); // título principal merge
    wb.SheetNames.push('Resumen');
    wb.Sheets['Resumen'] = wsResumen;

    // Tabla de amortización
    const tablaHeader = [
      'Mes',
      'Saldo Inicial',
      'Pago Base',
      'Interés',
      'Capital',
      'Cobros Indirectos',
      'Pago Total',
      'Saldo Final'
    ];
    const tablaRows = resultado.tablaAmortizacion.map(fila => [
      fila.mes,
      fila.saldoInicial,
      fila.pago,
      fila.interes,
      fila.capital,
      fila.cobrosIndirectos,
      fila.pagoTotal,
      fila.saldoFinal
    ]);

    const wsTabla = utils.aoa_to_sheet([tablaHeader, ...tablaRows]);
    wb.SheetNames.push('Amortización');
    wb.Sheets['Amortización'] = wsTabla;

    const fileName = `Simulación_Crédito_${loan.nombre.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().getTime()}.xlsx`;
    writeFile(wb, fileName);

  } catch (error) {
    console.error('Error generando Excel:', error);
    throw new Error('Error al generar el Excel. Por favor, intente nuevamente.');
  }
};

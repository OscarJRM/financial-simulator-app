import { jsPDF } from 'jspdf';
import { utils, writeFile } from 'xlsx';
import { InvestmentCalculation, IProductoInversion } from '../types/investmentInterface';

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
 * Exporta la simulación de inversión a PDF con diseño mejorado
 */
export const exportInvestmentToPDF = async (
  calculation: InvestmentCalculation,
  producto: IProductoInversion,
  monto: number,
  plazo: number
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
    const subtitleWidth = pdf.getTextWidth('SIMULACIÓN DE INVERSIÓN');
    pdf.text('SIMULACIÓN DE INVERSIÓN', (pageWidth - subtitleWidth) / 2, 40);

    pdf.setTextColor(0, 0, 0);
    yPosition = 60;

    // --- RESUMEN ---
    addText('RESUMEN DE LA INVERSIÓN', 16, true, margin, yPosition, colorTitulo, 'center');
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

    // Información del producto
    currentCol1Y = addRow('Producto:', producto.nombre, col1X, currentCol1Y, 30);
    currentCol1Y = addRow('Descripción:', producto.descripcion, col1X, currentCol1Y, 30);
    currentCol1Y = addRow('Monto Inicial:', `$${monto.toLocaleString()}`, col1X, currentCol1Y, 30);
    currentCol1Y = addRow('Plazo:', `${plazo} meses`, col1X, currentCol1Y, 30);
    currentCol1Y = addRow('Tasa Anual:', `${producto.tasa_anual}%`, col1X, currentCol1Y, 30);

    // Resultados de la simulación
    const returnPercentage = ((calculation.totalReturn / calculation.initialAmount) * 100);
    currentCol2Y = addRow('Monto Final:', `$${calculation.finalAmount.toLocaleString()}`, col2X, currentCol2Y, 30);
    currentCol2Y = addRow('Ganancia Total:', `$${calculation.totalReturn.toLocaleString()}`, col2X, currentCol2Y, 30);
    currentCol2Y = addRow('Rentabilidad:', `${returnPercentage.toFixed(2)}%`, col2X, currentCol2Y, 30);
    
    if (producto.tipo_inversion) {
      currentCol2Y = addRow('Tipo:', producto.tipo_inversion.nombre, col2X, currentCol2Y, 30);
      currentCol2Y = addRow('Riesgo:', producto.tipo_inversion.nivel_riesgo, col2X, currentCol2Y, 30);
    }

    yPosition = Math.max(currentCol1Y, currentCol2Y) + 12;

    // --- PROYECCIÓN MENSUAL ---
    checkPageBreak(25);
    addText('PROYECCIÓN MENSUAL', 16, true, margin, yPosition, colorTitulo, 'center');
    yPosition += 12;

    const tableTop = yPosition;
    const columns = [
      { header: 'Mes', width: 20 },
      { header: 'Balance Inicial', width: 35 },
      { header: 'Interés Ganado', width: 35 },
      { header: 'Balance Final', width: 35 },
      { header: 'Acumulado Total', width: 35 }
    ];

    drawRect(margin - 2, tableTop - 5, 160, 8, colorTitulo);

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

    const drawTableRow = (projection: any, isEven: boolean) => {
      checkPageBreak();
      if (isEven) {
        pdf.setFillColor(250, 250, 250);
        pdf.rect(margin - 2, yPosition - 4, 158, 6, 'F');
      }

      xPosition = margin;
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'normal');

      const balanceInicial = projection.month === 1 ? calculation.initialAmount : 
                            (calculation.monthlyProjection[projection.month - 2]?.accumulated || 0);

      const rowData = [
        { text: projection.month.toString(), color: colorTexto },
        { text: `$${balanceInicial.toFixed(2)}`, color: colorTexto },
        { text: `$${projection.interest.toFixed(2)}`, color: '#16a34a' },
        { text: `$${projection.balance.toFixed(2)}`, color: colorTexto },
        { text: `$${projection.accumulated.toFixed(2)}`, color: '#1d4ed8' }
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
      pdf.line(margin, yPosition - 1, margin + 155, yPosition - 1);
    };

    calculation.monthlyProjection.forEach((projection, index) => {
      drawTableRow(projection, index % 2 === 0);
    });

    // --- RESUMEN FINAL ---
    checkPageBreak(20);
    yPosition += 8;
    addText('RESUMEN FINAL', 14, true, margin, yPosition, colorTitulo, 'center');
    yPosition += 10;

    const resumenFinalY = yPosition;
    addText(`Inversión inicial: $${calculation.initialAmount.toLocaleString()}`, 10, false, margin, resumenFinalY);
    addText(`Total acumulado: $${calculation.finalAmount.toLocaleString()}`, 10, false, margin);
    addText(`Ganancia neta: $${calculation.totalReturn.toLocaleString()} (${returnPercentage.toFixed(2)}%)`, 10, true, margin);

    // --- PIE DE PÁGINA ---
    checkPageBreak(25);
    pdf.setDrawColor(...hexToRgb(colorPrimario));
    pdf.line(margin, yPosition + 5, pageWidth - margin, yPosition + 5);
    yPosition += 15;

    if (institution) {
      addText('INFORMACIÓN DE CONTACTO', 10, true, margin, yPosition, colorTitulo, 'center');
      yPosition += 8;

      const footerCol1 = margin;
      const footerCol2 = pageWidth / 2;

      if (institution.direccion) yPosition = addRow('Dirección:', institution.direccion, footerCol1, yPosition, 20);
      if (institution.telefono) yPosition = addRow('Teléfono:', institution.telefono, footerCol2, yPosition - lineHeight, 20);
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

    const fileName = `Simulación_Inversión_${producto.nombre.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().getTime()}.pdf`;
    pdf.save(fileName);

  } catch (error) {
    console.error('Error generando PDF:', error);
    throw new Error('Error al generar el PDF. Por favor, intente nuevamente.');
  }
};

/**
 * Exporta la simulación a Excel
 */
export const exportInvestmentToExcel = async (
  calculation: InvestmentCalculation,
  producto: IProductoInversion,
  monto: number,
  plazo: number
) => {
  try {
    const institution = await getInstitutionData();
    const nombreEmpresa = institution?.nombre || 'Institución Financiera';
    const returnPercentage = ((calculation.totalReturn / calculation.initialAmount) * 100);

    const wb = utils.book_new();

    // Resumen
    const resumenData: any[][] = [
      [nombreEmpresa.toUpperCase()],
      institution?.slogan ? [institution.slogan] : [''],
      ['SIMULACIÓN DE INVERSIÓN'],
      [''],
      ['RESUMEN DE LA INVERSIÓN'],
      ['Producto de Inversión:', producto.nombre],
      ['Descripción:', producto.descripcion],
      ['Monto Inicial:', `$${monto.toLocaleString()}`],
      ['Plazo de Inversión:', `${plazo} meses`],
      ['Tasa Anual:', `${producto.tasa_anual}%`],
      [''],
      ['RESULTADOS'],
      ['Monto Final:', `$${calculation.finalAmount.toLocaleString()}`],
      ['Ganancia Total:', `$${calculation.totalReturn.toLocaleString()}`],
      ['Rentabilidad:', `${returnPercentage.toFixed(2)}%`]
    ];

    if (producto.tipo_inversion) {
      resumenData.push(
        ['Tipo de Inversión:', producto.tipo_inversion.nombre],
        ['Nivel de Riesgo:', producto.tipo_inversion.nivel_riesgo],
        ['Tipo de Interés:', producto.tipo_inversion.tipo_interes]
      );
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
    wsResumen['!cols'] = [{ width: 25 }, { width: 40 }];
    if (!wsResumen['!merges']) wsResumen['!merges'] = [];
    wsResumen['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } });
    wb.SheetNames.push('Resumen');
    wb.Sheets['Resumen'] = wsResumen;

    // Proyección Mensual
    const proyeccionHeader = [
      'Mes',
      'Balance Inicial',
      'Interés Ganado',
      'Balance Final',
      'Acumulado Total'
    ];
    
    const proyeccionRows = calculation.monthlyProjection.map((projection, index) => {
      const balanceInicial = projection.month === 1 ? calculation.initialAmount : 
                            (calculation.monthlyProjection[index - 1]?.accumulated || 0);
      return [
        projection.month,
        balanceInicial,
        projection.interest,
        projection.balance,
        projection.accumulated
      ];
    });

    const wsProyeccion = utils.aoa_to_sheet([proyeccionHeader, ...proyeccionRows]);
    wsProyeccion['!cols'] = [
      { width: 10 },
      { width: 18 },
      { width: 18 },
      { width: 18 },
      { width: 18 }
    ];
    wb.SheetNames.push('Proyección Mensual');
    wb.Sheets['Proyección Mensual'] = wsProyeccion;

    const fileName = `Simulación_Inversión_${producto.nombre.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().getTime()}.xlsx`;
    writeFile(wb, fileName);

  } catch (error) {
    console.error('Error generando Excel:', error);
    throw new Error('Error al generar el Excel. Por favor, intente nuevamente.');
  }
};
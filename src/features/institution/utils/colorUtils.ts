/**
 * Utilidades para manejo de colores y cálculo de contraste
 */

/**
 * Convierte un color HEX a RGB
 * @param hex - Color en formato hexadecimal (#RRGGBB o #RGB)
 * @returns Objeto con valores r, g, b (0-255)
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  // Eliminar el # si existe
  const cleanHex = hex.replace('#', '');
  
  // Expandir formato corto (#RGB -> #RRGGBB)
  const fullHex = cleanHex.length === 3
    ? cleanHex.split('').map(char => char + char).join('')
    : cleanHex;

  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null;
}

/**
 * Calcula la luminancia relativa de un color según WCAG 2.0
 * @param r - Componente rojo (0-255)
 * @param g - Componente verde (0-255)
 * @param b - Componente azul (0-255)
 * @returns Luminancia relativa (0-1)
 */
export function calculateLuminance(r: number, g: number, b: number): number {
  // Normalizar valores RGB a 0-1
  const normalize = (channel: number) => {
    const normalized = channel / 255;
    // Aplicar gamma correction
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  };

  const rLinear = normalize(r);
  const gLinear = normalize(g);
  const bLinear = normalize(b);

  // Calcular luminancia relativa según WCAG
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Determina si un color de fondo necesita texto claro u oscuro
 * para cumplir con los estándares de accesibilidad WCAG
 * @param backgroundColor - Color de fondo en formato HEX
 * @returns '#ffffff' (blanco) o '#000000' (negro) según corresponda
 */
export function getContrastTextColor(backgroundColor: string): string {
  const rgb = hexToRgb(backgroundColor);
  
  if (!rgb) {
    // Si hay error al parsear, devolver negro por defecto
    return '#000000';
  }

  const luminance = calculateLuminance(rgb.r, rgb.g, rgb.b);

  // Si la luminancia es mayor a 0.5, el color es claro -> usar texto oscuro
  // Si la luminancia es menor a 0.5, el color es oscuro -> usar texto claro
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

/**
 * Calcula el ratio de contraste entre dos colores según WCAG
 * @param color1 - Primer color en HEX
 * @param color2 - Segundo color en HEX
 * @returns Ratio de contraste (1-21)
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 1;

  const lum1 = calculateLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = calculateLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Verifica si un color cumple con WCAG AA (ratio >= 4.5:1)
 * @param backgroundColor - Color de fondo en HEX
 * @param textColor - Color de texto en HEX
 * @returns true si cumple con WCAG AA
 */
export function meetsWCAGAA(backgroundColor: string, textColor: string): boolean {
  return getContrastRatio(backgroundColor, textColor) >= 4.5;
}

/**
 * Verifica si un color cumple con WCAG AAA (ratio >= 7:1)
 * @param backgroundColor - Color de fondo en HEX
 * @param textColor - Color de texto en HEX
 * @returns true si cumple con WCAG AAA
 */
export function meetsWCAGAAA(backgroundColor: string, textColor: string): boolean {
  return getContrastRatio(backgroundColor, textColor) >= 7;
}

import { useMemo } from 'react';

interface ScalingConfig {
  fontSize: string;
  padding: string;
  rowHeight: string;
  titleSize: string;
  labelSize: string;
  margin: string;
}

export const useDynamicScaling = (staffCount: number, sheetsPerPage: 1 | 2 | 4): ScalingConfig => {
  return useMemo(() => {
    // Base values for 1 sheet per page and ~20 staff
    let baseFontSize = 14;
    let basePadding = 24; 
    let baseRowHeight = 48; 
    let baseTitleSize = 30;
    let baseLabelSize = 18;
    let baseMargin = 40;

    // Adjust for sheets per page
    if (sheetsPerPage === 2) {
      baseFontSize *= 0.85;
      basePadding *= 0.85;
      baseRowHeight *= 0.85;
      baseTitleSize *= 0.85;
      baseLabelSize *= 0.9;
      baseMargin *= 0.85;
    } else if (sheetsPerPage === 4) {
      baseFontSize *= 0.7;
      basePadding *= 0.7;
      baseRowHeight *= 0.7;
      baseTitleSize *= 0.7;
      baseLabelSize *= 0.8;
      baseMargin *= 0.7;
    }

    // Adjust for staff count density
    // Spacing factor is less aggressive than density factor to preserve gaps
    const densityFactor = Math.max(0.6, 1 - (Math.max(0, staffCount - 20) * 0.015));
    const spacingFactor = Math.max(0.8, 1 - (Math.max(0, staffCount - 20) * 0.005));
    
    const fontSize = `${baseFontSize * densityFactor}px`;
    const padding = `${basePadding * spacingFactor}px`;
    const rowHeight = `${baseRowHeight * densityFactor}px`;
    const titleSize = `${baseTitleSize * densityFactor}px`;
    const labelSize = `${baseLabelSize * densityFactor}px`;
    const margin = `${baseMargin * spacingFactor}px`;

    return { fontSize, padding, rowHeight, titleSize, labelSize, margin };
  }, [staffCount, sheetsPerPage]);
};

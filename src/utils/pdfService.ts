import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export const exportToPDF = async (elementIds: string | string[], fileName: string) => {
  const ids = Array.isArray(elementIds) ? elementIds : [elementIds];
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  for (let i = 0; i < ids.length; i++) {
    const element = document.getElementById(ids[i]);
    if (!element) continue;

    const canvas = await html2canvas(element, {
      scale: 4,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const imgProps = pdf.getImageProperties(imgData);
    
    // Calculate dimensions to fit on A4 while maintaining aspect ratio
    const imgWidth = pageWidth;
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
    
    let finalWidth = imgWidth;
    let finalHeight = imgHeight;
    
    // If image is taller than page, scale it down
    if (finalHeight > pageHeight) {
      finalHeight = pageHeight;
      finalWidth = (imgProps.width * finalHeight) / imgProps.height;
    }

    // Center the image on the page
    const xOffset = (pageWidth - finalWidth) / 2;
    const yOffset = (pageHeight - finalHeight) / 2;

    if (i > 0) {
      pdf.addPage();
    }

    pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight, undefined, 'FAST');
  }

  pdf.save(`${fileName}.pdf`);
};

export const exportIndividualPDFs = async (elements: { id: string, name: string }[]) => {
  for (const item of elements) {
    const element = document.getElementById(item.id);
    if (!element) continue;

    const canvas = await html2canvas(element, {
      scale: 4,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgProps = pdf.getImageProperties(imgData);

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth;
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
    
    let finalWidth = imgWidth;
    let finalHeight = imgHeight;
    
    if (finalHeight > pageHeight) {
      finalHeight = pageHeight;
      finalWidth = (imgProps.width * finalHeight) / imgProps.height;
    }

    const xOffset = (pageWidth - finalWidth) / 2;
    const yOffset = (pageHeight - finalHeight) / 2;

    pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight, undefined, 'FAST');
    pdf.save(`${item.name}.pdf`);
  }
};

import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Generates a PDF from a given HTML element.
 * @param {HTMLElement} element - The DOM element to capture.
 * @param {string} filename - The name of the saved PDF file.
 */
export const exportElementToPDF = async (element, filename = 'trip-itinerary.pdf') => {
  if (!element) return;

  try {
    // Save original styles that might affect rendering
    const originalStyle = element.style.cssText;
    
    // Create a temporary wrapper to force light theme/white background if needed
    // html2canvas sometimes struggles with dark themes or glassmorphism depending on contrast.
    // For this app, we will capture as-is, but we can tweak if needed.
    
    const canvas = await html2canvas(element, {
      scale: 2, // Higher resolution
      useCORS: true, // Allow cross-origin images (like Maps)
      logging: false,
      backgroundColor: '#020617', // Match slate-950 background
    });

    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    
    // A4 paper size in mm
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 0;
    
    // Add first page
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;
    
    // Add subsequent pages if content overflows A4
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }
    
    pdf.save(filename);
  } catch (err) {
    console.error('Error generating PDF:', err);
    throw new Error('Failed to generate PDF');
  }
};

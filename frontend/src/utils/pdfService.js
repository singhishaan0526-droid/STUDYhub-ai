import html2pdf from 'html2pdf.js';

export const generatePDF = async ({
  elementId,
  filename = 'document.pdf',
  orientation = 'portrait',
}) => {
  const element = document.getElementById(elementId);

  if (!element) {
    throw new Error(`Element with id "${elementId}" not found.`);
  }

  // Clone element to manipulate for print without affecting UI
  const clonedElement = element.cloneNode(true);
  
  // Make the hidden element temporarily visible in the clone so html2pdf can render it
  clonedElement.classList.remove('hidden', 'hidden-print');
  clonedElement.style.display = 'block';
  
  // Clean unwanted UI elements from the PDF
  clonedElement.querySelectorAll('.no-print, [data-pdf-ignore]').forEach(el => el.remove());

  // Wrap the content inside a container for A4 margins
  // A4 dimensions: 210 x 297 mm
  const wrapper = document.createElement('div');
  wrapper.style.padding = '20px';
  wrapper.style.backgroundColor = 'white';
  wrapper.style.color = 'black';
  wrapper.style.fontFamily = 'Arial, sans-serif'; // Professional clean font
  wrapper.appendChild(clonedElement);

  const opt = {
    margin: [0.5, 0.5, 0.5, 0.5], // Top, Left, Bottom, Right (inches)
    filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2, // High resolution
      useCORS: true,
      logging: false,
      scrollY: 0,
      backgroundColor: '#ffffff' // Ensure white background
    },
    jsPDF: {
      unit: 'in',
      format: 'a4',
      orientation,
    },
    pagebreak: {
      mode: ['avoid-all', 'css', 'legacy'],
      before: '.page-break-before',
      after: '.page-break-after',
      avoid: ['.page-break-inside-avoid', 'h1', 'h2', 'h3', 'table', '.question-block'],
    },
  };

  try {
    await html2pdf().set(opt).from(wrapper).save();
    return true;
  } catch (err) {
    console.error('PDF generation failed:', err);
    throw err;
  }
};

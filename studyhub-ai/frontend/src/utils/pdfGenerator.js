import html2pdf from 'html2pdf.js';

export const generatePDF = async ({
  elementId,
  filename = 'document.pdf',
  orientation = 'portrait', // 'portrait' | 'landscape'
  scale = 2,
}) => {
  const element = document.getElementById(elementId);

  if (!element) {
    console.error(`❌ Element with id "${elementId}" not found.`);
    return;
  }

  try {
    // 🧾 Clone element (prevents UI flicker / style issues)
    const clonedElement = element.cloneNode(true);

    // 🧹 Optional: clean unwanted elements
    clonedElement.querySelectorAll('[data-pdf-ignore]').forEach(el => el.remove());

    // 📄 PDF options
    const opt = {
      margin: [0.5, 0.5, 0.5, 0.5],
      filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale,
        useCORS: true,
        logging: false,
        scrollY: 0, // fixes scroll cut issue
      },
      jsPDF: {
        unit: 'in',
        format: 'a4',
        orientation,
      },
      pagebreak: {
        mode: ['avoid-all', 'css', 'legacy'],
        before: '.page-break',
        avoid: ['.no-break'],
      },
    };

    // 🚀 Generate PDF
    await html2pdf().set(opt).from(clonedElement).save();

  } catch (err) {
    console.error('❌ PDF generation failed:', err);
  }
};
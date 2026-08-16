import React, { useState } from 'react';
import { Download, Loader2, CheckCircle } from 'lucide-react';
import { generatePDF } from '../utils/pdfService';

export default function ExportPdfButton({ elementId, filename, className = "", variant = "secondary" }) {
  const [status, setStatus] = useState('idle'); // idle, loading, success, error

  const handleExport = async () => {
    if (status === 'loading') return;
    
    setStatus('loading');
    try {
      await generatePDF({ elementId, filename });
      setStatus('success');
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setStatus('idle');
      }, 3000);
    } catch (error) {
      console.error("PDF Export Error:", error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const baseStyles = "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0a0a0a]";
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-500 focus:ring-blue-500",
    secondary: "bg-white/10 text-white hover:bg-white/20 focus:ring-white/50",
    success: "bg-emerald-600 text-white hover:bg-emerald-500 focus:ring-emerald-500",
  };

  const currentVariant = status === 'success' ? variants.success : variants[variant];

  return (
    <button 
      onClick={handleExport}
      disabled={status === 'loading'}
      className={`${baseStyles} ${currentVariant} ${className} ${status === 'loading' ? 'opacity-80 cursor-not-allowed' : ''}`}
      aria-label="Export PDF"
    >
      {status === 'idle' && (
        <>
          <Download className="h-4 w-4" />
          Export PDF
        </>
      )}
      
      {status === 'loading' && (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating PDF...
        </>
      )}

      {status === 'success' && (
        <>
          <CheckCircle className="h-4 w-4" />
          Downloaded
        </>
      )}

      {status === 'error' && (
        <>
          Failed to generate
        </>
      )}
    </button>
  );
}

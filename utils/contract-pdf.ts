import jsPDF from 'jspdf';

interface ContractData {
  investorName: string;
  investorDni: string;
  investorEmail: string;
  projectTitle: string;
  projectLocation: string;
  developerName: string;
  amount: number;
  tokens: number;
  tokenPrice: number;
  expectedReturn: number;
  returnPeriod: number;
  contractHash: string;
  date: string;
  investmentId: string;
}

export function generateContractPDF(data: ContractData): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 25;
  const contentWidth = pageWidth - margin * 2;
  let y = 30;

  // === HEADER ===
  doc.setFillColor(0, 40, 26);
  doc.rect(0, 0, pageWidth, 50, 'F');

  doc.setTextColor(0, 200, 83);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('SUELO', margin, 25);

  doc.setFontSize(10);
  doc.setTextColor(180, 180, 180);
  doc.text('Contrato de Participación en Inversión Inmobiliaria', margin, 38);

  y = 65;

  // === CONTRACT INFO ===
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Contrato Nº: ${data.investmentId.slice(0, 8).toUpperCase()}`, margin, y);
  doc.text(`Fecha: ${data.date}`, pageWidth - margin - 60, y);
  y += 15;

  // === PARTIES ===
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 100, 50);
  doc.text('PARTES DEL CONTRATO', margin, y);
  y += 3;
  doc.setDrawColor(0, 200, 83);
  doc.setLineWidth(0.5);
  doc.line(margin, y, margin + contentWidth, y);
  y += 10;

  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);

  const partyFields = [
    ['INVERSOR:', data.investorName],
    ['DNI/CUIT:', data.investorDni || 'No registrado'],
    ['Email:', data.investorEmail],
  ];
  partyFields.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, margin + 35, y);
    y += 7;
  });

  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.text('DESARROLLADOR:', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.text(data.developerName, margin + 55, y);
  y += 20;

  // === PROJECT ===
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 100, 50);
  doc.text('PROYECTO', margin, y);
  y += 3;
  doc.line(margin, y, margin + contentWidth, y);
  y += 10;

  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  const projectFields = [
    ['Nombre:', data.projectTitle],
    ['Ubicación:', data.projectLocation],
    ['Retorno Esperado:', `${data.expectedReturn}% en ${data.returnPeriod} meses`],
  ];
  projectFields.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, margin + 50, y);
    y += 7;
  });
  y += 13;

  // === INVESTMENT DETAILS ===
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 100, 50);
  doc.text('DETALLE DE LA INVERSIÓN', margin, y);
  y += 3;
  doc.line(margin, y, margin + contentWidth, y);
  y += 10;

  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, y - 5, contentWidth, 40, 'F');

  const invFields = [
    ['Participaciones adquiridas:', `${data.tokens} tokens`],
    ['Precio por token:', `USD ${data.tokenPrice.toLocaleString()}`],
    ['Monto total invertido:', `USD ${data.amount.toLocaleString()}`],
  ];
  invFields.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, margin + 5, y + 3);
    doc.setFont('helvetica', 'normal');
    doc.text(value, margin + contentWidth - 5, y + 3, { align: 'right' });
    y += 12;
  });
  y += 20;

  // === TERMS ===
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 100, 50);
  doc.text('TÉRMINOS Y CONDICIONES', margin, y);
  y += 3;
  doc.line(margin, y, margin + contentWidth, y);
  y += 10;

  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');

  const terms = [
    '1. El inversor adquiere participaciones fraccionadas del proyecto inmobiliario detallado.',
    '2. Los retornos están sujetos al desempeño del proyecto y condiciones de mercado.',
    '3. El desarrollador se compromete a reportar avances trimestrales del proyecto.',
    '4. Las participaciones no pueden ser transferidas sin autorización previa de la plataforma.',
    '5. En caso de cancelación, se aplicarán las políticas de reembolso vigentes.',
    '6. Este contrato tiene validez legal digital respaldada por hash criptográfico SHA-256.',
    '7. La verificación del contrato está disponible públicamente en la URL indicada.',
  ];
  terms.forEach((term) => {
    const lines = doc.splitTextToSize(term, contentWidth);
    doc.text(lines, margin, y);
    y += lines.length * 5 + 3;
  });
  y += 10;

  // === HASH VERIFICATION BLOCK ===
  doc.setFillColor(0, 40, 26);
  doc.rect(margin, y, contentWidth, 30, 'F');

  doc.setFontSize(8);
  doc.setTextColor(0, 200, 83);
  doc.setFont('helvetica', 'bold');
  doc.text('VERIFICACIÓN CRIPTOGRÁFICA', margin + 5, y + 8);

  doc.setFontSize(7);
  doc.setFont('courier', 'normal');
  doc.setTextColor(200, 200, 200);
  doc.text(`SHA-256: ${data.contractHash}`, margin + 5, y + 16);

  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  const verifyUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/verify/${data.contractHash}`
    : `https://suelo.vercel.app/verify/${data.contractHash}`;
  doc.text(`Verificar en: ${verifyUrl}`, margin + 5, y + 24);

  // === FOOTER ===
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.setFont('helvetica', 'normal');
  doc.text('Suelo - Plataforma de Inversión Inmobiliaria Fraccionada', pageWidth / 2, footerY, { align: 'center' });
  doc.text('Documento generado digitalmente. Verificable mediante hash SHA-256.', pageWidth / 2, footerY + 5, { align: 'center' });

  return doc;
}

import jsPDF from "jspdf";
import { formatCurrency, formatDate, formatDateTime, formatPercentage } from "./formatters";
import logoNossa from "@/assets/logo-nossa-seguros.png";


const NOSSA_BLUE = [30, 58, 95];
const NOSSA_GREEN = [165, 201, 0];

// Contact information
const CONTACT_PHONE = "+244 923 190 860";
const CONTACT_EMAIL = "apoioaocliente@nossaseguros.ao";

// Pre-loaded assets
let logoDataUrl: string | null = null;
let phoneIconDataUrl: string | null = null;
let emailIconDataUrl: string | null = null;
let logoAspectRatio = 2.5;

// Preload logo on module load
function preloadLogo() {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    const scale = 2;
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth * scale;
    canvas.height = img.naturalHeight * scale;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // White background to avoid black from transparency
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      logoDataUrl = canvas.toDataURL("image/jpeg", 0.92);
      logoAspectRatio = img.naturalWidth / img.naturalHeight;
    }
  };
  img.src = logoNossa;
}

function preloadPhoneIcon() {
  // Build SVG with green fill instead of white
  const svgString = `<svg fill="rgb(${NOSSA_GREEN[0]}, ${NOSSA_GREEN[1]}, ${NOSSA_GREEN[2]})" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="50" height="50"><path d="M 14 3.9902344 C 8.4886661 3.9902344 4 8.4789008 4 13.990234 L 4 35.990234 C 4 41.501568 8.4886661 45.990234 14 45.990234 L 36 45.990234 C 41.511334 45.990234 46 41.501568 46 35.990234 L 46 13.990234 C 46 8.4789008 41.511334 3.9902344 36 3.9902344 L 14 3.9902344 z M 18.005859 12.033203 C 18.633859 12.060203 19.210594 12.414031 19.558594 12.957031 C 19.954594 13.575031 20.569141 14.534156 21.369141 15.785156 C 22.099141 16.926156 22.150047 18.399844 21.498047 19.589844 L 20.033203 21.673828 C 19.637203 22.237828 19.558219 22.959703 19.824219 23.595703 C 20.238219 24.585703 21.040797 26.107203 22.466797 27.533203 C 23.892797 28.959203 25.414297 29.761781 26.404297 30.175781 C 27.040297 30.441781 27.762172 30.362797 28.326172 29.966797 L 30.410156 28.501953 C 31.600156 27.849953 33.073844 27.901859 34.214844 28.630859 C 35.465844 29.430859 36.424969 30.045406 37.042969 30.441406 C 37.585969 30.789406 37.939797 31.366141 37.966797 31.994141 C 38.120797 35.558141 35.359641 37.001953 34.556641 37.001953 C 34.000641 37.001953 27.316344 37.761656 19.777344 30.222656 C 12.238344 22.683656 12.998047 15.999359 12.998047 15.443359 C 12.998047 14.640359 14.441859 11.879203 18.005859 12.033203 z"/></svg>`;
  
  const blob = new Blob([svgString], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // White circle background
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(64, 64, 64, 0, Math.PI * 2);
      ctx.fill();

      // Draw SVG icon centered
      ctx.drawImage(img, 14, 14, 100, 100);
      phoneIconDataUrl = canvas.toDataURL("image/png");
    }
    URL.revokeObjectURL(url);
  };
  img.src = url;
}

function createEmailIcon() {
  const size = 128;
  const green = `rgb(${NOSSA_GREEN[0]}, ${NOSSA_GREEN[1]}, ${NOSSA_GREEN[2]})`;

  const emailCanvas = document.createElement("canvas");
  emailCanvas.width = size;
  emailCanvas.height = size;
  const emailCtx = emailCanvas.getContext("2d");
  if (emailCtx) {
    emailCtx.fillStyle = "#FFFFFF";
    emailCtx.beginPath();
    emailCtx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    emailCtx.fill();

    emailCtx.strokeStyle = green;
    emailCtx.lineWidth = 6;
    emailCtx.lineJoin = "round";

    emailCtx.strokeRect(30, 38, 68, 52);
    emailCtx.beginPath();
    emailCtx.moveTo(30, 38);
    emailCtx.lineTo(64, 68);
    emailCtx.lineTo(98, 38);
    emailCtx.stroke();

    emailIconDataUrl = emailCanvas.toDataURL("image/png");
  }
}

// Start preloading immediately
preloadLogo();
preloadPhoneIcon();
createEmailIcon();

function setupDocument(title: string): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Header background
  doc.setFillColor(NOSSA_BLUE[0], NOSSA_BLUE[1], NOSSA_BLUE[2]);
  doc.rect(0, 0, 210, 40, "F");

  // Add logo with white background
  if (logoDataUrl) {
    // Calculate dimensions preserving aspect ratio
    const logoHeight = 14;
    const logoWidth = logoHeight * logoAspectRatio;
    const padding = 3;
    // White rounded background for logo
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(15, 9, logoWidth + padding * 2, logoHeight + padding * 2, 3, 3, "F");
    try {
      doc.addImage(logoDataUrl, "JPEG", 15 + padding, 9 + padding, logoWidth, logoHeight);
    } catch (e) {
      console.error("Error adding logo to PDF:", e);
    }
  }
  
  // Always add text header on the right
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  if (!logoDataUrl) {
    doc.text("Nossa Seguros", 20, 22);
  }

  // Header text on the right
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Simulador de Cálculo", 190, 18, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.text("Compensações AT", 190, 26, { align: "right" });

  // Title
  doc.setTextColor(NOSSA_BLUE[0], NOSSA_BLUE[1], NOSSA_BLUE[2]);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(title, 20, 55);

  // Date
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Data/Hora: ${formatDateTime()}`, 20, 63);

  return doc;
}

// Footer height constant - content must stay above this
const FOOTER_HEIGHT = 35;

function getMaxContentY(doc: jsPDF): number {
  return doc.internal.pageSize.height - FOOTER_HEIGHT;
}

function checkPageBreak(doc: jsPDF, currentY: number, neededSpace: number = 15): number {
  // Force single page - no page breaks
  return currentY;
}

function addSection(doc: jsPDF, title: string, yPos: number): number {
  yPos = checkPageBreak(doc, yPos, 25);
  
  doc.setFillColor(NOSSA_GREEN[0], NOSSA_GREEN[1], NOSSA_GREEN[2]);
  doc.rect(20, yPos, 4, 8, "F");

  doc.setTextColor(NOSSA_BLUE[0], NOSSA_BLUE[1], NOSSA_BLUE[2]);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(title, 28, yPos + 6);

  return yPos + 12;
}

function addRow(doc: jsPDF, label: string, value: string, yPos: number, isHighlight = false): number {
  yPos = checkPageBreak(doc, yPos, 12);
  
  if (isHighlight) {
    doc.setFillColor(245, 250, 235);
    doc.rect(20, yPos - 4, 170, 10, "F");
  }

  doc.setTextColor(100, 100, 100);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(label, 25, yPos);

  doc.setTextColor(NOSSA_BLUE[0], NOSSA_BLUE[1], NOSSA_BLUE[2]);
  doc.setFont("helvetica", "bold");
  doc.text(value, 170, yPos, { align: "right" });

  return yPos + 8;
}

function addFooter(doc: jsPDF) {
  const pageHeight = doc.internal.pageSize.height;

  // Green footer bar
  doc.setFillColor(NOSSA_GREEN[0], NOSSA_GREEN[1], NOSSA_GREEN[2]);
  doc.rect(0, pageHeight - 30, 210, 30, "F");

  // Contact information
  doc.setTextColor(255, 255, 255);

  const iconSize = 10;
  const iconY = pageHeight - 23;
  const phoneIconX = 30;
  const emailIconX = 112;

  if (phoneIconDataUrl) {
    try {
      doc.addImage(phoneIconDataUrl, "PNG", phoneIconX, iconY, iconSize, iconSize);
    } catch (e) {
      console.error("Error adding phone icon:", e);
    }
  }

  if (emailIconDataUrl) {
    try {
      doc.addImage(emailIconDataUrl, "PNG", emailIconX, iconY, iconSize, iconSize);
    } catch (e) {
      console.error("Error adding email icon:", e);
    }
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Contact Center", 44, pageHeight - 19);
  doc.text("E-mail", 126, pageHeight - 19);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(CONTACT_PHONE, 44, pageHeight - 13);
  doc.text(CONTACT_EMAIL, 126, pageHeight - 13);

  // Disclaimer
  doc.setFontSize(7);
  doc.text("Este documento é meramente indicativo e não constitui compromisso contratual.", 105, pageHeight - 6, { align: "center" });
}

interface DadosPensaoMorte {
  nomeSinistrado?: string;
  salarioBaseMensal: number;
  subsidioFixoMensal: number;
  numSalariosAno: number;
  temConjuge: boolean;
  conjugeIdadeReforma: boolean;
  temExConjuge: boolean;
  exConjugeIdadeReforma: boolean;
  numFilhos: number;
  temPai: boolean;
  temMae: boolean;
  multiplicadorSubsidioMorte: number;
  multiplicadorFuneral: number;
}

interface ResultadosPensaoMorte {
  referenciaAnual: number;
  valorConjuge: number;
  valorExConjuge: number;
  valorFilhos: number;
  valorPai: number;
  valorMae: number;
  pensaoMensalTotal: number;
  subsidioMorte: number;
  subsidioFuneral: number;
  totalIndemnizacao: number;
}

export function exportPensaoMortePDF(dados: DadosPensaoMorte, resultados: ResultadosPensaoMorte) {
  const doc = setupDocument("Pensão por Morte");
  let y = 75;

  // Dados de Entrada
  y = addSection(doc, "Dados de Entrada", y);
  y = addRow(doc, "Sinistrado", dados.nomeSinistrado || "—", y);
  y = addRow(doc, "Salário Base Mensal", formatCurrency(dados.salarioBaseMensal), y);
  y = addRow(doc, "Subsídio Fixo Mensal", formatCurrency(dados.subsidioFixoMensal), y);
  y = addRow(doc, "Nº Salários/Ano", dados.numSalariosAno.toString(), y);
  y = addRow(doc, "Cônjuge", dados.temConjuge ? (dados.conjugeIdadeReforma ? "Sim (Idade Reforma)" : "Sim") : "Não", y);
  y = addRow(doc, "Ex-Cônjuge", dados.temExConjuge ? (dados.exConjugeIdadeReforma ? "Sim (Idade Reforma)" : "Sim") : "Não", y);
  y = addRow(doc, "Número de Filhos", dados.numFilhos.toString(), y);
  y = addRow(doc, "Pai", dados.temPai ? "Sim" : "Não", y);
  y = addRow(doc, "Mãe", dados.temMae ? "Sim" : "Não", y);
  y = addRow(doc, "Subsídio por Morte", `×${dados.multiplicadorSubsidioMorte}`, y);
  y = addRow(doc, "Despesas de Funeral", `×${dados.multiplicadorFuneral}`, y);

  y += 3;

  // Resultados
  y = addSection(doc, "Resultados", y);
  y = addRow(doc, "Remuneração de Referência", formatCurrency(resultados.referenciaAnual), y, true);

  if (resultados.valorConjuge > 0) {
    y = addRow(doc, "Cônjuge", formatCurrency(resultados.valorConjuge), y);
  }
  if (resultados.valorExConjuge > 0) {
    y = addRow(doc, "Ex-Cônjuge", formatCurrency(resultados.valorExConjuge), y);
  }
  if (resultados.valorFilhos > 0) {
    y = addRow(doc, `Filhos (${dados.numFilhos})`, formatCurrency(resultados.valorFilhos), y);
  }
  if (resultados.valorPai > 0) {
    y = addRow(doc, "Pai", formatCurrency(resultados.valorPai), y);
  }
  if (resultados.valorMae > 0) {
    y = addRow(doc, "Mãe", formatCurrency(resultados.valorMae), y);
  }

  y = addRow(doc, "Pensão Mensal Total", formatCurrency(resultados.pensaoMensalTotal), y, true);
  y += 3;
  y = addRow(doc, "Subsídio por Morte", formatCurrency(resultados.subsidioMorte), y);
  y = addRow(doc, "Despesas de Funeral", formatCurrency(resultados.subsidioFuneral), y);

  addFooter(doc);
  doc.save("pensao-morte-nossa-seguros.pdf");
}

interface DadosITA {
  nomeSinistrado?: string;
  salarioBaseMensal: number;
  subsidioFixoMensal: number;
  numSalariosAno: number;
  dataInicioInternamento: string;
  dataFimInternamento: string;
  dataInicioAmbulatorio: string;
  dataFimAmbulatorio: string;
}

interface ResultadosITA {
  referenciaAnual: number;
  remuneracaoDiaria: number;
  diasInternamento: number;
  indemnInternamento: number;
  diasAmbulatorio: number;
  indemnAmbulatorio: number;
  totalDias: number;
  totalIndemnizacao: number;
}

export function exportITAPDF(dados: DadosITA, resultados: ResultadosITA) {
  const doc = setupDocument("ITA - Incapacidade Temporária Absoluta");
  let y = 75;

  // Dados de Entrada
  y = addSection(doc, "Dados de Entrada", y);
  y = addRow(doc, "Sinistrado", dados.nomeSinistrado || "—", y);
  y = addRow(doc, "Salário Base Mensal", formatCurrency(dados.salarioBaseMensal), y);
  y = addRow(doc, "Subsídio Fixo Mensal", formatCurrency(dados.subsidioFixoMensal), y);
  y = addRow(doc, "Nº Salários/Ano", dados.numSalariosAno.toString(), y);

  if (dados.dataInicioInternamento) {
    y = addRow(doc, "Período Internamento", `${formatDate(dados.dataInicioInternamento)} a ${formatDate(dados.dataFimInternamento)}`, y);
  }
  if (dados.dataInicioAmbulatorio) {
    y = addRow(doc, "Período Ambulatório", `${formatDate(dados.dataInicioAmbulatorio)} a ${formatDate(dados.dataFimAmbulatorio)}`, y);
  }

  y += 3;

  // Resultados
  y = addSection(doc, "Resultados", y);
  y = addRow(doc, "Remuneração de Referência", formatCurrency(resultados.referenciaAnual), y, true);
  y = addRow(doc, "Remuneração Diária", formatCurrency(resultados.remuneracaoDiaria), y);

  if (resultados.diasInternamento > 0) {
    y = addRow(doc, "Dias de Internamento", `${resultados.diasInternamento} dias`, y);
    y = addRow(doc, "Indemnização Internamento", formatCurrency(resultados.indemnInternamento), y);
  }

  if (resultados.diasAmbulatorio > 0) {
    y = addRow(doc, "Dias de Ambulatório", `${resultados.diasAmbulatorio} dias`, y);
    y = addRow(doc, "Indemnização Ambulatório", formatCurrency(resultados.indemnAmbulatorio), y);
  }

  addFooter(doc);
  doc.save("ita-nossa-seguros.pdf");
}

interface DadosIPP {
  nomeSinistrado?: string;
  salarioBaseMensal: number;
  subsidioFixoMensal: number;
  numSalariosAno: number;
  decreto: number;
  ippMedico: number;
}

interface ResultadosIPP {
  referenciaAnual: number;
  pensaoMensalIPP: number;
}

export function exportIPPPDF(dados: DadosIPP, resultados: ResultadosIPP) {
  const doc = setupDocument("Pensão por IPP - Incapacidade Permanente Parcial");
  let y = 75;

  // Dados de Entrada
  y = addSection(doc, "Dados de Entrada", y);
  y = addRow(doc, "Sinistrado", dados.nomeSinistrado || "—", y);
  y = addRow(doc, "Salário Base Mensal", formatCurrency(dados.salarioBaseMensal), y);
  y = addRow(doc, "Subsídio Fixo Mensal", formatCurrency(dados.subsidioFixoMensal), y);
  y = addRow(doc, "Nº Salários/Ano", dados.numSalariosAno.toString(), y);
  y = addRow(doc, "Factor Decreto", "70% (fixo)", y);
  y = addRow(doc, "Grau de Incapacidade indicada pelo Médico", `${Math.round(dados.ippMedico * 100)} / 100`, y);

  y += 3;

  // Resultados
  y = addSection(doc, "Resultados", y);
  y = addRow(doc, "Remuneração de Referência", formatCurrency(resultados.referenciaAnual), y, true);

  // Fórmula
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(9);
  doc.text(`Fórmula: ${formatCurrency(resultados.referenciaAnual)} × 0,70 × ${dados.ippMedico.toFixed(2)}`, 25, y);
  y += 10;

  y = addRow(doc, "Pensão Mensal por IPP", formatCurrency(resultados.pensaoMensalIPP), y, true);

  addFooter(doc);
  doc.save("pensao-ipp-nossa-seguros.pdf");
}

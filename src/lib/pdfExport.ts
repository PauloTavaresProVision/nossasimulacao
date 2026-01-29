import jsPDF from "jspdf";
import { formatCurrency, formatDate, formatDateTime, formatPercentage } from "./formatters";
import logoNossa from "@/assets/logo-nossa-seguros.png";

const NOSSA_BLUE = [30, 58, 95];
const NOSSA_GREEN = [165, 201, 0];

// Contact information
const CONTACT_PHONE = "+244 923 190 860";
const CONTACT_EMAIL = "apoioaocliente@nossaseguros.ao";

// Pre-loaded logo data
let logoDataUrl: string | null = null;

// Preload logo on module load
function preloadLogo() {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(img, 0, 0);
      logoDataUrl = canvas.toDataURL("image/png");
    }
  };
  img.src = logoNossa;
}

// Start preloading immediately
preloadLogo();

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
    // White rounded background for logo
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(15, 8, 50, 24, 3, 3, "F");
    try {
      doc.addImage(logoDataUrl, "PNG", 18, 11, 44, 18);
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
  const maxY = getMaxContentY(doc);
  if (currentY + neededSpace > maxY) {
    doc.addPage();
    return 50; // Reset Y position for new page
  }
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

  return yPos + 14;
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

  return yPos + 10;
}

function addFooter(doc: jsPDF) {
  const pageHeight = doc.internal.pageSize.height;

  // Green footer bar
  doc.setFillColor(NOSSA_GREEN[0], NOSSA_GREEN[1], NOSSA_GREEN[2]);
  doc.rect(0, pageHeight - 30, 210, 30, "F");

  // Contact information
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  
  // Phone
  doc.text("Contact Center", 50, pageHeight - 20);
  doc.setFont("helvetica", "normal");
  doc.text(CONTACT_PHONE, 50, pageHeight - 14);

  // Email
  doc.setFont("helvetica", "bold");
  doc.text("E-mail", 130, pageHeight - 20);
  doc.setFont("helvetica", "normal");
  doc.text(CONTACT_EMAIL, 130, pageHeight - 14);

  // Disclaimer
  doc.setFontSize(7);
  doc.text("Este documento é meramente indicativo e não constitui compromisso contratual.", 105, pageHeight - 6, { align: "center" });
}

interface DadosPensaoMorte {
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
  y = addRow(doc, "Salário Base Mensal", formatCurrency(dados.salarioBaseMensal), y);
  y = addRow(doc, "Subsídio Fixo Mensal", formatCurrency(dados.subsidioFixoMensal), y);
  y = addRow(doc, "Nº Salários/Ano", dados.numSalariosAno.toString(), y);
  y = addRow(doc, "Cônjuge", dados.temConjuge ? (dados.conjugeIdadeReforma ? "Sim (Idade Reforma)" : "Sim") : "Não", y);
  y = addRow(doc, "Ex-Cônjuge", dados.temExConjuge ? (dados.exConjugeIdadeReforma ? "Sim (Idade Reforma)" : "Sim") : "Não", y);
  y = addRow(doc, "Número de Filhos", dados.numFilhos.toString(), y);
  y = addRow(doc, "Pai", dados.temPai ? "Sim" : "Não", y);
  y = addRow(doc, "Mãe", dados.temMae ? "Sim" : "Não", y);
  y = addRow(doc, "Multiplicador Subsídio Morte", `×${dados.multiplicadorSubsidioMorte}`, y);
  y = addRow(doc, "Multiplicador Funeral", `×${dados.multiplicadorFuneral}`, y);

  y += 5;

  // Resultados
  y = addSection(doc, "Resultados", y);
  y = addRow(doc, "Remuneração de Referência", formatCurrency(resultados.referenciaAnual), y, true);

  if (resultados.valorConjuge > 0) {
    y = addRow(doc, `Cônjuge (${dados.conjugeIdadeReforma ? "40%" : "30%"})`, formatCurrency(resultados.valorConjuge), y);
  }
  if (resultados.valorExConjuge > 0) {
    y = addRow(doc, `Ex-Cônjuge (${dados.exConjugeIdadeReforma ? "40%" : "30%"})`, formatCurrency(resultados.valorExConjuge), y);
  }
  if (resultados.valorFilhos > 0) {
    y = addRow(doc, `Filhos (${dados.numFilhos})`, formatCurrency(resultados.valorFilhos), y);
  }
  if (resultados.valorPai > 0) {
    y = addRow(doc, "Pai (10%)", formatCurrency(resultados.valorPai), y);
  }
  if (resultados.valorMae > 0) {
    y = addRow(doc, "Mãe (10%)", formatCurrency(resultados.valorMae), y);
  }

  y = addRow(doc, "Pensão Mensal Total", formatCurrency(resultados.pensaoMensalTotal), y, true);
  y += 3;
  y = addRow(doc, `Subsídio por Morte (×${dados.multiplicadorSubsidioMorte})`, formatCurrency(resultados.subsidioMorte), y);
  y = addRow(doc, `Subsídio Funeral (×${dados.multiplicadorFuneral})`, formatCurrency(resultados.subsidioFuneral), y);
  y = addRow(doc, "Total Indemnização", formatCurrency(resultados.totalIndemnizacao), y, true);

  addFooter(doc);
  doc.save("pensao-morte-nossa-seguros.pdf");
}

interface DadosITA {
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
  y = addRow(doc, "Salário Base Mensal", formatCurrency(dados.salarioBaseMensal), y);
  y = addRow(doc, "Subsídio Fixo Mensal", formatCurrency(dados.subsidioFixoMensal), y);
  y = addRow(doc, "Nº Salários/Ano", dados.numSalariosAno.toString(), y);

  if (dados.dataInicioInternamento) {
    y = addRow(doc, "Período Internamento", `${formatDate(dados.dataInicioInternamento)} a ${formatDate(dados.dataFimInternamento)}`, y);
  }
  if (dados.dataInicioAmbulatorio) {
    y = addRow(doc, "Período Ambulatório", `${formatDate(dados.dataInicioAmbulatorio)} a ${formatDate(dados.dataFimAmbulatorio)}`, y);
  }

  y += 5;

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
    y = addRow(doc, "Indemnização Ambulatório (65%)", formatCurrency(resultados.indemnAmbulatorio), y);
  }

  y = addRow(doc, "Total de Dias", `${resultados.totalDias} dias`, y, true);
  y = addRow(doc, "Total Indemnização ITA", formatCurrency(resultados.totalIndemnizacao), y, true);

  addFooter(doc);
  doc.save("ita-nossa-seguros.pdf");
}

interface DadosIPP {
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
  y = addRow(doc, "Salário Base Mensal", formatCurrency(dados.salarioBaseMensal), y);
  y = addRow(doc, "Subsídio Fixo Mensal", formatCurrency(dados.subsidioFixoMensal), y);
  y = addRow(doc, "Nº Salários/Ano", dados.numSalariosAno.toString(), y);
  y = addRow(doc, "Fator Decreto", formatPercentage(dados.decreto), y);
  y = addRow(doc, "IPP Médico", formatPercentage(dados.ippMedico), y);

  y += 5;

  // Resultados
  y = addSection(doc, "Resultados", y);
  y = addRow(doc, "Remuneração de Referência", formatCurrency(resultados.referenciaAnual), y, true);

  // Fórmula
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(9);
  doc.text(`Fórmula: ${formatCurrency(resultados.referenciaAnual)} × ${dados.decreto} × ${dados.ippMedico}`, 25, y);
  y += 10;

  y = addRow(doc, "Pensão Mensal por IPP", formatCurrency(resultados.pensaoMensalIPP), y, true);

  addFooter(doc);
  doc.save("pensao-ipp-nossa-seguros.pdf");
}

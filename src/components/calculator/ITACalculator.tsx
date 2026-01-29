import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle, Calculator, RotateCcw, FileDown, AlertCircle } from "lucide-react";
import { SalarioReferencia, calcularReferenciaAnual } from "./SalarioReferencia";
import { formatCurrency } from "@/lib/formatters";
import { exportITAPDF } from "@/lib/pdfExport";
import { useAdmin } from "@/contexts/AdminContext";

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

function calcularDias(dataInicio: string, dataFim: string): number {
  if (!dataInicio || !dataFim) return 0;
  const inicio = new Date(dataInicio);
  const fim = new Date(dataFim);
  if (fim < inicio) return -1; // Erro
  const diffTime = fim.getTime() - inicio.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
}

export function ITACalculator() {
  const { factors } = useAdmin();

  // Salário de referência
  const [salarioBaseMensal, setSalarioBaseMensal] = useState(0);
  const [subsidioFixoMensal, setSubsidioFixoMensal] = useState(0);
  const [numSalariosAno, setNumSalariosAno] = useState(13);

  // Datas
  const [dataInicioInternamento, setDataInicioInternamento] = useState("");
  const [dataFimInternamento, setDataFimInternamento] = useState("");
  const [dataInicioAmbulatorio, setDataInicioAmbulatorio] = useState("");
  const [dataFimAmbulatorio, setDataFimAmbulatorio] = useState("");

  const [showResults, setShowResults] = useState(false);

  const diasInternamento = useMemo(() => calcularDias(dataInicioInternamento, dataFimInternamento), [dataInicioInternamento, dataFimInternamento]);
  const diasAmbulatorio = useMemo(() => calcularDias(dataInicioAmbulatorio, dataFimAmbulatorio), [dataInicioAmbulatorio, dataFimAmbulatorio]);

  const erroInternamento = diasInternamento === -1;
  const erroAmbulatorio = diasAmbulatorio === -1;

  const resultados = useMemo((): ResultadosITA => {
    const ref = calcularReferenciaAnual(salarioBaseMensal, subsidioFixoMensal, numSalariosAno);
    const limiteDias = factors.itaLimiteDiasInternamento;
    const divisorDiaria = factors.itaDivisorRemuneracaoDiaria;
    const remuneracaoDiaria = ref / divisorDiaria;

    const diasIntern = diasInternamento > 0 ? diasInternamento : 0;
    const diasAmbul = diasAmbulatorio > 0 ? diasAmbulatorio : 0;

    // Indemnização Internamento (usa fatores do admin)
    let indemnInternamento = 0;
    if (diasIntern <= limiteDias) {
      indemnInternamento = remuneracaoDiaria * diasIntern * factors.itaInternamento100;
    } else {
      indemnInternamento = 
        (remuneracaoDiaria * limiteDias * factors.itaInternamento100) + 
        (remuneracaoDiaria * (diasIntern - limiteDias) * factors.itaInternamentoApos30);
    }

    // Indemnização Ambulatório (usa fator do admin)
    const indemnAmbulatorio = remuneracaoDiaria * diasAmbul * factors.itaAmbulatorio;

    return {
      referenciaAnual: ref,
      remuneracaoDiaria,
      diasInternamento: diasIntern,
      indemnInternamento,
      diasAmbulatorio: diasAmbul,
      indemnAmbulatorio,
      totalDias: diasIntern + diasAmbul,
      totalIndemnizacao: indemnInternamento + indemnAmbulatorio,
    };
  }, [salarioBaseMensal, subsidioFixoMensal, numSalariosAno, diasInternamento, diasAmbulatorio, factors]);

  const handleLimpar = () => {
    setSalarioBaseMensal(0);
    setSubsidioFixoMensal(0);
    setNumSalariosAno(13);
    setDataInicioInternamento("");
    setDataFimInternamento("");
    setDataInicioAmbulatorio("");
    setDataFimAmbulatorio("");
    setShowResults(false);
  };

  const handleExportPDF = () => {
    const dados = {
      salarioBaseMensal,
      subsidioFixoMensal,
      numSalariosAno,
      dataInicioInternamento,
      dataFimInternamento,
      dataInicioAmbulatorio,
      dataFimAmbulatorio,
    };
    exportITAPDF(dados, resultados);
  };

  const canCalculate = !erroInternamento && !erroAmbulatorio;

  return (
    <div className="animate-fade-in">
      <SalarioReferencia
        salarioBaseMensal={salarioBaseMensal}
        setSalarioBaseMensal={setSalarioBaseMensal}
        subsidioFixoMensal={subsidioFixoMensal}
        setSubsidioFixoMensal={setSubsidioFixoMensal}
        numSalariosAno={numSalariosAno}
        setNumSalariosAno={setNumSalariosAno}
      />

      {/* Período de Internamento */}
      <div className="card-elevated p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-semibold text-foreground">Período de Internamento</h3>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>Primeiros 30 dias: 100% | Após 30 dias: 75%</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Data Início</Label>
            <Input
              type="date"
              value={dataInicioInternamento}
              onChange={(e) => setDataInicioInternamento(e.target.value)}
              className="input-styled"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Data Fim</Label>
            <Input
              type="date"
              value={dataFimInternamento}
              onChange={(e) => setDataFimInternamento(e.target.value)}
              className="input-styled"
            />
          </div>
        </div>
        {erroInternamento && (
          <div className="flex items-center gap-2 mt-3 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">Data fim não pode ser anterior à data início</p>
          </div>
        )}
      </div>

      {/* Período de Ambulatório */}
      <div className="card-elevated p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-semibold text-foreground">Período de Ambulatório</h3>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Indemnização: 65% da remuneração diária</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Data Início</Label>
            <Input
              type="date"
              value={dataInicioAmbulatorio}
              onChange={(e) => setDataInicioAmbulatorio(e.target.value)}
              className="input-styled"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Data Fim</Label>
            <Input
              type="date"
              value={dataFimAmbulatorio}
              onChange={(e) => setDataFimAmbulatorio(e.target.value)}
              className="input-styled"
            />
          </div>
        </div>
        {erroAmbulatorio && (
          <div className="flex items-center gap-2 mt-3 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">Data fim não pode ser anterior à data início</p>
          </div>
        )}
      </div>

      {/* Botões */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Button
          onClick={() => setShowResults(true)}
          disabled={!canCalculate}
          className="btn-secondary gap-2"
        >
          <Calculator className="h-4 w-4" />
          Calcular
        </Button>
        <Button onClick={handleLimpar} variant="outline" className="btn-outline gap-2">
          <RotateCcw className="h-4 w-4" />
          Limpar
        </Button>
        {showResults && (
          <Button onClick={handleExportPDF} variant="outline" className="gap-2">
            <FileDown className="h-4 w-4" />
            Exportar PDF
          </Button>
        )}
      </div>

      {/* Resultados */}
      {showResults && canCalculate && (
        <div className="result-card animate-fade-in">
          <h3 className="text-lg font-semibold text-foreground mb-4">Resultados</h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="result-highlight">
                <p className="text-sm text-muted-foreground">Remuneração de Referência</p>
                <p className="text-xl font-bold text-foreground">{formatCurrency(resultados.referenciaAnual)}</p>
              </div>
              <div className="result-highlight">
                <p className="text-sm text-muted-foreground">Remuneração Diária (Ref ÷ 30)</p>
                <p className="text-xl font-bold text-foreground">{formatCurrency(resultados.remuneracaoDiaria)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Dias de Internamento</p>
                <p className="text-lg font-semibold text-foreground">{resultados.diasInternamento} dias</p>
                <p className="text-sm text-muted-foreground mt-1">Indemnização:</p>
                <p className="text-lg font-semibold text-nossa-green">{formatCurrency(resultados.indemnInternamento)}</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Dias de Ambulatório</p>
                <p className="text-lg font-semibold text-foreground">{resultados.diasAmbulatorio} dias</p>
                <p className="text-sm text-muted-foreground mt-1">Indemnização (65%):</p>
                <p className="text-lg font-semibold text-nossa-green">{formatCurrency(resultados.indemnAmbulatorio)}</p>
              </div>
            </div>

            <div className="result-highlight bg-gradient-to-r from-primary/10 to-primary/5 border-l-primary">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Dias</p>
                  <p className="text-lg font-semibold text-foreground">{resultados.totalDias} dias</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Indemnização ITA</p>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(resultados.totalIndemnizacao)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

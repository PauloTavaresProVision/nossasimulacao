import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle, Calculator, RotateCcw, FileDown } from "lucide-react";
import { SalarioReferencia, calcularReferenciaAnual } from "./SalarioReferencia";
import { formatCurrency } from "@/lib/formatters";
import { exportIPPPDF } from "@/lib/pdfExport";

interface ResultadosIPP {
  referenciaAnual: number;
  pensaoMensalIPP: number;
}

export function IPPCalculator() {
  // Salário de referência
  const [salarioBaseMensal, setSalarioBaseMensal] = useState(0);
  const [subsidioFixoMensal, setSubsidioFixoMensal] = useState(0);
  const [numSalariosAno, setNumSalariosAno] = useState(13);

  // Fatores IPP
  const [decreto, setDecreto] = useState(0.7);
  const [ippMedico, setIppMedico] = useState(0.5);

  const [showResults, setShowResults] = useState(false);

  const resultados = useMemo((): ResultadosIPP => {
    const ref = calcularReferenciaAnual(salarioBaseMensal, subsidioFixoMensal, numSalariosAno);
    const pensaoMensalIPP = ref * decreto * ippMedico;

    return {
      referenciaAnual: ref,
      pensaoMensalIPP,
    };
  }, [salarioBaseMensal, subsidioFixoMensal, numSalariosAno, decreto, ippMedico]);

  const handleLimpar = () => {
    setSalarioBaseMensal(0);
    setSubsidioFixoMensal(0);
    setNumSalariosAno(13);
    setDecreto(0.7);
    setIppMedico(0.5);
    setShowResults(false);
  };

  const handleExportPDF = async () => {
    const dados = {
      salarioBaseMensal,
      subsidioFixoMensal,
      numSalariosAno,
      decreto,
      ippMedico,
    };
    await exportIPPPDF(dados, resultados);
  };

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

      {/* Fatores IPP */}
      <div className="card-elevated p-6 mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">Fatores de Cálculo</h3>

        <div className="space-y-8">
          {/* Decreto */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Fator Decreto</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Coeficiente estabelecido por decreto. Valor entre 0 e 1 (ex: 0.7 = 70%)</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <span className="text-lg font-semibold text-nossa-green">{(decreto * 100).toFixed(0)}%</span>
            </div>
            <div className="flex items-center gap-4">
              <Slider
                value={[decreto]}
                onValueChange={(v) => setDecreto(v[0])}
                min={0}
                max={1}
                step={0.01}
                className="flex-1"
              />
              <Input
                type="number"
                min={0}
                max={1}
                step={0.01}
                value={decreto}
                onChange={(e) => setDecreto(Math.min(1, Math.max(0, Number(e.target.value))))}
                className="input-styled w-24"
              />
            </div>
          </div>

          {/* IPP Médico */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">IPP Médico</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Incapacidade Permanente Parcial determinada por avaliação médica. Valor entre 0 e 1 (ex: 0.5 = 50%)</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <span className="text-lg font-semibold text-nossa-green">{(ippMedico * 100).toFixed(0)}%</span>
            </div>
            <div className="flex items-center gap-4">
              <Slider
                value={[ippMedico]}
                onValueChange={(v) => setIppMedico(v[0])}
                min={0}
                max={1}
                step={0.01}
                className="flex-1"
              />
              <Input
                type="number"
                min={0}
                max={1}
                step={0.01}
                value={ippMedico}
                onChange={(e) => setIppMedico(Math.min(1, Math.max(0, Number(e.target.value))))}
                className="input-styled w-24"
              />
            </div>
          </div>
        </div>

        {/* Fórmula visual */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            Pensão Mensal = Ref × Decreto × IPP Médico
          </p>
          <p className="text-center mt-2 font-mono text-sm">
            = {formatCurrency(resultados.referenciaAnual)} × {decreto} × {ippMedico}
          </p>
        </div>
      </div>

      {/* Botões */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Button onClick={() => setShowResults(true)} className="btn-secondary gap-2">
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
      {showResults && (
        <div className="result-card animate-fade-in">
          <h3 className="text-lg font-semibold text-foreground mb-4">Resultados</h3>

          <div className="space-y-4">
            <div className="result-highlight">
              <p className="text-sm text-muted-foreground">Remuneração de Referência</p>
              <p className="text-xl font-bold text-foreground">{formatCurrency(resultados.referenciaAnual)}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Fator Decreto</p>
                <p className="text-lg font-semibold text-foreground">{(decreto * 100).toFixed(1)}%</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">IPP Médico</p>
                <p className="text-lg font-semibold text-foreground">{(ippMedico * 100).toFixed(1)}%</p>
              </div>
            </div>

            <div className="result-highlight bg-gradient-to-r from-primary/10 to-primary/5 border-l-primary">
              <p className="text-sm text-muted-foreground">Pensão Mensal por IPP</p>
              <p className="text-3xl font-bold text-primary">{formatCurrency(resultados.pensaoMensalIPP)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

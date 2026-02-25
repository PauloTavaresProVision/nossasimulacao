import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle, Calculator, RotateCcw, FileDown } from "lucide-react";
import { SalarioReferencia, calcularReferenciaAnual } from "./SalarioReferencia";
import { formatCurrency } from "@/lib/formatters";
import { exportPensaoMortePDF } from "@/lib/pdfExport";

interface ResultadosMorte {
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

export function PensaoMorte() {
  // Salário de referência
  const [salarioBaseMensal, setSalarioBaseMensal] = useState(0);
  const [subsidioFixoMensal, setSubsidioFixoMensal] = useState(0);
  const [numSalariosAno, setNumSalariosAno] = useState(13);
  const [nomeSinistrado, setNomeSinistrado] = useState("");

  // Beneficiários
  const [temConjuge, setTemConjuge] = useState(false);
  const [conjugeIdadeReforma, setConjugeIdadeReforma] = useState(false);
  const [temExConjuge, setTemExConjuge] = useState(false);
  const [exConjugeIdadeReforma, setExConjugeIdadeReforma] = useState(false);
  const [numFilhos, setNumFilhos] = useState(0);
  const [temPai, setTemPai] = useState(false);
  const [temMae, setTemMae] = useState(false);

  // Multiplicadores
  const [multiplicadorSubsidioMorte, setMultiplicadorSubsidioMorte] = useState(6);
  const [multiplicadorFuneral, setMultiplicadorFuneral] = useState(2);

  const [showResults, setShowResults] = useState(false);

  const resultados = useMemo((): ResultadosMorte => {
    const ref = calcularReferenciaAnual(salarioBaseMensal, subsidioFixoMensal, numSalariosAno);

    const valorConjuge = temConjuge ? (conjugeIdadeReforma ? 0.4 : 0.3) * ref : 0;
    const valorExConjuge = temExConjuge ? (exConjugeIdadeReforma ? 0.4 : 0.3) * ref : 0;

    let valorFilhos = 0;
    if (numFilhos === 1) valorFilhos = 0.2 * ref;
    else if (numFilhos === 2) valorFilhos = 0.4 * ref;
    else if (numFilhos >= 3) valorFilhos = 0.6 * ref;

    const valorPai = temPai ? 0.1 * ref : 0;
    const valorMae = temMae ? 0.1 * ref : 0;

    const pensaoMensalTotal = valorConjuge + valorExConjuge + valorFilhos + valorPai + valorMae;
    const subsidioMorte = ref * multiplicadorSubsidioMorte;
    const subsidioFuneral = ref * multiplicadorFuneral;
    const totalIndemnizacao = pensaoMensalTotal + subsidioMorte + subsidioFuneral;

    return {
      referenciaAnual: ref,
      valorConjuge,
      valorExConjuge,
      valorFilhos,
      valorPai,
      valorMae,
      pensaoMensalTotal,
      subsidioMorte,
      subsidioFuneral,
      totalIndemnizacao,
    };
  }, [
    salarioBaseMensal,
    subsidioFixoMensal,
    numSalariosAno,
    temConjuge,
    conjugeIdadeReforma,
    temExConjuge,
    exConjugeIdadeReforma,
    numFilhos,
    temPai,
    temMae,
    multiplicadorSubsidioMorte,
    multiplicadorFuneral,
  ]);

  const handleLimpar = () => {
    setSalarioBaseMensal(0);
    setSubsidioFixoMensal(0);
    setNumSalariosAno(13);
    setNomeSinistrado("");
    setTemConjuge(false);
    setConjugeIdadeReforma(false);
    setTemExConjuge(false);
    setExConjugeIdadeReforma(false);
    setNumFilhos(0);
    setTemPai(false);
    setTemMae(false);
    setMultiplicadorSubsidioMorte(6);
    setMultiplicadorFuneral(2);
    setShowResults(false);
  };

  const handleExportPDF = () => {
    const dados = {
      nomeSinistrado,
      salarioBaseMensal,
      subsidioFixoMensal,
      numSalariosAno,
      temConjuge,
      conjugeIdadeReforma,
      temExConjuge,
      exConjugeIdadeReforma,
      numFilhos,
      temPai,
      temMae,
      multiplicadorSubsidioMorte,
      multiplicadorFuneral,
    };
    exportPensaoMortePDF(dados, resultados);
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
        nomeSinistrado={nomeSinistrado}
        setNomeSinistrado={setNomeSinistrado}
      />

      {/* Beneficiários */}
      <div className="card-elevated p-6 mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Beneficiários</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cônjuge */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Tem Cônjuge?</Label>
              <Switch checked={temConjuge} onCheckedChange={setTemConjuge} />
            </div>
            {temConjuge && (
              <div className="flex items-center justify-between pl-4 border-l-2 border-secondary/30 animate-slide-in">
                <div className="flex items-center gap-1">
                  <Label className="text-sm">Cônjuge com idade de reforma?</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Se sim: 40% da Ref. Se não: 30%</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Switch checked={conjugeIdadeReforma} onCheckedChange={setConjugeIdadeReforma} />
              </div>
            )}
          </div>

          {/* Ex-Cônjuge */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Tem Ex-Cônjuge?</Label>
              <Switch checked={temExConjuge} onCheckedChange={setTemExConjuge} />
            </div>
            {temExConjuge && (
              <div className="flex items-center justify-between pl-4 border-l-2 border-secondary/30 animate-slide-in">
                <div className="flex items-center gap-1">
                  <Label className="text-sm">Ex-Cônjuge com idade de reforma?</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Se sim: 40% da Ref. Se não: 30%</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Switch checked={exConjugeIdadeReforma} onCheckedChange={setExConjugeIdadeReforma} />
              </div>
            )}
          </div>

          {/* Filhos */}
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <Label className="text-sm font-medium">Número de Filhos</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>1 filho: 20% | 2 filhos: 40% | 3+ filhos: 60%</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Input
              type="number"
              min={0}
              value={numFilhos || ""}
              onChange={(e) => {
                const val = e.target.value;
                setNumFilhos(val === "" ? 0 : Math.max(0, parseInt(val, 10) || 0));
              }}
              onBlur={(e) => {
                if (e.target.value === "") setNumFilhos(0);
              }}
              className="input-styled max-w-[120px]"
            />
          </div>

          {/* Ascendentes */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Ascendente (10% cada)</Label>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Tem Pai?</Label>
                <Switch checked={temPai} onCheckedChange={setTemPai} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Tem Mãe?</Label>
                <Switch checked={temMae} onCheckedChange={setTemMae} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subsídios */}
      <div className="card-elevated p-6 mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Subsídios</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <Label className="text-sm font-medium">Subsídio por Morte</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Valor padrão: 6. Pode ser 7 × Remuneração de Referência</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Select value={String(multiplicadorSubsidioMorte)} onValueChange={(v) => setMultiplicadorSubsidioMorte(Number(v))}>
              <SelectTrigger className="input-styled max-w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6</SelectItem>
                <SelectItem value="7">7</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <Label className="text-sm font-medium">Despesa de Funeral</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Padrão: 2. Pode ser 4 ou 5 em caso de transladação</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Select value={String(multiplicadorFuneral)} onValueChange={(v) => setMultiplicadorFuneral(Number(v))}>
              <SelectTrigger className="input-styled max-w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="5">5</SelectItem>
              </SelectContent>
            </Select>
          </div>
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resultados.valorConjuge > 0 && (
                <div className="bg-card p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">Cônjuge {conjugeIdadeReforma ? "(40%)" : "(30%)"}</p>
                  <p className="text-lg font-semibold text-foreground">{formatCurrency(resultados.valorConjuge)}</p>
                </div>
              )}
              {resultados.valorExConjuge > 0 && (
                <div className="bg-card p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">Ex-Cônjuge {exConjugeIdadeReforma ? "(40%)" : "(30%)"}</p>
                  <p className="text-lg font-semibold text-foreground">{formatCurrency(resultados.valorExConjuge)}</p>
                </div>
              )}
              {resultados.valorFilhos > 0 && (
                <div className="bg-card p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">Filhos ({numFilhos})</p>
                  <p className="text-lg font-semibold text-foreground">{formatCurrency(resultados.valorFilhos)}</p>
                </div>
              )}
              {resultados.valorPai > 0 && (
                <div className="bg-card p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">Pai (10%)</p>
                  <p className="text-lg font-semibold text-foreground">{formatCurrency(resultados.valorPai)}</p>
                </div>
              )}
              {resultados.valorMae > 0 && (
                <div className="bg-card p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">Mãe (10%)</p>
                  <p className="text-lg font-semibold text-foreground">{formatCurrency(resultados.valorMae)}</p>
                </div>
              )}
            </div>

            <div className="result-highlight">
              <p className="text-sm text-muted-foreground">Pensão Mensal Total</p>
              <p className="text-2xl font-bold text-nossa-green">{formatCurrency(resultados.pensaoMensalTotal)}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Subsídio por Morte (×{multiplicadorSubsidioMorte})</p>
                <p className="text-lg font-semibold text-foreground">{formatCurrency(resultados.subsidioMorte)}</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Despesa de Funeral (×{multiplicadorFuneral})</p>
                <p className="text-lg font-semibold text-foreground">{formatCurrency(resultados.subsidioFuneral)}</p>
              </div>
            </div>

            <div className="result-highlight bg-gradient-to-r from-primary/10 to-primary/5 border-l-primary">
              <p className="text-sm text-muted-foreground">Total Indemnização (Pensão + Subsídios)</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(resultados.totalIndemnizacao)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

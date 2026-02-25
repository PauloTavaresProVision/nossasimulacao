import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface SalarioReferenciaProps {
  salarioBaseMensal: number;
  setSalarioBaseMensal: (value: number) => void;
  subsidioFixoMensal: number;
  setSubsidioFixoMensal: (value: number) => void;
  numSalariosAno: number;
  setNumSalariosAno: (value: number) => void;
  nomeSinistrado?: string;
  setNomeSinistrado?: (value: string) => void;
}

export function SalarioReferencia({
  salarioBaseMensal,
  setSalarioBaseMensal,
  subsidioFixoMensal,
  setSubsidioFixoMensal,
  numSalariosAno,
  setNumSalariosAno,
  nomeSinistrado = "",
  setNomeSinistrado,
}: SalarioReferenciaProps) {
  return (
    <div className="card-elevated p-6 mb-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Remuneração de Referência
        </h3>
        <Tooltip>
          <TooltipTrigger asChild>
            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p>
              Ref = ((Salário Base + Subsídio Fixo) × Nº Salários/Ano) ÷ 12
            </p>
          </TooltipContent>
        </Tooltip>
      </div>

      {setNomeSinistrado !== undefined && (
        <div className="mb-4 space-y-2">
          <Label htmlFor="nomeSinistrado" className="text-sm font-medium">
            Nome do Sinistrado
          </Label>
          <Input
            id="nomeSinistrado"
            type="text"
            value={nomeSinistrado}
            onChange={(e) => {
              const value = e.target.value.replace(/[0-9]/g, "");
              setNomeSinistrado(value);
            }}
            placeholder="Introduza o nome"
            className="input-styled"
          />
        </div>
      )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="salarioBase" className="text-sm font-medium">
            Salário Base Mensal
          </Label>
          <Input
            id="salarioBase"
            type="text"
            inputMode="numeric"
            value={salarioBaseMensal ? new Intl.NumberFormat("pt-AO").format(salarioBaseMensal) : ""}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^\d]/g, "");
              setSalarioBaseMensal(raw ? Number(raw) : 0);
            }}
            placeholder="0"
            className="input-styled"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="subsidioFixo" className="text-sm font-medium">
            Subsídio Fixo Mensal
          </Label>
          <Input
            id="subsidioFixo"
            type="text"
            inputMode="numeric"
            value={subsidioFixoMensal ? new Intl.NumberFormat("pt-AO").format(subsidioFixoMensal) : ""}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^\d]/g, "");
              setSubsidioFixoMensal(raw ? Number(raw) : 0);
            }}
            placeholder="0"
            className="input-styled"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-1">
            <Label htmlFor="numSalarios" className="text-sm font-medium">
              Nº Salários/Ano
            </Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Tipicamente 13 ou 14 salários por ano</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Input
            id="numSalarios"
            type="number"
            min={12}
            max={14}
            value={numSalariosAno}
            onChange={(e) =>
              setNumSalariosAno(
                Math.min(14, Math.max(12, Number(e.target.value)))
              )
            }
            className="input-styled"
          />
        </div>
      </div>
    </div>
  );
}

export function calcularReferenciaAnual(
  salarioBaseMensal: number,
  subsidioFixoMensal: number,
  numSalariosAno: number
): number {
  return ((salarioBaseMensal + subsidioFixoMensal) * numSalariosAno) / 12;
}

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdmin, defaultFactors, CalculationFactors } from "@/contexts/AdminContext";
import { Lock, Unlock, RotateCcw, Save, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdminPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminPanel({ open, onOpenChange }: AdminPanelProps) {
  const { isAdmin, login, logout, factors, updateFactor, resetFactors } = useAdmin();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleLogin = () => {
    if (login(password)) {
      setPassword("");
      setError("");
      toast({
        title: "Acesso concedido",
        description: "Bem-vindo ao painel de administração.",
      });
    } else {
      setError("Password incorreta");
    }
  };

  const handleLogout = () => {
    logout();
    onOpenChange(false);
    toast({
      title: "Sessão terminada",
      description: "Saiu do modo administrador.",
    });
  };

  const handleReset = () => {
    resetFactors();
    toast({
      title: "Valores repostos",
      description: "Todos os fatores voltaram aos valores originais.",
    });
  };

  const renderFactorInput = (
    key: keyof CalculationFactors,
    label: string,
    isPercentage: boolean = true
  ) => (
    <div className="flex items-center justify-between gap-4 py-2">
      <Label className="text-sm">{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          step={isPercentage ? 0.01 : 1}
          min={0}
          max={isPercentage ? 1 : 100}
          value={factors[key]}
          onChange={(e) => updateFactor(key, Number(e.target.value))}
          className="w-24 text-right"
        />
        {isPercentage && (
          <span className="text-sm text-muted-foreground w-12">
            ({(factors[key] * 100).toFixed(0)}%)
          </span>
        )}
        {!isPercentage && <span className="text-sm text-muted-foreground w-12">x</span>}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isAdmin ? <Unlock className="h-5 w-5 text-nossa-green" /> : <Lock className="h-5 w-5" />}
            Painel de Administração
          </DialogTitle>
          <DialogDescription>
            {isAdmin
              ? "Edite os fatores de cálculo utilizados nas simulações."
              : "Introduza a password para aceder."}
          </DialogDescription>
        </DialogHeader>

        {!isAdmin ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="Introduza a password"
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            <Button onClick={handleLogin} className="w-full">
              <Lock className="h-4 w-4 mr-2" />
              Entrar
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <Tabs defaultValue="ita" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="ita">ITA</TabsTrigger>
                <TabsTrigger value="ipp">IPP</TabsTrigger>
                <TabsTrigger value="pensao">Pensão</TabsTrigger>
              </TabsList>

              <TabsContent value="ita" className="space-y-2 mt-4">
                <h4 className="font-medium text-sm text-muted-foreground mb-3">
                  Fatores de Incapacidade Temporária
                </h4>
                {renderFactorInput("itaInternamento100", "Internamento (≤30 dias)")}
                {renderFactorInput("itaInternamentoApos30", "Internamento (>30 dias)")}
                {renderFactorInput("itaAmbulatorio", "Ambulatório")}
              </TabsContent>

              <TabsContent value="ipp" className="space-y-2 mt-4">
                <h4 className="font-medium text-sm text-muted-foreground mb-3">
                  Fatores de Incapacidade Permanente Parcial
                </h4>
                {renderFactorInput("ippDecretoDefault", "Fator Decreto (padrão)")}
                {renderFactorInput("ippMedicoDefault", "IPP Médico (padrão)")}
              </TabsContent>

              <TabsContent value="pensao" className="space-y-2 mt-4">
                <h4 className="font-medium text-sm text-muted-foreground mb-3">
                  Fatores de Pensão por Morte
                </h4>
                {renderFactorInput("pensaoConjugeReforma", "Cônjuge (reforma)")}
                {renderFactorInput("pensaoConjugeNormal", "Cônjuge (normal)")}
                {renderFactorInput("pensaoFilho1", "1 Filho")}
                {renderFactorInput("pensaoFilhos2", "2 Filhos")}
                {renderFactorInput("pensaoFilhos3Mais", "3+ Filhos")}
                {renderFactorInput("pensaoPais", "Pais (cada)")}
                <div className="border-t pt-3 mt-3">
                  <h4 className="font-medium text-sm text-muted-foreground mb-3">Subsídios</h4>
                  {renderFactorInput("subsidioMorteMultiplicador", "Subsídio Morte", false)}
                  {renderFactorInput("subsidioFuneralMultiplicador", "Subsídio Funeral", false)}
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex gap-2 pt-4 border-t">
              <Button onClick={handleReset} variant="outline" className="flex-1">
                <RotateCcw className="h-4 w-4 mr-2" />
                Repor Originais
              </Button>
              <Button onClick={handleLogout} variant="destructive" className="flex-1">
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

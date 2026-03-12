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
import { Lock, Unlock, RotateCcw, Save, LogOut, KeyRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdminPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminPanel({ open, onOpenChange }: AdminPanelProps) {
  const { isAdmin, login, logout, factors, updateFactor, resetFactors, changeSitePassword, siteLogout } = useAdmin();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { toast } = useToast();

  // Password change state
  const [currentSitePass, setCurrentSitePass] = useState("");
  const [newSitePass, setNewSitePass] = useState("");
  const [confirmSitePass, setConfirmSitePass] = useState("");
  const [passError, setPassError] = useState("");

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

  const handleChangeSitePassword = async () => {
    setPassError("");
    if (!currentSitePass || !newSitePass || !confirmSitePass) {
      setPassError("Preencha todos os campos");
      return;
    }
    if (newSitePass.length < 4) {
      setPassError("A nova password deve ter pelo menos 4 caracteres");
      return;
    }
    if (newSitePass !== confirmSitePass) {
      setPassError("As passwords não coincidem");
      return;
    }
    const success = await changeSitePassword(currentSitePass, newSitePass);
    if (success) {
      setCurrentSitePass("");
      setNewSitePass("");
      setConfirmSitePass("");
      toast({
        title: "Password alterada",
        description: "A password de acesso ao simulador foi alterada com sucesso.",
      });
    } else {
      setPassError("Password actual incorrecta");
    }
  };

  const handleSiteLogout = () => {
    siteLogout();
    onOpenChange(false);
  };

  const renderFactorInput = (
    key: keyof CalculationFactors,
    label: string,
    type: "percentage" | "multiplier" | "days" = "percentage"
  ) => (
    <div className="flex items-center justify-between gap-4 py-2">
      <Label className="text-sm">{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          step={type === "percentage" ? 0.01 : 1}
          min={0}
          max={type === "percentage" ? 1 : 365}
          value={factors[key]}
          onChange={(e) => updateFactor(key, Number(e.target.value))}
          className="w-24 text-right"
        />
        {type === "percentage" && (
          <span className="text-sm text-muted-foreground w-12">
            ({(factors[key] * 100).toFixed(0)}%)
          </span>
        )}
        {type === "multiplier" && <span className="text-sm text-muted-foreground w-12">x</span>}
        {type === "days" && <span className="text-sm text-muted-foreground w-12">dias</span>}
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
              ? "Edite os fatores de cálculo e configurações do simulador."
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
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="ita">ITA</TabsTrigger>
                <TabsTrigger value="ipp">IPP</TabsTrigger>
                <TabsTrigger value="pensao">Pensão</TabsTrigger>
                <TabsTrigger value="password" className="flex items-center gap-1">
                  <KeyRound className="h-3.5 w-3.5" />
                  Acesso
                </TabsTrigger>
              </TabsList>

              <TabsContent value="ita" className="space-y-2 mt-4">
                <h4 className="font-medium text-sm text-muted-foreground mb-3">
                  Fatores de Incapacidade Temporária
                </h4>
                {renderFactorInput("itaInternamento100", "Internamento (≤limite)")}
                {renderFactorInput("itaInternamentoApos30", "Internamento (>limite)")}
                {renderFactorInput("itaAmbulatorio", "Ambulatório")}
                <div className="border-t pt-3 mt-3">
                  <h4 className="font-medium text-sm text-muted-foreground mb-3">Parâmetros</h4>
                  {renderFactorInput("itaLimiteDiasInternamento", "Limite dias internamento", "days")}
                  {renderFactorInput("itaDivisorRemuneracaoDiaria", "Divisor rem. diária (Ref÷X)", "days")}
                </div>
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
                  {renderFactorInput("subsidioMorteMultiplicador", "Subsídio de Morte", "multiplier")}
                  {renderFactorInput("subsidioFuneralMultiplicador", "Subsídio de Despesas de Funeral", "multiplier")}
                </div>
              </TabsContent>

              <TabsContent value="password" className="space-y-4 mt-4">
                <h4 className="font-medium text-sm text-muted-foreground mb-3">
                  Alterar Password de Acesso ao Simulador
                </h4>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-sm">Password actual</Label>
                    <Input
                      type="password"
                      value={currentSitePass}
                      onChange={(e) => { setCurrentSitePass(e.target.value); setPassError(""); }}
                      placeholder="Password actual"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm">Nova password</Label>
                    <Input
                      type="password"
                      value={newSitePass}
                      onChange={(e) => { setNewSitePass(e.target.value); setPassError(""); }}
                      placeholder="Nova password"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm">Confirmar nova password</Label>
                    <Input
                      type="password"
                      value={confirmSitePass}
                      onChange={(e) => { setConfirmSitePass(e.target.value); setPassError(""); }}
                      placeholder="Confirmar nova password"
                    />
                  </div>
                  {passError && <p className="text-sm text-destructive">{passError}</p>}
                  <Button onClick={handleChangeSitePassword} className="w-full">
                    <KeyRound className="h-4 w-4 mr-2" />
                    Alterar Password
                  </Button>
                </div>

                <div className="border-t pt-4 mt-4">
                  <Button onClick={handleSiteLogout} variant="outline" className="w-full">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair do Simulador
                  </Button>
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
                Sair Admin
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

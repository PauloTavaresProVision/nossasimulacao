import { useState } from "react";
import { useAdmin } from "@/contexts/AdminContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import logoNossa from "@/assets/logo-nossa-seguros.png";

export function SiteAccessGate() {
  const { siteLogin } = useAdmin();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (siteLogin(password)) {
      setError("");
    } else {
      setError("Password incorrecta");
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-nossa-blue-light flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-2xl p-8 space-y-6">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="bg-white rounded-xl p-4 shadow-md">
              <img
                src={logoNossa}
                alt="Nossa Seguros"
                className="h-12 w-auto"
              />
            </div>
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-xl font-bold text-foreground">
              Simulador de Cálculo de Compensações
            </h1>
            <p className="text-sm text-muted-foreground">
              Introduza a password para aceder ao simulador
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Password"
                  className="pl-10"
                  autoFocus
                />
              </div>
              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={!password}>
              Entrar
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Nossa Seguros
          </p>
        </div>
      </div>
    </div>
  );
}

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface CalculationFactors {
  // ITA
  itaInternamento100: number; // primeiros X dias (100%)
  itaInternamentoApos30: number; // após X dias (75%)
  itaAmbulatorio: number; // 65%
  itaLimiteDiasInternamento: number; // limite de dias para 100% (padrão 30)
  itaDivisorRemuneracaoDiaria: number; // divisor para calcular diária (padrão 30)
  
  // IPP
  ippDecretoDefault: number; // 70%
  ippMedicoDefault: number; // 50%
  
  // Pensão por Morte
  pensaoConjugeReforma: number; // 40%
  pensaoConjugeNormal: number; // 30%
  pensaoFilho1: number; // 20%
  pensaoFilhos2: number; // 40%
  pensaoFilhos3Mais: number; // 60%
  pensaoPais: number; // 10% cada
  
  // Subsídios
  subsidioMorteMultiplicador: number; // 6x
  subsidioFuneralMultiplicador: number; // 2x
}

const defaultFactors: CalculationFactors = {
  itaInternamento100: 1.0,
  itaInternamentoApos30: 0.75,
  itaAmbulatorio: 0.65,
  itaLimiteDiasInternamento: 30,
  itaDivisorRemuneracaoDiaria: 30,
  ippDecretoDefault: 0.7,
  ippMedicoDefault: 0.5,
  pensaoConjugeReforma: 0.4,
  pensaoConjugeNormal: 0.3,
  pensaoFilho1: 0.2,
  pensaoFilhos2: 0.4,
  pensaoFilhos3Mais: 0.6,
  pensaoPais: 0.1,
  subsidioMorteMultiplicador: 6,
  subsidioFuneralMultiplicador: 2,
};

interface AdminContextType {
  isAdmin: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  factors: CalculationFactors;
  updateFactor: (key: keyof CalculationFactors, value: number) => void;
  resetFactors: () => void;
  // Site access
  isSiteAuthenticated: boolean;
  siteLogin: (password: string) => boolean;
  siteLogout: () => void;
  changeSitePassword: (currentPassword: string, newPassword: string) => boolean;
}

const AdminContext = createContext<AdminContextType | null>(null);

const ADMIN_PASSWORD = "Admin2026";
const FACTORS_STORAGE_KEY = "nossa-seguros-factors";
const SITE_PASSWORD_KEY = "nossa-seguros-site-password";
const SITE_AUTH_KEY = "nossa-seguros-site-auth";
const SITE_AUTH_EXPIRY_KEY = "nossa-seguros-site-auth-expiry";
const DEFAULT_SITE_PASSWORD = "Nossa2026";
const SESSION_DURATION_MS = 60 * 60 * 1000; // 1 hora

function isSessionValid(): boolean {
  const auth = sessionStorage.getItem(SITE_AUTH_KEY);
  const expiry = sessionStorage.getItem(SITE_AUTH_EXPIRY_KEY);
  if (auth === "true" && expiry) {
    return Date.now() < Number(expiry);
  }
  return false;
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSiteAuthenticated, setIsSiteAuthenticated] = useState(isSessionValid);
  const [factors, setFactors] = useState<CalculationFactors>(() => {
    const stored = localStorage.getItem(FACTORS_STORAGE_KEY);
    return stored ? { ...defaultFactors, ...JSON.parse(stored) } : defaultFactors;
  });

  // Auto-expire session after 1 hour
  useEffect(() => {
    if (!isSiteAuthenticated) return;
    const expiry = sessionStorage.getItem(SITE_AUTH_EXPIRY_KEY);
    if (!expiry) return;
    const remaining = Number(expiry) - Date.now();
    if (remaining <= 0) {
      setIsSiteAuthenticated(false);
      sessionStorage.removeItem(SITE_AUTH_KEY);
      sessionStorage.removeItem(SITE_AUTH_EXPIRY_KEY);
      return;
    }
    const timer = setTimeout(() => {
      setIsSiteAuthenticated(false);
      sessionStorage.removeItem(SITE_AUTH_KEY);
      sessionStorage.removeItem(SITE_AUTH_EXPIRY_KEY);
    }, remaining);
    return () => clearTimeout(timer);
  }, [isSiteAuthenticated]);

  useEffect(() => {
    localStorage.setItem(FACTORS_STORAGE_KEY, JSON.stringify(factors));
  }, [factors]);

  const getSitePassword = (): string => {
    return localStorage.getItem(SITE_PASSWORD_KEY) || DEFAULT_SITE_PASSWORD;
  };

  const login = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
  };

  const siteLogin = (password: string): boolean => {
    if (password === getSitePassword()) {
      setIsSiteAuthenticated(true);
      sessionStorage.setItem(SITE_AUTH_KEY, "true");
      sessionStorage.setItem(SITE_AUTH_EXPIRY_KEY, String(Date.now() + SESSION_DURATION_MS));
      return true;
    }
    return false;
  };

  const siteLogout = () => {
    setIsSiteAuthenticated(false);
    sessionStorage.removeItem(SITE_AUTH_KEY);
  };

  const changeSitePassword = (currentPassword: string, newPassword: string): boolean => {
    if (currentPassword === getSitePassword()) {
      localStorage.setItem(SITE_PASSWORD_KEY, newPassword);
      return true;
    }
    return false;
  };

  const updateFactor = (key: keyof CalculationFactors, value: number) => {
    setFactors((prev) => ({ ...prev, [key]: value }));
  };

  const resetFactors = () => {
    setFactors(defaultFactors);
    localStorage.removeItem(FACTORS_STORAGE_KEY);
  };

  return (
    <AdminContext.Provider value={{ isAdmin, login, logout, factors, updateFactor, resetFactors, isSiteAuthenticated, siteLogin, siteLogout, changeSitePassword }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within AdminProvider");
  }
  return context;
}

export { defaultFactors };
export type { CalculationFactors };

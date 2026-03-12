import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CalculationFactors {
  // ITA
  itaInternamento100: number;
  itaInternamentoApos30: number;
  itaAmbulatorio: number;
  itaLimiteDiasInternamento: number;
  itaDivisorRemuneracaoDiaria: number;
  // IPP
  ippDecretoDefault: number;
  ippMedicoDefault: number;
  // Pensão por Morte
  pensaoConjugeReforma: number;
  pensaoConjugeNormal: number;
  pensaoFilho1: number;
  pensaoFilhos2: number;
  pensaoFilhos3Mais: number;
  pensaoPais: number;
  // Subsídios
  subsidioMorteMultiplicador: number;
  subsidioFuneralMultiplicador: number;
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
  siteLogin: (password: string) => Promise<boolean>;
  siteLogout: () => void;
  changeSitePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  isLoading: boolean;
}

const AdminContext = createContext<AdminContextType | null>(null);

const ADMIN_PASSWORD = "Admin2026";
const SITE_AUTH_KEY = "nossa-seguros-site-auth";
const SITE_AUTH_EXPIRY_KEY = "nossa-seguros-site-auth-expiry";
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
  const [factors, setFactors] = useState<CalculationFactors>(defaultFactors);
  const [sitePassword, setSitePassword] = useState<string>("Nossa2026");
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from Supabase on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("app_settings")
          .select("site_password, factors")
          .eq("id", "main")
          .single();

        if (!error && data) {
          setSitePassword(data.site_password);
          if (data.factors && typeof data.factors === "object" && !Array.isArray(data.factors)) {
            setFactors({ ...defaultFactors, ...(data.factors as Partial<CalculationFactors>) });
          }
        }
      } catch (e) {
        console.error("Failed to load settings:", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, []);

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

  // Save factors to Supabase when they change
  const saveFactorsToDb = useCallback(async (newFactors: CalculationFactors) => {
    await supabase
      .from("app_settings")
      .update({ factors: JSON.parse(JSON.stringify(newFactors)), updated_at: new Date().toISOString() })
      .eq("id", "main");
  }, []);

  const login = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const logout = () => setIsAdmin(false);

  const siteLogin = async (password: string): Promise<boolean> => {
    // Re-fetch from DB to get latest password
    const { data } = await supabase
      .from("app_settings")
      .select("site_password")
      .eq("id", "main")
      .single();

    const currentPassword = data?.site_password || sitePassword;

    if (password === currentPassword) {
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
    sessionStorage.removeItem(SITE_AUTH_EXPIRY_KEY);
  };

  const changeSitePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    // Re-fetch current password from DB
    const { data } = await supabase
      .from("app_settings")
      .select("site_password")
      .eq("id", "main")
      .single();

    const dbPassword = data?.site_password || sitePassword;

    if (currentPassword === dbPassword) {
      const { error } = await supabase
        .from("app_settings")
        .update({ site_password: newPassword, updated_at: new Date().toISOString() })
        .eq("id", "main");

      if (!error) {
        setSitePassword(newPassword);
        return true;
      }
    }
    return false;
  };

  const updateFactor = (key: keyof CalculationFactors, value: number) => {
    setFactors((prev) => {
      const updated = { ...prev, [key]: value };
      saveFactorsToDb(updated);
      return updated;
    });
  };

  const resetFactors = () => {
    setFactors(defaultFactors);
    saveFactorsToDb(defaultFactors);
  };

  return (
    <AdminContext.Provider value={{ isAdmin, login, logout, factors, updateFactor, resetFactors, isSiteAuthenticated, siteLogin, siteLogout, changeSitePassword, isLoading }}>
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

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PensaoMorte } from "@/components/calculator/PensaoMorte";
import { ITACalculator } from "@/components/calculator/ITACalculator";
import { IPPCalculator } from "@/components/calculator/IPPCalculator";
import logoNossa from "@/assets/logo-nossa-seguros.png";
import { Heart, Clock, Percent } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("pensao-morte");

  return (
    <div className="min-h-screen bg-background">
      {/* Header + Hero Combined */}
      <header className="bg-gradient-to-br from-primary via-primary to-nossa-blue-light shadow-lg">
        {/* Top bar with logo - centered */}
        <div className="container mx-auto px-4 py-5">
          <div className="flex flex-col items-center gap-4">
            <div className="bg-white rounded-xl p-4 shadow-lg">
              <img
                src={logoNossa}
                alt="Nossa Seguros"
                className="h-12 md:h-14 w-auto"
              />
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2">
              <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="text-primary-foreground/90 text-sm font-medium">
                Simulador de Compensações AT
              </span>
            </div>
          </div>
        </div>

        {/* Hero content */}
        <div className="container mx-auto px-4 py-8 md:py-12 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-secondary/20 text-secondary-foreground px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
              Ferramenta de Simulação
            </div>
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-3">
              Simulador de Cálculo de Compensações
            </h1>
            <p className="text-primary-foreground/80 text-lg md:text-xl">
              Acidentes de Trabalho
            </p>
            <div className="flex items-center justify-center gap-8 mt-6 text-primary-foreground/60 text-sm">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                <span>Pensão por Morte</span>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Incapacidade Temporária</span>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <Percent className="h-4 w-4" />
                <span>Pensão por IPP</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-1 md:grid-cols-3 gap-2 bg-transparent h-auto mb-8">
            <TabsTrigger
              value="pensao-morte"
              className={`flex items-center gap-2 py-4 px-6 rounded-xl text-sm md:text-base font-medium transition-all duration-200 ${
                activeTab === "pensao-morte"
                  ? "tab-active"
                  : "tab-inactive"
              }`}
            >
              <Heart className="h-5 w-5" />
              <span>Pensão por Morte</span>
            </TabsTrigger>
            <TabsTrigger
              value="ita"
              className={`flex items-center gap-2 py-4 px-6 rounded-xl text-sm md:text-base font-medium transition-all duration-200 ${
                activeTab === "ita"
                  ? "tab-active"
                  : "tab-inactive"
              }`}
            >
              <Clock className="h-5 w-5" />
              <span>ITA (Incapacidade Temporária)</span>
            </TabsTrigger>
            <TabsTrigger
              value="ipp"
              className={`flex items-center gap-2 py-4 px-6 rounded-xl text-sm md:text-base font-medium transition-all duration-200 ${
                activeTab === "ipp"
                  ? "tab-active"
                  : "tab-inactive"
              }`}
            >
              <Percent className="h-5 w-5" />
              <span>Pensão por IPP</span>
            </TabsTrigger>
          </TabsList>

          <div className="max-w-4xl mx-auto">
            <TabsContent value="pensao-morte" className="mt-0">
              <PensaoMorte />
            </TabsContent>
            <TabsContent value="ita" className="mt-0">
              <ITACalculator />
            </TabsContent>
            <TabsContent value="ipp" className="mt-0">
              <IPPCalculator />
            </TabsContent>
          </div>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-secondary text-secondary-foreground py-8 mt-12">
        <div className="container mx-auto px-4">
          {/* Contact Information */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border-2 border-secondary-foreground/80 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium opacity-90">Contact Center</p>
                <p className="text-lg font-bold">+244 923 190 860</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border-2 border-secondary-foreground/80 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium opacity-90">E-mail</p>
                <p className="text-lg font-bold">apoioaocliente@nossaseguros.ao</p>
              </div>
            </div>
          </div>
          
          {/* Divider */}
          <div className="border-t border-secondary-foreground/30 pt-4">
            <p className="text-center text-sm opacity-80">
              © {new Date().getFullYear()} Nossa Seguros. Todos os direitos reservados.
            </p>
            <p className="text-center text-xs opacity-60 mt-1">
              Este simulador tem carácter meramente indicativo e não constitui compromisso contratual.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

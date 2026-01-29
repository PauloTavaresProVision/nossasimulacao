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
      {/* Header */}
      <header className="bg-primary shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={logoNossa}
                alt="Nossa Seguros"
                className="h-12 md:h-16 w-auto"
              />
            </div>
            <div className="hidden md:block text-right">
              <p className="text-primary-foreground/80 text-sm">
                Simulador de Cálculo
              </p>
              <p className="text-primary-foreground font-semibold">
                Compensações AT
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-primary to-nossa-blue-light py-8 md:py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl md:text-4xl font-bold text-primary-foreground mb-2">
            Simulador de Cálculo de Compensações
          </h1>
          <p className="text-primary-foreground/80 text-lg md:text-xl">
            Acidentes de Trabalho
          </p>
        </div>
      </section>

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
      <footer className="bg-primary text-primary-foreground py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm opacity-80">
            © {new Date().getFullYear()} Nossa Seguros. Todos os direitos reservados.
          </p>
          <p className="text-xs opacity-60 mt-2">
            Este simulador tem carácter meramente indicativo e não constitui compromisso contratual.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

import React, { useState, useEffect } from 'react';
import { Settings, Mail, RefreshCw, CheckCircle, Zap } from 'lucide-react';

const steps = [
  { icon: CheckCircle, text: "Preparando actualizaciones", color: "text-emerald-500" },
  { icon: Zap, text: "Optimizando rendimiento", color: "text-blue-500" },
  { icon: Settings, text: "Aplicando mejoras", color: "text-purple-500" },
  { icon: RefreshCw, text: "Verificando sistema", color: "text-orange-500" }
];

const MaintenancePage = () => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % steps.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{animationDelay: '4s'}}></div>
        </div>
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-600 rounded-xl mb-3 shadow-lg">
            <Settings className="w-6 h-6 text-white animate-spin" style={{animationDuration: '4s'}} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">MyCuento</h1>
          <span className="text-purple-200 text-base">Sistema en Mantenimiento</span>
        </div>

        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-5 text-center">
          <h2 className="text-xl font-bold text-white mb-3">
            ⚡ Actualizaciones en progreso
          </h2>
          
          <p className="text-slate-300 mb-4">
            Implementando mejoras para una mejor experiencia.
          </p>

          {/* Current Activity */}
          <div className="flex items-center justify-center space-x-3 p-3 bg-white/5 rounded-xl border border-white/10 mb-4">
            {React.createElement(steps[currentStep].icon, {
              className: `w-5 h-5 ${steps[currentStep].color} animate-pulse`
            })}
            <span className="text-white">{steps[currentStep].text}</span>
          </div>

          {/* Contact */}
          <div className="pt-3 border-t border-white/10">
            <a 
              href="mailto:support@scottsoft.uk" 
              className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <Mail className="w-4 h-4 mr-2" />
              Soporte
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-3">
          <p className="text-sm text-slate-400">
            Actualización automática activa
          </p>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
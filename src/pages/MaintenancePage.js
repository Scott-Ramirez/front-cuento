import React, { useState, useEffect } from 'react';
import { Settings, Mail, RefreshCw, CheckCircle, Zap, Wrench, Clock, AlertCircle } from 'lucide-react';

const steps = [
    { icon: CheckCircle, text: "Preparando actualizaciones", color: "text-emerald-400", bgColor: "bg-emerald-500/20" },
    { icon: Zap, text: "Optimizando rendimiento", color: "text-blue-400", bgColor: "bg-blue-500/20" },
    { icon: Settings, text: "Aplicando mejoras", color: "text-purple-400", bgColor: "bg-purple-500/20" },
    { icon: RefreshCw, text: "Verificando sistema", color: "text-orange-400", bgColor: "bg-orange-500/20" }
];

const MaintenancePage = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [maintenanceMessage, setMaintenanceMessage] = useState('Sistema en mantenimiento. Volveremos pronto.');

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentStep(prev => (prev + 1) % steps.length);
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Obtener el mensaje de mantenimiento personalizado
        const fetchMaintenanceMessage = async () => {
            try {
                const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
                const response = await fetch(`${apiUrl}/version`);
                if (response.ok) {
                    const data = await response.json();
                    console.log('Maintenance data:', data); // Debug
                    if (data.maintenanceMessage && data.maintenanceMessage.trim()) {
                        setMaintenanceMessage(data.maintenanceMessage);
                    }
                }
            } catch (error) {
                console.warn('No se pudo obtener el mensaje de mantenimiento:', error);
                // Mantener el mensaje por defecto
            }
        };

        fetchMaintenanceMessage();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Enhanced Background Animation */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -inset-10 opacity-30">
                    <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
                    <div className="absolute top-3/4 right-1/4 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                    <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-cyan-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{ animationDelay: '4s' }}></div>
                </div>
            </div>

            {/* Animated Grid Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="h-full w-full" style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                }}></div>
            </div>

            <div className="max-w-lg w-full relative z-10">
                {/* Enhanced Brand Header */}
                <div className="text-center mb-8">
                    <div className="relative inline-block mb-6">
                        <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-lg opacity-30 animate-pulse"></div>
                        <div className="relative inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-2xl">
                            <Wrench className="w-8 h-8 text-white animate-bounce" style={{ animationDuration: '2s' }} />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-3">
                        MyCuento
                    </h1>

                </div>

                {/* Enhanced Main Card */}
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                    {/* Header with Icon */}
                    <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-white/10 p-6 text-center">
                        <div className="inline-flex items-center px-4 py-2 bg-orange-500/20 border border-orange-500/30 rounded-full">
                            <AlertCircle className="w-4 h-4 text-orange-400 mr-2" />
                            <span className="text-orange-300 text-sm font-medium">Sistema en Mantenimiento</span>
                        </div>
                    </div>

                    <div className="p-6">
                        {/* Custom Message with Better Styling */}
                        <div className="relative mb-6">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-25"></div>
                            <div className="relative bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center mt-1">
                                        <Clock className="w-3 h-3 text-blue-400" />
                                    </div>
                                    <p className="text-white text-base leading-relaxed font-medium">
                                        {maintenanceMessage}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Enhanced Contact Section */}
                        <div className="pt-4 border-t border-white/10">
                            <p className="text-slate-300 text-sm mb-4 text-center">
                                ¿Necesitas asistencia inmediata?
                            </p>
                            <a
                                href="mailto:support@scottsoft.uk"
                                className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-300 text-sm font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                <Mail className="w-4 h-4 mr-2" />
                                Contactar Soporte
                            </a>
                        </div>
                    </div>
                </div>

                {/* Enhanced Footer */}
                <div className="text-center mt-6">
                    <div className="inline-flex items-center space-x-3 px-4 py-2 bg-slate-800/30 border border-slate-700/30 rounded-full backdrop-blur-sm">
                        <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                        <p className="text-sm text-slate-300">
                            Verificando estado cada 30 segundos...
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MaintenancePage;
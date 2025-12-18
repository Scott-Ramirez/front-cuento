import React, { useState, useCallback } from 'react';
import { AlertTriangle, Trash2, Eye, EyeOff, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

// Componente separado para evitar re-renderizados
const ConfirmationInput = ({ value, onChange, error }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-red-600">
        <AlertTriangle size={18} />
        <h3 className="text-sm font-semibold">Confirmación requerida</h3>
      </div>
      
      <p className="text-gray-700 text-sm">
        Para continuar, escribe exactamente <strong>"ELIMINAR"</strong> en el campo de abajo:
      </p>
      
      <div>
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder="Escribe ELIMINAR aquí"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 font-mono text-center text-sm"
          autoComplete="off"
        />
      </div>

      {error && (
        <p className="text-red-600 text-sm">{error}</p>
      )}
    </div>
  );
};

// Componente separado para la contraseña
const PasswordInput = ({ value, onChange, showPassword, onTogglePassword, loading, error }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-red-600">
        <AlertTriangle size={18} />
        <h3 className="text-sm font-semibold">Última confirmación</h3>
      </div>
      
      <p className="text-gray-700 text-sm">
        Como medida de seguridad final, ingresa tu contraseña actual:
      </p>
      
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder="Tu contraseña actual"
          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
          disabled={loading}
          autoComplete="current-password"
        />
        <button
          type="button"
          onClick={onTogglePassword}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {error && (
        <p className="text-red-600 text-sm">{error}</p>
      )}
    </div>
  );
};

const DeleteAccountForm = ({ user }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1); // 1: warning, 2: confirmation, 3: password
  const [formData, setFormData] = useState({
    confirmText: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const resetForm = () => {
    setFormData({ confirmText: '', password: '' });
    setStep(1);
    setError('');
    setShowPassword(false);
    setLoading(false);
  };

  const handleClose = () => {
    setShowModal(false);
    setTimeout(resetForm, 300); // Wait for modal close animation
  };

  const handleConfirmTextChange = useCallback((e) => {
    setFormData(prev => ({ ...prev, confirmText: e.target.value }));
  }, []);

  const handlePasswordChange = useCallback((e) => {
    setFormData(prev => ({ ...prev, password: e.target.value }));
  }, []);

  const handleTogglePassword = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const handleNextStep = useCallback(() => {
    setError('');
    if (step === 2) {
      if (formData.confirmText !== 'ELIMINAR') {
        setError('Debes escribir exactamente "ELIMINAR" para continuar');
        return;
      }
    }
    setStep(step + 1);
  }, [step, formData.confirmText]);

  const handleDeleteAccount = async () => {
    if (!formData.password.trim()) {
      setError('Debes ingresar tu contraseña actual');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.delete('/users/delete-account', {
        data: { password: formData.password }
      });

      // Show success message and logout
      alert('Tu cuenta ha sido eliminada exitosamente');
      logout();
      navigate('/');
    } catch (error) {
      setError(error.response?.data?.message || 'Error al eliminar la cuenta. Verifica tu contraseña.');
    } finally {
      setLoading(false);
    }
  };

  // Componente de paso simplificado
  const WarningStep = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-red-600">
        <AlertTriangle size={18} />
        <h3 className="text-sm font-semibold">¿Estás seguro?</h3>
      </div>
      
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
        <p className="text-red-800 font-medium text-sm">
          Esta acción eliminará permanentemente tu cuenta y todos tus datos:
        </p>
        <ul className="text-red-700 space-y-1 ml-4 list-disc text-xs">
          <li>Todos tus cuentos serán eliminados</li>
          <li>Se perderán todos tus comentarios y likes</li>
          <li>No podrás recuperar tu información</li>
          <li>Esta acción es <strong>irreversible</strong></li>
        </ul>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800 text-xs">
          💡 <strong>Alternativa:</strong> Si solo quieres tomar un descanso, 
          puedes cerrar sesión y volver cuando quieras.
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="border-l-4 border-red-500 bg-red-50 p-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="text-red-500" size={24} />
          <div>
            <h2 className="text-sm font-semibold text-red-800">
              Zona de Peligro
            </h2>
            <p className="text-red-600 text-xs mt-1">
              Las acciones en esta sección son irreversibles
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-red-200 rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Trash2 className="text-red-600" size={16} />
          <h3 className="text-sm font-semibold text-gray-900">Eliminar cuenta</h3>
        </div>
        
        <p className="text-gray-600 text-sm">
          Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, asegúrate de tu decisión.
        </p>
        
        <button
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Eliminar mi cuenta
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-base font-semibold text-gray-900">
                Eliminar cuenta - Paso {step} de 3
              </h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {step === 1 && <WarningStep />}
              {step === 2 && (
                <ConfirmationInput 
                  value={formData.confirmText}
                  onChange={handleConfirmTextChange}
                  error={error}
                />
              )}
              {step === 3 && (
                <PasswordInput
                  value={formData.password}
                  onChange={handlePasswordChange}
                  showPassword={showPassword}
                  onTogglePassword={handleTogglePassword}
                  loading={loading}
                  error={error}
                />
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col sm:flex-row gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              
              {step < 3 ? (
                <button
                  onClick={handleNextStep}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  disabled={loading}
                >
                  Continuar
                </button>
              ) : (
                <button
                  onClick={handleDeleteAccount}
                  disabled={loading || !formData.password.trim()}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Eliminar definitivamente
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeleteAccountForm;
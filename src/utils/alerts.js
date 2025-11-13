import Swal from 'sweetalert2';

// Configuración global de SweetAlert2
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  }
});

export const showSuccess = (message, title = '¡Éxito!') => {
  return Toast.fire({
    icon: 'success',
    title: title,
    text: message,
  });
};

export const showError = (message, title = 'Error') => {
  return Toast.fire({
    icon: 'error',
    title: title,
    text: message,
  });
};

export const showWarning = (message, title = 'Advertencia') => {
  return Toast.fire({
    icon: 'warning',
    title: title,
    text: message,
  });
};

export const showInfo = (message, title = 'Información') => {
  return Toast.fire({
    icon: 'info',
    title: title,
    text: message,
  });
};

export const showConfirm = (message, title = '¿Estás seguro?') => {
  return Swal.fire({
    title: title,
    text: message,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, continuar',
    cancelButtonText: 'Cancelar'
  });
};

export const showLoading = (title = 'Cargando...', text = 'Por favor espera') => {
  return Swal.fire({
    title: title,
    text: text,
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
};

export const closeLoading = () => {
  Swal.close();
};

const alerts = {
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showConfirm,
  showLoading,
  closeLoading,
};

export default alerts;

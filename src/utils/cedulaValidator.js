/**
 * Validador de Cédula Ecuatoriana para Frontend
 * Implementa el algoritmo oficial del Registro Civil del Ecuador
 * Válido para las 24 provincias de Ecuador
 */

/**
 * Códigos de provincias ecuatorianas válidos
 */
const PROVINCIAS_VALIDAS = [
  '01', '02', '03', '04', '05', '06', '07', '08', '09', '10',
  '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
  '21', '22', '23', '24', '30'
];

/**
 * Nombres de las provincias ecuatorianas
 */
const PROVINCIAS_ECUADOR = {
  '01': 'Azuay',
  '02': 'Bolívar',
  '03': 'Cañar',
  '04': 'Carchi',
  '05': 'Cotopaxi',
  '06': 'Chimborazo',
  '07': 'El Oro',
  '08': 'Esmeraldas',
  '09': 'Guayas',
  '10': 'Imbabura',
  '11': 'Loja',
  '12': 'Los Ríos',
  '13': 'Manabí',
  '14': 'Morona Santiago',
  '15': 'Napo',
  '16': 'Pastaza',
  '17': 'Pichincha',
  '18': 'Tungurahua',
  '19': 'Zamora Chinchipe',
  '20': 'Galápagos',
  '21': 'Sucumbíos',
  '22': 'Orellana',
  '23': 'Santo Domingo de los Tsáchilas',
  '24': 'Santa Elena',
  '30': 'Ecuatorianos en el exterior'
};

/**
 * Valida si una cédula ecuatoriana es válida
 * @param {string} cedula - Cédula a validar (10 dígitos)
 * @returns {Object} - { isValid: boolean, error?: string, provincia?: string }
 */
export function validarCedulaEcuatoriana(cedula) {
  // Validar que sea string y remover espacios
  if (typeof cedula !== 'string') {
    return { isValid: false, error: 'La cédula debe ser una cadena de texto' };
  }
  
  cedula = cedula.trim();
  
  // Validar longitud
  if (cedula.length !== 10) {
    return { isValid: false, error: 'La cédula debe tener exactamente 10 dígitos' };
  }
  
  // Validar que solo contenga números
  if (!/^\d{10}$/.test(cedula)) {
    return { isValid: false, error: 'La cédula solo debe contener números' };
  }
  
  // Validar provincia (primeros 2 dígitos)
  const codigoProvincia = cedula.substring(0, 2);
  
  if (!PROVINCIAS_VALIDAS.includes(codigoProvincia)) {
    return { 
      isValid: false, 
      error: `Código de provincia inválido: ${codigoProvincia}. Debe corresponder a una provincia ecuatoriana` 
    };
  }
  
  // Validar tercer dígito (debe ser menor a 6 para personas naturales)
  const tercerDigito = parseInt(cedula.charAt(2));
  if (tercerDigito >= 6) {
    return { isValid: false, error: 'El tercer dígito debe ser menor a 6 para personas naturales' };
  }
  
  // Algoritmo de validación del dígito verificador
  const digitos = cedula.split('').map(d => parseInt(d));
  const digitoVerificador = digitos[9];
  
  // Coeficientes para el algoritmo de validación
  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let suma = 0;
  
  for (let i = 0; i < 9; i++) {
    let producto = digitos[i] * coeficientes[i];
    if (producto >= 10) {
      producto = producto - 9;
    }
    suma += producto;
  }
  
  // Calcular dígito verificador esperado
  const residuo = suma % 10;
  const digitoCalculado = residuo === 0 ? 0 : 10 - residuo;
  
  if (digitoCalculado !== digitoVerificador) {
    return { 
      isValid: false, 
      error: `Cédula ecuatoriana inválida. El dígito verificador no coincide` 
    };
  }
  
  return { 
    isValid: true, 
    provincia: PROVINCIAS_ECUADOR[codigoProvincia],
    codigoProvincia: codigoProvincia
  };
}

/**
 * Función para uso con Yup validation
 * @param {string} value - Valor de la cédula
 * @returns {boolean} - true si es válida
 */
export function validarCedulaYup(value) {
  if (!value) return false;
  
  const resultado = validarCedulaEcuatoriana(value);
  return resultado.isValid;
}

/**
 * Obtener nombre de provincia por código
 * @param {string} codigo - Código de provincia
 * @returns {string} - Nombre de la provincia
 */
export function obtenerNombreProvincia(codigo) {
  return PROVINCIAS_ECUADOR[codigo] || 'Provincia desconocida';
}

/**
 * Obtener todas las provincias
 * @returns {Array} - Array con códigos y nombres de provincias
 */
export function obtenerTodasLasProvincias() {
  return Object.entries(PROVINCIAS_ECUADOR).map(([codigo, nombre]) => ({
    codigo,
    nombre
  }));
}

export default {
  validarCedulaEcuatoriana,
  validarCedulaYup,
  obtenerNombreProvincia,
  obtenerTodasLasProvincias,
  PROVINCIAS_ECUADOR
};

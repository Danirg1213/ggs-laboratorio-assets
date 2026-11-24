const tipos = {
  losa: ['Largo (m)', 'Ancho (m)', 'Espesor (cm)'],
  muro: ['Largo (m)', 'Altura (m)', 'Espesor (cm)'],
  prisma: ['Largo (m)', 'Ancho (m)', 'Altura (m)'],
  cilindro: ['Diámetro (cm)', 'Altura (m)'],
  escalera: ['Ancho (m)', 'Huella (cm)', 'Contrahuella (cm)', 'Número de peldaños'],
  tubo: ['Diámetro exterior (cm)', 'Diámetro interior (cm)', 'Largo (m)']
};

const descripciones = {
  losa: 'Losa con largo y ancho en planta y espesor vertical.',
  muro: 'Muro con largo horizontal, altura vertical y espesor entre sus caras.',
  prisma: 'Bloque rectangular con largo, ancho y altura.',
  cilindro: 'Columna con el diámetro medido por el centro de la cara circular y la altura vertical.',
  escalera: 'Escalera maciza. Mide el ancho transversal, la huella horizontal y la contrahuella vertical. Cuenta los peldaños iguales.',
  tubo: 'Tubo hueco. Mide el largo de extremo a extremo y los diámetros exterior e interior por el centro de la boca.'
};

const formulario = document.querySelector('#calculadora');
const tipo = document.querySelector('#tipo');
const dimensiones = document.querySelector('#dimensiones');
const diagrama = document.querySelector('#diagrama');
const ampliar = document.querySelector('#ampliar');
const resultado = document.querySelector('#resultado');
const error = document.querySelector('#error');
const formato = new Intl.NumberFormat('es-MX', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
const formatoPequeno = new Intl.NumberFormat('es-MX', { maximumSignificantDigits: 3 });

function mostrarVolumen(id, volumen) {
  const unidades = volumen > 0 && volumen < 0.001 ? formatoPequeno : formato;
  document.querySelector(id).textContent = unidades.format(volumen) + ' m³';
}

function mostrarCampos() {
  const elemento = tipo.value;
  const ruta = './diagrama-' + elemento + '.png';
  diagrama.src = ruta;
  ampliar.href = ruta;
  diagrama.alt = descripciones[elemento];
  const campos = tipos[elemento].map(texto => {
    const etiqueta = document.createElement('label');
    const campo = document.createElement('input');
    campo.inputMode = texto === 'Número de peldaños' ? 'numeric' : 'decimal';
    campo.required = true;
    etiqueta.append(texto, campo);
    return etiqueta;
  });
  dimensiones.replaceChildren(...campos);
}

function leerDecimal(campo) {
  const valor = campo.value.trim();
  return /^(?:\d+(?:[.,]\d+)?|[.,]\d+)$/.test(valor)
    ? Number(valor.replace(',', '.'))
    : NaN;
}

function volumenPorPieza(elemento, [primera, segunda, tercera, peldanos]) {
  switch (elemento) {
    case 'cilindro':
      return Math.PI * (primera / 200) ** 2 * segunda;
    case 'prisma':
      return primera * segunda * tercera;
    case 'escalera': {
      const sumaDeAlturas = (tercera / 100) * peldanos * (peldanos + 1) / 2;
      return primera * (segunda / 100) * sumaDeAlturas;
    }
    case 'tubo': {
      const diferenciaDeRadios = (primera - segunda) / 200;
      const sumaDeRadios = primera / 200 + segunda / 200;
      return Math.PI * diferenciaDeRadios * sumaDeRadios * tercera;
    }
    default:
      return primera * segunda * (tercera / 100);
  }
}

function ocultarResultado() {
  resultado.hidden = true;
  error.textContent = '';
}

tipo.addEventListener('change', () => {
  mostrarCampos();
  ocultarResultado();
});
formulario.addEventListener('input', ocultarResultado);
formulario.addEventListener('submit', evento => {
  evento.preventDefault();
  const medidas = [...dimensiones.querySelectorAll('input')].map(leerDecimal);
  const piezas = document.querySelector('#cantidad').valueAsNumber;
  const desperdicio = leerDecimal(document.querySelector('#desperdicio'));
  if (medidas.some(valor => !Number.isFinite(valor) || valor <= 0) ||
      !Number.isSafeInteger(piezas) || piezas < 1 ||
      !Number.isFinite(desperdicio) || desperdicio < 0) {
    error.textContent = 'Ingresa medidas mayores que cero, una cantidad entera y un porcentaje de desperdicio válido.';
    return;
  }

  if (tipo.value === 'escalera' && !Number.isSafeInteger(medidas[3])) {
    error.textContent = 'Ingresa un número entero de peldaños.';
    return;
  }
  if (tipo.value === 'tubo' && medidas[1] >= medidas[0]) {
    error.textContent = 'El diámetro interior debe ser menor que el diámetro exterior.';
    return;
  }

  const base = volumenPorPieza(tipo.value, medidas) * piezas;
  const adicional = base * (desperdicio / 100);
  const total = base + adicional;
  if (base <= 0 || !Number.isFinite(total)) {
    error.textContent = 'El volumen está fuera del rango que puede calcularse.';
    return;
  }

  mostrarVolumen('#base', base);
  mostrarVolumen('#adicional', adicional);
  mostrarVolumen('#total', total);
  resultado.hidden = false;
});

mostrarCampos();

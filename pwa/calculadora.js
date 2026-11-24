const tipos = {
  losa: ['Largo (m)', 'Ancho (m)', 'Espesor (cm)'],
  muro: ['Largo (m)', 'Altura (m)', 'Espesor (cm)'],
  prisma: ['Largo (m)', 'Ancho (m)', 'Altura (m)'],
  cilindro: ['Diámetro (cm)', 'Altura (m)']
};

const formulario = document.querySelector('#calculadora');
const tipo = document.querySelector('#tipo');
const dimensiones = document.querySelector('#dimensiones');
const resultado = document.querySelector('#resultado');
const error = document.querySelector('#error');
const formato = new Intl.NumberFormat('es-MX', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
const formatoPequeno = new Intl.NumberFormat('es-MX', { maximumSignificantDigits: 3 });

function mostrarVolumen(id, volumen) {
  const unidades = volumen > 0 && volumen < 0.001 ? formatoPequeno : formato;
  document.querySelector(id).textContent = unidades.format(volumen) + ' m³';
}

function mostrarCampos() {
  const campos = tipos[tipo.value].map(texto => {
    const etiqueta = document.createElement('label');
    const campo = document.createElement('input');
    campo.inputMode = 'decimal';
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

function volumenPorPieza(elemento, [primera, segunda, tercera]) {
  switch (elemento) {
    case 'cilindro':
      return Math.PI * (primera / 200) ** 2 * segunda;
    case 'prisma':
      return primera * segunda * tercera;
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

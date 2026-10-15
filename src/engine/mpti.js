// Motor MPTI: funciones puras, sin dependencias de React.
import {
  SJT, DISC_ITEMS, DISC_OBJETIVO, DISC_NOMBRES, IDT_ITEMS, EXP_OPCIONES,
  CATALOGO, PESOS_CARTILLA,
} from '../data/mpti-config.js';

const prom = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const r1 = (x) => Math.round(x * 10) / 10;
export const fmt = (x, d = 1) => Number(x).toFixed(d).replace('.', ',');

// ---------- Componentes ----------

export function puntajeSJT(resp = {}) {
  const vals = SJT.filter((s) => resp[s.id] !== undefined).map((s) => s.opciones[resp[s.id]].puntaje);
  return prom(vals);
}

export function perfilDISC(resp = {}) {
  const cuenta = { D: 0, I: 0, S: 0, C: 0 };
  DISC_ITEMS.forEach((it) => {
    const r = resp[it.id];
    if (!r) return;
    if (r.mas) cuenta[r.mas] += 1;
    if (r.menos) cuenta[r.menos] -= 1;
  });
  const n = DISC_ITEMS.length;
  const perfil = {};
  Object.keys(cuenta).forEach((k) => { perfil[k] = Math.round(((cuenta[k] + n) / (2 * n)) * 100); });
  return perfil;
}

export function ajusteDISC(perfil, objetivo = DISC_OBJETIVO) {
  const difs = Object.keys(objetivo).map((k) => Math.abs((perfil[k] ?? 50) - objetivo[k]));
  return Math.max(0, 100 - prom(difs));
}

export function nivelesIDT(resp = {}) {
  const niveles = {};
  IDT_ITEMS.forEach((it) => {
    if (resp[it.competencia] !== undefined) niveles[it.competencia] = it.opciones[resp[it.competencia]].nivel;
  });
  return niveles;
}

export function puntajeIDT(niveles, competencias) {
  return prom(competencias.map((c) => Math.min((niveles[c.id] ?? 1) / c.requerido, 1) * 100));
}

export function puntajeEXP(exp = {}) {
  const f = EXP_OPCIONES.formacion.find((o) => o.id === exp.formacion)?.puntaje ?? 0;
  const e = EXP_OPCIONES.experiencia.find((o) => o.id === exp.experiencia)?.puntaje ?? 0;
  const total = EXP_OPCIONES.conocimientos.length;
  const c = ((exp.conocimientos || []).length / total) * 100;
  return f * 0.3 + e * 0.4 + c * 0.3;
}

// Interpretación del factor SOC de la cartilla v1: pertenecer a un grupo con
// brecha suma; no pertenecer o no responder deja la mitad del puntaje.
// Existe solo para demostrar por qué no debe entrar al ICPC.
export function puntajeSOC(car = {}) {
  return (car.grupos || []).length > 0 ? 100 : 50;
}

// ---------- ICPC ----------

export function rango(valor, umbrales) {
  if (valor >= umbrales.alta) return 'alta';
  if (valor >= umbrales.media) return 'media';
  return 'potencial';
}

export const RANGO_TEXTO = {
  alta: 'Compatibilidad alta',
  media: 'Compatibilidad media',
  potencial: 'Potencial de desarrollo',
};

export const RECOMENDACION = {
  alta: 'Recomendado para vinculación.',
  media: 'Vinculable con un plan de inducción reforzada.',
  potencial: 'Banco de talento: reevaluar después de la formación o considerar otro cargo.',
};

function ponderar(comp, pesos) {
  const claves = Object.keys(pesos);
  const suma = claves.reduce((a, k) => a + pesos[k], 0) || 1;
  return claves.reduce((a, k) => a + pesos[k] * (comp[k] ?? 0), 0) / suma;
}

export function evaluar(candidato, cfg) {
  const niveles = nivelesIDT(candidato.idt);
  const perfil = perfilDISC(candidato.disc);
  const componentes = {
    sjt: puntajeSJT(candidato.sjt),
    idt: puntajeIDT(niveles, cfg.competencias),
    disc: ajusteDISC(perfil),
    exp: puntajeEXP(candidato.exp),
  };
  const soc = puntajeSOC(candidato.car);
  const icpc = r1(ponderar(componentes, cfg.pesos));
  const icpcCartilla = r1(ponderar({ ...componentes, soc }, PESOS_CARTILLA));
  const rg = rango(icpc, cfg.umbrales);
  return {
    componentes: Object.fromEntries(Object.entries(componentes).map(([k, v]) => [k, r1(v)])),
    soc,
    icpc,
    icpcCartilla,
    rango: rg,
    rangoCartilla: rango(icpcCartilla, cfg.umbrales),
    recomendacion: RECOMENDACION[rg],
    niveles,
    perfil,
    brechas: calcularBrechas(candidato, componentes, niveles, perfil, cfg),
  };
}

// ---------- Brechas y plan ----------

export function calcularBrechas(candidato, comp, niveles, perfil, cfg) {
  const out = [];
  cfg.competencias.forEach((c) => {
    const actual = niveles[c.id] ?? 1;
    const b = c.requerido - actual;
    if (b > 0) {
      out.push({
        clave: c.id, componente: c.nombre, actual: `Nivel ${actual}`, deseado: `Nivel ${c.requerido}`,
        brecha: `${b} ${b === 1 ? 'nivel' : 'niveles'}`, prioridad: b >= 2 ? 'Alta' : 'Media', ...CATALOGO[c.id],
      });
    }
  });
  if (comp.sjt < 70) {
    out.push({
      clave: 'sjt', componente: 'Juicio situacional', actual: `${Math.round(comp.sjt)} / 100`, deseado: '70 / 100 o más',
      brecha: `${Math.round(70 - comp.sjt)} puntos`, prioridad: comp.sjt < 50 ? 'Alta' : 'Media', ...CATALOGO.sjt,
    });
  }
  if (comp.disc < 70) {
    const dims = Object.keys(DISC_OBJETIVO).sort(
      (a, b) => Math.abs(perfil[b] - DISC_OBJETIVO[b]) - Math.abs(perfil[a] - DISC_OBJETIVO[a]),
    );
    const d = dims[0];
    out.push({
      clave: 'disc', componente: `Ajuste comportamental (${DISC_NOMBRES[d]})`,
      actual: `${perfil[d]} / 100`, deseado: `${DISC_OBJETIVO[d]} / 100`,
      brecha: `${Math.abs(perfil[d] - DISC_OBJETIVO[d])} puntos`, prioridad: 'Baja', ...CATALOGO.disc,
    });
  }
  const tiene = candidato.exp?.conocimientos || [];
  EXP_OPCIONES.conocimientos.forEach((k) => {
    if (!tiene.includes(k.id)) {
      out.push({
        clave: k.id, componente: k.texto, actual: 'Sin experiencia declarada', deseado: 'Dominio básico',
        brecha: 'Conocimiento nuevo', prioridad: 'Media', ...CATALOGO[k.id],
      });
    }
  });
  if (candidato.exp?.experiencia === '0-6') {
    out.push({
      clave: 'experiencia', componente: 'Experiencia en el rol', actual: 'Menos de 6 meses', deseado: '6 meses a 1 año',
      brecha: 'Curva de aprendizaje', prioridad: 'Media', ...CATALOGO.experiencia,
    });
  }
  const orden = { Alta: 0, Media: 1, Baja: 2 };
  return out.sort((a, b) => orden[a.prioridad] - orden[b.prioridad]);
}

export function redactarPlan(nombre, ev) {
  const quien = nombre?.trim() || 'La persona evaluada';
  if (!ev.brechas.length) {
    return [`${quien} cumple el nivel requerido en todos los componentes evaluados. Se sugiere la inducción estándar del cargo.`];
  }
  const altas = ev.brechas.filter((b) => b.prioridad === 'Alta');
  const resto = ev.brechas.filter((b) => b.prioridad !== 'Alta');
  const p = [];
  const fuertes = Object.entries(ev.componentes).filter(([, v]) => v >= 80).length;
  p.push(`${quien} obtuvo un ICPC de ${fmt(ev.icpc)} (${RANGO_TEXTO[ev.rango].toLowerCase()}). ${fuertes ? `Tiene ${fuertes} ${fuertes === 1 ? 'componente' : 'componentes'} en 80 o más.` : ''} ${ev.recomendacion}`.replace(/\s+/g, ' ').trim());
  if (altas.length) {
    p.push(`Prioridad alta, durante el primer mes: ${altas.map((b) => `${b.accion.toLowerCase()} (${b.duracion}) para ${b.componente.toLowerCase()}`).join('; ')}.`);
  }
  if (resto.length) {
    p.push(`Después: ${resto.map((b) => `${b.accion.toLowerCase()} (${b.duracion})`).join('; ')}.`);
  }
  p.push('Se recomienda reevaluar el ICPC al terminar la ruta para medir el avance.');
  return p;
}

// ---------- Auditoría de equidad ----------

export const ATRIBUTOS = {
  genero: 'Género',
  edad: 'Rango de edad',
  grupo: 'Grupo con brecha',
  municipio: 'Municipio',
};

export function valorAtributo(car = {}, atributo) {
  if (atributo === 'grupo') {
    if (car.grupoNoResponde) return 'Prefiero no responder';
    return (car.grupos || []).length ? 'Pertenece a un grupo' : 'Ninguno';
  }
  return car[atributo] || 'Prefiero no responder';
}

export const MIN_N = 30;

// Regla de los cuatro quintos: la tasa de compatibilidad alta del grupo con
// menor tasa debe ser al menos el 80% de la del grupo con mayor tasa.
export function auditar(evaluados, atributo, modo) {
  const grupos = {};
  evaluados.forEach(({ candidato, ev }) => {
    const g = valorAtributo(candidato.car, atributo);
    const valor = modo === 'cartilla' ? ev.icpcCartilla : ev.icpc;
    const rg = modo === 'cartilla' ? ev.rangoCartilla : ev.rango;
    grupos[g] = grupos[g] || { grupo: g, n: 0, altas: 0, suma: 0 };
    grupos[g].n += 1;
    grupos[g].suma += valor;
    if (rg === 'alta') grupos[g].altas += 1;
  });
  const filas = Object.values(grupos)
    .map((g) => ({ grupo: g.grupo, n: g.n, tasa: g.altas / g.n, promedio: r1(g.suma / g.n) }))
    .sort((a, b) => b.n - a.n);
  const validas = filas.filter((f) => f.n >= MIN_N);
  let razon = 1;
  let pValor = 1;
  if (validas.length >= 2) {
    const alto = validas.reduce((a, b) => (b.tasa > a.tasa ? b : a));
    const bajo = validas.reduce((a, b) => (b.tasa < a.tasa ? b : a));
    razon = alto.tasa > 0 ? bajo.tasa / alto.tasa : 1;
    pValor = pruebaProporciones(alto, bajo);
  }
  const proms = validas.map((f) => f.promedio);
  const brechaProm = validas.length >= 2 ? r1(Math.max(...proms) - Math.min(...proms)) : 0;
  // Se alerta solo si la diferencia supera la regla de los cuatro quintos
  // y además es estadísticamente significativa (no es ruido de muestra).
  const alerta = razon < 0.8 && pValor < 0.05;
  return { filas, razon: Math.round(razon * 100) / 100, pValor: Math.round(pValor * 1000) / 1000, alerta, brechaProm };
}

// Prueba z de dos proporciones (bilateral).
function pruebaProporciones(a, b) {
  const x1 = a.tasa * a.n;
  const x2 = b.tasa * b.n;
  const p = (x1 + x2) / (a.n + b.n);
  const se = Math.sqrt(p * (1 - p) * (1 / a.n + 1 / b.n));
  if (!se) return 1;
  const z = Math.abs(a.tasa - b.tasa) / se;
  return 2 * (1 - normalCDF(z));
}

function normalCDF(z) {
  const t = 1 / (1 + 0.2316419 * z);
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const q = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return 1 - q;
}

// Candidatos sintéticos para la demostración. La habilidad de cada persona se
// genera de forma independiente de sus datos demográficos, como debería ser
// en una población real: cualquier diferencia entre grupos en el ICPC
// proviene de la fórmula, no de las personas.
import { SJT, DISC_ITEMS, IDT_ITEMS, EXP_OPCIONES, CARACTERIZACION } from '../data/mpti-config.js';

function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const elegir = (rnd, xs, pesos) => {
  if (!pesos) return xs[Math.floor(rnd() * xs.length)];
  const total = pesos.reduce((a, b) => a + b, 0);
  let u = rnd() * total;
  for (let i = 0; i < xs.length; i += 1) { u -= pesos[i]; if (u <= 0) return xs[i]; }
  return xs[xs.length - 1];
};

export function generarSinteticos(n = 400, semilla = 123) {
  const rnd = mulberry32(semilla);
  const lista = [];
  for (let i = 0; i < n; i += 1) {
    const habilidad = Math.min(1, Math.max(0, 0.45 + (rnd() + rnd() + rnd() - 1.5) * 0.8));

    const sjt = {};
    SJT.forEach((s) => {
      const orden = s.opciones.map((o, idx) => idx).sort((a, b) => s.opciones[b].puntaje - s.opciones[a].puntaje);
      sjt[s.id] = rnd() < 0.25 + habilidad * 0.7 ? orden[0] : elegir(rnd, orden.slice(1));
    });

    const idt = {};
    IDT_ITEMS.forEach((it) => {
      const u = rnd();
      idt[it.competencia] = u < habilidad * 0.8 ? 2 : u < 0.4 + habilidad * 0.5 ? 1 : 0;
    });

    const disc = {};
    DISC_ITEMS.forEach((it) => {
      const dims = it.palabras.map((p) => p[1]);
      const sesgo = ['S', 'C', 'I', 'D'];
      const mas = rnd() < habilidad * 0.6 ? elegir(rnd, sesgo.slice(0, 3)) : elegir(rnd, dims);
      const menos = elegir(rnd, dims.filter((d) => d !== mas));
      disc[it.id] = { mas, menos };
    });

    const conocimientos = EXP_OPCIONES.conocimientos.filter(() => rnd() < 0.35 + habilidad * 0.5).map((k) => k.id);
    const exp = {
      formacion: elegir(rnd, ['bachiller', 'tecnico', 'profesional'], [5, 4, 1]),
      experiencia: elegir(rnd, ['0-6', '6-12', '1-3', '3+'], [2, 3, 3, 1]),
      conocimientos,
    };

    const noResponde = rnd() < 0.08;
    const grupos = noResponde ? [] : CARACTERIZACION.grupos.filter(() => rnd() < 0.065);
    const car = {
      genero: elegir(rnd, CARACTERIZACION.genero, [52, 44, 1, 3]),
      edad: elegir(rnd, CARACTERIZACION.edad, [45, 38, 14, 3]),
      municipio: elegir(rnd, CARACTERIZACION.municipio, [50, 30, 17, 3]),
      grupos,
      grupoNoResponde: noResponde,
      desplazamiento: elegir(rnd, ['Menos de 30 min', '30 a 60 min', 'Más de 60 min']),
    };

    lista.push({
      id: `C-${String(i + 1).padStart(4, '0')}`,
      nombre: `Candidato sintético ${i + 1}`,
      sintetico: true,
      fecha: '2026-10-01',
      sjt, idt, disc, exp, car,
    });
  }
  return lista;
}

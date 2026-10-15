import { evaluar, auditar } from './mpti.js';
import { generarSinteticos } from './sinteticos.js';
import { RESPUESTAS_GEMELOS } from './gemelos.js';
import { COMPETENCIAS, PESOS_MPTI, UMBRALES } from '../data/mpti-config.js';

const cfg = { competencias: COMPETENCIAS, pesos: PESOS_MPTI, umbrales: UMBRALES };
const a = evaluar({ ...RESPUESTAS_GEMELOS, car: { genero: 'Hombre', edad: '18 a 28', grupos: [] } }, cfg);
const b = evaluar({ ...RESPUESTAS_GEMELOS, car: { genero: 'Mujer', edad: '29 a 45', grupos: ['Madre o padre cabeza de hogar'] } }, cfg);
console.log('A', a.componentes, a.icpc, a.rango, '| cartilla', a.icpcCartilla, a.rangoCartilla);
console.log('B', b.icpc, b.rango, '| cartilla', b.icpcCartilla, b.rangoCartilla);
if (a.icpc !== b.icpc) throw new Error('El ICPC corregido debe ser igual para los gemelos');

const ev = generarSinteticos().map((c) => ({ candidato: c, ev: evaluar(c, cfg) }));
const cuenta = { alta: 0, media: 0, potencial: 0 };
ev.forEach((x) => { cuenta[x.ev.rango] += 1; });
console.log('Rangos', cuenta);
for (const at of ['genero', 'edad', 'grupo', 'municipio']) {
  const m = auditar(ev, at, 'mpti'); const c = auditar(ev, at, 'cartilla');
  console.log(at, 'MPTI', m.razon, m.pValor, m.alerta, m.brechaProm, '| cartilla', c.razon, c.pValor, c.alerta, c.brechaProm);
}
console.log('Plan ejemplo brechas', a.brechas.length);
console.log('OK');

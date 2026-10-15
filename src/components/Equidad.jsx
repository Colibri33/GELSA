import { useEffect, useRef, useState } from 'react';
import { CARACTERIZACION } from '../data/mpti-config.js';
import { evaluar, auditar, ATRIBUTOS, RANGO_TEXTO, MIN_N, fmt } from '../engine/mpti.js';
import { RESPUESTAS_GEMELOS } from '../engine/gemelos.js';

const GRUPO_OPC = ['Ninguno', ...CARACTERIZACION.grupos, 'Prefiero no responder'];
const aCar = (p) => ({
  genero: p.genero,
  edad: p.edad,
  grupos: p.grupo === 'Ninguno' || p.grupo === 'Prefiero no responder' ? [] : [p.grupo],
  grupoNoResponde: p.grupo === 'Prefiero no responder',
});

function useAnimado(objetivo) {
  const [valor, setValor] = useState(objetivo);
  const desde = useRef(objetivo);
  useEffect(() => {
    const reducido = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reducido) { setValor(objetivo); desde.current = objetivo; return undefined; }
    const inicio = performance.now();
    const de = desde.current;
    let id;
    const paso = (t) => {
      const k = Math.min(1, (t - inicio) / 600);
      const e = 1 - (1 - k) ** 3;
      setValor(de + (objetivo - de) * e);
      if (k < 1) id = requestAnimationFrame(paso); else desde.current = objetivo;
    };
    id = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(id);
  }, [objetivo]);
  return fmt(valor);
}

function Selector({ valor, opciones, onCambiar, nombre }) {
  return (
    <div className="segmentado" role="radiogroup" aria-label={nombre}>
      {opciones.map(([id, texto]) => (
        <button key={id} role="radio" aria-checked={valor === id} className={valor === id ? 'seg activo' : 'seg'} onClick={() => onCambiar(id)}>{texto}</button>
      ))}
    </div>
  );
}

const MODOS = [['cartilla', 'Fórmula de la cartilla (con SOC)'], ['mpti', 'MPTI corregido (sin SOC)']];

function Gemelo({ letra, p, setP, ev, modo }) {
  const valor = modo === 'cartilla' ? ev.icpcCartilla : ev.icpc;
  const rg = modo === 'cartilla' ? ev.rangoCartilla : ev.rango;
  const animado = useAnimado(valor);
  return (
    <div className={`gemelo ${rg}`}>
      <p className="gemelo-titulo">Persona {letra}</p>
      <div className="gemelo-campos">
        <label className="campo compacto"><span>Género</span>
          <select value={p.genero} onChange={(e) => setP({ ...p, genero: e.target.value })}>{CARACTERIZACION.genero.map((g) => <option key={g}>{g}</option>)}</select>
        </label>
        <label className="campo compacto"><span>Edad</span>
          <select value={p.edad} onChange={(e) => setP({ ...p, edad: e.target.value })}>{CARACTERIZACION.edad.map((g) => <option key={g}>{g}</option>)}</select>
        </label>
        <label className="campo compacto"><span>Grupo con brecha</span>
          <select value={p.grupo} onChange={(e) => setP({ ...p, grupo: e.target.value })}>{GRUPO_OPC.map((g) => <option key={g}>{g}</option>)}</select>
        </label>
      </div>
      <p className="gemelo-num" aria-live="polite">{animado}</p>
      <p className="gemelo-rango">{RANGO_TEXTO[rg]}</p>
    </div>
  );
}

export default function Equidad({ evaluados, cfg }) {
  const [modo, setModo] = useState('cartilla');
  const [a, setA] = useState({ genero: 'Hombre', edad: '18 a 28', grupo: 'Ninguno' });
  const [b, setB] = useState({ genero: 'Mujer', edad: '29 a 45', grupo: 'Madre o padre cabeza de hogar' });
  const evA = evaluar({ ...RESPUESTAS_GEMELOS, car: aCar(a) }, cfg);
  const evB = evaluar({ ...RESPUESTAS_GEMELOS, car: aCar(b) }, cfg);
  const vA = modo === 'cartilla' ? evA.icpcCartilla : evA.icpc;
  const vB = modo === 'cartilla' ? evB.icpcCartilla : evB.icpc;
  const rA = modo === 'cartilla' ? evA.rangoCartilla : evA.rango;
  const rB = modo === 'cartilla' ? evB.rangoCartilla : evB.rango;
  const dif = fmt(Math.abs(vA - vB));
  const noResponde = [a, b].some((p) => p.grupo === 'Prefiero no responder');

  const [modoAud, setModoAud] = useState('cartilla');
  const [atributo, setAtributo] = useState('grupo');
  const aud = auditar(evaluados, atributo, modoAud);

  return (
    <section className="equidad">
      <h1>Prueba de gemelos</h1>
      <p className="texto">
        Las dos personas dieron exactamente las mismas respuestas en todas las pruebas. Solo cambian sus datos
        demográficos. Un modelo justo les debe dar el mismo puntaje.
      </p>

      <Selector valor={modo} opciones={MODOS} onCambiar={setModo} nombre="Fórmula" />

      <div className="gemelos">
        <Gemelo letra="A" p={a} setP={setA} ev={evA} modo={modo} />
        <Gemelo letra="B" p={b} setP={setB} ev={evB} modo={modo} />
      </div>

      <div className={`mensaje-gemelos ${vA === vB ? 'ok' : 'alerta'}`} aria-live="polite">
        {vA === vB ? (
          <p>Mismas respuestas, mismo puntaje. Los datos demográficos no cambian el resultado.</p>
        ) : (
          <>
            <p>Mismas respuestas y {dif} puntos de diferencia, causados solo por los datos demográficos.</p>
            {rA !== rB && (
              <p>
                La persona {vA > vB ? 'A' : 'B'} queda en {RANGO_TEXTO[vA > vB ? rA : rB].toLowerCase()} y la persona {vA > vB ? 'B' : 'A'} en{' '}
                {RANGO_TEXTO[vA > vB ? rB : rA].toLowerCase()}: la fórmula cambia la recomendación.
              </p>
            )}
            {noResponde && <p>Quien elige no responder pierde puntos, lo que contradice el principio de voluntariedad de la Ley 1581.</p>}
          </>
        )}
      </div>

      <h2 className="subtitulo">Auditoría por grupos</h2>
      <p className="texto">
        Compara, sobre los {evaluados.length} candidatos, qué proporción de cada grupo queda en compatibilidad alta. Se
        aplica la regla de los cuatro quintos: la tasa más baja debe ser al menos el 80% de la más alta. Solo se alerta si
        la diferencia además es estadísticamente significativa, para no confundir ruido de muestra con sesgo.
      </p>

      <div className="aud-controles">
        <Selector valor={modoAud} opciones={MODOS} onCambiar={setModoAud} nombre="Fórmula auditada" />
        <label className="campo compacto"><span>Comparar por</span>
          <select value={atributo} onChange={(e) => setAtributo(e.target.value)}>
            {Object.entries(ATRIBUTOS).map(([k, t]) => <option key={k} value={k}>{t}</option>)}
          </select>
        </label>
      </div>

      <div className={`aud-veredicto ${aud.alerta ? 'alerta' : 'ok'}`}>
        <p className="aud-razon">{fmt(aud.razon, 2)}</p>
        <div>
          <p className="aud-titulo">{aud.alerta ? 'Posible sesgo detectado' : 'Sin sesgo detectado'}</p>
          <p>
            Razón entre la tasa más baja y la más alta (mínimo aceptable: 0,80). Valor p: {fmt(aud.pValor, 3)}. Diferencia de
            ICPC promedio entre grupos: {fmt(aud.brechaProm)} puntos.
          </p>
          {!aud.alerta && aud.razon < 0.8 && (
            <p>La razón está por debajo de 0,80, pero la diferencia no es estadísticamente significativa: es variación normal de la muestra.</p>
          )}
        </div>
      </div>

      <div className="tabla-scroll">
        <table className="tabla">
          <thead><tr><th>Grupo</th><th>Personas</th><th>Compatibilidad alta</th><th>ICPC promedio</th></tr></thead>
          <tbody>
            {aud.filas.map((f) => (
              <tr key={f.grupo} className={f.n < MIN_N ? 'tenue' : ''}>
                <td>{f.grupo}{f.n < MIN_N && <span className="duracion"> (muestra pequeña, no se compara)</span>}</td>
                <td className="numero">{f.n}</td>
                <td>
                  <div className="tasa">
                    <div className="barra"><div className="barra-relleno" style={{ width: `${f.tasa * 100}%` }} /></div>
                    <span className="numero">{Math.round(f.tasa * 100)}%</span>
                  </div>
                </td>
                <td className="numero">{fmt(f.promedio)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

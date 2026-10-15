import { COMPONENTES, DISC_NOMBRES, DISC_OBJETIVO } from '../data/mpti-config.js';
import { RANGO_TEXTO, redactarPlan, fmt } from '../engine/mpti.js';

export const DECISIONES = {
  vincular: 'Vincular',
  induccion: 'Vincular con plan de inducción',
  banco: 'Enviar a banco de talento',
  descartar: 'No continuar en el proceso',
};

export default function Resultado({ candidato, ev, decision, onDecidir, onVolver }) {
  const plan = redactarPlan(candidato.sintetico ? null : candidato.nombre, ev);
  return (
    <section className="resultado">
      <button className="enlace volver" onClick={onVolver}>Volver a la lista</button>

      <div className={`veredicto ${ev.rango}`}>
        <div>
          <p className="codigo">{candidato.id}{candidato.sintetico ? ' (sintético)' : ` | ${candidato.nombre}`}</p>
          <p className="icpc-grande">{fmt(ev.icpc)}</p>
          <p className="icpc-etiqueta">Índice de Compatibilidad Persona-Cargo</p>
        </div>
        <div className="veredicto-texto">
          <p className="rango-nombre">{RANGO_TEXTO[ev.rango]}</p>
          <p>{ev.recomendacion}</p>
        </div>
      </div>

      <div className="rejilla-2">
        <div className="panel">
          <h2>Componentes</h2>
          {Object.entries(ev.componentes).map(([k, v]) => (
            <div key={k} className="barra-fila">
              <div className="barra-etiqueta"><span>{COMPONENTES[k]}</span><strong>{Math.round(v)}</strong></div>
              <div className="barra"><div className="barra-relleno" style={{ width: `${v}%` }} /></div>
            </div>
          ))}
          <p className="nota">Los datos de caracterización no se muestran aquí ni entran al cálculo.</p>
        </div>

        <div className="panel">
          <h2>Estilo de trabajo frente al cargo</h2>
          {Object.keys(DISC_OBJETIVO).map((k) => (
            <div key={k} className="disc-fila">
              <span className="disc-letra">{k}</span>
              <div className="disc-pista" aria-label={`${DISC_NOMBRES[k]}: persona ${ev.perfil[k]}, cargo ${DISC_OBJETIVO[k]}`}>
                <div className="disc-persona" style={{ width: `${ev.perfil[k]}%` }} />
                <div className="disc-objetivo" style={{ left: `${DISC_OBJETIVO[k]}%` }} />
              </div>
              <span className="disc-nombre">{DISC_NOMBRES[k]}</span>
            </div>
          ))}
          <p className="nota">La barra es el perfil de la persona y la marca vertical es el perfil que pide el cargo. DISC describe tendencias, no descarta.</p>
        </div>
      </div>

      <div className="panel">
        <h2>Tabla de brechas</h2>
        {ev.brechas.length === 0 ? (
          <p className="texto">No hay brechas frente al perfil del cargo.</p>
        ) : (
          <div className="tabla-scroll">
            <table className="tabla">
              <thead>
                <tr><th>Componente</th><th>Actual</th><th>Deseado</th><th>Brecha</th><th>Prioridad</th><th>Acción sugerida</th></tr>
              </thead>
              <tbody>
                {ev.brechas.map((b) => (
                  <tr key={b.clave}>
                    <td>{b.componente}</td><td>{b.actual}</td><td>{b.deseado}</td><td>{b.brecha}</td>
                    <td><span className={`prioridad ${b.prioridad.toLowerCase()}`}>{b.prioridad}</span></td>
                    <td>{b.accion} <span className="duracion">({b.duracion})</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="panel">
        <h2>Plan de desarrollo sugerido</h2>
        {plan.map((p, i) => <p key={i} className="texto">{p}</p>)}
      </div>

      <div className="panel decision">
        <h2>Decisión de Gestión Humana</h2>
        <p className="texto">El sistema recomienda; la persona responsable decide y registra su criterio.</p>
        <div className="opciones">
          {Object.entries(DECISIONES).map(([k, t]) => (
            <button key={k} aria-pressed={decision === k} className={decision === k ? 'opcion elegida' : 'opcion'} onClick={() => onDecidir(k)}>{t}</button>
          ))}
        </div>
        {decision && <p className="confirmacion">Decisión registrada: {DECISIONES[decision]}.</p>}
      </div>
    </section>
  );
}

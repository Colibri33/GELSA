import { useState } from 'react';
import { RANGO_TEXTO, fmt } from '../engine/mpti.js';
import { DECISIONES } from './Resultado.jsx';

const FILTROS = ['todos', 'alta', 'media', 'potencial'];

export default function GestionHumana({ evaluados, decisiones, onAbrir }) {
  const [filtro, setFiltro] = useState('todos');
  const [soloApp, setSoloApp] = useState(false);
  const [limite, setLimite] = useState(25);

  const base = soloApp ? evaluados.filter((x) => !x.candidato.sintetico) : evaluados;
  const cuenta = { alta: 0, media: 0, potencial: 0 };
  base.forEach((x) => { cuenta[x.ev.rango] += 1; });
  const lista = base
    .filter((x) => filtro === 'todos' || x.ev.rango === filtro)
    .sort((a, b) => (a.candidato.sintetico === b.candidato.sintetico ? b.ev.icpc - a.ev.icpc : a.candidato.sintetico ? 1 : -1));

  return (
    <section>
      <div className="titulo-seccion">
        <h1>Candidatos para Asesor Comercial</h1>
        <label className="check">
          <input type="checkbox" checked={soloApp} onChange={(e) => setSoloApp(e.target.checked)} />
          <span>Ver solo los evaluados en la app</span>
        </label>
      </div>

      <div className="resumen">
        {['alta', 'media', 'potencial'].map((r) => (
          <div key={r} className={`resumen-item ${r}`}>
            <span className="resumen-num">{cuenta[r]}</span>
            <span>{RANGO_TEXTO[r]}</span>
          </div>
        ))}
      </div>

      <p className="texto nota">
        Revisión ciega: esta lista muestra códigos en lugar de nombres y no incluye datos de caracterización, para que la
        primera lectura se base solo en lo que la persona demostró.
      </p>

      <div className="filtros" role="group" aria-label="Filtrar por rango">
        {FILTROS.map((f) => (
          <button key={f} aria-pressed={filtro === f} className={filtro === f ? 'filtro activo' : 'filtro'} onClick={() => { setFiltro(f); setLimite(25); }}>
            {f === 'todos' ? 'Todos' : RANGO_TEXTO[f]}
          </button>
        ))}
      </div>

      {lista.length === 0 ? (
        <div className="panel vacio">
          <p className="texto">Aún no hay candidatos en esta vista. Evalúa a alguien desde la pestaña Evaluar candidato.</p>
        </div>
      ) : (
        <div className="tabla-scroll">
          <table className="tabla lista-candidatos">
            <thead>
              <tr><th>Código</th><th>ICPC</th><th>Rango</th><th>Brechas</th><th>Decisión</th></tr>
            </thead>
            <tbody>
              {lista.slice(0, limite).map(({ candidato, ev }) => (
                <tr key={candidato.id} onClick={() => onAbrir(candidato.id)} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onAbrir(candidato.id)}>
                  <td>{candidato.id}{!candidato.sintetico && <span className="nuevo">Evaluado en la app</span>}</td>
                  <td className="numero">{fmt(ev.icpc)}</td>
                  <td><span className={`rango-pill ${ev.rango}`}>{RANGO_TEXTO[ev.rango]}</span></td>
                  <td className="numero">{ev.brechas.length}</td>
                  <td>{decisiones[candidato.id] ? DECISIONES[decisiones[candidato.id]] : <span className="pendiente">Pendiente</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {lista.length > limite && (
        <button className="boton secundario mas" onClick={() => setLimite(limite + 50)}>Mostrar más ({lista.length - limite} restantes)</button>
      )}
    </section>
  );
}

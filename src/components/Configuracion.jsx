import { COMPONENTES } from '../data/mpti-config.js';

export default function Configuracion({ cfg, onCambiar, onReiniciar, defecto }) {
  const suma = Object.values(cfg.pesos).reduce((a, b) => a + b, 0);
  const setPeso = (k, v) => onCambiar({ ...cfg, pesos: { ...cfg.pesos, [k]: Math.max(0, Number(v) || 0) } });
  const setUmbral = (k, v) => onCambiar({ ...cfg, umbrales: { ...cfg.umbrales, [k]: Math.min(100, Math.max(0, Number(v) || 0)) } });
  const setNivel = (id, v) => onCambiar({ ...cfg, competencias: cfg.competencias.map((c) => (c.id === id ? { ...c, requerido: Number(v) } : c)) });

  return (
    <section className="config">
      <h1>Configuración del cargo</h1>
      <p className="texto aviso">
        Valores provisionales hasta que el equipo los valide con Gestión Humana de GELSA. Los cambios se aplican de inmediato a
        todos los candidatos.
      </p>

      <div className="rejilla-2">
        <div className="panel">
          <h2>Pesos del ICPC</h2>
          {Object.keys(cfg.pesos).map((k) => (
            <label key={k} className="peso">
              <span>{COMPONENTES[k]}</span>
              <input type="range" min="0" max="60" value={cfg.pesos[k]} onChange={(e) => setPeso(k, e.target.value)} />
              <span className="numero">{suma ? Math.round((cfg.pesos[k] / suma) * 100) : 0}%</span>
            </label>
          ))}
          <p className="nota">Los pesos se normalizan para sumar 100%. El factor sociodemográfico no está disponible: esos datos solo se usan para auditar.</p>
        </div>

        <div className="panel">
          <h2>Rangos de compatibilidad</h2>
          <label className="campo"><span>Compatibilidad alta desde</span>
            <input type="number" min="0" max="100" value={cfg.umbrales.alta} onChange={(e) => setUmbral('alta', e.target.value)} />
          </label>
          <label className="campo"><span>Compatibilidad media desde</span>
            <input type="number" min="0" max="100" value={cfg.umbrales.media} onChange={(e) => setUmbral('media', e.target.value)} />
          </label>
          <p className="nota">Por debajo del segundo valor, la persona queda en potencial de desarrollo.</p>
        </div>
      </div>

      <div className="panel">
        <h2>Nivel requerido por competencia</h2>
        <div className="niveles">
          {cfg.competencias.map((c) => (
            <label key={c.id} className="campo compacto">
              <span>{c.nombre}</span>
              <select value={c.requerido} onChange={(e) => setNivel(c.id, e.target.value)}>
                {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>Nivel {n}</option>)}
              </select>
            </label>
          ))}
        </div>
      </div>

      <div className="acciones-paso">
        <button className="boton secundario" onClick={() => onCambiar(defecto)}>Restaurar valores iniciales</button>
        <button className="boton peligro" onClick={onReiniciar}>Borrar candidatos evaluados y decisiones</button>
      </div>
    </section>
  );
}

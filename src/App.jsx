import { useMemo, useState } from 'react';
import { CARGO, COMPETENCIAS, PESOS_MPTI, UMBRALES } from './data/mpti-config.js';
import { evaluar } from './engine/mpti.js';
import { generarSinteticos } from './engine/sinteticos.js';
import { leer, guardar, borrarTodo } from './store.js';
import Evaluar from './components/Evaluar.jsx';
import Resultado from './components/Resultado.jsx';
import GestionHumana from './components/GestionHumana.jsx';
import Equidad from './components/Equidad.jsx';
import Configuracion from './components/Configuracion.jsx';
import Arcos from './components/Arcos.jsx';

const CFG_DEFECTO = { pesos: PESOS_MPTI, umbrales: UMBRALES, competencias: COMPETENCIAS };
const SINTETICOS = generarSinteticos();

const VISTAS = [
  { id: 'evaluar', nombre: 'Evaluar candidato' },
  { id: 'gh', nombre: 'Gestión Humana' },
  { id: 'equidad', nombre: 'Equidad' },
  { id: 'config', nombre: 'Configuración' },
];

export default function App() {
  const [vista, setVista] = useState('evaluar');
  const [cfg, setCfg] = useState(() => leer('cfg', CFG_DEFECTO));
  const [locales, setLocales] = useState(() => leer('candidatos', []));
  const [decisiones, setDecisiones] = useState(() => leer('decisiones', {}));
  const [seleccion, setSeleccion] = useState(null);

  const evaluados = useMemo(
    () => [...locales, ...SINTETICOS].map((c) => ({ candidato: c, ev: evaluar(c, cfg) })),
    [locales, cfg],
  );

  const actualizarCfg = (nuevo) => { setCfg(nuevo); guardar('cfg', nuevo); };

  const agregarCandidato = (c) => {
    const id = `L-${String(locales.length + 1).padStart(3, '0')}`;
    const nuevo = { ...c, id, fecha: new Date().toISOString().slice(0, 10) };
    const lista = [nuevo, ...locales];
    setLocales(lista);
    guardar('candidatos', lista);
    setSeleccion(id);
    setVista('gh');
    window.scrollTo(0, 0);
  };

  const decidir = (id, decision) => {
    const d = { ...decisiones, [id]: decision };
    setDecisiones(d);
    guardar('decisiones', d);
  };

  const reiniciar = () => {
    borrarTodo();
    setCfg(CFG_DEFECTO);
    setLocales([]);
    setDecisiones({});
    setSeleccion(null);
  };

  const elegido = seleccion && evaluados.find((x) => x.candidato.id === seleccion);

  return (
    <div className="app">
      <header className="cabecera">
        <div className="cabecera-interna">
          <a className="marca" href="/" aria-label="MPTI, inicio">
            <img src="/logo-gelsa.png" alt="Grupo Gelsa" className="logo" />
          </a>
          <nav className="pestanas" aria-label="Secciones">
            {VISTAS.map((v) => (
              <button
                key={v.id}
                className={vista === v.id ? 'pestana activa' : 'pestana'}
                aria-current={vista === v.id ? 'page' : undefined}
                onClick={() => { setVista(v.id); setSeleccion(null); window.scrollTo(0, 0); }}
              >
                {v.nombre}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <section className="banda">
        <div className="banda-interna">
          <div>
            <p className="banda-sigla">MPTI</p>
            <p className="banda-titulo">Modelo Predictivo de Talento Inclusivo</p>
            <p className="banda-cargo">Cargo: {CARGO.nombre}</p>
          </div>
          <Arcos className="banda-arcos" />
        </div>
      </section>

      <main className="contenido">
        {vista === 'evaluar' && <Evaluar onTerminar={agregarCandidato} />}
        {vista === 'gh' && !elegido && (
          <GestionHumana evaluados={evaluados} decisiones={decisiones} onAbrir={(id) => { setSeleccion(id); window.scrollTo(0, 0); }} />
        )}
        {vista === 'gh' && elegido && (
          <Resultado
            candidato={elegido.candidato}
            ev={elegido.ev}
            decision={decisiones[elegido.candidato.id]}
            onDecidir={(d) => decidir(elegido.candidato.id, d)}
            onVolver={() => setSeleccion(null)}
          />
        )}
        {vista === 'equidad' && <Equidad evaluados={evaluados} cfg={cfg} />}
        {vista === 'config' && <Configuracion cfg={cfg} onCambiar={actualizarCfg} onReiniciar={reiniciar} defecto={CFG_DEFECTO} />}
      </main>

      <footer className="pie">
        <p>
          Prototipo demostrativo del reto GELSA. Los contenidos de las pruebas y los pesos son provisionales y los
          candidatos C-0001 a C-0400 son sintéticos. La decisión final siempre es de Gestión Humana.
        </p>
      </footer>
    </div>
  );
}

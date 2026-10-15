import { useState } from 'react';
import { SJT, DISC_ITEMS, IDT_ITEMS, EXP_OPCIONES, CARACTERIZACION, CARGO } from '../data/mpti-config.js';
import { RESPUESTAS_GEMELOS } from '../engine/gemelos.js';

const PASOS = ['Autorización', 'Caracterización', 'Trayectoria', 'Situaciones', 'Estilo de trabajo', 'Competencias'];

const VACIO = {
  nombre: '',
  consentimiento: false,
  car: { genero: '', edad: '', municipio: '', grupos: [], grupoNoResponde: false, desplazamiento: '' },
  exp: { formacion: '', experiencia: '', conocimientos: [] },
  sjt: {},
  disc: {},
  idt: {},
};

export default function Evaluar({ onTerminar }) {
  const [paso, setPaso] = useState(0);
  const [d, setD] = useState(VACIO);
  const set = (parte, valor) => setD((x) => ({ ...x, [parte]: { ...x[parte], ...valor } }));

  const completo = [
    d.consentimiento && d.nombre.trim().length > 1,
    true,
    d.exp.formacion && d.exp.experiencia,
    SJT.every((s) => d.sjt[s.id] !== undefined),
    DISC_ITEMS.every((it) => d.disc[it.id]?.mas && d.disc[it.id]?.menos),
    IDT_ITEMS.every((it) => d.idt[it.competencia] !== undefined),
  ];

  const usarEjemplo = () => {
    setD({
      ...VACIO,
      nombre: d.nombre || 'Persona de ejemplo',
      consentimiento: true,
      car: { ...VACIO.car, genero: 'Mujer', edad: '29 a 45', municipio: 'Soacha', grupos: ['Madre o padre cabeza de hogar'], desplazamiento: '30 a 60 min' },
      ...structuredClone(RESPUESTAS_GEMELOS),
    });
    setPaso(PASOS.length - 1);
  };

  const siguiente = () => {
    if (paso < PASOS.length - 1) { setPaso(paso + 1); window.scrollTo(0, 0); return; }
    const { consentimiento, ...candidato } = d;
    onTerminar(candidato);
    setD(VACIO);
    setPaso(0);
  };

  return (
    <section className="evaluar">
      <div className="titulo-seccion">
        <h1>Evaluación para {CARGO.nombre}</h1>
        <button className="enlace" onClick={usarEjemplo}>Llenar con respuestas de ejemplo</button>
      </div>

      <ol className="pasos" aria-label="Progreso">
        {PASOS.map((p, i) => (
          <li key={p} className={i === paso ? 'actual' : i < paso ? 'hecho' : ''}>
            <span className="num">{i + 1}</span>
            <span className="nombre-paso">{p}</span>
          </li>
        ))}
      </ol>

      <div className="panel">
        {paso === 0 && <Autorizacion d={d} setD={setD} />}
        {paso === 1 && <Caracterizacion car={d.car} set={(v) => set('car', v)} />}
        {paso === 2 && <Trayectoria exp={d.exp} set={(v) => set('exp', v)} />}
        {paso === 3 && <Situaciones resp={d.sjt} set={(v) => set('sjt', v)} />}
        {paso === 4 && <Estilo resp={d.disc} set={(v) => set('disc', v)} />}
        {paso === 5 && <Competencias resp={d.idt} set={(v) => set('idt', v)} />}
      </div>

      <div className="acciones-paso">
        {paso > 0 && <button className="boton secundario" onClick={() => setPaso(paso - 1)}>Atrás</button>}
        <button className="boton" disabled={!completo[paso]} onClick={siguiente}>
          {paso === PASOS.length - 1 ? 'Calcular compatibilidad' : 'Continuar'}
        </button>
      </div>
    </section>
  );
}

function Autorizacion({ d, setD }) {
  return (
    <>
      <h2>Autorización de tratamiento de datos</h2>
      <p className="texto">
        GELSA usará tus respuestas solo para este proceso de selección, según la Ley 1581 de 2012. Los datos de
        caracterización son voluntarios, se guardan aparte y no cambian tu puntaje: sirven para verificar que el
        proceso trate a todos los grupos por igual.
      </p>
      <label className="campo">
        <span>Nombre completo</span>
        <input value={d.nombre} onChange={(e) => setD((x) => ({ ...x, nombre: e.target.value }))} autoComplete="name" />
      </label>
      <label className="check">
        <input type="checkbox" checked={d.consentimiento} onChange={(e) => setD((x) => ({ ...x, consentimiento: e.target.checked }))} />
        <span>Autorizo el tratamiento de mis datos para este proceso.</span>
      </label>
    </>
  );
}

function Opciones({ nombre, opciones, valor, onElegir }) {
  return (
    <div className="opciones" role="radiogroup" aria-label={nombre}>
      {opciones.map((o) => (
        <button
          key={o}
          role="radio"
          aria-checked={valor === o}
          className={valor === o ? 'opcion elegida' : 'opcion'}
          onClick={() => onElegir(o)}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function Caracterizacion({ car, set }) {
  const alternarGrupo = (g) => {
    const tiene = car.grupos.includes(g);
    set({ grupos: tiene ? car.grupos.filter((x) => x !== g) : [...car.grupos, g], grupoNoResponde: false });
  };
  return (
    <>
      <h2>Caracterización voluntaria</h2>
      <p className="texto aviso">Estas respuestas no entran al cálculo de compatibilidad. Puedes dejar cualquiera sin responder.</p>
      <fieldset><legend>Género</legend><Opciones nombre="Género" opciones={CARACTERIZACION.genero} valor={car.genero} onElegir={(v) => set({ genero: v })} /></fieldset>
      <fieldset><legend>Rango de edad</legend><Opciones nombre="Rango de edad" opciones={CARACTERIZACION.edad} valor={car.edad} onElegir={(v) => set({ edad: v })} /></fieldset>
      <fieldset><legend>Municipio de residencia</legend><Opciones nombre="Municipio" opciones={CARACTERIZACION.municipio} valor={car.municipio} onElegir={(v) => set({ municipio: v })} /></fieldset>
      <fieldset>
        <legend>¿Perteneces a alguno de estos grupos? Puedes elegir varios.</legend>
        <div className="opciones">
          {CARACTERIZACION.grupos.map((g) => (
            <button key={g} aria-pressed={car.grupos.includes(g)} className={car.grupos.includes(g) ? 'opcion elegida' : 'opcion'} onClick={() => alternarGrupo(g)}>{g}</button>
          ))}
          <button aria-pressed={car.grupoNoResponde} className={car.grupoNoResponde ? 'opcion elegida' : 'opcion'} onClick={() => set({ grupos: [], grupoNoResponde: !car.grupoNoResponde })}>Prefiero no responder</button>
        </div>
      </fieldset>
      <fieldset><legend>Tiempo de desplazamiento al trabajo</legend><Opciones nombre="Desplazamiento" opciones={['Menos de 30 min', '30 a 60 min', 'Más de 60 min']} valor={car.desplazamiento} onElegir={(v) => set({ desplazamiento: v })} /></fieldset>
    </>
  );
}

function Trayectoria({ exp, set }) {
  const alternar = (id) => set({ conocimientos: exp.conocimientos.includes(id) ? exp.conocimientos.filter((x) => x !== id) : [...exp.conocimientos, id] });
  return (
    <>
      <h2>Formación y experiencia</h2>
      <fieldset>
        <legend>Nivel de formación</legend>
        <div className="opciones">
          {EXP_OPCIONES.formacion.map((o) => (
            <button key={o.id} aria-pressed={exp.formacion === o.id} className={exp.formacion === o.id ? 'opcion elegida' : 'opcion'} onClick={() => set({ formacion: o.id })}>{o.texto}</button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend>Experiencia en atención al cliente, recaudo o manejo de caja</legend>
        <div className="opciones">
          {EXP_OPCIONES.experiencia.map((o) => (
            <button key={o.id} aria-pressed={exp.experiencia === o.id} className={exp.experiencia === o.id ? 'opcion elegida' : 'opcion'} onClick={() => set({ experiencia: o.id })}>{o.texto}</button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend>¿En cuáles de estas tareas tienes experiencia?</legend>
        <div className="opciones">
          {EXP_OPCIONES.conocimientos.map((k) => (
            <button key={k.id} aria-pressed={exp.conocimientos.includes(k.id)} className={exp.conocimientos.includes(k.id) ? 'opcion elegida' : 'opcion'} onClick={() => alternar(k.id)}>{k.texto}</button>
          ))}
        </div>
      </fieldset>
    </>
  );
}

function Situaciones({ resp, set }) {
  return (
    <>
      <h2>Situaciones del punto de venta</h2>
      <p className="texto">Elige lo que harías en cada caso. No hay que justificar la respuesta.</p>
      {SJT.map((s, i) => (
        <article key={s.id} className="caso">
          <h3>{i + 1}. {s.titulo}</h3>
          <p>{s.situacion}</p>
          <div className="lista-opciones" role="radiogroup" aria-label={s.titulo}>
            {s.opciones.map((o, idx) => (
              <button key={idx} role="radio" aria-checked={resp[s.id] === idx} className={resp[s.id] === idx ? 'respuesta elegida' : 'respuesta'} onClick={() => set({ [s.id]: idx })}>
                <span className="letra">{String.fromCharCode(65 + idx)}</span>
                <span>{o.texto}</span>
              </button>
            ))}
          </div>
        </article>
      ))}
    </>
  );
}

function Estilo({ resp, set }) {
  const marcar = (id, tipo, dim) => {
    const actual = resp[id] || {};
    const otro = tipo === 'mas' ? 'menos' : 'mas';
    const nuevo = { ...actual, [tipo]: dim };
    if (nuevo[otro] === dim) nuevo[otro] = undefined;
    set({ [id]: nuevo });
  };
  return (
    <>
      <h2>Estilo de trabajo</h2>
      <p className="texto">En cada grupo, marca la palabra que más te describe en el trabajo y la que menos. No hay respuestas buenas ni malas.</p>
      {DISC_ITEMS.map((it, i) => (
        <div key={it.id} className="disc-item">
          <span className="disc-num">Grupo {i + 1}</span>
          <table className="disc-tabla">
            <thead><tr><th scope="col">Palabra</th><th scope="col">Más</th><th scope="col">Menos</th></tr></thead>
            <tbody>
              {it.palabras.map(([p, dim]) => (
                <tr key={p}>
                  <td>{p}</td>
                  <td><input type="radio" name={`${it.id}-mas`} aria-label={`${p}: me describe más`} checked={resp[it.id]?.mas === dim} onChange={() => marcar(it.id, 'mas', dim)} /></td>
                  <td><input type="radio" name={`${it.id}-menos`} aria-label={`${p}: me describe menos`} checked={resp[it.id]?.menos === dim} onChange={() => marcar(it.id, 'menos', dim)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </>
  );
}

function Competencias({ resp, set }) {
  return (
    <>
      <h2>Cómo trabajas</h2>
      <p className="texto">Elige la opción que más se parece a lo que haces normalmente.</p>
      {IDT_ITEMS.map((it, i) => (
        <article key={it.competencia} className="caso">
          <h3>{i + 1}. {it.enunciado}</h3>
          <div className="lista-opciones" role="radiogroup" aria-label={it.enunciado}>
            {it.opciones.map((o, k, arr) => (k + i) % arr.length).map((idx, pos) => (
              <button key={idx} role="radio" aria-checked={resp[it.competencia] === idx} className={resp[it.competencia] === idx ? 'respuesta elegida' : 'respuesta'} onClick={() => set({ [it.competencia]: idx })}>
                <span className="letra">{String.fromCharCode(65 + pos)}</span>
                <span>{it.opciones[idx].texto}</span>
              </button>
            ))}
          </div>
        </article>
      ))}
    </>
  );
}

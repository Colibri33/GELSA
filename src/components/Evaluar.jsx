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
  const [intento, setIntento] = useState(false);
  const set = (parte, valor) => setD((x) => ({ ...x, [parte]: { ...x[parte], ...valor } }));

  const carCompleta = Boolean(
    d.car.genero &&
      d.car.edad &&
      d.car.municipio &&
      d.car.desplazamiento &&
      (d.car.grupos.length > 0 || d.car.grupoNoResponde),
  );

  const completo = [
    d.consentimiento && d.nombre.trim().length > 1,
    carCompleta,
    d.exp.formacion && d.exp.experiencia,
    SJT.every((s) => d.sjt[s.id] !== undefined),
    DISC_ITEMS.every((it) => d.disc[it.id]?.mas && d.disc[it.id]?.menos),
    IDT_ITEMS.every((it) => d.idt[it.competencia] !== undefined),
  ];

  const irA = (nuevoPaso) => {
    setPaso(nuevoPaso);
    setIntento(false);
    window.scrollTo(0, 0);
  };

  const usarEjemplo = () => {
    setD({
      ...VACIO,
      nombre: d.nombre || 'Persona de ejemplo',
      consentimiento: true,
      car: { ...VACIO.car, genero: 'Mujer', edad: '29 a 45', municipio: 'Soacha', grupos: ['Madre o padre cabeza de hogar'], desplazamiento: '30 a 60 min' },
      ...structuredClone(RESPUESTAS_GEMELOS),
    });
    setPaso(PASOS.length - 1);
    setIntento(false);
  };

  const siguiente = () => {
    if (!completo[paso]) {
      setIntento(true);
      setTimeout(() => {
        document.querySelector('.panel .falta')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
      return;
    }
    if (paso < PASOS.length - 1) {
      irA(paso + 1);
      return;
    }
    const { consentimiento, ...candidato } = d;
    onTerminar(candidato);
    setD(VACIO);
    setPaso(0);
    setIntento(false);
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
        {paso === 0 && <Autorizacion d={d} setD={setD} resaltar={intento} />}
        {paso === 1 && <Caracterizacion car={d.car} set={(v) => set('car', v)} resaltar={intento} />}
        {paso === 2 && <Trayectoria exp={d.exp} set={(v) => set('exp', v)} resaltar={intento} />}
        {paso === 3 && <Situaciones resp={d.sjt} set={(v) => set('sjt', v)} resaltar={intento} />}
        {paso === 4 && <Estilo resp={d.disc} set={(v) => set('disc', v)} resaltar={intento} />}
        {paso === 5 && <Competencias resp={d.idt} set={(v) => set('idt', v)} resaltar={intento} />}
      </div>

      <div className="acciones-paso">
        {paso > 0 && <button className="boton secundario" onClick={() => irA(paso - 1)}>Atrás</button>}
        <button className="boton" onClick={siguiente} aria-disabled={!completo[paso]}>
          {paso === PASOS.length - 1 ? 'Calcular compatibilidad' : 'Continuar'}
        </button>
      </div>
      {intento && !completo[paso] && (
        <p className="nota" role="alert" style={{ textAlign: 'right' }}>
          Responde las preguntas resaltadas en rojo para poder continuar.
        </p>
      )}
    </section>
  );
}

function Autorizacion({ d, setD, resaltar }) {
  const faltaNombre = d.nombre.trim().length <= 1;
  const faltaConsent = !d.consentimiento;
  const faltan = (faltaNombre ? 1 : 0) + (faltaConsent ? 1 : 0);
  return (
    <>
      <h2>Autorización de tratamiento de datos</h2>
      <p className="texto">
        GELSA usará tus respuestas solo para este proceso de selección, según la Ley 1581 de 2012. Los datos de
        caracterización se guardan aparte y no cambian tu puntaje: sirven para verificar que el
        proceso trate a todos los grupos por igual.
      </p>
      {resaltar && faltan > 0 && (
        <p className="mensaje-falta" role="alert">
          Te {faltan === 1 ? 'falta 1 dato' : `faltan ${faltan} datos`} en esta sección.
        </p>
      )}
      <label className={resaltar && faltaNombre ? 'campo falta' : 'campo'}>
        <span>Nombre completo {resaltar && faltaNombre && <span className="pista-falta">• Falta responder</span>}</span>
        <input value={d.nombre} onChange={(e) => setD((x) => ({ ...x, nombre: e.target.value }))} autoComplete="name" aria-invalid={faltaNombre} />
      </label>
      <label className={resaltar && faltaConsent ? 'check falta-check' : 'check'}>
        <input type="checkbox" checked={d.consentimiento} onChange={(e) => setD((x) => ({ ...x, consentimiento: e.target.checked }))} />
        <span>Autorizo el tratamiento de mis datos para este proceso. {resaltar && faltaConsent && <span className="pista-falta">• Falta autorizar</span>}</span>
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
          type="button"
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

function Caracterizacion({ car, set, resaltar }) {
  const falta = {
    genero: !car.genero,
    edad: !car.edad,
    municipio: !car.municipio,
    grupos: !(car.grupos.length > 0 || car.grupoNoResponde),
    desplazamiento: !car.desplazamiento,
  };
  const faltan = Object.values(falta).filter(Boolean).length;
  const alternarGrupo = (g) => {
    const tiene = car.grupos.includes(g);
    set({ grupos: tiene ? car.grupos.filter((x) => x !== g) : [...car.grupos, g], grupoNoResponde: false });
  };
  const clase = (k) => (resaltar && falta[k] ? 'falta' : '');
  const marca = (k) => (resaltar && falta[k] ? <span className="pista-falta"> • Falta responder</span> : null);
  return (
    <>
      <h2>Caracterización</h2>
      <p className="texto aviso">Estas respuestas no entran al cálculo de compatibilidad. Responde todas las preguntas para continuar.</p>
      {resaltar && faltan > 0 && (
        <p className="mensaje-falta" role="alert">
          Te {faltan === 1 ? 'falta 1 pregunta' : `faltan ${faltan} preguntas`} en esta sección.
        </p>
      )}
      <fieldset className={clase('genero')}><legend>Género{marca('genero')}</legend><Opciones nombre="Género" opciones={CARACTERIZACION.genero} valor={car.genero} onElegir={(v) => set({ genero: v })} /></fieldset>
      <fieldset className={clase('edad')}><legend>Rango de edad{marca('edad')}</legend><Opciones nombre="Rango de edad" opciones={CARACTERIZACION.edad} valor={car.edad} onElegir={(v) => set({ edad: v })} /></fieldset>
      <fieldset className={clase('municipio')}><legend>Municipio de residencia{marca('municipio')}</legend><Opciones nombre="Municipio" opciones={CARACTERIZACION.municipio} valor={car.municipio} onElegir={(v) => set({ municipio: v })} /></fieldset>
      <fieldset className={clase('grupos')}>
        <legend>¿Perteneces a alguno de estos grupos? Puedes elegir varios.{marca('grupos')}</legend>
        <div className="opciones">
          {CARACTERIZACION.grupos.map((g) => (
            <button key={g} type="button" aria-pressed={car.grupos.includes(g)} className={car.grupos.includes(g) ? 'opcion elegida' : 'opcion'} onClick={() => alternarGrupo(g)}>{g}</button>
          ))}
          <button type="button" aria-pressed={car.grupoNoResponde} className={car.grupoNoResponde ? 'opcion elegida' : 'opcion'} onClick={() => set({ grupos: [], grupoNoResponde: !car.grupoNoResponde })}>Prefiero no responder</button>
        </div>
      </fieldset>
      <fieldset className={clase('desplazamiento')}><legend>Tiempo de desplazamiento al trabajo{marca('desplazamiento')}</legend><Opciones nombre="Desplazamiento" opciones={['Menos de 30 min', '30 a 60 min', 'Más de 60 min']} valor={car.desplazamiento} onElegir={(v) => set({ desplazamiento: v })} /></fieldset>
    </>
  );
}

function Trayectoria({ exp, set, resaltar }) {
  const faltaForm = !exp.formacion;
  const faltaExp = !exp.experiencia;
  const faltan = (faltaForm ? 1 : 0) + (faltaExp ? 1 : 0);
  const alternar = (id) => set({ conocimientos: exp.conocimientos.includes(id) ? exp.conocimientos.filter((x) => x !== id) : [...exp.conocimientos, id] });
  return (
    <>
      <h2>Formación y experiencia</h2>
      {resaltar && faltan > 0 && (
        <p className="mensaje-falta" role="alert">
          Te {faltan === 1 ? 'falta 1 pregunta' : `faltan ${faltan} preguntas`} en esta sección.
        </p>
      )}
      <fieldset className={resaltar && faltaForm ? 'falta' : ''}>
        <legend>Nivel de formación{resaltar && faltaForm && <span className="pista-falta"> • Falta responder</span>}</legend>
        <div className="opciones">
          {EXP_OPCIONES.formacion.map((o) => (
            <button key={o.id} type="button" aria-pressed={exp.formacion === o.id} className={exp.formacion === o.id ? 'opcion elegida' : 'opcion'} onClick={() => set({ formacion: o.id })}>{o.texto}</button>
          ))}
        </div>
      </fieldset>
      <fieldset className={resaltar && faltaExp ? 'falta' : ''}>
        <legend>Experiencia en atención al cliente, recaudo o manejo de caja{resaltar && faltaExp && <span className="pista-falta"> • Falta responder</span>}</legend>
        <div className="opciones">
          {EXP_OPCIONES.experiencia.map((o) => (
            <button key={o.id} type="button" aria-pressed={exp.experiencia === o.id} className={exp.experiencia === o.id ? 'opcion elegida' : 'opcion'} onClick={() => set({ experiencia: o.id })}>{o.texto}</button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend>¿En cuáles de estas tareas tienes experiencia? (opcional)</legend>
        <div className="opciones">
          {EXP_OPCIONES.conocimientos.map((k) => (
            <button key={k.id} type="button" aria-pressed={exp.conocimientos.includes(k.id)} className={exp.conocimientos.includes(k.id) ? 'opcion elegida' : 'opcion'} onClick={() => alternar(k.id)}>{k.texto}</button>
          ))}
        </div>
      </fieldset>
    </>
  );
}

function Situaciones({ resp, set, resaltar }) {
  const faltan = SJT.filter((s) => resp[s.id] === undefined).length;
  return (
    <>
      <h2>Situaciones del punto de venta</h2>
      <p className="texto">Elige lo que harías en cada caso. No hay que justificar la respuesta.</p>
      {resaltar && faltan > 0 && (
        <p className="mensaje-falta" role="alert">
          Te {faltan === 1 ? 'falta 1 situación' : `faltan ${faltan} situaciones`} por responder. Están resaltadas en rojo.
        </p>
      )}
      {SJT.map((s, i) => {
        const falta = resp[s.id] === undefined;
        return (
          <article key={s.id} className={resaltar && falta ? 'caso falta' : 'caso'}>
            <h3>{i + 1}. {s.titulo}{resaltar && falta && <span className="pista-falta"> • Falta responder</span>}</h3>
            <p>{s.situacion}</p>
            <div className="lista-opciones" role="radiogroup" aria-label={s.titulo}>
              {s.opciones.map((o, idx) => (
                <button key={idx} type="button" role="radio" aria-checked={resp[s.id] === idx} className={resp[s.id] === idx ? 'respuesta elegida' : 'respuesta'} onClick={() => set({ [s.id]: idx })}>
                  <span className="letra">{String.fromCharCode(65 + idx)}</span>
                  <span>{o.texto}</span>
                </button>
              ))}
            </div>
          </article>
        );
      })}
    </>
  );
}

function Estilo({ resp, set, resaltar }) {
  const marcar = (id, tipo, dim) => {
    const actual = resp[id] || {};
    // Ya no se borra la otra columna: la opción duplicada viene bloqueada (disabled).
    // Se conserva esta guarda por seguridad.
    if (actual[tipo] === dim) return;
    set({ [id]: { ...actual, [tipo]: dim } });
  };
  const faltan = DISC_ITEMS.filter((it) => !resp[it.id]?.mas || !resp[it.id]?.menos).length;
  return (
    <>
      <h2>Estilo de trabajo</h2>
      <p className="texto">
        En cada grupo, marca la palabra que más te describe en el trabajo y la que menos. Deben ser dos palabras
        distintas. La palabra que eliges en una columna se bloquea en la otra para que no se borre tu elección.
      </p>
      {resaltar && faltan > 0 && (
        <p className="mensaje-falta" role="alert">
          Te {faltan === 1 ? 'falta 1 grupo' : `faltan ${faltan} grupos`} por completar. Están resaltados en rojo.
        </p>
      )}
      {DISC_ITEMS.map((it, i) => {
        const sel = resp[it.id] || {};
        const faltaMas = !sel.mas;
        const faltaMenos = !sel.menos;
        const incompleto = faltaMas || faltaMenos;
        const detalleFalta = !faltaMas && faltaMenos ? 'Falta Menos' : faltaMas && !faltaMenos ? 'Falta Más' : 'Falta Más y Menos';
        return (
          <div key={it.id} className={resaltar && incompleto ? 'disc-item falta' : 'disc-item'}>
            <span className="disc-num">
              Grupo {i + 1}
              {resaltar && incompleto && <span className="pista-falta"> • {detalleFalta}</span>}
              {!resaltar && incompleto && (
                <span className="disc-estado">
                  {' '}({!sel.mas && !sel.menos ? 'sin responder' : !sel.mas ? 'falta Más' : 'falta Menos'})
                </span>
              )}
            </span>
            <table className="disc-tabla">
              <thead><tr><th scope="col">Palabra</th><th scope="col">Más</th><th scope="col">Menos</th></tr></thead>
              <tbody>
                {it.palabras.map(([p, dim]) => {
                  const masBloq = sel.menos === dim;
                  const menosBloq = sel.mas === dim;
                  return (
                    <tr key={p} className={masBloq || menosBloq ? 'bloqueada' : ''}>
                      <td>{p}</td>
                      <td>
                        <input
                          type="radio"
                          name={`${it.id}-mas`}
                          aria-label={`${p}: me describe más`}
                          checked={sel.mas === dim}
                          disabled={masBloq}
                          title={masBloq ? 'Ya la elegiste en Menos' : undefined}
                          onChange={() => marcar(it.id, 'mas', dim)}
                        />
                      </td>
                      <td>
                        <input
                          type="radio"
                          name={`${it.id}-menos`}
                          aria-label={`${p}: me describe menos`}
                          checked={sel.menos === dim}
                          disabled={menosBloq}
                          title={menosBloq ? 'Ya la elegiste en Más' : undefined}
                          onChange={() => marcar(it.id, 'menos', dim)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })}
    </>
  );
}

function Competencias({ resp, set, resaltar }) {
  const faltan = IDT_ITEMS.filter((it) => resp[it.competencia] === undefined).length;
  return (
    <>
      <h2>Cómo trabajas</h2>
      <p className="texto">Elige la opción que más se parece a lo que haces normalmente.</p>
      {resaltar && faltan > 0 && (
        <p className="mensaje-falta" role="alert">
          Te {faltan === 1 ? 'falta 1 pregunta' : `faltan ${faltan} preguntas`} por responder. Están resaltadas en rojo.
        </p>
      )}
      {IDT_ITEMS.map((it, i) => {
        const falta = resp[it.competencia] === undefined;
        return (
          <article key={it.competencia} className={resaltar && falta ? 'caso falta' : 'caso'}>
            <h3>{i + 1}. {it.enunciado}{resaltar && falta && <span className="pista-falta"> • Falta responder</span>}</h3>
            <div className="lista-opciones" role="radiogroup" aria-label={it.enunciado}>
              {it.opciones.map((o, k, arr) => (k + i) % arr.length).map((idx, pos) => (
                <button key={idx} type="button" role="radio" aria-checked={resp[it.competencia] === idx} className={resp[it.competencia] === idx ? 'respuesta elegida' : 'respuesta'} onClick={() => set({ [it.competencia]: idx })}>
                  <span className="letra">{String.fromCharCode(65 + pos)}</span>
                  <span>{it.opciones[idx].texto}</span>
                </button>
              ))}
            </div>
          </article>
        );
      })}
    </>
  );
}

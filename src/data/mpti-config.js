// =====================================================================
// CONTENIDO Y PARÁMETROS DEL MPTI
// ---------------------------------------------------------------------
// Todo lo marcado como PROVISIONAL debe reemplazarse con lo que defina
// el equipo de Ingeniería Industrial. La lógica del motor (engine/) no
// necesita cambios cuando se actualice este archivo.
// =====================================================================

export const CARGO = {
  id: 'asesor',
  nombre: 'Asesor Comercial / Taquillero',
  tipo: 'Selección externa',
  proposito:
    'Ejecutar la atención al cliente, la venta de servicios y el recaudo de transacciones en los puntos Paga Todo, garantizando el cumplimiento de protocolos y el cuadre de caja.',
};

// Fórmula de la cartilla (pág. 24). Se conserva SOLO para la prueba de equidad.
export const PESOS_CARTILLA = { sjt: 30, idt: 25, disc: 20, exp: 15, soc: 10 };

// PROVISIONAL: fórmula MPTI sin el factor SOC. El 10% se repartió
// proporcionalmente entre los demás componentes. El equipo debe validarlo.
export const PESOS_MPTI = { sjt: 33, idt: 28, disc: 22, exp: 17 };

// Rangos de compatibilidad (pág. 24 de la cartilla).
export const UMBRALES = { alta: 80, media: 50 };

export const COMPONENTES = {
  sjt: 'Juicio situacional (SJT)',
  idt: 'Competencias ID Talento',
  disc: 'Ajuste comportamental (DISC)',
  exp: 'Formación y experiencia',
  soc: 'Factor sociodemográfico (SOC)',
};

// PROVISIONAL: competencias del cargo y nivel requerido (escala 1 a 5).
export const COMPETENCIAS = [
  { id: 'cliente', nombre: 'Orientación al cliente', requerido: 4 },
  { id: 'comunicacion', nombre: 'Comunicación asertiva', requerido: 4 },
  { id: 'presion', nombre: 'Resiliencia y manejo de la presión', requerido: 4 },
  { id: 'rigor', nombre: 'Rigor y cumplimiento normativo', requerido: 5 },
  { id: 'problemas', nombre: 'Resolución de problemas', requerido: 3 },
  { id: 'equipo', nombre: 'Trabajo en equipo', requerido: 3 },
];

// PROVISIONAL (excepto el escenario 1, tomado de la cartilla).
// Cada opción tiene un puntaje de 0 a 100, no solo una respuesta correcta.
export const SJT = [
  {
    id: 'red',
    titulo: 'Caída de red en hora pico',
    situacion:
      'En hora pico, la red transaccional del punto se cae. Hay 15 clientes en fila esperando giros y pagos urgentes, y un usuario empieza a reclamar de forma agresiva por la demora.',
    opciones: [
      { texto: 'Decirle al cliente que el sistema falló, suspender la atención y esperar a que la red vuelva sin dar más información.', puntaje: 20 },
      { texto: 'Atender la molestia con calma, informar el protocolo de contingencia, ofrecer alternativas según el servicio y reportar la falla al supervisor de zona.', puntaje: 100 },
      { texto: 'Pedirle al usuario que entienda que la culpa es del proveedor de internet y no del punto.', puntaje: 0 },
      { texto: 'Atender a la fila de forma manual sin validar en el sistema, asumiendo el riesgo de descuadre.', puntaje: 40 },
    ],
  },
  {
    id: 'descuadre',
    titulo: 'Descuadre al cierre',
    situacion:
      'Al hacer el arqueo de cierre te faltan $50.000 frente a lo que registra el sistema. Tu turno ya terminó y el siguiente asesor está esperando para recibir la caja.',
    opciones: [
      { texto: 'Poner el dinero de tu bolsillo para que cuadre y no generar novedades.', puntaje: 30 },
      { texto: 'Revisar las transacciones del turno, registrar la novedad y reportarla al supervisor antes de entregar la caja.', puntaje: 100 },
      { texto: 'Entregar la caja y revisar la diferencia mañana con más calma.', puntaje: 10 },
      { texto: 'Pedirle al asesor del siguiente turno que recibas la caja así y que lo resuelvan entre los dos.', puntaje: 0 },
    ],
  },
  {
    id: 'documento',
    titulo: 'Giro sin documento',
    situacion:
      'Un cliente frecuente quiere cobrar un giro a nombre de su hermana. No trae el documento de ella, pero insiste en que siempre lo han atendido así.',
    opciones: [
      { texto: 'Hacer el pago porque es un cliente conocido y no quieres perderlo.', puntaje: 0 },
      { texto: 'Decirle que no se puede y llamar al siguiente cliente.', puntaje: 40 },
      { texto: 'Explicarle con amabilidad por qué se exige el documento y qué opciones tiene para que su hermana cobre el giro.', puntaje: 100 },
      { texto: 'Llamar al supervisor para que autorice una excepción.', puntaje: 50 },
    ],
  },
  {
    id: 'ausencia',
    titulo: 'Compañero ausente',
    situacion:
      'Tu compañero de turno no llegó y no contesta. La fila crece y hay clientes con pagos de servicios que vencen hoy.',
    opciones: [
      { texto: 'Atender solo, lo más rápido posible, sin avisar a nadie.', puntaje: 40 },
      { texto: 'Avisar al supervisor, informar a la fila el tiempo de espera y priorizar los pagos que vencen hoy.', puntaje: 100 },
      { texto: 'Cerrar una ventanilla y poner un aviso de atención limitada.', puntaje: 30 },
      { texto: 'Seguir llamando a tu compañero hasta que conteste antes de continuar.', puntaje: 10 },
    ],
  },
  {
    id: 'billete',
    titulo: 'Billete sospechoso',
    situacion:
      'Un cliente paga una recarga con un billete de $50.000 que no pasa la verificación. El cliente parece no saberlo y hay gente detrás de él.',
    opciones: [
      { texto: 'Decirle en voz alta que el billete es falso.', puntaje: 20 },
      { texto: 'Recibirlo para no generar un conflicto en la fila.', puntaje: 0 },
      { texto: 'Verificarlo según el procedimiento, explicárselo de forma discreta y seguir el protocolo de reporte.', puntaje: 100 },
      { texto: 'Devolverlo sin explicar y pedir otro medio de pago.', puntaje: 40 },
    ],
  },
];

// PROVISIONAL: 6 ítems de elección forzada (la cartilla propone 24).
// En cada ítem la persona elige la palabra que MÁS y la que MENOS la describe.
export const DISC_ITEMS = [
  { id: 'd1', palabras: [['Paciente', 'S'], ['Decidido', 'D'], ['Preciso', 'C'], ['Entusiasta', 'I']] },
  { id: 'd2', palabras: [['Conversador', 'I'], ['Ordenado', 'C'], ['Directo', 'D'], ['Calmado', 'S']] },
  { id: 'd3', palabras: [['Cuidadoso', 'C'], ['Leal', 'S'], ['Optimista', 'I'], ['Competitivo', 'D']] },
  { id: 'd4', palabras: [['Firme', 'D'], ['Constante', 'S'], ['Analítico', 'C'], ['Persuasivo', 'I']] },
  { id: 'd5', palabras: [['Servicial', 'S'], ['Exigente', 'D'], ['Sociable', 'I'], ['Detallista', 'C']] },
  { id: 'd6', palabras: [['Metódico', 'C'], ['Expresivo', 'I'], ['Tranquilo', 'S'], ['Arriesgado', 'D']] },
];

export const DISC_NOMBRES = { D: 'Dominancia', I: 'Influencia', S: 'Estabilidad', C: 'Cumplimiento' };

// PROVISIONAL: perfil adaptado que exige el cargo (0 a 100 por dimensión).
export const DISC_OBJETIVO = { D: 40, I: 65, S: 70, C: 75 };

// PROVISIONAL: un ítem conductual por competencia. Las opciones describen
// conductas de distinto nivel (1, 3 o 5) en lugar de una escala Likert.
export const IDT_ITEMS = [
  {
    competencia: 'cliente',
    enunciado: 'Cuando un cliente no entiende por qué no puedes hacer un trámite, normalmente:',
    opciones: [
      { texto: 'Le repito la regla y sigo con el siguiente.', nivel: 1 },
      { texto: 'Le explico la regla y le digo a dónde puede acudir.', nivel: 3 },
      { texto: 'Le explico la razón, le propongo una alternativa concreta y verifico que quedó claro.', nivel: 5 },
    ],
  },
  {
    competencia: 'comunicacion',
    enunciado: 'Si debes informarle a tu supervisor una novedad del punto, normalmente:',
    opciones: [
      { texto: 'Espero a que me pregunte.', nivel: 1 },
      { texto: 'Se la cuento cuando lo veo.', nivel: 3 },
      { texto: 'Se la reporto de inmediato con los datos clave: qué pasó, cuándo y qué hice.', nivel: 5 },
    ],
  },
  {
    competencia: 'presion',
    enunciado: 'En un día con fila larga y clientes molestos, lo que más me pasa es:',
    opciones: [
      { texto: 'Me cuesta concentrarme y cometo más errores.', nivel: 1 },
      { texto: 'Mantengo el ritmo, aunque termino muy cansado.', nivel: 3 },
      { texto: 'Organizo prioridades, mantengo la calma y reviso dos veces las transacciones.', nivel: 5 },
    ],
  },
  {
    competencia: 'rigor',
    enunciado: 'Sobre los procedimientos de caja, mi forma de trabajar es:',
    opciones: [
      { texto: 'Los sigo cuando hay tiempo; si hay afán, priorizo atender rápido.', nivel: 1 },
      { texto: 'Los sigo casi siempre, salvo en casos especiales.', nivel: 3 },
      { texto: 'Los sigo siempre, incluso con presión, y reporto cuando uno no se puede cumplir.', nivel: 5 },
    ],
  },
  {
    competencia: 'problemas',
    enunciado: 'Cuando algo falla y no conozco la solución:',
    opciones: [
      { texto: 'Espero a que alguien lo resuelva.', nivel: 1 },
      { texto: 'Pido ayuda al supervisor.', nivel: 3 },
      { texto: 'Pruebo lo que está en el protocolo y, si no funciona, escalo explicando lo que ya intenté.', nivel: 5 },
    ],
  },
  {
    competencia: 'equipo',
    enunciado: 'Si a un compañero de otro turno le falta información para recibir la caja:',
    opciones: [
      { texto: 'Le entrego lo que me piden y me voy.', nivel: 1 },
      { texto: 'Le cuento las novedades si me pregunta.', nivel: 3 },
      { texto: 'Le dejo las novedades por escrito y resuelvo sus dudas antes de irme.', nivel: 5 },
    ],
  },
];

// PROVISIONAL: puntajes de formación y experiencia frente a la ficha del cargo.
export const EXP_OPCIONES = {
  formacion: [
    { id: 'bachiller', texto: 'Bachiller', puntaje: 80 },
    { id: 'tecnico', texto: 'Técnico o tecnólogo', puntaje: 100 },
    { id: 'profesional', texto: 'Profesional o estudiante universitario', puntaje: 100 },
  ],
  experiencia: [
    { id: '0-6', texto: 'Menos de 6 meses', puntaje: 30 },
    { id: '6-12', texto: '6 meses a 1 año', puntaje: 85 },
    { id: '1-3', texto: '1 a 3 años', puntaje: 100 },
    { id: '3+', texto: 'Más de 3 años', puntaje: 100 },
  ],
  conocimientos: [
    { id: 'arqueo', texto: 'Arqueo y cuadre de caja' },
    { id: 'pos', texto: 'Terminal POS o sistemas de recaudo' },
    { id: 'servicio', texto: 'Atención al cliente presencial' },
  ],
};

// Caracterización voluntaria (no entra al ICPC). Se agregó 46 años o más
// porque la cartilla menciona Talento Senior pero el rango llegaba a 45.
export const CARACTERIZACION = {
  genero: ['Mujer', 'Hombre', 'No binario', 'Prefiero no responder'],
  edad: ['18 a 28', '29 a 45', '46 o más', 'Prefiero no responder'],
  municipio: ['Bogotá', 'Soacha', 'Otro municipio de Cundinamarca', 'Prefiero no responder'],
  grupos: ['Madre o padre cabeza de hogar', 'Persona con discapacidad', 'Población LGBTIQ+', 'Talento senior', 'Primer empleo'],
};

// PROVISIONAL: catálogo de acciones. El plan solo recomienda acciones de aquí,
// para no proponer formaciones que GELSA no ofrece.
export const CATALOGO = {
  cliente: { accion: 'Taller de servicio al cliente en canal presencial', duracion: '8 horas' },
  comunicacion: { accion: 'Taller de comunicación asertiva y reporte de novedades', duracion: '6 horas' },
  presion: { accion: 'Sesiones de autorregulación emocional en operación', duracion: '4 sesiones' },
  rigor: { accion: 'Curso de protocolos de caja y prevención de fraude', duracion: '10 horas' },
  problemas: { accion: 'Simulación de contingencias operativas', duracion: '6 horas' },
  equipo: { accion: 'Entrenamiento en entrega de turno y trabajo colaborativo', duracion: '4 horas' },
  sjt: { accion: 'Talleres de simulación de casos reales del punto', duracion: '8 horas' },
  disc: { accion: 'Acompañamiento de adaptación al entorno operativo', duracion: '3 sesiones' },
  arqueo: { accion: 'Inducción práctica en arqueo y cuadre de caja', duracion: '6 horas' },
  pos: { accion: 'Inducción en terminal POS y sistema transaccional Paga Todo', duracion: '4 horas' },
  servicio: { accion: 'Módulo básico de atención al usuario', duracion: '4 horas' },
  experiencia: { accion: 'Primer mes con asesor mentor en turnos críticos', duracion: '4 semanas' },
};

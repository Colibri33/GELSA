# MPTI | Prototipo del Modelo Predictivo de Talento Inclusivo

Prototipo para el reto GELSA (Paga Todo). Cargo de demostración: Asesor Comercial / Taquillero.

## Correr en local

```bash
npm install
npm run dev
```

Prueba del motor (verifica que la prueba de gemelos dé el mismo puntaje):

```bash
npm test
```

## Subir a Vercel

1. Sube esta carpeta a un repositorio de GitHub.
2. En Vercel: Add New > Project > importa el repositorio.
3. Vercel detecta Vite solo. Build command: `npm run build`. Output: `dist`.

## Estructura

- `src/data/mpti-config.js`: TODO el contenido (preguntas, claves de calificación, pesos, niveles requeridos,
  catálogo de formación). Es el único archivo que hay que editar cuando el equipo de Industrial entregue el contenido final.
- `src/engine/mpti.js`: motor (ICPC, brechas, plan de desarrollo, auditoría de equidad). Funciones puras.
- `src/engine/sinteticos.js`: 400 candidatos sintéticos con semilla fija.
- `src/engine/gemelos.js`: respuestas base de la prueba de gemelos.
- `src/components/`: pantallas (evaluación, Gestión Humana, equidad, configuración).

## Decisiones de diseño

- El factor sociodemográfico (SOC) de la cartilla NO entra al ICPC. Su 10% se repartió proporcionalmente
  (provisional). La fórmula original se conserva solo en la pantalla de Equidad para demostrar el problema.
- La auditoría usa la regla de los cuatro quintos y una prueba z de dos proporciones; solo alerta si la
  diferencia es significativa (p < 0,05) y el grupo tiene al menos 30 personas.
- El plan de desarrollo se arma con reglas a partir del catálogo; no usa IA generativa.
- Los datos se guardan en el navegador (localStorage). No hay servidor ni base de datos.

# Programación · entorno personal de práctica

Aplicación web estática para practicar ejercicios de **Introducción a la Programación** con una interfaz inspirada en el flujo de Clearn.

> Proyecto personal de estudio. No es un producto oficial de Clearn.

## Estructura

- `index.html`: estructura principal de la aplicación.
- `styles.css`: apariencia de la interfaz.
- `app.js`: navegación, editor Monaco, guardado de progreso y ejecución de Python con Pyodide.
- `data.js`: banco de evaluaciones, preguntas y casos de prueba.

## Diseñada para crecer

El banco está organizado por **evaluaciones**. Cada nueva interrogación/control/prueba se agrega como un nuevo objeto dentro de `evaluations` en `data.js`. Cada evaluación puede tener cualquier cantidad de preguntas.

La interfaz cambia automáticamente el selector superior, el menú lateral, los enunciados, el editor y la pantalla de revisión. No es necesario rediseñar la web cada vez que se agreguen ejercicios.

## Corrector Python

El código del estudiante se ejecuta en el navegador mediante Pyodide. El editor es Monaco y está configurado para Python con:

- 4 espacios por nivel de sangría.
- `insertSpaces: true`.
- detección automática de indentación desactivada.
- autoindentación de bloques Python.
- `Ctrl/Cmd + Enter` para ejecutar.

El código del estudiante se envía a Python como texto y se compila de forma independiente con `compile(..., "<tu_codigo.py>", "exec")`. No se concatena al código interno del corrector, evitando que la sangría del evaluador interfiera con la solución.

## Casos de prueba

Actualmente contiene los casos de prueba visibles de I1. Los tests ocultos del corrector original no se incluyen ni se inventan.

## Publicación con GitHub Pages

Una vez cargados los archivos:

1. Abre **Settings** del repositorio.
2. Entra a **Pages**.
3. En **Build and deployment**, selecciona **Deploy from a branch**.
4. Selecciona la rama `main` y la carpeta `/ (root)`.
5. Guarda.

Después de unos minutos la página debería quedar disponible en:

`https://andreamelimiranda.github.io/programacion/`

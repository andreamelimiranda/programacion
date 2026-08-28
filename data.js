window.PROGRAMACION_DATA = {
  course: "Introducción a la Programación",
  evaluations: [
    {
      id: "i1-2025-2-s7",
      name: "I1",
      semester: "2025 - Segundo",
      section: "Sección 7",
      instructions: "Entorno personal de práctica. Resuelve cada ejercicio en Python y comprueba tu solución con los casos de prueba visibles.",
      questions: [
        {
          id: "dcclub-a",
          title: "DCClub Recreativo - A",
          objective: [
            "El DCClub está recibiendo solicitudes de inscripción para sus diversas actividades deportivas.",
            "Deberás hacer un programa que reciba primero un str con el nombre de la actividad y después un int n que representa el número de solicitudes recibidas. A continuación, se recibirán las n solicitudes, y se deberá imprimir cuántas solicitudes corresponden a la actividad."
          ],
          kind: "stdin",
          starter: "",
          tests: [
            {
              input: "Tenis\n4\nFutbol\nTenis\nTenis\nRugby\n",
              expected: "2",
              explanation: "El nombre de la actividad es Tenis y se reciben 4 inscripciones. Solo 2 corresponden a Tenis."
            },
            {
              input: "Futbol\n8\nFutbol\nFutvol\nFootball\nFutbol\nFutbol\nFutbol\nFutbolito\nFusbol\n",
              expected: "4",
              explanation: "De las 8 inscripciones, solo 4 coinciden exactamente con Futbol."
            }
          ]
        },
        {
          id: "dcclub-b",
          title: "DCClub Recreativo - B",
          objective: [
            "El DCClub ha decidido ofrecer dos actividades recreativas por semana, con cierto número limitado de cupos. Debes hacer un programa que reciba estas actividades, con sus respectivos cupos, y luego reciba solicitudes de inscripción.",
            "Cada solicitud debe ser aceptada si quedan cupos disponibles, o rechazada si no quedan cupos o la actividad no existe. Recibirás inscripciones hasta llenar todos los cupos.",
            "Recibirás un str con el nombre de la primera actividad, un int con su capacidad, un str con el nombre de la segunda actividad y un int con su capacidad. Después recibirás str con nombres de actividades a manera de inscripción.",
            "Por cada inscripción debes imprimir Inscrito/a, No hay cupos, o No hay <nombre_actividad> según corresponda. Una vez se llenen todos los cupos, deberás imprimir Cierre de las inscripciones."
          ],
          kind: "stdin",
          starter: "",
          tests: [
            {
              input: "tenis\n2\nnado\n3\ntenis\ntenis\nnado\ntenis\nnado\npadel\nnado\n",
              expected: "Inscrito/a\nInscrito/a\nInscrito/a\nNo hay cupos\nInscrito/a\nNo hay padel\nInscrito/a\nCierre de las inscripciones"
            },
            {
              input: "basquetbol\n2\nfutbol\n4\nfutbol\nfutbol\nfutbol\nfutbol\nbasquetbol\nbasquetbol\n",
              expected: "Inscrito/a\nInscrito/a\nInscrito/a\nInscrito/a\nInscrito/a\nInscrito/a\nCierre de las inscripciones"
            }
          ]
        },
        {
          id: "dcclub-c",
          title: "DCClub Recreativo - C",
          objective: [
            "El DCClub quiere registrar los datos de las personas que se inscriban en su primera actividad oficial: Programación Competitiva.",
            "Primero recibirás un int que representa la cantidad de cupos y luego, por cada postulante, su nombre, universidad y teléfono."
          ],
          requirements: [
            "El postulante debe pertenecer a la UC. Si no pertenece, la postulación se rechaza y el cupo queda disponible.",
            "El teléfono debe tener 9 dígitos. Si el postulante pertenece a la UC y el teléfono es incorrecto, se debe solicitar nuevamente hasta que tenga 9 dígitos.",
            "Por cada inscripción válida, imprime <nombre> <universidad> <numero_telefono>.",
            "El programa seguirá recibiendo postulaciones hasta llenar todos los cupos. No debes imprimir nada para los casos rechazados."
          ],
          kind: "stdin",
          starter: "",
          tests: [
            {
              input: "2\nJoaquin\nUC\n912345678\nMarta\nUChile\n9123456\nAgustin\nUC\n91234567\n9123456\n912345678\n",
              expected: "Joaquin UC 912345678\nAgustin UC 912345678"
            },
            {
              input: "3\nFelipe\nUC\n912345678\nAlberto\nUC\n921436587\nAndre\nUC\n123456789\n",
              expected: "Felipe UC 912345678\nAlberto UC 921436587\nAndre UC 123456789"
            }
          ]
        },
        {
          id: "dccurso-a",
          title: "DCCurso Universitario - A",
          objective: [
            "La universidad está recolectando y calculando los datos de sus estudiantes en el último semestre. Realiza un programa que, dado un str del nombre del alumno, imprima su mejor nota final junto a todos los cursos inscritos en los que la obtuvo.",
            "Con respecto a la forma en que se imprimen los cursos con la misma nota, estos deben ir en el mismo orden en el que están inscritos."
          ],
          moduleTitle: "Para esto contarás con el módulo dccdatos:",
          requirements: [
            "obtener_nota(codigo_curso, nombre_alumno): retorna un float con la nota del alumno en ese curso.",
            "obtener_cantidad_inscritos(nombre_alumno): retorna un int con la cantidad de cursos inscritos.",
            "obtener_curso_inscrito(nombre_alumno, i): retorna el código del i-ésimo curso inscrito."
          ],
          kind: "dcc_a",
          starter: "from dccdatos import obtener_nota, obtener_cantidad_inscritos, obtener_curso_inscrito\n\n",
          tests: [
            {
              input: "Carlos Sepulveda\n",
              expected: "6.1\nIIC1101\nFIL2001",
              explanation: "Se imprime la mayor nota final y luego los cursos en los que se obtuvo, respetando el orden de inscripción."
            }
          ]
        },
        {
          id: "dccurso-b",
          title: "DCCurso Universitario - B",
          objective: [
            "La universidad está recolectando los datos de los estudiantes para el nuevo semestre. Realiza un programa capaz de revisar en qué cursos, de un conjunto determinado, el alumno se encuentra inscrito.",
            "Primero recibirás un str con el nombre del estudiante y un int n con el número de cursos a revisar. Luego recibirás n códigos de curso."
          ],
          requirements: [
            "Imprime Si: <codigo_curso> si el estudiante lo tiene inscrito en el sistema.",
            "Imprime No: <codigo_curso> en caso contrario.",
            "Finalmente imprime <creditos_totales> creditos inscritos de los recibidos."
          ],
          moduleTitle: "Para esto contarás con el módulo dccdatos:",
          moduleItems: [
            "obtener_creditos(codigo_curso)",
            "obtener_cantidad_inscritos(nombre_alumno)",
            "obtener_curso_inscrito(nombre_alumno, i)"
          ],
          kind: "dcc_b",
          starter: "from dccdatos import obtener_creditos, obtener_cantidad_inscritos, obtener_curso_inscrito\n\n",
          tests: [
            {
              input: "Renata Alvarez\n5\nMAT1107\nAST101\nQIM100E\nDPT5000\nIIC2143\n",
              expected: "No: MAT1107\nSi: AST101\nNo: QIM100E\nSi: DPT5000\nNo: IIC2143\n10 creditos inscritos de los recibidos"
            }
          ]
        },
        {
          id: "oblongo",
          title: "Números Extraños - A",
          objective: [
            "Un número oblongo es aquel que es el producto de dos números positivos consecutivos. Por ejemplo, 30 es oblongo porque 5 · 6 = 30; 462 también es oblongo porque 21 · 22 = 462.",
            "Deberás escribir la función es_oblongo(numero), que recibe un int numero y retorna True si este es oblongo y False si no. numero siempre será positivo.",
            "No debes preocuparte por recibir inputs. Solo debes definir correctamente la función es_oblongo(numero)."
          ],
          kind: "func_oblongo",
          starter: "def es_oblongo(numero):\n    # escribe tu solución aquí\n    pass\n",
          tests: [
            { call: "es_oblongo(12)", expected: "True" },
            { call: "es_oblongo(10)", expected: "False" }
          ]
        },
        {
          id: "ondulado",
          title: "Números Extraños - B",
          objective: [
            "Un número ondulado es aquel que tiene 3 dígitos o más y se escribe alternando dos dígitos distintos: ababab... Por ejemplo, 14141 y 5757 son ondulados, pero 12345, 14131 y 555 no lo son.",
            "Deberás escribir la función es_ondulado(numero) que retorne True si numero es ondulado y False en caso contrario. numero siempre será positivo y tendrá largo mayor o igual a 3."
          ],
          moduleTitle: "Para esto cuentas con el módulo mates:",
          requirements: [
            "obtener_largo(numero): retorna la cantidad de dígitos del número.",
            "obtener_digito(numero, pos): entrega el dígito de la posición pos, comenzando desde 0 de izquierda a derecha.",
            "No debes preocuparte por recibir inputs. Solo debes definir correctamente es_ondulado(numero) y su retorno."
          ],
          kind: "func_ondulado",
          starter: "from mates import obtener_largo, obtener_digito\n\ndef es_ondulado(numero):\n    # escribe tu solución aquí\n    pass\n",
          tests: [
            { call: "es_ondulado(404)", expected: "True" },
            { call: "es_ondulado(1232)", expected: "False" }
          ]
        }
      ]
    }
  ]
};

import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ButtonToggleView from "./ButtonToggleView";
import RenderPreguntaIndividual from "./RenderPreguntaIndividual";

export default function RenderCurso() {
  const params = useParams();
  const { id_curso } = params;
  const [obj_curso, setObj_curso] = useState({
    _id: "Cargando...",
    created_by: "Cargando...",
    nombre: "Cargando...",
    temas: ["Cargando..."],
    descripcion: "Cargando...",
    enrolled_users: ["Cargando..."],
    teachers: ["Cargando..."],
    sections: ["Cargando..."],
    objs_preguntas: ["Cargando..."],
  });
  const [lista_secciones, setLista_secciones] = useState([]);
  // const [lista_actividades, setLista_actividades]=useState([])
  // const [lista_preguntas, setLista_preguntas]=useState([])
  const [obj_actividad_a_renderizar, setObj_actividad_a_renderizar] = useState({
    idSection: ["Cargando..."],
    name: "Cargando...",
    position: ["Cargando..."],
    questions: ["Cargando..."],
    totalScore: 0,
    answeredScore: 0,
  });

  const navigate = useNavigate();

  const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL, // Usa la URL de la variable de entorno
    withCredentials: true, // Si necesitas enviar cookies
  });

  // const [cantidadPreguntasRespondidas, setCantidadPreguntasRespondidas] = useState(0);
  // const [cantidadPreguntasCurso, setCantidadPreguntasCurso] = useState(0);

  const cargarDatosCurso = async (id_curso) => {
    try {
      const response = await api.post("/buscar-cursos", {
        palabra_a_buscar: `#: ${id_curso}`,
      });
      if (response.data.Status === 301 && response.data.docs[0]) {
        const nuevo_curso = response.data.docs[0];
        setObj_curso((obj_anterior_curso) => {
          let nuevo_obj_curso = {
            ...obj_anterior_curso,
            _id: nuevo_curso._id,
            created_by: nuevo_curso.created_by,
            nombre: nuevo_curso.nombre,
            temas: nuevo_curso.temas,
            descripcion: nuevo_curso.descripcion,
            enrolled_users: nuevo_curso.enrolled_users,
            teachers: nuevo_curso.teachers,
            sections: nuevo_curso.sections,
          };
          return nuevo_obj_curso;
        });
      }
    } catch (error) {
      console.error(`Error cargando los datos del curso ${id_curso}:`, error);
    }
  };

  useEffect(() => {
    cargarDatosCurso(id_curso);
  }, []);

  // Generamos la lista de secciones, actividades y preguntas cuando el curso se guarde en el obj_curso
  // useEffect(() => {
  //   let objs_secciones_validas = []
  //   try {
  //     const promesaSeccionesEncontradas = obj_curso.sections.map(async(id_seccion_individual) => {
  //       const response = await api.post("/buscar-secciones", {
  //         palabra_a_buscar: `#: ${id_seccion_individual}`
  //       })
  //       if (response.data.Status === 407 && response.data.docs[0]) {
  //         return response.data.docs[0]
  //       } else {
  //         console.error(`Error buscando la sección ${id_seccion_individual}`)
  //         return null
  //       }
  //     })

  //     const objs_lista_secciones = await Promise.all(promesaSeccionesEncontradas)
  //     objs_secciones_validas = objs_lista_secciones.filter((obj_seccion) => obj_seccion !== null);
  //   } catch (error) {
  //     console.error("Error generando la lista de secciones:", error)
  //   }

  //   let objs_actividades_validas = []
  //   try {
  //     const promesaActividadesEncontradas = objs_secciones_validas.map(async (obj_seccion_individual) => {
  //       return [...obj_seccion_individual.id_tasks.map(async (id_actividad_individual) => {
  //         const response = await api.post("/buscar-actividades", {
  //           palabra_a_buscar: `#: ${id_actividad_individual}`
  //         })
  //         if (response.data.Status === 507 && response.data.docs[0]) {
  //           return response.data.docs[0]
  //         } else {
  //           console.error(`Error buscando la actividad ${id_actividad_individual}`)
  //           return null
  //         }
  //       })]
  //     })

  //     const objs_lista_actividades = await Promise.all(promesaActividadesEncontradas)
  //     objs_actividades_validas = objs_lista_actividades.filter((obj_actividad) => obj_actividad !== null);
  //   } catch (error) {
  //     console.error("Error generando la lista de actividades:", error)
  //   }

  //   let objs_preguntas_validas = []
  //   try {
  //     const promesaPreguntasEncontradas = objs_actividades_validas.map(async (obj_actividad_individual) => {
  //       return [...obj_actividad_individual.questions.map(async (id_pregunta_individual) => {
  //         const response = await api.post("/buscar-preguntas", {
  //           palabra_a_buscar: `#: ${id_pregunta_individual}`
  //         })
  //         if (response.data.Status === 607 && response.data.docs[0]) {
  //           return response.data.docs[0]
  //         } else {
  //           console.error(`Error buscando la pregunta ${id_pregunta_individual}`)
  //           return null
  //         }
  //       })]
  //     })

  //     const objs_lista_preguntas = await Promise.all(promesaPreguntasEncontradas)
  //     objs_preguntas_validas = objs_lista_preguntas.filter((obj_pregunta) => obj_pregunta !== null);
  //   } catch (error) {
  //     console.error("Error generando la lista de preguntas:", error)
  //   }

  //   // Creamos la lista de secciones que contiene activiades
  //   setLista_secciones(() => {
  //     return objs_secciones_validas.map((obj_seccion_individual, index) => (
  //       <div className="d-flex justify-content-center align-items-center border-primary border-bottom">
  //         <h3 className="mx-2 my-3 p-0">
  //           {obj_seccion_individual.name}</h3>
  //           <ButtonToggleView
  //             data_contenidos={objs_actividades_validas}
  //             componenteAMostrar={"seccion-en-curso"}
  //             mensajeBtn={obj_seccion_individual.name}
  //             mensajeVacio={"No hay actividades!"}
  //             id_curso={id_curso}
  //             // cantidad_secciones_curso={curso.sections.length}
  //             // buscarActividad={buscarActividad}
  //             // arreglo_objetos_actividades_por_todas_las_secciones={data_actividades.map(
  //             //   (actividad_individual) => {
  //             //     return {
  //             //       id_task: actividad_individual._id,
  //             //       // amount_of_tasks: actividad_individual.id_tasks.length,
  //             //       task_name: actividad_individual.name,
  //             //       idSection: actividad_individual.idSection,
  //             //     };
  //             //   }
  //             // )}
  //             // rerenderPorActualizacionDeDatos={rerenderPorActualizacionDeDatos}
  //             // setRerenderPorActualizacionDeDatos={setRerenderPorActualizacionDeDatos}
  //           />
  //       </div>
  //     ))
  //   })
  // }, [obj_curso])

  useEffect(() => {
    const generarDatosCurso = async () => {
      try {
        // 1. Buscar las secciones
        const promesaSeccionesEncontradas = obj_curso.sections.map(
          async (id_seccion_individual) => {
            const response = await api.post("/buscar-secciones", {
              palabra_a_buscar: `#: ${id_seccion_individual}`,
            });
            if (response.data.Status === 407 && response.data.docs[0]) {
              return response.data.docs[0];
            } else {
              console.error(`Error buscando la sección ${id_seccion_individual}`);
              return null;
            }
          }
        );

        // Esperamos todas las secciones
        const objs_secciones_validas = (await Promise.all(promesaSeccionesEncontradas)).filter(
          (obj_seccion) => obj_seccion !== null
        );

        // 2. Buscar las actividades para cada sección
        const promesaActividadesEncontradas = objs_secciones_validas.map(
          async (obj_seccion_individual) => {
            const actividadesPromises = obj_seccion_individual.id_tasks.map(
              async (id_actividad_individual) => {
                const response = await api.post("/buscar-actividades", {
                  palabra_a_buscar: `#: ${id_actividad_individual}`,
                });
                if (response.data.Status === 507 && response.data.docs[0]) {
                  return response.data.docs[0];
                } else {
                  console.error(`Error buscando la actividad ${id_actividad_individual}`);
                  return null;
                }
              }
            );

            // Esperamos todas las actividades de la sección
            const actividades_validas = (await Promise.all(actividadesPromises)).filter(
              (actividad) => actividad !== null
            );

            // Retornamos la sección con sus actividades
            return { ...obj_seccion_individual, objs_actividades: actividades_validas };
          }
        );

        const objs_lista_secciones_con_actividades = await Promise.all(
          promesaActividadesEncontradas
        );

        // 3. Buscar las preguntas para cada actividad
        const promesaPreguntasEncontradas = objs_lista_secciones_con_actividades.map(
          async (obj_seccion_individual) => {
            const promesasPreguntas = obj_seccion_individual.objs_actividades.map(
              async (obj_actividad_individual) => {
                const preguntasPromises = obj_actividad_individual.questions.map(
                  async (id_pregunta_individual) => {
                    const response = await api.post("/buscar-preguntas", {
                      palabra_a_buscar: `#: ${id_pregunta_individual}`,
                    });
                    if (response.data.Status === 607 && response.data.docs[0]) {
                      return response.data.docs[0];
                    } else {
                      console.error(`Error buscando la pregunta ${id_pregunta_individual}`);
                      return null;
                    }
                  }
                );

                // Esperamos todas las preguntas de la actividad
                const preguntas_validas = (await Promise.all(preguntasPromises)).filter(
                  (pregunta) => pregunta !== null
                );

                return { ...obj_actividad_individual, objs_preguntas: preguntas_validas };
              }
            );

            // Asignamos las actividades con sus preguntas a la sección
            const actividadesConPreguntas = await Promise.all(promesasPreguntas);
            return { ...obj_seccion_individual, objs_actividades: actividadesConPreguntas };
          }
        );

        const secciones_finales = await Promise.all(promesaPreguntasEncontradas);
        console.log(`secciones_finales:`, secciones_finales);

        // 4. Actualizamos el estado para renderizar
        setLista_secciones(secciones_finales);
      } catch (error) {
        console.error("Error generando datos del curso:", error);
      }
    };

    if (obj_curso) {
      generarDatosCurso();
    }
  }, [obj_curso]);

  // Guardar las respuestas de la actividad renderizada actualmente en el arreglo de actividades de cada sección que tiene el curso en tiempo real
  useEffect(() => {
    setLista_secciones((lista_secciones_anterior) => {
      let nueva_lista_secciones = [...lista_secciones_anterior];
      if (!obj_actividad_a_renderizar || obj_actividad_a_renderizar._id == undefined) {
        return nueva_lista_secciones;
      }
      const index_actividad_renderizada = nueva_lista_secciones.findIndex(
        (obj_seccion_individual) =>
          obj_seccion_individual.id_tasks.includes(obj_actividad_a_renderizar._id.toString())
      );
      if (index_actividad_renderizada == -1) {
        return nueva_lista_secciones;
      }
      if (nueva_lista_secciones && nueva_lista_secciones.length > 0) {
        const index_actividad_renderizada_dentro_de_obj_seccion = nueva_lista_secciones[
          index_actividad_renderizada
        ].objs_actividades.findIndex(
          (obj_actividad_individual) =>
            obj_actividad_individual._id == obj_actividad_a_renderizar._id.toString()
        );
        if (index_actividad_renderizada_dentro_de_obj_seccion == -1) {
          return nueva_lista_secciones;
        }
        // Modificar el objeto actividad renderizado dentro de la lista de objs actividad en su sección padre
        nueva_lista_secciones[index_actividad_renderizada].objs_actividades[
          index_actividad_renderizada_dentro_de_obj_seccion
        ] = obj_actividad_a_renderizar;

        // Modificar la puntuación de la sección padre
        nueva_lista_secciones[index_actividad_renderizada].answeredScore =
          obj_actividad_a_renderizar.answeredScore;
        return nueva_lista_secciones;
      }
    });
  }, [obj_actividad_a_renderizar]);

  // Obtener la cantidad de respuestas contestadas por el usuario sin importar si son o no correctas utilizando el último valor de la lista de secciones del curso renderizado
  // useEffect(() => {
  //   let cantidadPreguntasTotalesCurso = 0;

  //   if (
  //     lista_secciones &&
  //     Array.isArray(lista_secciones.objs_actividades) &&
  //     lista_secciones.objs_actividades.length > 0
  //   ) {
  //     lista_secciones.objs_actividades.forEach((obj_actividad_individual) => {
  //       if (
  //         obj_actividad_individual &&
  //         Array.isArray(obj_actividad_individual.objs_preguntas) &&
  //         obj_actividad_individual.objs_preguntas.length > 0
  //       ) {
  //         obj_actividad_individual.objs_preguntas.forEach((obj_pregunta_individual) => {
  //           if (obj_pregunta_individual) {
  //             cantidadPreguntasTotalesCurso += 1;
  //           }
  //         });
  //       }
  //     });
  //   }

  //   // Actualiza el estado con la nueva cantidad de preguntas
  //   setCantidadPreguntasCurso(cantidadPreguntasTotalesCurso);
  // }, [lista_secciones, obj_curso]); // Dependencias del useEffect

  const calcularCantidadPreguntasContestadasCurso = () => {
    let cantidadPreguntasContestadasCurso = 0;

    if (Array.isArray(lista_secciones) && lista_secciones.length > 0) {
      lista_secciones.forEach((seccion) => {
        if (
          seccion &&
          Array.isArray(seccion.objs_actividades) &&
          seccion.objs_actividades.length > 0
        ) {
          seccion.objs_actividades.forEach((obj_actividad_individual) => {
            if (
              obj_actividad_individual &&
              Array.isArray(obj_actividad_individual.objs_preguntas) &&
              obj_actividad_individual.objs_preguntas.length > 0
            ) {
              obj_actividad_individual.objs_preguntas.forEach((obj_pregunta_individual) => {
                if (obj_pregunta_individual && obj_pregunta_individual.completed === true) {
                  cantidadPreguntasContestadasCurso += 1;
                }
              });
            }
          });
        }
      });
    }
    return cantidadPreguntasContestadasCurso;
  };

  const calcularCantidadPreguntasTotalesCurso = () => {
    let cantidadPreguntasTotalesCurso = 0;

    if (Array.isArray(lista_secciones) && lista_secciones.length > 0) {
      lista_secciones.forEach((seccion) => {
        if (
          seccion &&
          Array.isArray(seccion.objs_actividades) &&
          seccion.objs_actividades.length > 0
        ) {
          seccion.objs_actividades.forEach((obj_actividad_individual) => {
            if (
              obj_actividad_individual &&
              Array.isArray(obj_actividad_individual.objs_preguntas) &&
              obj_actividad_individual.objs_preguntas.length > 0
            ) {
              obj_actividad_individual.objs_preguntas.forEach((obj_pregunta_individual) => {
                if (obj_pregunta_individual) {
                  cantidadPreguntasTotalesCurso += 1;
                }
              });
            }
          });
        }
      });
    }
    return cantidadPreguntasTotalesCurso;
  };

  // const construirRespuestasUsuario = () => {
  //   let id_curso = obj_curso._id !== "Cargando..." ? obj_curso._id : "";

  //   const obj_respuestaCurso = {
  //     idCourse: id_curso,
  //     sections: lista_secciones.map((seccion) => {
  //       let totalScoreSeccion = 0;
  //       let answeredScoreSeccion = 0;
  //       let seccionCompletada = true;

  //       const tasks = seccion.objs_actividades.map((actividad) => {
  //         let totalScoreActividad = 0;
  //         let answeredScoreActividad = 0;
  //         let actividadCompletada = true;

  //         const questions = actividad.objs_preguntas.map((pregunta) => {
  //           totalScoreActividad += pregunta.totalScore || 0;
  //           answeredScoreActividad += pregunta.answeredScore || 0;

  //           if (!pregunta.completed) {
  //             actividadCompletada = false;
  //           }

  //           return {
  //             idQuestion: pregunta.idQuestion || "",
  //             completed: pregunta.completed || false,
  //             userAnswer: pregunta.userAnswer || "",
  //             correctAnswer: pregunta.correctAnswer || "",
  //             totalScore: pregunta.totalScore || 0,
  //             answeredScore: pregunta.answeredScore || 0,
  //           };
  //         });

  //         totalScoreSeccion += totalScoreActividad;
  //         answeredScoreSeccion += answeredScoreActividad;

  //         if (!actividadCompletada) {
  //           seccionCompletada = false;
  //         }

  //         return {
  //           idTask: actividad.idTask || "",
  //           completed: actividadCompletada,
  //           totalScore: totalScoreActividad,
  //           answeredScore: answeredScoreActividad,
  //           questions: questions,
  //         };
  //       });

  //       return {
  //         idSection: seccion.idSection || "",
  //         completed: seccionCompletada,
  //         totalScore: totalScoreSeccion,
  //         answeredScore: answeredScoreSeccion,
  //         tasks: tasks,
  //       };
  //     }),
  //   };

  //   return obj_respuestaCurso;
  // };

  const construirRespuestasUsuario = () => {
    let id_curso = obj_curso._id !== "Cargando..." ? obj_curso._id : "";

    const obj_respuestaCurso = {
      idCourse: id_curso,
      sections: lista_secciones.map((seccion) => {
        let totalScoreSeccion = 0;
        let answeredScoreSeccion = 0;
        let seccionCompletada = true;

        const tasks = seccion.objs_actividades.map((actividad) => {
          let totalScoreActividad = 0;
          let answeredScoreActividad = 0;
          let actividadCompletada = true;

          const questions = actividad.objs_preguntas.map((pregunta) => {
            totalScoreActividad += pregunta.totalScore || 0;
            answeredScoreActividad += pregunta.answeredScore || 0;

            if (!pregunta.completed) {
              actividadCompletada = false;
            }

            // Asegúrate de que userAnswer y correctAnswer tengan un valor válido
            return {
              idQuestion: pregunta._id.toString() || "", // Asegúrate de que no esté vacío
              completed: pregunta.completed || false,
              userAnswer: pregunta.answers !== undefined ? pregunta.answers : "", // Proporciona un valor por defecto
              correctAnswer: pregunta.correctAnswer !== undefined ? pregunta.correctAnswer : "", // Proporciona un valor por defecto
              totalScore: pregunta.totalScore || 0,
              answeredScore: pregunta.answeredScore || 0,
            };
          });

          totalScoreSeccion += totalScoreActividad;
          answeredScoreSeccion += answeredScoreActividad;

          if (!actividadCompletada) {
            seccionCompletada = false;
          }

          return {
            idTask: actividad._id.toString() || "", // Asegúrate de que no esté vacío
            completed: actividadCompletada,
            totalScore: totalScoreActividad,
            answeredScore: answeredScoreActividad,
            questions: questions,
          };
        });

        return {
          idSection: seccion._id.toString() || "", // Asegúrate de que no esté vacío
          completed: seccionCompletada,
          totalScore: totalScoreSeccion,
          answeredScore: answeredScoreSeccion,
          tasks: tasks,
        };
      }),
    };

    return obj_respuestaCurso;
  };

  // function construirRespuestasUsuario() {
  //   // const respuestasUsuario = {
  //   //   answers: [],
  //   // };

  //   const id_curso = obj_curso._id !== "Cargando..." ? obj_curso._id : "";

  //   const respuestasCurso = {
  //     idCourse: id_curso,
  //     sections: lista_secciones.map((seccion) => {
  //       const { idSection, tasks } = seccion;

  //       return {
  //         idSection: idSection,
  //         completed: tasks.every((task) => task.completed), // Ejemplo para determinar si la sección está completa
  //         totalScore: tasks.reduce((total, task) => total + task.totalScore, 0),
  //         answeredScore: tasks.reduce((total, task) => total + task.answeredScore, 0),
  //         tasks: tasks.map((task) => {
  //           const { idTask, questions } = task;

  //           return {
  //             idTask: idTask,
  //             completed: questions.every((question) => question.completed), // Ejemplo para determinar si la tarea está completa
  //             totalScore: questions.reduce((total, question) => total + question.totalScore, 0),
  //             answeredScore: questions.reduce(
  //               (total, question) => total + question.answeredScore,
  //               0
  //             ),
  //             questions: questions.map((question) => {
  //               const { idQuestion, userAnswer, correctAnswer, totalScore, answeredScore } =
  //                 question;

  //               return {
  //                 idQuestion: idQuestion,
  //                 completed: question.completed,
  //                 userAnswer: userAnswer,
  //                 correctAnswer: correctAnswer, // Se mantiene como Mixed para aceptar diferentes formatos
  //                 totalScore: totalScore,
  //                 answeredScore: answeredScore,
  //               };
  //             }),
  //           };
  //         }),
  //       };
  //     }),
  //   };

  //   // lis.forEach((respuesta) => {

  //   //   respuestasUsuario.answers.push(respuestasSeccion);
  //   // });

  //   return respuestasCurso;
  // }

  const handleGuardarRespuestasUsuario = async () => {
    // Contruimos las respuestas
    const obj_respuestas = construirRespuestasUsuario();
    let id_usuario_actual = "";

    console.log(`obj_respuestas:`, obj_respuestas);

    // Obtenemos el ID del usuario actual
    try {
      const response = await api.post("/obtener-id-usuario");
      if (response.data.id) {
        id_usuario_actual = response.data.id.toString();
      }
    } catch (error) {
      console.error("Error obteniendo el ID del usuario actual.");
    }

    // Guardamos las respuestas del usuario
    try {
      const response = await api.post("/guardar-respuestas-usuario-de-un-curso", {
        id_usuario: id_usuario_actual,
        obj_answers: obj_respuestas,
      });

      if (response.data.Status === 207) {
        navigate("/home", { state: { response_data: response.data } });
      }
    } catch (error) {
      console.error("Error actualizando las respuestas del usuario actual.");
    }
  };

  const renderPortadaDatosCurso = () => {
    return (
      <div className="container d-flex flex-column justify-content-center align-items-center">
        {/* Título del curso */}
        <div className="d-flex justify-content-start align-items-center w-100 mb-3 bg-body-tertiary rounded-3 overflow-hidden border-secondary border-bottom">
          {/* <h3 className="text-secondary-emphasis border-secondary border-end">Curso </h3> */}
          <h1 className="m-3">{obj_curso.nombre}</h1>
        </div>

        {/* Temas del curso */}
        <div className="d-flex justify-content-start align-items-center mb-3 w-100">
          {obj_curso.temas != [] ? (
            obj_curso.temas.map((tema, index) => (
              <p key={`tema-${index}`} className="m-0 text-secondary-emphasis">
                {index == 0 ? tema.charAt(0).toUpperCase() + tema.slice(1) : tema}
              </p>
            ))
          ) : (
            <p className="m-0 text-secondary-emphasis">No hay temas clave</p>
          )}
        </div>

        {/* Descripción del curso */}
        <div className="d-flex justify-content-start align-items-center mb-3 w-100">
          {obj_curso.descripcion != "" ? (
            <p className="m-0">{obj_curso.descripcion}</p>
          ) : (
            <p className="m-0">Soy un curso {id_curso} y me renderizaré...</p>
          )}
        </div>

        {/* Comenzar a contestar */}
        <div className="w-75">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setVisualizando("Contenido");
              if (
                lista_secciones.length > 0 &&
                lista_secciones &&
                lista_secciones[0].objs_actividades.length > 0 &&
                lista_secciones[0].objs_actividades
              ) {
                setObj_actividad_a_renderizar(lista_secciones[0].objs_actividades[0]);
              }
            }}
            className="btn btn-primary btn-lg w-100">
            Empezar a contestar
          </button>
        </div>
      </div>
    );
  };

  const renderContenidoCurso = () => {
    return (
      <div className="container d-flex flex-column justify-content-center align-items-center w-100">
        {obj_actividad_a_renderizar ? (
          // Renderizamos la sección que está en obj_actividad_a_renderizar
          <section name={obj_actividad_a_renderizar.name} className="w-100">
            {/* Título de la actividad */}
            <div className="d-flex flex-column justify-content-around align-items-center">
              <div className="d-flex justify-content-around align-items-center">
                <p className="text-secondary-emphasis border-secondary border-end pe-3 m-0">
                  Actividad
                </p>
                <h2 className="m-0 ms-3">{obj_actividad_a_renderizar.name}</h2>
              </div>
              <hr></hr>
            </div>

            {/* Preguntas de la actividad */}
            {obj_actividad_a_renderizar.objs_preguntas &&
            obj_actividad_a_renderizar.objs_preguntas.length > 0 ? (
              obj_actividad_a_renderizar.objs_preguntas.map((obj_pregunta_a_renderizar, index) => {
                // console.log(`obj_pregunta_a_renderizar:`, obj_pregunta_a_renderizar);
                // De renderPreguntaIndividual a RespuestaCompletarNumerosTabla no se está pasando bien el arreglo de listaElementosTabla
                // if (obj_pregunta_a_renderizar.typeOfQuestion == "Completar número en tabla") {
                //   let nueva_lista_elementos_tabla = [...obj_pregunta_a_renderizar.answers];

                //   nueva_lista_elementos_tabla.forEach((fila) => {
                //     if (fila.length > 0) {
                //       fila.forEach((celda) => {
                //         if (celda.completar) {
                //           celda.respuesta = "";
                //         }
                //       });
                //     }
                //   });

                //   obj_pregunta_a_renderizar.answers = nueva_lista_elementos_tabla;

                //   return (
                //     <div className="mb-3" key={`pregunta-${index}`}>
                //       <RenderPreguntaIndividual
                //         pregunta={obj_pregunta_a_renderizar}
                //         // listaElementosTablaProcesada={nueva_lista_elementos_tabla}
                //         obj_actividad_a_renderizar={obj_actividad_a_renderizar}
                //         setObj_actividad_a_renderizar={setObj_actividad_a_renderizar}
                //       />
                //     </div>
                //   );
                // }
                // console.log(`renderizo la pregunta:`, obj_pregunta_a_renderizar);
                // setCantidadPreguntasCurso((cantidadAnterior) => {
                //   return cantidadAnterior++;
                // });
                return (
                  <div className="mb-3 w-100" key={`pregunta-${index}`}>
                    <RenderPreguntaIndividual
                      pregunta={obj_pregunta_a_renderizar}
                      obj_actividad_a_renderizar={obj_actividad_a_renderizar}
                      setObj_actividad_a_renderizar={setObj_actividad_a_renderizar}
                      // cantidadPreguntasRespondidas={cantidadPreguntasRespondidas}
                      // setCantidadPreguntasRespondidas={setCantidadPreguntasRespondidas}
                    />
                  </div>
                );
              })
            ) : (
              <>
                <p>No hay preguntas, pase a la siguiente actividad</p>
              </>
            )}
          </section>
        ) : (
          <>
            <p>No hay actividades, pase a la siguiente sección</p>
          </>
        )}
      </div>
    );
  };

  const renderFinalizarCurso = () => {
    const cantidad_preguntas_totales_curso = calcularCantidadPreguntasTotalesCurso();
    const cantidad_preguntas_contestadas_por_usuario = calcularCantidadPreguntasContestadasCurso();
    return (
      <div className="container d-flex flex-column justify-content-center align-items-center">
        {/* Título del curso */}
        <div className="d-flex justify-content-start align-items-center w-100 mb-3 bg-body-tertiary rounded-3 overflow-hidden border-secondary border-bottom">
          {/* <h3 className="text-secondary-emphasis border-secondary border-end">Curso </h3> */}
          <h1 className="m-3">{obj_curso.nombre}</h1>
        </div>

        {/* Temas del curso */}
        <div className="d-flex justify-content-start align-items-center mb-3 w-100">
          {obj_curso.temas != [] ? (
            obj_curso.temas.map((tema, index) => (
              <p key={`tema-${index}`} className="m-0 text-secondary-emphasis">
                {index == 0 ? tema.charAt(0).toUpperCase() + tema.slice(1) : tema}
              </p>
            ))
          ) : (
            <p className="m-0 text-secondary-emphasis">No hay temas clave</p>
          )}
        </div>

        {/* Descripción del curso */}
        <div className="d-flex justify-content-start align-items-center mb-3 w-100">
          {obj_curso.descripcion != "" ? (
            <p className="m-0">{obj_curso.descripcion}</p>
          ) : (
            <p className="m-0">Soy un curso '{id_curso}' y me renderizaré...</p>
          )}
        </div>

        {/* Conteo de respuestas */}
        <div>
          <p>
            Usted ha contestado {cantidad_preguntas_contestadas_por_usuario}/
            {cantidad_preguntas_totales_curso} preguntas
          </p>
          <p>Conteste todas para finalizar el curso.</p>
        </div>

        {/* Guardar las respuestas */}
        <div className="w-75">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handleGuardarRespuestasUsuario();
            }}
            className={
              cantidad_preguntas_contestadas_por_usuario == cantidad_preguntas_totales_curso
                ? "btn btn-success btn-lg w-100"
                : "btn btn-success btn-lg w-100 disabled"
            }>
            Mandar respuestas
          </button>
        </div>
      </div>
    );
  };

  const [visualizando, setVisualizando] = useState("Portada");
  const dict_funciones_para_cambiar_la_visualizacion = {
    Portada: renderPortadaDatosCurso(),
    Contenido: renderContenidoCurso(),
    Finalizar: renderFinalizarCurso(),
  };

  return (
    <div className="container d-flex flex-column justify-content-around align-items-start w-100 m-0">
      {/* Menú lateral de navegación del conenido del curso */}
      <nav className="navbar navbar-expand-lg bg-body-tertiary sticky-top">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">
            Navegación
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav flex-column">
              {/* Sección de portada el curso */}
              <li className="nav-item my-1">
                {/* <a className="nav-link active" aria-current="page" href="#">
                  Home
                </a> */}
                <button
                  className="btn btn-link text-secondary-emphasis"
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setVisualizando("Portada");
                  }}>
                  Portada del curso
                </button>
              </li>

              {/* Secciones a contestar del curso */}
              {obj_curso._id != "Cargando..." &&
              obj_curso.sections != "Cargando..." &&
              lista_secciones.length > 0 &&
              lista_secciones != [] &&
              lista_secciones ? (
                lista_secciones.map((obj_seccion_individual, index) => {
                  return (
                    <li className="nav-item my-1 w-100" key={`btn-navegacion-${index}`}>
                      {/* <button
                        className="btn btn-link text-secondary-emphasis"
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setVisualizando("Contenido");
                        }}>
                        {obj_seccion_individual.name}
                      </button> */}
                      <ButtonToggleView
                        data_contenidos={obj_seccion_individual.objs_actividades}
                        componenteAMostrar={"render-actividad-curso"}
                        mensajeBtn={obj_seccion_individual.name}
                        mensajeVacio={"No hay actividades"}
                        id_curso={obj_curso._id}
                        visualizando={visualizando}
                        setVisualizando={setVisualizando}
                        obj_actividad_a_renderizar={obj_actividad_a_renderizar}
                        setObj_actividad_a_renderizar={setObj_actividad_a_renderizar}
                        // cantidad_secciones_curso={curso.sections.length}
                        // // buscarActividad={buscarActividad}
                        // arreglo_objetos_actividades_por_todas_las_secciones={data_actividades.map(
                        //   (actividad_individual) => {
                        //     return {
                        //       id_task: actividad_individual._id,
                        //       // amount_of_tasks: actividad_individual.id_tasks.length,
                        //       task_name: actividad_individual.name,
                        //       idSection: actividad_individual.idSection,
                        //     };
                        //   }
                        // )}
                        // rerenderPorActualizacionDeDatos={rerenderPorActualizacionDeDatos}
                        // setRerenderPorActualizacionDeDatos={setRerenderPorActualizacionDeDatos}
                      />
                    </li>
                  );
                })
              ) : (
                <></>
              )}

              {/* Sección de finalizar el curso */}
              <li className="nav-item my-1">
                <button
                  className="btn btn-link text-secondary-emphasis"
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setVisualizando("Finalizar");
                  }}>
                  Finalizar el curso
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      {/* <div className="d-flex flex-column justify-content-center align-items-center w-25">
        <div className="d-flex justify-content-center align-items-center border-primary border-bottom">
          <a className="mx-2 my-3 p-0">Portada</a>
        </div>
      </div> */}

      {/* Contenido del curso */}
      <div className="w-100">{dict_funciones_para_cambiar_la_visualizacion[visualizando]}</div>
    </div>
  );
}

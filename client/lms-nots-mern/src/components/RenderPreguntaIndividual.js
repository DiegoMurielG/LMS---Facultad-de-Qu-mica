import axios from "axios";
import RenderContenidos from "./RenderContenidos";
import RespuestaAbierta from "./RespuestaAbierta";
import { useEffect, useState } from "react";
import RespuestaIntervaloNumerico from "./RespuestaIntervaloNumerico";
import RespuestaCompletarNumerosTabla from "./RespuestaCompletarNumerosTabla";
import RespuestaOpcionMultiple from "./RespuestaOpcionMultiple";

/**
 * Componente que renderiza una pregunta con solo los datos de la misma
 * @param {Pregunta} pregunta
 * @returns {JSX} componente de la pregunta
 */
export default function RenderPreguntaIndividual({
  pregunta,
  // listaElementosTablaProcesada = [],
  obj_actividad_a_renderizar = null,
  setObj_actividad_a_renderizar = null,
  cantidadPreguntasRespondidas = null,
  setCantidadPreguntasRespondidas = null,
}) {
  const [data_respuesta, setData_respuesta] = useState("");
  const [pregunta_contestada_correctamente, setPregunta_contestada_correctamente] = useState(false);
  const [cantidad_de_intentos, setCantidad_de_intentos] = useState(0);
  // console.log(`pregunta.answers:`, pregunta.answers);
  // Arreglo de respuestas de opción múltiple a utilizar
  const [listaRespuestasOpcionMultiple, setListaRespuestasOpcionMultiple] = useState(
    pregunta.answers
  );
  // Arreglo de elementos de la tabla a completar
  const [listaElementosTabla, setListaElementosTabla] = useState(pregunta.answers);
  // let tmpPregunta = <></>;

  // const [listaElementosTabla, setListaElementosTabla] = useState(() => {
  //   // let nueva_lista_elementos_tabla = [...pregunta.answers];

  //   if (pregunta.typeOfQuestion != "Completar número en tabla" && !pregunta.completedCorrectly) {
  //     // console.log(`pregunta.typeOfQuestion:`, pregunta.typeOfQuestion);
  //     return pregunta.answers;
  //   }
  //   let nueva_lista_elementos_tabla = pregunta.answers.map((fila) =>
  //     fila.map((celda) => ({ ...celda }))
  //   );
  //   // console.log(
  //   //   `Procesando en RenderPreguntaIndividual a -> nueva_lista_elementos_tabla:`,
  //   //   nueva_lista_elementos_tabla
  //   // );
  //   nueva_lista_elementos_tabla.forEach((fila) => {
  //     // console.log(`\nRecorriendo la fila:`, JSON.stringify(fila));
  //     if (fila.length > 0) {
  //       fila.forEach((celda) => {
  //         // console.log(`La celda.completar:`, celda.completar);
  //         // console.log(`La celda.respuesta:`, celda.respuesta);
  //         if (celda.completar && celda.respuesta != "" && !celda.correcta) {
  //           celda.respuesta = "";
  //         }
  //       });
  //     }
  //   });
  //   // console.log(`listaElementosTabla valdrá:`, nueva_lista_elementos_tabla);
  //   return nueva_lista_elementos_tabla;
  //   // return pregunta.answers;
  // });

  // const [listaElementosTabla, setListaElementosTabla] = useState(() => {
  //   let nueva_lista_elementos_tabla = [...pregunta.answers];

  //   // Si la pregunta no es de tipo "Completar número en tabla", simplemente devuelve la lista de respuestas
  //   if (pregunta.typeOfQuestion !== "Completar número en tabla") {
  //     return nueva_lista_elementos_tabla;
  //   }

  //   // Verifica que cada fila sea un array y luego procesa las celdas
  //   nueva_lista_elementos_tabla.forEach((fila, indexFila) => {
  //     if (Array.isArray(fila)) {
  //       fila.forEach((celda, indexCelda) => {
  //         if (celda.completar) {
  //           // Asegúrate de que celda tenga la propiedad `respuesta`
  //           if (typeof celda === "object" && celda !== null) {
  //             celda.respuesta = celda.respuesta || ""; // Si no tiene respuesta, inicializa como string vacío
  //           } else {
  //             // Si `celda` no es un objeto, lanza una advertencia o inicializa correctamente
  //             console.warn(
  //               `Celda en fila ${indexFila} y columna ${indexCelda} no es un objeto válido:`,
  //               celda
  //             );
  //           }
  //         }
  //       });
  //     } else {
  //       console.warn(`Fila ${indexFila} no es un arreglo válido:`, fila);
  //       // Si la fila no es un array, inicialízala como un array vacío para evitar errores
  //       nueva_lista_elementos_tabla[indexFila] = [];
  //     }
  //   });
  //   console.log(`nueva_lista_elementos_tabla:`, nueva_lista_elementos_tabla);
  //   return nueva_lista_elementos_tabla;
  // });

  const [numeroColumnas, setNumeroColumnas] = useState(pregunta.answers[0]?.length);
  const [numeroFilas, setNumeroFilas] = useState(pregunta.answers.length);

  // Utiliza useEffect para asegurarte de que listaElementosTabla se actualice cuando la pregunta cambie
  useEffect(() => {
    if (pregunta.typeOfQuestion === "Completar número en tabla" && !pregunta.completedCorrectly) {
      let nueva_lista_elementos_tabla = pregunta.answers.map((fila) =>
        fila.map((celda) => ({ ...celda }))
      );

      nueva_lista_elementos_tabla.forEach((fila) => {
        fila.forEach((celda) => {
          if (celda.completar && celda.respuesta !== "" && !celda.correcta) {
            celda.respuesta = "";
          }
        });
      });
      console.log(`1- pregunta.answers:`, pregunta.answers);
      console.log(`1- nueva_lista_elementos_tabla:`, nueva_lista_elementos_tabla);
      setListaElementosTabla(nueva_lista_elementos_tabla);
      console.log(`2- pregunta.answers:`, pregunta.answers);
      console.log(`2- nueva_lista_elementos_tabla:`, nueva_lista_elementos_tabla);
      // tmpPregunta = handleRenderPregunta(pregunta);
    } else if (
      pregunta.typeOfQuestion === "Completar número en tabla" &&
      pregunta.completedCorrectly &&
      Array.isArray(pregunta.answers)
    ) {
      // console.log(`2-pregunta.answers:`, pregunta.answers);
      // Se contestó correctamente la pregunta de la tabla
      let nueva_lista_elementos_tabla = pregunta.answers;
      setListaElementosTabla(nueva_lista_elementos_tabla);
    } else {
      // Se tiene otro tipo de pregunta
      let nueva_lista_elementos_tabla = [
        [
          {
            id: "1920728677bMATmgdyjyWKPvLyG",
            respuesta: "Cargando...",
            correcta: false,
            valorRespuesta: 0,
            completar: false,
            texto: false,
            numerico: false,
            aparecer_al_completar_tabla: false,
          },
          {
            id: "1920728677b5oEHZ28BYTwpAnjB",
            respuesta: "Cargando...",
            correcta: false,
            valorRespuesta: 0,
            completar: false,
            texto: false,
            numerico: false,
            aparecer_al_completar_tabla: false,
          },
          {
            id: "192072877f8HZ1oQmsBh1D1MlDL",
            respuesta: "Cargando...",
            correcta: false,
            valorRespuesta: 0,
            completar: false,
            texto: false,
            numerico: false,
            aparecer_al_completar_tabla: true,
          },
          {
            id: "19207289334SEGMPbgqxnv0AbDs",
            respuesta: "Cargando...",
            correcta: false,
            valorRespuesta: 0,
            completar: false,
            texto: false,
            numerico: false,
            aparecer_al_completar_tabla: false,
          },
          {
            id: "19207289fb2pbXxqitUVMnST7QA",
            respuesta: "Cargando...",
            correcta: false,
            valorRespuesta: 0,
            completar: false,
            texto: false,
            numerico: false,
            aparecer_al_completar_tabla: true,
          },
          {
            id: "1920728ac2cOhk6Nj0EgVQmoBYh",
            respuesta: "Cargando...",
            correcta: false,
            valorRespuesta: 0,
            completar: false,
            texto: false,
            numerico: false,
            aparecer_al_completar_tabla: false,
          },
        ],
        [
          {
            id: "1920728677bUJ7IzPoOcA5EE3qb",
            respuesta: "Cargando...",
            correcta: false,
            valorRespuesta: 0,
            completar: false,
            texto: false,
            numerico: false,
            aparecer_al_completar_tabla: false,
          },
          {
            id: "1920728677bAzudExcMWtHFL9Ve",
            respuesta: "Cargando...",
            correcta: false,
            valorRespuesta: 0,
            completar: true,
            texto: true,
            numerico: false,
            aparecer_al_completar_tabla: false,
          },
          {
            id: "192072877f82RaZDJ2WE8naMDup",
            respuesta: "Cargando...",
            correcta: false,
            valorRespuesta: 0,
            completar: false,
            texto: false,
            numerico: false,
            aparecer_al_completar_tabla: true,
          },
          {
            id: "192072893341dj6oNwiqCZFWHaY",
            respuesta: "Cargando...",
            correcta: false,
            valorRespuesta: 0,
            completar: true,
            texto: true,
            numerico: false,
            aparecer_al_completar_tabla: false,
          },
          {
            id: "19207289fb2Nz8hQrJXO4ZHwK8H",
            respuesta: "Cargando...",
            correcta: false,
            valorRespuesta: 0,
            completar: false,
            texto: false,
            numerico: false,
            aparecer_al_completar_tabla: true,
          },
          {
            id: "1920728ac2cvfE0S2GucmU20CVN",
            respuesta: "Cargando...",
            correcta: false,
            valorRespuesta: 0,
            completar: false,
            texto: false,
            numerico: false,
            aparecer_al_completar_tabla: false,
          },
        ],
        [
          {
            id: "192072871e9VsWRjZW9ltl2z5CH",
            respuesta: "Cargando...",
            correcta: false,
            valorRespuesta: 0,
            completar: false,
            texto: false,
            numerico: false,
            aparecer_al_completar_tabla: false,
          },
          {
            id: "192072871e9suvK2wDjjJypAvQz",
            respuesta: "Cargando...",
            correcta: false,
            valorRespuesta: 0,
            completar: true,
            texto: true,
            numerico: false,
            aparecer_al_completar_tabla: false,
          },
          {
            id: "1920728908elPlC6qaBd83m6Zkc",
            respuesta: "Cargando...",
            correcta: false,
            valorRespuesta: 0,
            completar: false,
            texto: false,
            numerico: false,
            aparecer_al_completar_tabla: true,
          },
          {
            id: "192072893345erOSG7cBNMePi9m",
            respuesta: "Cargando...",
            correcta: false,
            valorRespuesta: 0,
            completar: true,
            texto: true,
            numerico: false,
            aparecer_al_completar_tabla: false,
          },
          {
            id: "19207289fb2a3bk454wDs6RJcMx",
            respuesta: "Cargando...",
            correcta: false,
            valorRespuesta: 0,
            completar: false,
            texto: false,
            numerico: false,
            aparecer_al_completar_tabla: true,
          },
          {
            id: "1920728ac2cIh1ih5qFQJalm7Hk",
            respuesta: "Cargando...",
            correcta: false,
            valorRespuesta: 0,
            completar: false,
            texto: false,
            numerico: false,
            aparecer_al_completar_tabla: false,
          },
        ],
      ];
      setListaElementosTabla(nueva_lista_elementos_tabla);
    }

    setCantidad_de_intentos(cantidad_de_intentos);
    if (cantidadPreguntasRespondidas != null) {
      setCantidadPreguntasRespondidas(cantidadPreguntasRespondidas);
    }

    return () => {
      // Limpiar el estado cuando el componente se desmonte (cambio de actividad)
      setListaElementosTabla([]);
    };
  }, [pregunta, obj_actividad_a_renderizar]);

  // useEffect para filtrar las respuestas de opción múltiple al cargar la respuesta y evitar trampas
  useEffect(() => {
    setListaRespuestasOpcionMultiple((prevList) => {
      let answersCopyList = [...prevList];
      let newAnswersList = answersCopyList.map((answer) => {
        return {
          ...answer,
          correcta: false,
        };
      });
      return newAnswersList;
    });
  }, []); // Si la lista solo necesita inicializarse una vez, puedes dejar las dependencias vacías.

  // useEffect(() => {
  //   if (pregunta.typeOfQuestion === "Completar número en tabla") {
  //     tmpPregunta = handleRenderPregunta(pregunta);
  //   }
  // }, [listaElementosTabla]);

  // useEffect(() => {
  //   if (Array.isArray(pregunta.answers)) {
  //     // Copia profunda de los elementos de la tabla
  //     const nuevaLista = pregunta.answers.map((fila) => fila.map((celda) => ({ ...celda })));
  //     setListaElementosTabla(nuevaLista);
  //   }
  // }, [pregunta.answers]);

  /**
   * Regresa un objeto JSX para renderizar según el tipo de pregunta que se coloca
   * @param {Pregunta} pregunta - Objeto pregunta
   * @returns {JSX} pregunta
   */
  const handleRenderPregunta = (pregunta) => {
    const renderPreguntaAbierta = (pregunta) => {
      return (
        <RespuestaAbierta
          data_respuesta={data_respuesta}
          setData_respuesta={setData_respuesta}
          valorPuntosPregunta={pregunta.totalScore}
          isDisabled={false}
          contestadaCorrectamente={pregunta_contestada_correctamente}
          preguntaContestada={cantidad_de_intentos}
        />
      );
    };

    const renderPreguntaOpcionMultiple = (pregunta) => {
      return (
        <RespuestaOpcionMultiple
          listaRespuestas={listaRespuestasOpcionMultiple}
          setListaRespuestas={setListaRespuestasOpcionMultiple}
          valorPuntosPregunta={pregunta.totalScore}
          isDisabled={false}
          contestadaCorrectamente={pregunta_contestada_correctamente}
          preguntaContestada={cantidad_de_intentos}
        />
      );
    };

    const renderPreguntaIntervaloNumerico = (pregunta) => {
      return (
        <RespuestaIntervaloNumerico
          listaRespuestas={data_respuesta}
          setListaRespuestas={setData_respuesta}
          valorPuntosPregunta={pregunta.totalScore}
          isDisabled={false}
          contestadaCorrectamente={pregunta_contestada_correctamente}
          preguntaContestada={cantidad_de_intentos}
        />
      );
    };

    const renderPreguntaCompletarNumerosTabla = (pregunta) => {
      // console.log(`pregunta completar numeros tabla:`, pregunta);

      if (!listaElementosTabla || listaElementosTabla.length === 0) {
        return <p>Cargando...</p>; // O algún mensaje de carga
      }

      console.log(`3- listaElementosTabla:`, listaElementosTabla);

      return (
        <RespuestaCompletarNumerosTabla
          listaElementosTabla={listaElementosTabla}
          setListaElementosTabla={setListaElementosTabla}
          numeroColumnas={numeroColumnas}
          setNumeroColumnas={setNumeroColumnas}
          numeroFilas={numeroFilas}
          setNumeroFilas={setNumeroFilas}
          isDisabled={false}
          contestadaCorrectamente={pregunta_contestada_correctamente}
          preguntaContestada={cantidad_de_intentos}
        />
      );

      // return (
      //   <RespuestaCompletarNumerosTabla
      //     // listaRespuestas={data_respuesta}
      //     // setListaRespuestas={setData_respuesta}
      //     // valorPuntosPregunta={pregunta.totalScore}
      //     // isDisabled={false}
      //     listaElementosTabla={listaElementosTabla}
      //     setListaElementosTabla={setListaElementosTabla}
      //     numeroColumnas={numeroColumnas}
      //     setNumeroColumnas={setNumeroColumnas}
      //     numeroFilas={numeroFilas}
      //     setNumeroFilas={setNumeroFilas}
      //     isDisabled={false}
      //     contestadaCorrectamente={pregunta_contestada_correctamente}
      //     preguntaContestada={cantidad_de_intentos}
      //   />
      // );
    };

    const tipo_de_pregunta = pregunta.typeOfQuestion;
    let componente_a_regresar = <></>;

    switch (tipo_de_pregunta) {
      case "Abierta":
        componente_a_regresar = renderPreguntaAbierta(pregunta);
        break;
      case "Opción múltiple":
        componente_a_regresar = renderPreguntaOpcionMultiple(pregunta);
        break;
      case "Intervalo numérico":
        componente_a_regresar = renderPreguntaIntervaloNumerico(pregunta);
        break;
      // "Varias preguntas"
      // "Interactiva secuencial"
      // "Completar un texto"
      // "Llenar datos y graficar"
      case "Completar número en tabla":
        componente_a_regresar = renderPreguntaCompletarNumerosTabla(pregunta);
        break;
      // "Video interactivo con preguntas"
      // "Secuencia de pasos"
      default:
        componente_a_regresar = <></>;
        break;
    }
    return componente_a_regresar;
  };

  const handleContestarPregunta = (e) => {
    const modificar_pregunta_en_obj_actividad_a_renderizar = (
      id_pregunta,
      respuesta_usuario,
      es_correcta_la_respuesta
    ) => {
      setObj_actividad_a_renderizar((obj_anterior) => {
        let nuevo_objeto = { ...obj_anterior };
        if (nuevo_objeto) {
          const index_pregunta_a_modificar = nuevo_objeto.objs_preguntas.findIndex(
            (obj_pregunta) => obj_pregunta._id == id_pregunta
          );
          if (index_pregunta_a_modificar == -1) {
            console.error(
              "La pregunta no se encontró dentro de la actividad renderizada actualmente."
            );
            return "La pregunta no se encontró dentro de la actividad renderizada actualmente.";
          }
          nuevo_objeto.objs_preguntas[index_pregunta_a_modificar].answers = respuesta_usuario;
          nuevo_objeto.objs_preguntas[index_pregunta_a_modificar].completed = true;
          // Colocar una puntuación a la pregunta
          // No se está cambiando ni en el obj_actividad_a_renderizar y por lo tanto tampoco en la lista_secciones_curso
          if (es_correcta_la_respuesta) {
            nuevo_objeto.objs_preguntas[index_pregunta_a_modificar].answeredScore =
              nuevo_objeto.objs_preguntas[index_pregunta_a_modificar].totalScore;
            nuevo_objeto.objs_preguntas[index_pregunta_a_modificar].completedCorrectly =
              es_correcta_la_respuesta;
            nuevo_objeto.objs_preguntas[index_pregunta_a_modificar].numberOfAttempts =
              cantidad_de_intentos;
            nuevo_objeto.answeredScore +=
              nuevo_objeto.objs_preguntas[index_pregunta_a_modificar].answeredScore;
          }
        }
        return nuevo_objeto;
      });
    };

    const evaluarPreguntaAbierta = (id_pregunta) => {
      let es_correcta = false;

      if (data_respuesta !== null || data_respuesta !== undefined) {
        es_correcta = true;
        setPregunta_contestada_correctamente(true);
      } else {
        setPregunta_contestada_correctamente(false);
      }

      // Si no estamos visualizando la pregunta en edición, es decir, si tenemos un objeto obj_actividad_a_renderizar a renderizar, guarda la respuesta en el objeto
      if (obj_actividad_a_renderizar) {
        // Usa 'es_correcta' en lugar del estado que se actualizará asíncronamente
        modificar_pregunta_en_obj_actividad_a_renderizar(id_pregunta, data_respuesta, es_correcta);
      }
    };

    const evaluarPreguntaOpcionMultiple = (pregunta_contra_la_que_comparar) => {
      let es_correcta = false;
      let respuestasUsuario = [];

      if (listaRespuestasOpcionMultiple && pregunta_contra_la_que_comparar.correctAnswer) {
        respuestasUsuario = listaRespuestasOpcionMultiple.filter(
          (respuesta) => respuesta.seleccionada
        );
        let respuestasCorrectas = pregunta_contra_la_que_comparar.correctAnswer;

        // Ej.: [true, true, false], en este caso 2 de 3 opciones correctas fuerón seleccionadas, por lo tanto, la pregunta está incompleta y por ende incorrecta
        let arregloBoolCorrecto = respuestasUsuario.map((respuestaUsuario) => {
          return respuestasCorrectas.find(({ id }) => id === respuestaUsuario.id);
        });

        if (!arregloBoolCorrecto.includes(undefined) && arregloBoolCorrecto.length > 0) {
          es_correcta = true;
          setPregunta_contestada_correctamente(true);
        } else {
          es_correcta = false;
          setPregunta_contestada_correctamente(false);
        }
      }

      // Si no estamos visualizando la pregunta en edición, es decir, si tenemos un objeto obj_actividad_a_renderizar a renderizar, guarda la respuesta en el objeto
      if (obj_actividad_a_renderizar) {
        // Usa 'es_correcta' en lugar de 'pregunta_contestada_correctamente'
        modificar_pregunta_en_obj_actividad_a_renderizar(
          pregunta_contra_la_que_comparar._id,
          respuestasUsuario,
          es_correcta
        );
      }
    };

    const evaluarPreguntaIntervaloNumerico = (pregunta_contra_la_que_comparar) => {
      let es_correcta = false;

      if (data_respuesta && pregunta_contra_la_que_comparar.correctAnswer) {
        const limInferior = pregunta_contra_la_que_comparar.correctAnswer[0].intervalo[0];
        const limSuperior = pregunta_contra_la_que_comparar.correctAnswer[0].intervalo[1];
        const valorUsuario = Number(data_respuesta[0]?.valor);

        if (
          valorUsuario >= limInferior &&
          valorUsuario <= limSuperior &&
          !isNaN(valorUsuario) &&
          valorUsuario !== undefined
        ) {
          es_correcta = true;
          setPregunta_contestada_correctamente(true);
        } else {
          setPregunta_contestada_correctamente(false);
        }
      }

      // Si no estamos visualizando la pregunta en edición, es decir, si tenemos un objeto obj_actividad_a_renderizar a renderizar, guarda la respuesta en el objeto
      if (obj_actividad_a_renderizar) {
        // Usa 'es_correcta' en lugar de 'pregunta_contestada_correctamente'
        modificar_pregunta_en_obj_actividad_a_renderizar(
          pregunta_contra_la_que_comparar._id,
          data_respuesta,
          es_correcta
        );
      }
    };

    // const evaluarPreguntaCompletarNumerosTabla = (pregunta_contra_la_que_comparar) => {
    //   if (
    //     pregunta_contra_la_que_comparar.correctAnswer &&
    //     pregunta_contra_la_que_comparar.correctAnswer.length > 0
    //   ) {
    //     // Extraemos las celdas a evaluar de toda la tabla
    //     let celdas_a_evaluar = [];
    //     let copia_listaElementosTabla = [...listaElementosTabla];
    //     copia_listaElementosTabla.forEach((fila) => {
    //       if (fila.length > 0) {
    //         fila.forEach((celda) => {
    //           if (celda.completar) {
    //             celdas_a_evaluar.push(celda);
    //           }
    //         });
    //       }
    //     });

    //     celdas_a_evaluar.forEach((celda_a_evaluar) => {
    //       let celda_contra_la_que_comparar = pregunta_contra_la_que_comparar.correctAnswer.find(
    //         ({ id }) => id === celda_a_evaluar.id
    //       );
    //       // Se contestó correctamente la respuesta
    //       if (celda_a_evaluar.respuesta == celda_contra_la_que_comparar.respuesta) {
    //         // Modifico el atributo correcta de la celda_a_evaluar a true dentro de lista_elementos_tabla
    //         setListaElementosTabla((prev_lista) => {
    //           let nueva_lista = [...prev_lista];
    //           nueva_lista.forEach((fila) => {
    //             if (fila.length > 0) {
    //               fila.forEach((celda) => {
    //                 if (celda.id == celda_a_evaluar.id) {
    //                   celda.correcta = true;
    //                 }
    //               });
    //             }
    //           });
    //           return nueva_lista;
    //         });
    //         setPregunta_contestada_correctamente(true);
    //       } else {
    //         // Modifico el atributo correcta de la celda_a_evaluar a false dentro de lista_elementos_tabla
    //         setListaElementosTabla((prev_lista) => {
    //           let nueva_lista = [...prev_lista];
    //           nueva_lista.forEach((fila) => {
    //             if (fila.length > 0) {
    //               fila.forEach((celda) => {
    //                 if (celda.id == celda_a_evaluar.id) {
    //                   celda.correcta = false;
    //                 }
    //               });
    //             }
    //           });
    //           return nueva_lista;
    //         });
    //         setPregunta_contestada_correctamente(false);
    //       }
    //     });
    //     console.log(`listaElementosTabla: `, JSON.stringify(listaElementosTabla));
    //   }
    // };

    // Mía
    const evaluarPreguntaCompletarNumerosTabla = (pregunta_contra_la_que_comparar) => {
      let es_correcta = false;
      if (
        pregunta_contra_la_que_comparar.correctAnswer &&
        pregunta_contra_la_que_comparar.correctAnswer.length > 0
      ) {
        // Extraemos las celdas a evaluar de toda la tabla
        let celdas_a_evaluar = [];
        let copia_listaElementosTabla = [...listaElementosTabla];

        copia_listaElementosTabla.forEach((fila) => {
          fila.forEach((celda) => {
            if (celda.completar) {
              celdas_a_evaluar.push(celda);
            }
          });
        });

        // Actualizamos el estado con la lista evaluada
        const nueva_lista = copia_listaElementosTabla.map((fila) =>
          fila.map((celda_a_evaluar) => {
            // Verificamos si la celda tiene que ser evaluada
            if (celda_a_evaluar.completar) {
              // Buscamos la celda correspondiente en la pregunta para comparar
              const celda_contra_la_que_comparar =
                pregunta_contra_la_que_comparar.correctAnswer.find(
                  ({ id }) => id === celda_a_evaluar.id
                );

              if (celda_contra_la_que_comparar) {
                // Si las respuestas coinciden, marcamos como correcta
                if (celda_a_evaluar.respuesta === celda_contra_la_que_comparar.respuesta) {
                  celda_a_evaluar.correcta = true;
                } else {
                  celda_a_evaluar.correcta = false;
                }
              }
            }
            return celda_a_evaluar;
          })
        );

        // Actualizamos la tabla con la nueva lista
        setListaElementosTabla(nueva_lista);

        // Verificamos si todas las celdas son correctas para establecer la pregunta como contestada correctamente
        const todasCorrectas = celdas_a_evaluar.every((celda) => celda.correcta);
        setPregunta_contestada_correctamente(todasCorrectas);
        es_correcta = todasCorrectas;

        // console.log(`listaElementosTabla actualizada: `, JSON.stringify(nueva_lista));
      }

      // Si no estamos visualizando la pregunta en edición, es decir, si tenemos un objeto obj_actividad_a_renderizar a renderizar, guarda la respuesta en el objeto
      if (obj_actividad_a_renderizar) {
        // Usa 'es_correcta' en lugar de 'pregunta_contestada_correctamente'
        modificar_pregunta_en_obj_actividad_a_renderizar(
          pregunta_contra_la_que_comparar._id,
          listaElementosTabla,
          es_correcta
        );
      }
    };

    // const evaluarPreguntaCompletarNumerosTabla = (pregunta_contra_la_que_comparar) => {
    //   let es_correcta = false;
    //   if (
    //     pregunta_contra_la_que_comparar.correctAnswer &&
    //     pregunta_contra_la_que_comparar.correctAnswer.length > 0
    //   ) {
    //     // Extraemos las celdas a evaluar de toda la tabla
    //     let celdas_a_evaluar = [];
    //     let copia_listaElementosTabla = [...listaElementosTabla];

    //     copia_listaElementosTabla.forEach((fila) => {
    //       fila.forEach((celda) => {
    //         if (celda.completar) {
    //           celdas_a_evaluar.push(celda);
    //         }
    //       });
    //     });

    //     // Actualizamos el estado con la lista evaluada
    //     const nueva_lista = copia_listaElementosTabla.map((fila) =>
    //       fila.map((celda_a_evaluar) => {
    //         // Verificamos si la celda tiene que ser evaluada
    //         if (celda_a_evaluar.completar) {
    //           // Buscamos la celda correspondiente en la pregunta para comparar
    //           const celda_contra_la_que_comparar =
    //             pregunta_contra_la_que_comparar.correctAnswer.find(
    //               ({ id }) => id === celda_a_evaluar.id
    //             );

    //           if (celda_contra_la_que_comparar) {
    //             // Si las respuestas coinciden, marcamos como correcta
    //             return {
    //               ...celda_a_evaluar,
    //               correcta: celda_a_evaluar.respuesta === celda_contra_la_que_comparar.respuesta,
    //             };
    //           }
    //         }
    //         return celda_a_evaluar; // Retornamos la celda sin cambios si no se evalúa
    //       })
    //     );

    //     // Actualizamos la tabla con la nueva lista
    //     setListaElementosTabla(nueva_lista);

    //     // Verificamos si todas las celdas son correctas
    //     const todasCorrectas = nueva_lista.flat().every((celda) => celda.correcta);
    //     setPregunta_contestada_correctamente(todasCorrectas);
    //     es_correcta = todasCorrectas;

    //     // Código para modificar el objeto si es necesario
    //     if (obj_actividad_a_renderizar) {
    //       modificar_pregunta_en_obj_actividad_a_renderizar(
    //         pregunta_contra_la_que_comparar._id,
    //         nueva_lista,
    //         es_correcta
    //       );
    //     }
    //   }
    // };

    e.preventDefault();
    const tipo_de_pregunta = pregunta.typeOfQuestion;
    setCantidad_de_intentos((anterior_cantidad_de_intentos) => {
      return anterior_cantidad_de_intentos + 1;
    });
    // Utilizamos cantidadAnterior + 1 en lugar de cantidadAnterior++ ya que en JS, el hacer cantidadAnterior++ regresa el valor antes de incrementar en 1 la variable, por lo que el estado siempre tendrá 1 menos.
    if (cantidadPreguntasRespondidas != null) {
      setCantidadPreguntasRespondidas((cantidadAnterior) => cantidadAnterior + 1);
    }

    switch (tipo_de_pregunta) {
      case "Abierta":
        evaluarPreguntaAbierta(pregunta._id);
        break;
      case "Opción múltiple":
        evaluarPreguntaOpcionMultiple(pregunta);
        break;
      case "Intervalo numérico":
        evaluarPreguntaIntervaloNumerico(pregunta);
        break;
      // "Varias preguntas"
      // "Interactiva secuencial"
      // "Completar un texto"
      // "Llenar datos y graficar"
      case "Completar número en tabla":
        evaluarPreguntaCompletarNumerosTabla(pregunta);
        break;
      // "Video interactivo con preguntas"
      // "Secuencia de pasos"

      default:
        setPregunta_contestada_correctamente(false);
        break;
    }
  };

  return (
    <div
      className="container d-flex flex-column justify-content-center align-items-center w-100 rounded-3 bg-body-secondary"
      id={pregunta._id.toString()}>
      {/* Contenido previo de la pregunta */}
      {pregunta.contents.map((id_contenido, index) => {
        return (
          <div key={`contenido-previo-${index}`}>
            <RenderContenidos
              contenidos={[id_contenido]}
              tipo_contenido_a_renderizar={"instrucciones"}
              contents_pregunta={pregunta.contents}
            />
          </div>
        );
      })}
      <hr></hr>

      {/* Título de la pregunta */}
      <div className="d-flex justify-content-center align-items-center w-100 mb-3">
        <div className="w-75 py-3 border-secondary border-end">
          <h3 className="m-0">{pregunta.question}</h3>
        </div>
        <div className="d-flex justify-content-end align-items-center w-25">
          <p className="text-secondary-emphasis m-0">Tipo: {pregunta.typeOfQuestion}</p>
        </div>
      </div>

      {/* Zona para contestar la pregunta */}
      <div className="container mb-3">{handleRenderPregunta(pregunta)}</div>
      {/* <div className="container mb-3">{tmpPregunta}</div> */}

      {/* Botón de contestar */}
      <div className="mb-3 w-100">
        <button
          className={
            pregunta.completedCorrectly
              ? "btn btn-success btn-lg mb-3 w-100 disabled"
              : "btn btn-success btn-lg mb-3 w-100"
          }
          type="button"
          onClick={(e) => {
            handleContestarPregunta(e);
          }}>
          Contestar
        </button>
      </div>

      <hr></hr>
      {/* Contenido posterior de la pregunta */}
      {pregunta_contestada_correctamente ? (
        <>
          <p>Contestada correctamente en {cantidad_de_intentos} intentos.</p>
          {pregunta.contents.map((id_contenido, index) => {
            return (
              <div key={`contenido-posterior-${index}`}>
                <RenderContenidos
                  contenidos={[id_contenido]}
                  tipo_contenido_a_renderizar={"retroalimentacion"}
                  contents_pregunta={pregunta.contents}
                />
              </div>
            );
          })}
        </>
      ) : (
        <></>
      )}
    </div>
  );
}

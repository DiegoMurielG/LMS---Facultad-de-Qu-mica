import axios from "axios";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import InputBuscador from "./InputBuscador";
import RenderPreguntaIndividual from "./RenderPreguntaIndividual";
import ButtonToggleView from "./ButtonToggleView";

export default function PreguntaIndividual({
  pregunta,
  flechaVacia,
  flechaLlena,
  cantidad_preguntas_por_actividad,
  arreglo_objetos_actividades_por_pregunta, //={arreglo_objetos_secciones_por_todas_las_actividades.filter(
  //   (seccion_individual) => seccion_individual.id_tasks.includes(contenido._id)
  // )}
  // arreglo_objetos_preguntas_por_actividad={arreglo_objetos_preguntas_por_actividad}
  rerenderPorActualizacionDeDatos,
  setRerenderPorActualizacionDeDatos,
}) {
  const [preguntaSeVe, setPreguntaSeVe] = useState(false);
  const [flechaSeccion, setFlechaPregunta] = useState(flechaVacia);
  const [classNamesContainerDataPregunta, setClassNamesContainerDataPregunta] = useState(
    "container d-flex flex-column d-none"
  );
  // const [lista_data_tasks, setLista_data_tasks] = useState([]);

  // Construir pregunta actual
  // let seccionConstruida = {
  //   idCourse: id_curso, // La FK que viene desde el curso
  //   _id: seccion._id,
  //   name: seccion.name, // Nombre de la pregunta
  //   position: seccion.position, // Posición de la pregunta dentro del curso (número de pregunta para ordenarlas)
  //   // -1 = al final => $push
  //   // 0 = al inicio => $push[0]
  //   id_tasks: seccion.id_tasks, // Arreglo de los ID’s en orden de las actividades que tiene la pregunta
  //   totalScore: seccion.totalScore, // Suma del valor de todas las actividades que contiene esta pregunta
  //   answeredScore: seccion.answeredScore, // Suma de todos los puntos obtenidos por el usuario al contestar todas las actividades de esta pregunta
  // };

  const [nombrePregunta, setNombrePregunta] = useState(pregunta.question);
  const [puntuacionPregunta, setPuntuacionPregunta] = useState(pregunta.totalScore);
  const [posicionPregunta, setPosicionPregunta] = useState(pregunta.position);

  // Input Buscador
  const [actividadesBuscadas, setActividadesBuscadas] = useState("");
  const [actividadesDisponibles, setActividadesDisponibles] = useState([]);
  const [actividadesSeleccionadas, setActividadesSeleccionadas] = useState([]);

  const handleBuscarActividades = (e) => {
    e.preventDefault();
    setActividadesBuscadas(e.target.value);
  };

  const handleToggleVerPregunta = (e) => {
    e.preventDefault();
    setPreguntaSeVe(!preguntaSeVe);
  };

  useEffect(() => {
    if (preguntaSeVe) {
      setFlechaPregunta(flechaLlena);
      setClassNamesContainerDataPregunta("container d-flex flex-column d-block");
    } else {
      setFlechaPregunta(flechaVacia);
      setClassNamesContainerDataPregunta("container d-flex flex-column d-none");
    }
  }, [preguntaSeVe]);

  const handleChangeNombrePregunta = (e) => {
    e.preventDefault();
    setNombrePregunta(e.target.value);
  };

  const handleChangePuntuacionPregunta = (e) => {
    e.preventDefault();
    const nuevaPuntuacionTotal = parseInt(e.target.value, 10);

    if (0 <= nuevaPuntuacionTotal) {
      setPuntuacionPregunta(e.target.value);
    } else {
      Swal.fire({
        title: "Ingrese un valor válido para la puntuación total de la pregunta",
        text: `El valor de la puntuación total para esta pregunta debe de ser igual o mayor a 0.`,
        showCancelButton: false,
        confirmButtonText: "Continuar",
        icon: "warning",
      });
    }
  };

  const handleChangePosicionPregunta = (e, datos_actividad_individual) => {
    e.preventDefault();
    const nuevaPosicion = parseInt(e.target.value, 10);
    const valor_maximo_posicion = cantidad_preguntas_por_actividad.find(
      (obj_cantidad_preguntas_por_actividad) =>
        obj_cantidad_preguntas_por_actividad.id_task === datos_actividad_individual._id.toString()
    ).cantidad_preguntas;
    if (nuevaPosicion >= 0 && nuevaPosicion < valor_maximo_posicion) {
      setPosicionPregunta((posicionesAnteriores) => {
        let nuevasPosiciones = [...posicionesAnteriores];
        const index = nuevasPosiciones.findIndex(
          ({ id_actividad }) => id_actividad === datos_actividad_individual._id.toString()
        );
        if (index > -1) {
          nuevasPosiciones[index].posicion_en_esta_actividad_padre = nuevaPosicion;
        }
        return nuevasPosiciones;
      });
    } else {
      Swal.fire({
        title: "Ingrese un valor válido para la posición de la pregunta",
        text: `El valor de posición para esta pregunta debe de ser igual o mayor a 0 y menor o igual a ${
          valor_maximo_posicion - 1
        }.`,
        showCancelButton: false,
        confirmButtonText: "Continuar",
        icon: "warning",
      });
    }
  };

  const handleActualizarPregunta = async (e = null) => {
    if (e) {
      e.preventDefault();
    }

    try {
      await axios.post("http://localhost:5000/api/actualizar-nombre-pregunta", {
        id_pregunta: pregunta._id,
        nombre_pregunta: nombrePregunta,
      });

      await axios.post("http://localhost:5000/api/actualizar-posicion-preguntas-curso", {
        id_pregunta: pregunta._id,
        idTask: pregunta.idTask,
        posicion: -1,
      });

      await axios.post("http://localhost:5000/api/aniadir-actividades-pregunta", {
        id_pregunta: pregunta._id,
        actividades_a_aniadir: actividadesSeleccionadas.map(
          (objeto_actividad) => objeto_actividad._id
        ),
      });

      await axios.post("http://localhost:5000/api/actualizar-puntuacion-pregunta", {
        id_pregunta: pregunta._id,
        puntuacion_total: puntuacionPregunta,
      });
    } catch (error) {
      console.error("Error actualizando la pregunta:", error);
    }
    Swal.fire({
      title: `Pregunta ${nombrePregunta} actualizada correctamente`,
      confirmButtonText: "Continuar",
      icon: "success",
    });
    setRerenderPorActualizacionDeDatos(true);
  };

  const handleConfirmarBorrarPregunta = (e, pregunta_id, pregunta_idTask) => {
    e.preventDefault();
    Swal.fire({
      title: `Seguro que desea borrar la pregunta\n ${pregunta.question}?`,
      showDenyButton: true,
      confirmButtonText: "Si, borrar",
      denyButtonText: "No, cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        borrarPregunta(pregunta_id, pregunta_idTask);
      }
    });
  };

  const borrarPregunta = async (pregunta_id, pregunta_idTask) => {
    alert("Borrando pregunta...");
    // Movemos la pregunta al final para que las preguntas que no se borrarán cambien de posición
    try {
      await axios.post("http://localhost:5000/api/actualizar-posicion-preguntas-curso", {
        id_pregunta: pregunta._id,
        idTask: pregunta.idTask,
        posicion: -1,
      });
    } catch (error) {
      console.error("Error actualizando la posición de la pregunta.", error);
    }

    try {
      await axios
        .post("http://localhost:5000/api/borrar-pregunta", {
          id_pregunta: pregunta._id,
          idTask: pregunta.idTask,
        })
        .then((response) => {
          Swal.fire({
            title: response.data.message,
            confirmButtonText: "Continuar",
            icon: "success",
          });
        })
        .catch((error) => {
          console.error("Error borrando la pregunta.", error);
        });
    } catch (error) {
      console.error("Error borrando la pregunta.", error);
    }
  };

  // Función para buscar actividades
  // const buscarActividades = async (id_task) => {
  //   try {
  //     const response = await axios.post("http://localhost:5000/api/buscar-actividades", {
  //       palabra_a_buscar: `#: ${id_task}`,
  //     });

  //     return response.data.docs[0].name; // Devuelve el nombre de la actividad
  //   } catch (error) {
  //     console.error(`Error buscando la actividad '${id_task}': ${error}`);
  //     return "Error al buscar actividad"; // En caso de error, devuelve un mensaje
  //   }
  // };

  // Función para borrar la actividad específica
  const handleRemoveThisTask = async (id_task_to_errase) => {
    try {
      await axios.post("http://localhost:5000/api/eliminar-actividad-de-pregunta", {
        id_pregunta: pregunta._id,
        id_actividad: id_task_to_errase,
      });
    } catch (error) {
      console.error(`Error buscando y eliminando la actividad '${id_task_to_errase}': ${error}`);
      return "Error al buscar y eliminar la actividad."; // En caso de error, devuelve un mensaje
    }
    window.location.reload();
  };

  // Efecto para obtener las actividades y renderizarlas
  // useEffect(() => {
  //   const obtenerActividades = async () => {
  //     const actividades = arreglo_objetos_actividades_por_seccion.map(
  //       async (task_individual, index) => {
  //         // const nombreActividad = await buscarActividades(id_task);
  //         // const nombreActividad = await buscarActividad(id_task);
  //         return (
  //           <div
  //             key={index}
  //             className="d-flex justify-content-between align-items-center bg-body-secondary border-light-subtle rounded-3 p-1 mx-2 my-1">
  //             <button
  //               onClick={(e) => {
  //                 e.preventDefault();
  //                 handleRemoveThisTask(task_individual.id_task);
  //               }}
  //               className="btn rounded-5 d-flex justify-content-center align-items-center p-1 me-1">
  //               <svg
  //                 xmlns="http://www.w3.org/2000/svg"
  //                 width="16"
  //                 height="16"
  //                 fill="currentColor"
  //                 className="bi bi-x-lg"
  //                 viewBox="0 0 16 16">
  //                 <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
  //               </svg>
  //             </button>
  //             <h3 className="me-3 my-2">{task_individual.task_name}</h3>
  //             <button className="btn btn-primary">Ver</button>
  //           </div>
  //         );
  //       }
  //     );
  //     // Creamos un array de promesas y esperamos su resolución
  //     // const actividades = await Promise.all(
  //     //   // seccion.id_tasks.map(async (id_task) => {
  //     // );

  //     setLista_data_tasks(actividades); // Actualiza el estado con el resultado de todas las promesas
  //   };

  //   obtenerActividades(); // Llamamos a la función para obtener las actividades
  // }, [arreglo_objetos_actividades_por_seccion]);

  // Búsqueda de actividades en tiempo real por input del usuario
  useEffect(() => {
    // Buscar la actividad escrito en la DB
    axios
      .post("http://localhost:5000/api/buscar-actividades", {
        palabra_a_buscar: actividadesBuscadas,
      })
      .then((response) => {
        // Obetnemos un arreglo con las coincidencias
        const actividadesEncontradas = response.data.docs;
        if (actividadesEncontradas.length > 0) {
          // Se encontró al menos 1 actividad que coincide con el nombre escrito
          // Las actividades obtenidas serán guardadas en actividadesDisponibles
          actividadesEncontradas.forEach((actividadEncontrada) => {
            // Guardamos el objeto de actividad dentro de actividadesDisponibles evitando que se repita
            let actividadEstaDisponible = actividadesDisponibles.find((actividad) => {
              return actividad._id === actividadEncontrada._id;
            });
            if (!actividadEstaDisponible) {
              // setActividadesDisponibles([...actividadesDisponibles, actividadEncontrada]);
              setActividadesDisponibles([
                ...actividadesDisponibles,
                {
                  _id: actividadEncontrada._id,
                  nombre: `${actividadEncontrada.name}`,
                },
              ]);
            }
          });
        } else {
          // No se encontrarón actividades que coincidieran con el texto ingresado en "actividadesBuscados" dentro del InputBuscador
          setActividadesDisponibles([]);
        }
      })
      .catch((error) => {
        console.error(`Error buscando la actividad ${actividadesBuscadas}.\n${error}`);
      });
  }, [actividadesBuscadas]);

  // useEffect(() => {
  //   setLista_data_tasks(
  //     seccion.id_tasks.map((id_task, index) => (
  //       <div
  //         key={index}
  //         className="d-flex justify-content-between align-items-center bg-body-secondary border-light-subtle rounded-3 p-1 mx-2 my-1">
  //         <h3 className="me-3 my-2">
  //           {
  //             // JSON.stringify(id_task)
  //             buscarActividades(id_task)
  //           }
  //         </h3>
  //         <button className="btn btn-primary">Ver</button>
  //       </div>
  //     ))
  //   );
  // }, [seccion.id_tasks]); //, preguntaSeVe

  return (
    <div className="contanier d-flex flex-column justify-content-center align-items-center rounded-3 mb-3 bg-body-tertiary overflow-hidden">
      <div className="d-flex justify-content-between align-items-center bg-body-tertiary w-100">
        {/* <span className="me-1">Sección:</span> */}
        <h2 className="my-0 w-75 my-3">
          {pregunta.question.charAt(0).toUpperCase() + pregunta.question.substring(1)}
        </h2>
        <button onClick={handleToggleVerPregunta} className="btn btn-primary btn-lg">
          Ver &nbsp;
          {flechaSeccion}
        </button>
      </div>
      <div className={classNamesContainerDataPregunta}>
        <div className="contanier d-flex justify-content-center align-items-center w-100 mt-3">
          <div className="d-flex flex-column justify-content-end align-items-start w-75 pe-3">
            <div className="form-floating mb-3 w-100">
              <input
                type="text"
                className="form-control"
                placeholder="Nombre de la sección"
                id="floatingInput-nombre-seccion"
                value={nombrePregunta}
                onChange={handleChangeNombrePregunta}
              />
              <label htmlFor="floatingInput-nombre-seccion">Nombre de la pregunta</label>
            </div>

            {/* <div className="form-floating mb-3 w-100">
              <input
                type="number"
                className="form-control"
                placeholder="Posición de la sección"
                id="floatingInput-posicion-seccion"
                value={posicionActividad}
                min={0}
                max={cantidad_secciones_curso - 1}
                onChange={handleChangePosicionActividad}
              />
              <label htmlFor="floatingInput-posicion-seccion">
                Posición de la sección [{0}-{cantidad_secciones_curso - 1}]
              </label>
            </div> */}

            <div className="form-floating mb-3 w-100">
              <input
                type="number"
                className="form-control"
                placeholder="Puntuación total de la sección"
                id="floatingInput-puntuacion-seccion"
                value={puntuacionPregunta}
                onChange={(e) => {
                  handleChangePuntuacionPregunta(e);
                }}
              />
              <label htmlFor="floatingInput-puntuacion-seccion">
                Puntuación total de la pregunta
              </label>
            </div>
          </div>
          <div className="d-flex flex-column justify-content-center align-items-center w-25">
            <button
              type="button"
              onClick={handleActualizarPregunta}
              className="btn btn-success mb-3 w-100">
              Actualizar
            </button>
            <button
              className="btn btn-danger w-100"
              onClick={(e) => handleConfirmarBorrarPregunta(e, pregunta._id, pregunta.idTask)}>
              Borrar
            </button>
          </div>
        </div>
        <div className="d-flex flex-column justify-content-center align-items-center">
          <h2></h2>
          <ButtonToggleView
            data_contenidos={[
              {
                _id: pregunta._id,
                typeOfQuestion: pregunta.typeOfQuestion,
                position: posicionPregunta,
                completed: false,
                idTask: pregunta.idTask,
                idBody: pregunta.idBody,
                question: nombrePregunta,
                totalScore: puntuacionPregunta,
                answeredScore: pregunta.answeredScore,
                answers: pregunta.answers,
                correctAnswer: pregunta.correctAnswer,
                idFeedback: pregunta.idFeedback,
                contents: pregunta.contents,
                questions: pregunta.questions,
                __v: 0,
              },
            ]}
            componenteAMostrar={"render-pregunta"}
            mensajeBtn={"Ver previsualización de la pregunta"}
            mensajeVacio={"Error construyendo la previsualización"}
            rerenderPorActualizacionDeDatos={rerenderPorActualizacionDeDatos}
            setRerenderPorActualizacionDeDatos={setRerenderPorActualizacionDeDatos}
          />

          {/* <RenderPreguntaIndividual pregunta={pregunta} /> */}
        </div>
        <h2 className="my-3 mt-5">Actividades</h2>
        <div className="d-flex flex-column justify-content-center align-items-center">
          {arreglo_objetos_actividades_por_pregunta.length > 0 ? (
            arreglo_objetos_actividades_por_pregunta.map((datos_actividad_individual, index) => {
              if (datos_actividad_individual.questions.includes(pregunta._id.toString())) {
                return (
                  // Mostrar la posición de la actividad dentro de cada sección
                  // ===============================================
                  // ===============================================
                  // ===============================================
                  // ====== TIENES QUE HACER QUE LAS ACTIVIDADES Y PREGUNTAS GUARDEN SU POSICIÓN CON BASE AL PADRE, ES DECIR, QUE UNA ACTIVIDAD EN EL CAMPO DE POSICIÓN GUARDE UN ARREGLO DE TUPLAS DONDE CADA UNA SEA DE LA SIGUIENTE MANERA ======
                  // =======
                  // actividad =
                  // {
                  //   ...demásPropiedades,
                  //     posicion: [
                  //       {
                  //         id_seccion: id_seccion_padre1,
                  //         posicion_en_esta_seccion_padre: posicion_en_esta_seccion_padre1,
                  //       },
                  //       {
                  //         id_seccion: id_seccion_padre2,
                  //         posicion_en_esta_seccion_padre: posicion_en_esta_seccion_padre2,
                  //       },
                  //       Y más objetos con la posición según la sección
                  //   ]
                  // }
                  // HACER LO MISMO PARA LAS PREGUNTAS PERO GUARDANDO EL ID DE LA ACTIVIDAD PADRE
                  // ====
                  // =========== TERMINAR DE CONSTRUIR LA ACTIVIDAD INDIVIDUAL ========
                  // ===============================================
                  // ===============================================
                  <div
                    key={index}
                    className="d-flex justify-content-between align-items-center bg-body-secondary border-light-subtle rounded-3 p-1 mx-2 my-1 w-75">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemoveThisTask(datos_actividad_individual._id);
                      }}
                      className="btn rounded-5 d-flex justify-content-center align-items-center p-1 me-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        className="bi bi-x-lg"
                        viewBox="0 0 16 16">
                        <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                      </svg>
                    </button>
                    <h3 className="mx-3 my-2 text-nowrap">{datos_actividad_individual.name}</h3>
                    <div className="form-floating my-2 mx-3 w-100">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Posición de la actividad"
                        id="floatingInput-posicion-actividad"
                        value={
                          // pregunta.position.find(
                          //   ({ id_actividad }) =>
                          //     id_actividad === datos_actividad_individual._id.toString()
                          // )?.posicion_en_esta_actividad_padre || 0
                          posicionPregunta.find(
                            (obj_posicion_pregunta_individual) =>
                              obj_posicion_pregunta_individual.id_actividad.toString() ===
                              datos_actividad_individual._id.toString()
                          )?.posicion_en_esta_actividad_padre || 0
                        }
                        // {
                        //   () => {
                        //     // console.log(`actividad.position:${JSON.stringify(actividad.position)}`);
                        //     const posicion = actividad.position.find(
                        //       ({ id_seccion }) => id_seccion === datos_actividad_individual.id_section
                        //     );

                        //     // Verificar si el objeto fue encontrado, y acceder a la propiedad o devolver 0 si no existe
                        //     const posicion_en_seccion = posicion
                        //       ? posicion.posicion_en_esta_actividad_padre
                        //       : 0;
                        //     return posicion_en_seccion;
                        //   }
                        //   // actividad.position.find(
                        //   //   ({ id_seccion }) => id_seccion === datos_actividad_individual.id_section
                        //   // ).posicion_en_esta_seccion_padre || 0
                        // }
                        min={0}
                        max={
                          cantidad_preguntas_por_actividad.find((obj_cantidad) => {
                            return (
                              obj_cantidad.id_task.toString() ===
                              datos_actividad_individual._id.toString()
                            );
                          }).cantidad_preguntas
                        }
                        onChange={(e) => {
                          handleChangePosicionPregunta(e, datos_actividad_individual);
                        }}
                      />
                      <label htmlFor="floatingInput-posicion-actividad">
                        Posición de la pregunta [{0}-
                        {cantidad_preguntas_por_actividad.find((obj_cantidad) => {
                          return (
                            obj_cantidad.id_task.toString() ===
                            datos_actividad_individual._id.toString()
                          );
                        }).cantidad_preguntas - 1}
                        ]
                      </label>
                    </div>
                    {/* ========================================================= */}
                    {/* ========================================================= */}
                    {/* ========================================================= */}
                    {/* ========================================================= */}
                    {/* ===================MODIFICAR LA POSICIÓN DE LAS ACTIVIDADES DENTRO DE LA SECCIÓN EDITADA, PROBAR A AÑADIR Y ELIMINAR SECCIONES A UNA ACTIVIDAD, CAMBIAR LA POSICIÓN DE LA ACTIVIDAD EN LA SECCIÓN Y LUEGO IR A HACER LO MISMO PERO CON LAS PREGUNTAS, ACABAS ESTO A MÁS TARDAR HOY EN LA NOCHE MAÑANA EN LA MAÑANA(11 O 12/09/2024)=================== */}
                    {/* ========================================================= */}
                    {/* ========================================================= */}
                    {/* ========================================================= */}
                    {/* ========================================================= */}

                    <button className="btn btn-primary">Ver</button>
                  </div>
                );
              } else {
                return <></>;
              }
            })
          ) : (
            <p>No se encontraron actividades, añada una!</p>
          )}
        </div>
        <hr></hr>
        <h3 className="mb-3 text-secondary-emphasis">Añadir actividades</h3>
        <div className="mb-3">
          <InputBuscador
            name="actividadesBuscadas-en-seccion"
            id="floatingInput-actividades-en-seccion"
            placeholder="Busque actividades por nombre"
            label="Actividades"
            onChange={(e) => {
              // console.log(e);
              handleBuscarActividades(e);
            }}
            value={actividadesBuscadas || ""}
            // searching={"actividades"}
            elementosDisponibles={actividadesDisponibles}
            elementosSeleccionados={actividadesSeleccionadas}
            setElementosSeleccionados={setActividadesSeleccionadas}
            aQuienAsignamos="pregunta"
            queBuscamos="actividades"
          />
        </div>
      </div>
    </div>
  );
}

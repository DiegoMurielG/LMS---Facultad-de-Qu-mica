import axios from "axios";
import { act, useEffect, useState } from "react";
import InputBuscador from "./InputBuscador";
import Swal from "sweetalert2";

export default function ActividadIndividual({
  actividad,
  flechaVacia,
  flechaLlena,
  arreglo_objetos_secciones_por_actividad,
  arreglo_objetos_preguntas_por_actividad,
  rerenderPorActualizacionDeDatos,
  setRerenderPorActualizacionDeDatos,
}) {
  const [actividadSeVe, setActividadSeVe] = useState(false);
  const [flechaActividad, setFlechaActividad] = useState(flechaVacia);
  const [classNamesContainerDataActividad, setClassNamesContainerDataActividad] = useState(
    "container d-flex flex-column d-none"
  );

  const [nombreActividad, setNombreActividad] = useState(actividad.name);
  const [posicionActividad, setPosicionActividad] = useState(actividad.position);
  // const [posicionPreguntas, setPosicionPreguntas] = useState(
  //   arreglo_objetos_preguntas_por_actividad
  // );
  // // Para sincrinizar el estado de la variable de estado posicionPreguntas con la del prop arreglo_objetos_preguntas_por_actividad
  // useEffect(() => {
  //   setPosicionPreguntas(arreglo_objetos_preguntas_por_actividad);
  // }, [arreglo_objetos_preguntas_por_actividad]);
  // actividad.position.find(({ id_seccion }) => id_seccion === datos_seccion_individual.id_section)
  // .posicion_en_esta_seccion_padre || 0

  // Input Buscador de Secciones
  const [seccionesBuscadas, setSeccionesBuscadas] = useState("");
  const [seccionesDisponibles, setSeccionesDisponibles] = useState([]);
  const [seccionesSeleccionadas, setSeccionesSeleccionadas] = useState([]);

  // Input Buscador de Preguntas
  const [preguntasBuscadas, setPreguntasBuscadas] = useState("");
  const [preguntasDisponibles, setPreguntasDisponibles] = useState([]);
  const [preguntasSeleccionadas, setPreguntasSeleccionadas] = useState([]);

  const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL, // Usa la URL de la variable de entorno
    withCredentials: true, // Si necesitas enviar cookies
  });

  const handleToggleVerActividad = (e) => {
    e.preventDefault();
    setActividadSeVe(!actividadSeVe);
  };

  // useEffect(() => {
  //   setPosicionPreguntas(arreglo_objetos_preguntas_por_actividad);
  // }, []);

  useEffect(() => {
    if (actividadSeVe) {
      setFlechaActividad(flechaLlena);
      setClassNamesContainerDataActividad("container d-flex flex-column d-block");
    } else {
      setFlechaActividad(flechaVacia);
      setClassNamesContainerDataActividad("container d-flex flex-column d-none");
    }
  }, [actividadSeVe]);

  const handleBuscarSecciones = (e) => {
    e.preventDefault();

    setSeccionesBuscadas(e.target.value);
  };

  // Búsqueda de secciones en tiempo real por input del usuario
  useEffect(() => {
    // Buscar la sección escrito en la DB
    api
      .post("/buscar-secciones", {
        palabra_a_buscar: seccionesBuscadas,
      })
      .then((response) => {
        // Obetnemos un arreglo con las coincidencias
        const seccionesEncontradas = response.data.docs;
        if (seccionesEncontradas.length > 0) {
          // Se encontró al menos 1 seccion que coincide con el nombre escrito
          // Las secciones obtenidas serán guardadas en seccionesDisponibles
          seccionesEncontradas.forEach((seccionEncontrada) => {
            // Guardamos el objeto de actividad dentro de seccionesDisponibles evitando que se repita
            let seccionEstaDisponible = seccionesDisponibles.find((seccion) => {
              return seccion._id === seccionEncontrada._id;
            });
            if (!seccionEstaDisponible) {
              // setseccionesDisponibles([...seccionesDisponibles, seccionEncontrada]);
              setSeccionesDisponibles([
                ...seccionesDisponibles,
                {
                  _id: seccionEncontrada._id,
                  nombre: `${seccionEncontrada.name}`,
                  id_tasks: seccionEncontrada.id_tasks,
                },
              ]);
            }
          });
        } else {
          // No se encontrarón secciones que coincidieran con el texto ingresado en "seccionesBuscados" dentro del InputBuscador
          setSeccionesDisponibles([]);
        }
      })
      .catch((error) => {
        console.error(`Error buscando la sección ${seccionesBuscadas}.\n${error}`);
      });
  }, [seccionesBuscadas]);

  const handleBuscarPreguntas = (e) => {
    e.preventDefault();

    setPreguntasBuscadas(e.target.value);
  };

  // Búsqueda de preguntas en tiempo real por input del usuario
  useEffect(() => {
    // Buscar la pregunta escrita en la DB
    api
      .post("/buscar-preguntas", {
        palabra_a_buscar: preguntasBuscadas,
      })
      .then((response) => {
        // Obetnemos un arreglo con las coincidencias
        const preguntasEncontradas = response.data.docs;
        console.log(preguntasEncontradas);
        if (preguntasEncontradas.length > 0) {
          // Se encontró al menos 1 pregunta que coincide con el nombre escrito
          // Las preguntas obtenidas serán guardadas en preguntasDisponibles
          preguntasEncontradas.forEach((preguntaEncontrada) => {
            // Guardamos el objeto de pregunta dentro de preguntasDisponibles evitando que se repita
            let preguntaEstaDisponible = preguntasDisponibles.find((pregunta) => {
              return pregunta._id === preguntaEncontrada._id;
            });
            if (!preguntaEstaDisponible) {
              setPreguntasDisponibles([
                ...preguntasDisponibles,
                {
                  _id: preguntaEncontrada._id,
                  valor_puntos_pregunta: preguntaEncontrada.totalScore,
                  nombre: (
                    <>
                      {preguntaEncontrada.question}
                      <br></br>
                      Tipo: {preguntaEncontrada.typeOfQuestion}
                    </>
                  ),
                },
              ]);
            }
          });
        } else {
          // No se encontrarón preguntas que coincidieran con el texto ingresado en "preguntasBuscados" dentro del InputBuscador
          setPreguntasDisponibles([]);
        }
      })
      .catch((error) => {
        console.error(`Error buscando la pregunta ${preguntasBuscadas}.\n${error}`);
      });
  }, [preguntasBuscadas]);

  // Función para borrar la sección específica
  const handleRemoveThisSection = async (id_section_to_errase) => {
    try {
      await api.post("/eliminar-seccion-de-actividad", {
        id_actividad: actividad._id,
        id_section: id_section_to_errase,
      });
    } catch (error) {
      console.error(`Error buscando y eliminando la actividad '${id_section_to_errase}': ${error}`);
      return "Error al buscar y eliminar la actividad."; // En caso de error, devuelve un mensaje
    }
    window.location.reload();
  };

  // Función para borrar la pregunta específica
  const handleRemoveThisPregunta = async (id_pregunta_to_errase) => {
    try {
      await api.post("/eliminar-pregunta-de-actividad", {
        id_actividad: actividad._id,
        id_pregunta: id_pregunta_to_errase,
      });
    } catch (error) {
      console.error(`Error buscando y eliminando la pregunta '${id_pregunta_to_errase}': ${error}`);
      return "Error al buscar y eliminar la pregunta."; // En caso de error, devuelve un mensaje
    }
    window.location.reload();
  };

  const handleChangeNombreActividad = (e) => {
    e.preventDefault();
    setNombreActividad(e.target.value);
  };

  const handleChangePosicionActividad = (e, datos_seccion_individual) => {
    e.preventDefault();
    const nuevaPosicion = parseInt(e.target.value, 10);

    if (nuevaPosicion >= 0 && nuevaPosicion < datos_seccion_individual.amount_of_tasks) {
      setPosicionActividad((posicionAnterior) => {
        // Crear una copia del array de posiciones
        const nuevaPosicionArray = [...posicionAnterior];

        // Encontrar el índice de la sección a modificar
        const index = nuevaPosicionArray.findIndex(
          ({ id_seccion }) => id_seccion === datos_seccion_individual.id_section
        );

        // Verificar si se encontró la sección
        if (index !== -1) {
          // Actualizar la posición en la sección encontrada
          nuevaPosicionArray[index].posicion_en_esta_seccion_padre = nuevaPosicion;
        }

        // Devolver la nueva copia del estado
        return nuevaPosicionArray;
      });
    } else {
      // Mostrar alerta si la posición es inválida
      Swal.fire({
        title: "Ingrese un valor válido para la posición de la actividad",
        text: `El valor de posición para esta actividad debe de ser igual o mayor a 0 y menor o igual a ${
          datos_seccion_individual.amount_of_tasks - 1
        }.`,
        showCancelButton: false,
        confirmButtonText: "Continuar",
        icon: "warning",
      });
    }
  };

  // const handleChangePosicionPregunta = (e, datos_pregunta_individual) => {
  //   e.preventDefault();
  //   const nuevaPosicion = parseInt(e.target.value, 10);

  //   if (nuevaPosicion >= 0 && nuevaPosicion < posicionPreguntas.length) {
  //     // setPosicionPreguntas((posicionAnterior) => {
  //     //   // Crear una copia del array de posiciones
  //     //   const nuevaPosicionArray = [...posicionAnterior];

  //     //   // Encontrar el índice de la pregunta a modificar
  //     //   const index = nuevaPosicionArray.findIndex(
  //     //     ({ id_pregunta }) => id_pregunta === datos_pregunta_individual._id.toString()
  //     //   );

  //     //   // Verificar si se encontró la sección
  //     //   if (index !== -1) {
  //     //     // Actualizar la posición en la sección encontrada
  //     //     nuevaPosicionArray[index].posicion_en_esta_seccion_padre = nuevaPosicion;
  //     //   }

  //     //   // Devolver la nueva copia del estado
  //     //   return nuevaPosicionArray;
  //     // });
  //     setPosicionPreguntas((posicionAnterior) => {
  //       // Crear una copia del array de posiciones
  //       const nuevaPosicionArray = [...posicionAnterior];

  //       const index = nuevaPosicionArray.questions.findIndex(
  //         (id_pregunta_individual) =>
  //           id_pregunta_individual === datos_pregunta_individual._id.toString()
  //       );
  //       // La pregunta está dentro del arreglo de questions de la actividad actual
  //       if (index > -1) {
  //         actividad.questions.splice(index, 1);
  //         actividad.questions.splice(nuevaPosicion, 0, datos_pregunta_individual._id.toString());
  //       }
  //     });
  //   } else {
  //     // Mostrar alerta si la posición es inválida
  //     Swal.fire({
  //       title: "Ingrese un valor válido para la posición de la pregunta",
  //       text: `El valor de posición para esta pregunta debe de ser igual o mayor a 0 y menor o igual a ${
  //         posicionPreguntas.length - 1
  //       }.`,
  //       showCancelButton: false,
  //       confirmButtonText: "Continuar",
  //       icon: "warning",
  //     });
  //   }
  // };
  // const handleChangePosicionPregunta = (e, datos_pregunta_individual) => {
  //   e.preventDefault();
  //   const nuevaPosicion = parseInt(e.target.value, 10);

  //   if (nuevaPosicion >= 0 && nuevaPosicion < arreglo_objetos_preguntas_por_actividad.length) {
  //     setPosicionPreguntas((preguntasConPosicionAnterior) => {
  //       // Hacer una copia del estado anterior
  //       const nuevaPosicionArray = [...preguntasConPosicionAnterior];

  //       // Encontrar el índice de la pregunta a modificar
  //       const index_obj_pregunta_a_actualizar = nuevaPosicionArray.findIndex(
  //         (pregunta_individual) =>
  //           pregunta_individual.position.findIndex((obj_position_individual) => {
  //             return obj_position_individual.id_actividad === actividad._id.toString();
  //           }) // === datos_pregunta_individual._id.toString()
  //       );

  //       const obj_pregunta_a_actualizar = nuevaPosicionArray[index_obj_pregunta_a_actualizar];

  //       const index_en_arreglo_position = obj_pregunta_a_actualizar.position.findIndex(
  //         (position_obj) => {
  //           return position_obj.id_actividad === actividad._id.toString();
  //         }
  //       );

  //       // Verificar si se encontró la pregunta
  //       if (index_en_arreglo_position !== -1) {
  //         // Remover la pregunta de su posición actual
  //         // const preguntaMovida = nuevaPosicionArray.splice(index_en_arreglo_position, 1)[0];
  //         const arreglo_con_pregunta_eliminada = nuevaPosicionArray[
  //           index_obj_pregunta_a_actualizar
  //         ].position.splice(index_en_arreglo_position, 1);

  //         // Insertar la pregunta en la nueva posición
  //         nuevaPosicionArray[index_obj_pregunta_a_actualizar].position.splice(
  //           nuevaPosicion,
  //           0,
  //           arreglo_con_pregunta_eliminada[0]
  //         );

  //         // nuevaPosicionArray.splice(nuevaPosicion, 0, preguntaMovida);

  //         // Actualizar el estado
  //         return {
  //           ...preguntasConPosicionAnterior,
  //           position: nuevaPosicionArray,
  //         };
  //       }

  //       // return posicionAnterior;
  //       return nuevaPosicionArray;
  //     });
  //   } else {
  //     // Mostrar alerta si la posición es inválida
  //     Swal.fire({
  //       title: "Ingrese un valor válido para la posición de la pregunta",
  //       text: `El valor de posición para esta pregunta debe ser igual o mayor a 0 y menor a ${
  //         posicionPreguntas?.position?.length || 0
  //       }.`,
  //       showCancelButton: false,
  //       confirmButtonText: "Continuar",
  //       icon: "warning",
  //     });
  //   }
  // };

  const handleActualizarActividad = async (e = null) => {
    if (e) {
      e.preventDefault();
    }

    try {
      await api.post("/actualizar-nombre-actividad", {
        id_actividad: actividad._id,
        nombre_actividad: nombreActividad,
      });

      // =================================================
      // Actualizando lo referente a las secciones
      // =================================================

      await api.post("/actualizar-posicion-actividad-seccion-desde-actividad", {
        id_actividad: actividad._id,
        // id_seccion: actividad,
        posicion: posicionActividad,
      });

      // Falta añadir el id de la nueva sección al campo idSection de la actividad a actualizar
      await api.post("/aniadir-secciones-actividad", {
        id_actividad: actividad._id,
        secciones_a_aniadir: seccionesSeleccionadas.map((objeto_seccion) => objeto_seccion._id),
      });

      // =================================================
      // Actualizando lo referente a las preguntas
      // =================================================

      await api.post("/aniadir-preguntas-actividad", {
        id_actividad: actividad._id,
        preguntas_a_aniadir: preguntasSeleccionadas.map((objeto_pregunta) => objeto_pregunta._id),
      });

      setRerenderPorActualizacionDeDatos(true);
    } catch (error) {
      console.error("Error actualizando la actividad:", error);
    }
    Swal.fire({
      title: `Actividad ${nombreActividad} actualizada correctamente`,
      confirmButtonText: "Continuar",
      icon: "success",
    });
  };

  const handleConfirmarBorrarActividad = (e, id_actividad, id_secciones, id_preguntas) => {
    e.preventDefault();
    Swal.fire({
      title: `Seguro que desea borrar la actividad\n ${actividad.name}?`,
      showDenyButton: true,
      confirmButtonText: "Si, borrar",
      denyButtonText: "No, cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        borrarActividad(id_actividad, id_secciones, id_preguntas);
      }
    });
  };

  const borrarActividad = async (id_actividad, id_secciones, id_preguntas) => {
    alert("Borrando actividad...");
    // // Movemos la actividad al final para que las secciones que no se borrarán cambien de posición
    try {
      await api.post("/actualizar-posicion-actividades-curso", {
        id_actividad: actividad._id,
        id_secciones: actividad.idSection,
        posicion: -1,
      });
    } catch (error) {
      console.error("Error actualizando la posición de la actividad.", error);
    }

    try {
      await api
        .post("/borrar-actividad", {
          id_actividad: actividad._id,
          // id_secciones: actividad.idSection,
          // id_tasks: id_tasks,
        })
        .then((response) => {
          Swal.fire({
            title: response.data.message,
            confirmButtonText: "Continuar",
            icon: "success",
          });
        })
        .catch((error) => {
          console.error("Error borrando la actividad.", error);
        });
    } catch (error) {
      console.error("Error borrando la actividad.", error);
    }
  };

  return (
    <div className="contanier d-flex flex-column justify-content-center align-items-center rounded-3 mb-3 bg-body-tertiary overflow-hidden">
      <div className="d-flex justify-content-between align-items-center bg-body-tertiary w-100">
        {/* <span className="me-1">Sección:</span> */}
        <h2 className="my-0 w-75 my-3">
          {actividad.name.charAt(0).toUpperCase() + actividad.name.substring(1)}
        </h2>
        <button onClick={handleToggleVerActividad} className="btn btn-primary btn-lg">
          Ver &nbsp;
          {flechaActividad}
        </button>
      </div>
      <div className={classNamesContainerDataActividad}>
        <div className="contanier d-flex justify-content-center align-items-center w-100 mt-3">
          <div className="d-flex flex-column justify-content-end align-items-start w-75 pe-3">
            <div className="form-floating mb-3 w-100">
              <input
                type="text"
                className="form-control"
                placeholder="Nombre de la sección"
                id="floatingInput-nombre-seccion"
                value={nombreActividad}
                onChange={handleChangeNombreActividad}
              />
              <label htmlFor="floatingInput-nombre-seccion">Nombre de la actividad</label>
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
                value={actividad.totalScore || 0}
                disabled
              />
              <label htmlFor="floatingInput-puntuacion-seccion">
                Puntuación total de la actividad
              </label>
            </div>
          </div>
          <div className="d-flex flex-column justify-content-center align-items-center w-25">
            <button
              type="button"
              onClick={handleActualizarActividad}
              className="btn btn-success mb-3 w-100">
              Actualizar
            </button>
            <button
              className="btn btn-danger w-100"
              onClick={(e) =>
                handleConfirmarBorrarActividad(
                  e,
                  actividad._id,
                  actividad.idSection,
                  actividad.questions
                )
              }>
              Borrar
            </button>
          </div>
        </div>
        <h2 className="my-3 mt-5">Secciones</h2>
        <div className="d-flex flex-column justify-content-center align-items-center">
          {arreglo_objetos_secciones_por_actividad.length > 0 ? (
            arreglo_objetos_secciones_por_actividad.map((datos_seccion_individual, index) => {
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
                      handleRemoveThisSection(datos_seccion_individual.id_section);
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
                  <h3 className="mx-3 my-2 text-nowrap">{datos_seccion_individual.section_name}</h3>
                  <div className="form-floating my-2 mx-3 w-100">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Posición de la actividad"
                      id="floatingInput-posicion-actividad"
                      value={
                        actividad.position.find(
                          ({ id_seccion }) => id_seccion === datos_seccion_individual.id_section
                        )?.posicion_en_esta_seccion_padre || 0
                      }
                      // {
                      //   () => {
                      //     // console.log(`actividad.position:${JSON.stringify(actividad.position)}`);
                      //     const posicion = actividad.position.find(
                      //       ({ id_seccion }) => id_seccion === datos_seccion_individual.id_section
                      //     );

                      //     // Verificar si el objeto fue encontrado, y acceder a la propiedad o devolver 0 si no existe
                      //     const posicion_en_seccion = posicion
                      //       ? posicion.posicion_en_esta_seccion_padre
                      //       : 0;
                      //     return posicion_en_seccion;
                      //   }
                      //   // actividad.position.find(
                      //   //   ({ id_seccion }) => id_seccion === datos_seccion_individual.id_section
                      //   // ).posicion_en_esta_seccion_padre || 0
                      // }
                      min={0}
                      max={datos_seccion_individual.amount_of_tasks - 1}
                      onChange={(e) => {
                        handleChangePosicionActividad(e, datos_seccion_individual);
                      }}
                    />
                    <label htmlFor="floatingInput-posicion-actividad">
                      Posición de la actividad [{0}-{datos_seccion_individual.amount_of_tasks - 1}]
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
            })
          ) : (
            <p>No se encontraron secciones, añada una!</p>
          )}
        </div>
        <hr></hr>
        <h3 className="mb-3 text-secondary-emphasis">Añadir secciones</h3>
        <div className="mb-3">
          <div className="mb-3">
            <InputBuscador
              name="seccionesBuscadas"
              id="floatingInput-secciones"
              placeholder="Busque secciones por nombre"
              label="Secciones"
              onChange={(e) => {
                // console.log(e);
                handleBuscarSecciones(e);
              }}
              value={seccionesBuscadas}
              // searching={"actividades"}
              elementosDisponibles={seccionesDisponibles}
              elementosSeleccionados={seccionesSeleccionadas}
              setElementosSeleccionados={setSeccionesSeleccionadas}
              aQuienAsignamos="actividad"
              queBuscamos="seccion"
            />
          </div>
        </div>

        {/* Preguntas */}
        <h2 className="my-3">Preguntas</h2>
        <div className="d-flex flex-column justify-content-center align-items-center">
          {arreglo_objetos_preguntas_por_actividad.length > 0 ? (
            arreglo_objetos_preguntas_por_actividad.map((datos_pregunta_individual, index) => {
              if (!datos_pregunta_individual.idTask.includes(actividad._id)) {
                return <p key={index}>No se encontraron preguntas, añada una!</p>;
              } else {
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
                    className="d-flex justify-content-between align-items-center bg-body-secondary border-light-subtle rounded-3 p-1 mx-2 my-1 w-100">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemoveThisPregunta(datos_pregunta_individual._id);
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
                    <div className="d-flex flex-wrap">
                      <h3 className="mx-3 my-2 text-nowrap">
                        {datos_pregunta_individual.question}
                      </h3>
                      <div className="form-floating my-2 mx-3 w-100">
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Posición de la pregunta"
                          id="floatingInput-posicion-pregunta"
                          value={
                            datos_pregunta_individual.position.find(
                              ({ id_actividad }) => id_actividad === actividad._id
                            )?.posicion_en_esta_actividad_padre || 0
                          }
                          min={0}
                          max={arreglo_objetos_preguntas_por_actividad.length - 1 || 0}
                          // onChange={(e) => {
                          //   handleChangePosicionPregunta(e, datos_pregunta_individual);
                          // }}
                          disabled={true}
                        />
                        <label htmlFor="floatingInput-posicion-pregunta">
                          Posición de la pregunta [{0}-
                          {arreglo_objetos_preguntas_por_actividad.length - 1}]
                        </label>
                      </div>
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
              }
            })
          ) : (
            <p>No se encontraron preguntas, añada una!</p>
          )}
        </div>
        <hr></hr>
        <h3 className="mb-3 text-secondary-emphasis">Añadir preguntas</h3>
        <div className="mb-3">
          <div className="mb-3">
            <InputBuscador
              name="preguntasBuscadas"
              id="floatingInput-preguntas"
              placeholder="Busque preguntas por nombre"
              label="Preguntas"
              onChange={(e) => {
                // console.log(e);
                handleBuscarPreguntas(e);
              }}
              value={preguntasBuscadas}
              // searching={"actividades"}
              elementosDisponibles={preguntasDisponibles}
              elementosSeleccionados={preguntasSeleccionadas}
              setElementosSeleccionados={setPreguntasSeleccionadas}
              aQuienAsignamos="actividad"
              queBuscamos="preguntas"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

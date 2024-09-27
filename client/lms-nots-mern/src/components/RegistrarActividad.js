import axios from "axios";
import { useEffect, useState } from "react";
import InputBuscador from "./InputBuscador";
import Swal from "sweetalert2";

export default function RegistrarActividad() {
  const [nombreActividad, setNombreActividad] = useState("");

  // Input Buscador
  const [preguntasBuscadas, setPreguntasBuscadas] = useState("");
  const [preguntasDisponibles, setPreguntasDisponibles] = useState([]);
  const [preguntasSeleccionadas, setPreguntasSeleccionadas] = useState([]);

  const [seccionesBuscadas, setSeccionesBuscadas] = useState("");
  const [seccionesDisponibles, setSeccionesDisponibles] = useState([]);
  const [seccionesSeleccionadas, setSeccionesSeleccionadas] = useState([]);

  axios.defaults.withCredentials = true;

  const handleBuscarPreguntas = (e) => {
    e.preventDefault();

    setPreguntasBuscadas(e.target.value);
  };

  // useEffect(() => {
  //   // Buscamos las preguntas que coincidan con preguntasBuscadas
  //   // axios.post("", {});
  //   // Colocamos esas preguntas en preguntasDisponibles
  //   // Al hacerles click las colocamos en preguntasSeleccionadas
  // }, [preguntasBuscadas]);

  // Búsqueda de preguntas en tiempo real por input del usuario
  useEffect(() => {
    // Buscar la pregunta escrita en la DB
    axios
      .post("https://lms-facultad-de-quimica.onrender.com/api/buscar-preguntas", {
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

  const handleBuscarSecciones = (e) => {
    e.preventDefault();

    setSeccionesBuscadas(e.target.value);
  };

  // Búsqueda de secciones en tiempo real por input del usuario
  useEffect(() => {
    // Buscar la sección escrito en la DB
    axios
      .post("https://lms-facultad-de-quimica.onrender.com/api/buscar-secciones", {
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

  const crearActividad = () => {
    let totalScoreActividad = 0;

    preguntasSeleccionadas.forEach((pregunta) => {
      totalScoreActividad += pregunta.valor_puntos_pregunta;
    });

    let actividad = {
      idSection: seccionesSeleccionadas.flatMap((seccionSeleccionada) => {
        return seccionSeleccionada._id;
      }), // Arreglo que guarda la sección a la que pertenece esta actividad (FK que viene de la sección)
      name: nombreActividad, // Cadena que guarda el nombre de la actividad
      position: seccionesSeleccionadas.flatMap((seccionSeleccionada) => {
        return {
          id_seccion: seccionSeleccionada._id,
          posicion_en_esta_seccion_padre: seccionSeleccionada.id_tasks.length,
          // En este caso como vamos a registrar la actividad en la sección 'seccionSeleccionada', sabemos que se agrega al final del arreglo de id_task de cada 'seccionSeleccionada', y como usamos índices en 0, cuando se pushé sera igual al length antes de registrar la actividad en el arreglo de id_tasks de la 'seccionSeleccionada'
        };
      }), // Posición de la actividad dentro de la sección correspondiente (número de actividad para ordenarlas)
      questions: preguntasSeleccionadas.flatMap((preguntaSeleccionada) => {
        return preguntaSeleccionada._id;
      }), // Arreglo de ID’s en orden de las preguntas que tiene la actividad
      totalScore: totalScoreActividad, // Suma del valor de todas las preguntas que contiene esta actividad
      answeredScore: 0, // Suma de todos los puntos obtenidos por el usuario al contestar todas las preguntas de esta actividad
    };

    return actividad;
  };

  // const handleSubmit = (e) => {
  //   e.preventDefault();

  //   alert("Registrando una actividad");
  //   // Registrar la actividad con los datos del formulario
  //   // nombreActividad
  //   // preguntasSeleccionadas
  //   let actividad = crearActividad();
  //   let id_actividad = "";
  //   axios
  //     .post("https://lms-facultad-de-quimica.onrender.com/api/registrar-actividad", {
  //       idSection: actividad.idSection, // Arreglo que guarda la sección a la que pertenece esta actividad (FK que viene de la sección)
  //       name: actividad.name, // Cadena que guarda el nombre de la actividad
  //       position: actividad.position, // Posición de la actividad dentro de la secci[on correspondiente] (número de actividad para ordenarlas)
  //       questions: actividad.questions, // Arreglo de ID’s en orden de las preguntas que tiene la actividad
  //       totalScore: actividad.totalScore, // Suma del valor de todas las preguntas que contiene esta actividad
  //       answeredScore: actividad.answeredScore,
  //     })
  //     .then((response) => {
  //       if (response.data.Status === 505) {
  //         id_actividad = response.data.content_id;
  //         Swal.fire({
  //           title: response.data.message,
  //           confirmButtonText: "Continuar",
  //           showCancelButton: false,
  //           icon: "success",
  //         });

  //         // Reset del formulario
  //         resetForm();
  //       } else {
  //         Swal.fire({
  //           title: response.data.message,
  //           confirmButtonText: "Continuar",
  //           showCancelButton: false,
  //           icon: "warning",
  //         });
  //       }
  //     })
  //     .catch((error) => {
  //       console.error(`Error guardando la pregunta.\n${error}`);
  //     });

  //   let preguntasActualizadasCorrectamente = false;
  //   // Buscar cada pregunta que contiene esta actividad registrada y colocar en su arreglo de idTask: [id_esta_actividad]
  //   const promesasPreguntas = preguntasSeleccionadas.flatMap(async (pregunta) => {
  //     let arregloActividadesPregunta = [];

  //     const set_activities_id_to_question_Promise = axios
  //       .post("https://lms-facultad-de-quimica.onrender.com/api/buscar-pregunta", {
  //         palabra_a_buscar: `#: ${pregunta._id}`,
  //       })
  //       .then((response) => {
  //         // Checar que la actividad no este ya en el arreglo
  //         let estaYaLaActividad = response.data.idTask.filter(
  //           (id_actividad_pregunta_buscada) => id_actividad_pregunta_buscada === id_actividad
  //         );
  //         if (!estaYaLaActividad) {
  //           arregloActividadesPregunta = [...response.data.idTask, id_actividad];
  //         }

  //         console.log(`arregloActividadesPregunta: ${arregloActividadesPregunta}`);

  //         // Actualizar el arreglo idTask de la pregunta
  //         axios
  //           .post("https://lms-facultad-de-quimica.onrender.com/api/actualizar-idTask-pregunta", {
  //             id_pregunta: pregunta._id,
  //             id_tasks_individuales: arregloActividadesPregunta,
  //           })
  //           .then((response) => {
  //             if (response.data.Status === 607) {
  //               preguntasActualizadasCorrectamente = true;
  //             } else {
  //               preguntasActualizadasCorrectamente = false;
  //             }
  //           })
  //           .catch((error) => {
  //             console.error(`Error actualizando la pregunta.\n${error}`);
  //           });
  //       });
  //     return Promise.all([set_activities_id_to_question_Promise]).then(() => pregunta);
  //   });
  //   Promise.all(promesasPreguntas)
  //     .then((updatedQuestions) => {
  //       if (preguntasActualizadasCorrectamente) {
  //         Swal.fire({
  //           title: "Preguntas actualizadas correctamente.",
  //           confirmButtonText: "Continuar",
  //           showCancelButton: false,
  //           icon: "success",
  //         });
  //       }
  //     })
  //     .catch((error) => {
  //       console.error("Error updating questions:", error);
  //     });
  //   // .catch((error) => {
  //   //   console.error("Error fetching questions:", error);
  //   // });
  // };

  // Función para resetear el formulario

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      alert("Registrando una actividad");

      // Construir la actividad
      let actividad = crearActividad();
      let id_actividad = "";

      // Registrar la actividad en la base de datos
      const response = await axios.post(
        "https://lms-facultad-de-quimica.onrender.com/api/registrar-actividad",
        {
          idSection: actividad.idSection,
          name: actividad.name,
          position: actividad.position,
          questions: actividad.questions,
          totalScore: actividad.totalScore,
          answeredScore: actividad.answeredScore,
        }
      );

      if (response.data.Status === 505) {
        id_actividad = response.data.content_id; // Actualiza id_actividad con el ID recibido del servidor

        Swal.fire({
          title: response.data.message,
          confirmButtonText: "Continuar",
          showCancelButton: false,
          icon: "success",
        });

        // Aquí es donde se actualizan las secciones con el nuevo ID de la actividad recién guardada
        const promesasSecciones = seccionesSeleccionadas.map(async (seccion_individual) => {
          const seccionResponse = await axios.post(
            "https://lms-facultad-de-quimica.onrender.com/api/buscar-secciones",
            {
              palabra_a_buscar: `#: ${seccion_individual._id}`,
            }
          );

          let arregloActividadesSeccionIndividual = seccionResponse.data.docs[0].id_tasks || [];

          if (!arregloActividadesSeccionIndividual.includes(id_actividad)) {
            arregloActividadesSeccionIndividual.push(id_actividad);
          }
          // La actividad ya tiene el objeto de posición correspondiente porque al crear la actividad para guardarla ya lo estamos haciendo
          await axios.post(
            "https://lms-facultad-de-quimica.onrender.com/api/aniadir-idTask-seccion",
            {
              id_seccion: seccion_individual._id,
              updated_id_tasks: arregloActividadesSeccionIndividual,
            }
          );
        });

        await Promise.all(promesasSecciones);

        // await axios.post("https://lms-facultad-de-quimica.onrender.com/api/actualizar-idSections-task", {
        //   id_task: id_actividad,
        //   updated_id_sections: actividad.position,
        // });

        // =====================================
        // =====================================
        // =====================================
        // =====================================
        // Actualizar las secciones selecionadas colocando la actividad registrada al final de su arreglo id_tasks y modificar el arreglo de position de la actividad registrada para tener la posición en cada sección padre
        // Haz lo mismo que hiciste en RegistrarSeccion, buscas cada sección por separado, modificas en el front el arreglo de id_task y a la par modificas el arreglo de position de esta actividad con cada sección
        // Al final guardas cada sección individual con el nuevo id de esta actividad agregado a su arreglo de id_tasks y modificas el arreglo de position de esta actividad para que sea el nuevo con la posición de la actividad en cada una de las secciones selecionadas
        // Repite lo mismo con las preguntas y luego continua generando el componente de ActividadIndividual
        // Finalmente corrige errores y continua con PreguntaIndividual
        // Luego expande el guardado de preguntas a cualquier tipo de pregunta
        // Crea un ejemplo para mostrarselo a Eva
        // Empieza con la recopilación de datos
        // Crea la visualización de todo para el usuario
        // Crea la visualización de todo para los maestros
        // =====================================
        // =====================================
        // =====================================
        // =====================================

        // Aquí es donde se actualizan las preguntas con el nuevo ID de actividad
        const promesasPreguntas = preguntasSeleccionadas.map(async (pregunta) => {
          const preguntaResponse = await axios.post(
            "https://lms-facultad-de-quimica.onrender.com/api/buscar-preguntas",
            {
              palabra_a_buscar: `#: ${pregunta._id}`,
            }
          );

          let arregloActividadesPregunta = preguntaResponse.data.docs[0].idTask || [];

          // Agregar el nuevo id_actividad si no está ya presente
          if (!arregloActividadesPregunta.includes(id_actividad)) {
            arregloActividadesPregunta.push(id_actividad);
          }

          // Actualizar la pregunta con el nuevo arreglo de actividades
          await axios.post(
            "https://lms-facultad-de-quimica.onrender.com/api/actualizar-idTask-pregunta",
            {
              id_pregunta: pregunta._id,
              id_tasks_individuales: arregloActividadesPregunta,
            }
          );
        });

        await Promise.all(promesasPreguntas);

        Swal.fire({
          title: "Preguntas actualizadas correctamente.",
          confirmButtonText: "Continuar",
          showCancelButton: false,
          icon: "success",
        });

        // Reset del formulario
        resetForm();
      } else {
        Swal.fire({
          title: response.data.message,
          confirmButtonText: "Continuar",
          showCancelButton: false,
          icon: "warning",
        });
      }
    } catch (error) {
      console.error(`Error guardando la actividad o actualizando las preguntas.\n${error}`);
    }
  };

  const resetForm = () => {
    setNombreActividad("");

    setPreguntasBuscadas("");
    setPreguntasDisponibles([]);
    setPreguntasSeleccionadas([]);

    setSeccionesBuscadas("");
    setSeccionesDisponibles([]);
    setSeccionesSeleccionadas([]);
  };

  return (
    <div className="container w-50 d-flex flex-column justify-content-center align-items-center mb-5">
      <div className="d-flex justify-content-center align-items-center">
        <h2 className="mb-3 me-3">Añadir actividad</h2>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1em"
          height="1em"
          fill="currentColor"
          className="bi bi-arrow-90deg-right"
          viewBox="0 0 16 16"
          style={{ transform: "rotate(90deg)" }}>
          <path
            fillRule="evenodd"
            d="M14.854 4.854a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708.708L13.293 4H3.5A2.5 2.5 0 0 0 1 6.5v8a.5.5 0 0 0 1 0v-8A1.5 1.5 0 0 1 3.5 5h9.793l-3.147 3.146a.5.5 0 0 0 .708.708z"
          />
        </svg>
      </div>
      <form
        onSubmit={(e) => {
          handleSubmit(e);
        }}>
        <div className="form-floating mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Nombre de la sección"
            id="floatingInput-nombre-actividad"
            onChange={(e) => {
              setNombreActividad(e.target.value);
            }}
            value={nombreActividad || ""} // Asegurarse de que siempre sea una cadena
          />
          <label htmlFor="floatingInput-nombre-actividad">Nombre de la actividad</label>
        </div>
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
        <button type="submit" className="btn btn-success my-3">
          Añadir
        </button>
      </form>
    </div>
  );
}

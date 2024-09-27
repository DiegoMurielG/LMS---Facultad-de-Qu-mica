import axios from "axios";
import { useEffect, useState } from "react";
import SeccionIndividual from "./SeccionIndividual";
import ButtonToggleView from "./ButtonToggleView";
import RegistrarSeccion from "./RegistrarSeccion";
import RegistrarActividad from "./RegistrarActividad";
import RegistrarPregunta from "./RegistrarPregunta";

export default function EditarSecciones({ curso }) {
  // Visibilidad de las secciones
  const [seccionesSeVen, setSeccionesSeVen] = useState(false);
  const flechaVacia = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      className="bi bi-caret-right"
      viewBox="0 0 16 16">
      <path d="M6 12.796V3.204L11.481 8zm.659.753 5.48-4.796a1 1 0 0 0 0-1.506L6.66 2.451C6.011 1.885 5 2.345 5 3.204v9.592a1 1 0 0 0 1.659.753" />
    </svg>
  );

  const flechaLlena = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      className="bi bi-caret-down-fill"
      viewBox="0 0 16 16">
      <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
    </svg>
  );
  const [flechaSecciones, setFlechaSecciones] = useState(flechaVacia);

  const [classNamesContainerDataSecciones, setClassNamesContainerDataSecciones] = useState(
    "container d-flex flex-column d-none"
  );

  // Datos de las secciones
  const [data_secciones, setData_secciones] = useState([
    // {
    //       idCourse: curso._id, // La FK que viene desde el curso
    //       name: "placeholder",
    //       position: 0, // Posición de la sección dentro del curso (número de sección para ordenarlas)
    //       id_tasks: ["placeholder", "placeholder", "placeholder"], // Arreglo de los ID’s en orden de las actividades que tiene la sección
    //       totalScore: 91, // Suma del valor de todas las actividades que contiene esta sección
    //       answeredScore: 0, // Suma de todos los puntos obtenidos por el usuario al contestar todas las actividades de esta sección
    // },
    // {
    //       idCourse: curso._id, // La FK que viene desde el curso
    //       name: "placeholder",
    //       position: 1, // Posición de la sección dentro del curso (número de sección para ordenarlas)
    //       id_tasks: ["placeholder", "placeholder", "placeholder"], // Arreglo de los ID’s en orden de las actividades que tiene la sección
    //       totalScore: 52, // Suma del valor de todas las actividades que contiene esta sección
    //       answeredScore: 0, // Suma de todos los puntos obtenidos por el usuario al contestar todas las actividades de esta sección
    // },
    // {
    //       idCourse: curso._id, // La FK que viene desde el curso
    //       name: "placeholder",
    //       position: 2, // Posición de la sección dentro del curso (número de sección para ordenarlas)
    //       id_tasks: ["placeholder", "placeholder", "placeholder"], // Arreglo de los ID’s en orden de las actividades que tiene la sección
    //       totalScore: 11, // Suma del valor de todas las actividades que contiene esta sección
    //       answeredScore: 0, // Suma de todos los puntos obtenidos por el usuario al contestar todas las actividades de esta sección
    // },
  ]);
  // Datos de las actividades
  const [data_actividades, setData_actividades] = useState([]);
  // Datos de las preguntas
  const [data_preguntas, setData_preguntas] = useState([]);

  const [lista_data_secciones, setLista_data_secciones] = useState([]);

  const [rerenderPorActualizacionDeDatos, setRerenderPorActualizacionDeDatos] = useState(false);

  axios.defaults.withCredentials = true;

  // const construirSecciones = (secciones) => {
  //   return secciones.flatMap(seccion => {
  //     return {
  //       idCourse: curso._id, // La FK que viene desde el curso
  //       name: seccion.name,
  //       position: seccion, // Posición de la sección dentro del curso (número de sección para ordenarlas)
  //       id_tasks: seccion, // Arreglo de los ID’s en orden de las actividades que tiene la sección
  //       totalScore: seccion, // Suma del valor de todas las actividades que contiene esta sección
  //       answeredScore: seccion, // Suma de todos los puntos obtenidos por el usuario al contestar todas las actividades de esta sección
  //     };
  //   });
  // }

  // Buscar secciones del curso y guardarlas en data_secciones
  // Corrección debajo
  const buscarYGuardarSecciones = async () => {
    console.log("dentro de buscarYGuardarSecciones");
    let listaSecciones = [];

    // Obtener las secciones del curso
    const promesasBusquedaSeccionesCurso = curso.sections.map(async (section_id) => {
      try {
        const response = await axios.post("http://localhost:5000/api/buscar-secciones", {
          palabra_a_buscar: `#: ${section_id}`,
        });

        if (response.data.docs[0]) {
          listaSecciones.push(response.data.docs[0]);
        }
      } catch (error) {
        console.error(error);
        curso.enrolled_users = "Error fetching sections";
      }
    });

    // Espera a que todas las promesas de las secciones terminen
    await Promise.all(promesasBusquedaSeccionesCurso);

    // Actualiza las secciones
    setData_secciones(listaSecciones);

    // Después de actualizar las secciones, busca y guarda las actividades
    await buscarYGuardarActividades(listaSecciones);
  };

  // Función mía debajo
  // const buscarYGuardarSecciones = async () => {
  //   console.log("dentro de buscarYGuardarSecciones");
  //   let listaSecciones = [];
  //   let listaSeccionesConstruidas = [];
  //   const promesasBusquedaSeccionesCurso = curso.sections.map(async (section_id) => {
  //     const promesaSeccionIndividual = axios
  //       .post("http://localhost:5000/api/buscar-secciones", {
  //         palabra_a_buscar: `#: ${section_id}`,
  //       })
  //       .then((response) => {
  //         if (response.data.docs[0]) {
  //           listaSecciones.push(response.data.docs[0]);
  //         }
  //       })
  //       .catch((error) => {
  //         console.error(error);
  //         curso.enrolled_users = "Error fetching sections";
  //       });

  //     return Promise.all([promesaSeccionIndividual]).then(() => section_id);
  //   });

  //   Promise.all(promesasBusquedaSeccionesCurso)
  //     .then((busquedaSeccionesCurso) => {
  //       // listaSeccionesConstruidas = construirSecciones(listaSecciones);
  //       setData_secciones(listaSecciones);
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching sections:", error);
  //     });
  //   await buscarYGuardarActividades(listaSecciones);
  // };

  const buscarActividad = async (id_task) => {
    try {
      const response = await axios.post("http://localhost:5000/api/buscar-actividades", {
        palabra_a_buscar: `#: ${id_task}`,
      });

      setData_actividades((prevDataActividades) => [...prevDataActividades, response.data.docs[0]]);
      return response.data.docs[0].name; // Devuelve el nombre de la actividad
    } catch (error) {
      console.error(`Error buscando la actividad '${id_task}': ${error}`);
      return "Error al buscar actividad"; // En caso de error, devuelve un mensaje
    }
  };

  // Buscar actividades según las secciones del curso
  const buscarYGuardarActividades = async (secciones) => {
    let listaActividades = [];

    // Por cada sección, buscar las actividades correspondientes
    const promesasBusquedaActividadesCurso = secciones.map(async (seccion_individual) => {
      const promesasActividadesDeSeccionIndividual = seccion_individual.id_tasks.map(
        async (task_id) => {
          try {
            const response = await axios.post("http://localhost:5000/api/buscar-actividades", {
              palabra_a_buscar: `#: ${task_id}`,
            });

            if (response.data.docs[0]) {
              const actividad = response.data.docs[0];

              // Verificar si la actividad ya existe en listaActividades
              const existeActividad = listaActividades.some((obj) => obj._id === actividad._id);

              if (!existeActividad) {
                listaActividades.push(actividad);
              }
            }
          } catch (error) {
            console.error(`Error buscando la actividad '${task_id}':`, error);
          }
        }
      );

      // Espera a que todas las actividades de la sección se completen
      await Promise.all(promesasActividadesDeSeccionIndividual);
    });

    // Espera que todas las promesas de actividades se completen
    await Promise.all(promesasBusquedaActividadesCurso);

    // Actualiza el estado asegurándote de eliminar duplicados
    setData_actividades((prevDataActividades) => {
      const nuevasActividades = [...prevDataActividades, ...listaActividades];

      // Eliminar duplicados en el estado
      const actividadesUnicas = nuevasActividades.filter(
        (actividad, index, self) => index === self.findIndex((a) => a._id === actividad._id)
      );

      return actividadesUnicas;
    });
    // Después de actualizar las actividades, busca y guarda las preguntas
    await buscarYGuardarPreguntas(listaActividades);
  };

  // Buscar preguntas según las actividades del curso
  const buscarYGuardarPreguntas = async (actividades) => {
    let listaPreguntas = [];

    // Por cada sección, buscar las actividades correspondientes
    const promesasBusquedaPreguntasCurso = actividades.map(async (actividad_individual) => {
      const promesasPreguntasDeActividadIndividual = actividad_individual.questions.map(
        async (question_id) => {
          try {
            const response = await axios.post("http://localhost:5000/api/buscar-preguntas", {
              palabra_a_buscar: `#: ${question_id}`,
            });

            if (response.data.docs[0]) {
              const pregunta = response.data.docs[0];

              // Verificar si la pregunta ya existe en listaPreguntas
              const existePregunta = listaPreguntas.some((obj) => obj._id === pregunta._id);

              if (!existePregunta) {
                listaPreguntas.push(pregunta);
              }
            }
          } catch (error) {
            console.error(`Error buscando la pregunta '${question_id}':`, error);
          }
        }
      );

      // Espera a que todas las preguntas de la actividad se completen
      await Promise.all(promesasPreguntasDeActividadIndividual);
    });

    // Espera que todas las promesas de preguntas se completen
    await Promise.all(promesasBusquedaPreguntasCurso);

    // Actualiza el estado asegurándote de eliminar duplicados
    setData_preguntas((prevDataPreguntas) => {
      const nuevasPreguntas = [...prevDataPreguntas, ...listaPreguntas];

      // Eliminar duplicados en el estado
      const preguntasUnicas = nuevasPreguntas.filter(
        (pregunta, index, self) => index === self.findIndex((p) => p._id === pregunta._id)
      );

      return preguntasUnicas;
    });
  };

  // const buscarYGuardarActividades = async () => {
  //   console.log("dentro de buscarYGuardarActiviades");
  //   // console.log(`data_actividades: ${JSON.stringify(data_actividades)}`);
  //   let listaActividades = data_actividades;
  //   // Por cada sección buscar las acividades correspondientes
  //   const promesasBusquedaActividadesCurso = data_secciones.map(async (seccion_individual) => {
  //     const promesaActividadesDeSeccionIndividual = seccion_individual.id_tasks.map(
  //       async (task_id) => {
  //         const promesaActividadIndividual = axios
  //           .post("http://localhost:5000/api/buscar-actividades", {
  //             palabra_a_buscar: `#: ${task_id}`,
  //           })
  //           .then((response) => {
  //             if (
  //               response.data.docs[0] &&
  //               listaActividades.indexOf((obj) => obj._id == task_id) == -1
  //             ) {
  //               listaActividades.push(response.data.docs[0]);
  //               console.log(`listaActividades: ${JSON.stringify(listaActividades)}`);
  //             }
  //           })
  //           .catch((error) => {
  //             console.error("Error fetching tasks:", error);
  //             curso.enrolled_users = "Error fetching tasks";
  //           });
  //         return await Promise.all([promesaActividadIndividual]).then(() => task_id);
  //       }
  //     );
  //     return await Promise.all([promesaActividadesDeSeccionIndividual]).then(
  //       () => seccion_individual
  //     );
  //   });

  //   await Promise.all(promesasBusquedaActividadesCurso)
  //     .then((busquedaActividadesCurso) => {
  //       // listaActividadesConstruidas = construirSecciones(listaActividades);
  //       setData_actividades(listaActividades);
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching tasks:", error);
  //     });
  // };

  useEffect(() => {
    const buscarDatosCurso = async () => {
      await buscarYGuardarSecciones();
    };

    buscarDatosCurso();
  }, []);

  useEffect(() => {
    if (rerenderPorActualizacionDeDatos) {
      buscarYGuardarSecciones();
      setRerenderPorActualizacionDeDatos(false);
    }
  }, [rerenderPorActualizacionDeDatos]);

  const handleToggleVerSecciones = (e) => {
    e.preventDefault();
    // Alternar entre la visibilidad de las secciones: visible o no visible
    if (!seccionesSeVen) {
      setSeccionesSeVen(true);
    } else {
      setSeccionesSeVen(false);
    }
    // Si están ocultas:
    // Rotar la flecha 90 grados en sentido de las manecillas del reloj

    // Buscar las secciones que tiene el curso y mostrarlas

    // Si están visibles:
    // Ocultar la visibilidad de las secciones sin borrar los datos. usar className="invisible"
  };

  useEffect(() => {
    if (seccionesSeVen) {
      setFlechaSecciones(flechaLlena);
      setClassNamesContainerDataSecciones(
        classNamesContainerDataSecciones.replace(" d-none", " d-block")
      );
    } else {
      setFlechaSecciones(flechaVacia);
      setClassNamesContainerDataSecciones(
        classNamesContainerDataSecciones.replace(" d-block", " d-none")
      );
    }
  }, [seccionesSeVen]);

  // Al cambiar los datos de data_secciones o la visibilidad de las secciones con seccionesSeVen, la lista de secciones disponibles se vuelve a renderizar
  // useEffect(() => {
  //   setLista_data_secciones(
  //     data_secciones.map((seccion, index) => (
  //       <div key={index}>
  //         <SeccionIndividual
  //           seccion={seccion}
  //           flechaVacia={flechaVacia}
  //           flechaLlena={flechaLlena}
  //         />
  //       </div>
  //     ))
  //   );
  // }, [data_secciones, data_actividades, data_preguntas, seccionesSeVen]);

  return (
    <div className="contanier w-100 d-flex flex-column justify-content-center align-items-center rounded-3 overflow-hidden">
      {/* <div className="d-flex justify-content-evenly mb-3">
        <button
          onClick={(e) => {
            handleToggleVerSecciones(e);
          }}
          className="btn btn-secondary d-flex justify-content-around align-items-center">
          <h2 className="me-3">Ver secciones del curso</h2>
          &nbsp;
          {flechaSecciones}
        </button>
      </div>
      <div className={classNamesContainerDataSecciones}>
        {/* Descplegar las secciones con conditional rendering y .map() a data_secciones */}
      {/* {lista_data_secciones} */}
      {/* </div>  */}
      <div className="d-flex w-100 flex-column justify-content-center align-items-center">
        <div className="w-100 d-flex flex-row">
          <RegistrarSeccion id_curso={curso._id} />
          <RegistrarActividad />
        </div>
        <div className="w-100">
          <RegistrarPregunta />
        </div>
      </div>
      <div>
        <ButtonToggleView
          data_contenidos={data_secciones}
          componenteAMostrar={"seccion"}
          mensajeBtn={"Ver secciones del curso"}
          mensajeVacio={"No hay secciones aún, añada una!"}
          id_curso={curso._id}
          cantidad_secciones_curso={curso.sections.length}
          // buscarActividad={buscarActividad}
          arreglo_objetos_actividades_por_todas_las_secciones={data_actividades.map(
            (actividad_individual) => {
              return {
                id_task: actividad_individual._id,
                // amount_of_tasks: actividad_individual.id_tasks.length,
                task_name: actividad_individual.name,
                idSection: actividad_individual.idSection,
              };
            }
          )}
          rerenderPorActualizacionDeDatos={rerenderPorActualizacionDeDatos}
          setRerenderPorActualizacionDeDatos={setRerenderPorActualizacionDeDatos}
        />
      </div>
      <div>
        <ButtonToggleView
          data_contenidos={data_actividades}
          componenteAMostrar={"actividad"}
          /*
        arreglo_objetos_secciones_por_actividad=
        [
        {
        id_section: id_seccion1,
        amount_of_tasks: Cantidad de actividades que tiene esta sección,
        section_name: Nombre de la sección 1
        },
        {
        id_section: id_seccion2,
        amount_of_tasks: Cantidad de actividades que tiene esta sección,
        section_name: Nombre de la sección 2
        },
        ...
        ]
        */
          arreglo_objetos_secciones_por_todas_las_actividades={data_secciones.map(
            (seccion_individual) => {
              return {
                id_section: seccion_individual._id,
                amount_of_tasks: seccion_individual.id_tasks.length,
                section_name: seccion_individual.name,
                id_tasks: seccion_individual.id_tasks,
              };
            }
          )}
          arreglo_objetos_preguntas_por_actividad={data_preguntas}
          mensajeBtn={"Ver actividades del curso"}
          mensajeVacio={"No hay actividades aún, añada una!"}
          rerenderPorActualizacionDeDatos={rerenderPorActualizacionDeDatos}
          setRerenderPorActualizacionDeDatos={setRerenderPorActualizacionDeDatos}
        />
      </div>
      <div>
        <ButtonToggleView
          data_contenidos={data_preguntas}
          componenteAMostrar={"pregunta"}
          mensajeBtn={"Ver preguntas del curso"}
          mensajeVacio={"No hay preguntas aún, añada una!"}
          cantidad_preguntas_por_actividad={data_actividades.map((actividad_individual) => {
            return {
              id_task: actividad_individual._id.toString(),
              cantidad_preguntas: actividad_individual.questions.length,
            };
          })}
          arreglo_objetos_actividades_por_pregunta={data_actividades}
          rerenderPorActualizacionDeDatos={rerenderPorActualizacionDeDatos}
          setRerenderPorActualizacionDeDatos={setRerenderPorActualizacionDeDatos}
        />
      </div>
      <h1 style={{ color: "orange" }}>
        Añadir las secciones de "Ver actividades" y de "Ver preguntas"
      </h1>
      <p>En estas secciones se verán las actividades y secciones creadas</p>
      <p>
        Esto con la finalidad de que si queremos editar la actividad de una sección, al darle editar
        a la actividad dentro de la sección, nos vamos a mostrar la actividad dentro de las
        actvidades que tenemos y la colocamos en edición.
      </p>
      <p>
        Lo mismo aplica para las preguntas, al editar una pregunta editamos sus contenido también.
      </p>
    </div>
  );
}

// =====================================================================================
// =====================================================================================
// =====================================================================================
// =====================================================================================
// ================= MUESTRA LAS PREGUNTAS Y ACTIVIDADES ==========
// =====================================================================================
// =====================================================================================
// ================= PARA DESPUÉS PODER EDITARLAS Y ASÍ EDITAR TODOS LOS DATOS =========
// ================= ENTRE SI QUE SE AFECTAN, ES DECIR, SI EDITO LA PUNTUACIÓN DE UNA PREGUNTA, QUE SE CAMBIE LA CANTIDAD DE PUNTOS TOTALES DE LA ACTIVIDAD Y, POR ENDE, DE LA SECCIÓN, O SI BORRO UNA PREGUNTA QUE SE BORRE DE TODAS LAS ACTIVIADES EN LAS QUE ESTABA, O SI BORRO UNA SECCIÓN QUE TODAS LAS ACTIVIDADES QUE TENÍA DEJEN DE TENERLA Y A SU VEZ QUE EL CURSO DEJE DE TENERLA =========
// ================= Y ASÍ CON TODO LO DEMÁS ===========================================
// =====================================================================================

import axios from "axios";
import { useEffect, useState } from "react";
import InputBuscador from "./InputBuscador";
import Swal from "sweetalert2";

export default function RegistrarSeccion({ id_curso }) {
  const [nombreSeccion, setNombreSeccion] = useState("");

  // Input Buscador
  const [actividadesBuscadas, setActividadesBuscadas] = useState("");
  const [actividadesDisponibles, setActividadesDisponibles] = useState([]);
  const [actividadesSeleccionadas, setActividadesSeleccionadas] = useState([]);

  axios.defaults.withCredentials = true;

  const handleBuscarActividades = (e) => {
    e.preventDefault();
    setActividadesBuscadas(e.target.value);
  };

  // useEffect(() => {
  //   // Buscamos las actividades que coincidan con actividadesBuscadas
  //   // axios.post("", {});
  //   // Colocamos esas actividades en actividadesDisponibles
  //   // Al hacerles click las colocamos en actividadesSeleccionadas
  // }, []);

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
                  valor_puntos_actividad: actividadEncontrada.totalScore,
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

  // Función para resetear el formulario
  const resetForm = () => {
    setNombreSeccion("");

    // Restablecer estados relacionados
    setActividadesBuscadas("");
    setActividadesDisponibles([]);
    setActividadesSeleccionadas([]);
  };

  const crearSeccion = () => {
    let totalScoreSeccion = 0;

    actividadesSeleccionadas.forEach((actividad) => {
      totalScoreSeccion += actividad.valor_puntos_actividad;
    });
    let seccion = {
      idCourse: id_curso, // La FK que viene desde el curso
      name: nombreSeccion, // Nombre de la sección
      position: -1, // Posición de la sección dentro del curso (número de sección para ordenarlas)
      // -1 = al final => $push
      // 0 = al inicio => $push[0]
      id_tasks: actividadesSeleccionadas.flatMap((actividadSeleccionada) => {
        return actividadSeleccionada._id;
      }), // Arreglo de los ID’s en orden de las actividades que tiene la sección
      totalScore: totalScoreSeccion, // Suma del valor de todas las actividades que contiene esta sección
      answeredScore: 0, // Suma de todos los puntos obtenidos por el usuario al contestar todas las actividades de esta sección
      sections_curso: [],
    };

    return seccion;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    alert("Registrando una sección");
    // Registrar la sección con los datos del formulario
    // nombreSeccion
    // actividadesSeleccionadas
    try {
      alert("Registrando una sección");

      // Construir la seccion
      let seccion = crearSeccion();
      let id_seccion = "";
      let id_tasks_created_section;

      // Buscamos el curso para obtener el arreglo de "sections_curso" y así evitar desincornización de datos
      const sections_curso_response = await axios.post("http://localhost:5000/api/buscar-cursos", {
        palabra_a_buscar: `#: ${id_curso}`,
        filtro: "todos",
      });

      if (sections_curso_response.data.Status === 301) {
        seccion.sections_curso = sections_curso_response.data.docs[0].sections;
      }

      if (seccion.position == -1) {
        seccion.position = seccion.sections_curso.length;
      }

      console.log(`seccion.id_tasks: ${JSON.stringify(seccion.id_tasks)}`);

      // Registrar la sección en la base de datos
      const response = await axios.post("http://localhost:5000/api/registrar-seccion", {
        idCourse: seccion.id_curso, // La FK que viene desde el curso
        name: seccion.name, // Nombre de la sección
        position: seccion.position, // Posición de la sección dentro del curso (número de sección para ordenarlas)
        // -1 = al final => $push
        // 0 = al inicio => $push[0]
        id_tasks: seccion.id_tasks, // Arreglo de los ID’s en orden de las actividades que tiene la sección
        totalScore: seccion.totalScore, // Suma del valor de todas las actividades que contiene esta sección
        answeredScore: seccion.answeredScore, // Suma de todos los puntos obtenidos por el usuario al contestar todas las actividades de esta sección
        sections_curso: seccion.sections_curso,
      });

      if (response.data.Status === 405) {
        id_seccion = response.data.content_id; // Actualiza id_seccion con el ID recibido del servidor
        id_tasks_created_section = response.data.id_tasks; // Actualiza id_tasks_created_section con el arreglo recibido del servidor

        const promesaActualizarCurso = [id_seccion].map(async (id_seccion_obtenido) => {
          return await axios.post("http://localhost:5000/api/actualizar-secciones-curso", {
            id_curso: id_curso,
            id_seccion: id_seccion_obtenido,
            position: seccion.position,
          });
        });

        // Aquí es donde se actualizan las actividades con el nuevo ID de la sección recién creada
        const promesasActividades = actividadesSeleccionadas.map(async (actividad) => {
          const actividadResponse = await axios.post(
            "http://localhost:5000/api/buscar-actividades",
            {
              palabra_a_buscar: `#: ${actividad._id}`,
            }
          );

          let arregloSeccionesActividad = actividadResponse.data.docs[0].idSection || [];
          let arregloPosicionesActividad = actividadResponse.data.docs[0].position || [];

          // Agregar el nuevo id_seccion si no está ya presente
          if (!arregloSeccionesActividad.includes(id_seccion)) {
            arregloSeccionesActividad.push(id_seccion);

            // Buscar en esta sección la posición del ID de este task a modificar
            arregloPosicionesActividad.push({
              id_seccion: id_seccion,
              posicion_en_esta_seccion_padre: id_tasks_created_section.indexOf(actividad._id),
            });
          }

          // Actualizar la actividad con el nuevo arreglo de secciones
          await axios.post("http://localhost:5000/api/actualizar-idSection-actividad", {
            id_actividad: actividad._id,
            id_sections_individuales: arregloSeccionesActividad,
            arregloPosicionesActividad: arregloPosicionesActividad,
          });
        });

        await Promise.all(promesasActividades, promesaActualizarCurso);

        // Swal.fire({
        //   title: "Actividades actualizadas correctamente.",
        //   confirmButtonText: "Continuar",
        //   showCancelButton: false,
        //   icon: "success",
        // });

        Swal.fire({
          title: response.data.message,
          text: "Curso y actividades actualizadas correctamente.",
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
      console.error(`Error guardando la sección o actualizando las actividades.\n${error}`);
    }
  };

  return (
    <div className="container w-50 d-flex flex-column justify-content-center align-items-center mb-5">
      <div className="d-flex justify-content-center align-items-center">
        <h2 className="mb-3 me-3">Añadir sección</h2>
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
            id="floatingInput-nombre-seccion"
            onChange={(e) => {
              setNombreSeccion(e.target.value);
            }}
            value={nombreSeccion || ""}
          />
          <label htmlFor="floatingInput-nombre-seccion">Nombre de la sección</label>
        </div>
        <InputBuscador
          name="actividadesBuscadas"
          id="floatingInput-actividades"
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
          aQuienAsignamos="sección"
          queBuscamos="actividades"
        />
        <button type="submit" className="btn btn-success my-3">
          Añadir
        </button>
      </form>
    </div>
  );
}

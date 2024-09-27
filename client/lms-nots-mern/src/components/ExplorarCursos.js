import axios from "axios";
import { useEffect, useState } from "react";

export default function ExplorarCursos() {
  const [obj_con_datos_alumno, setObj_con_datos_alumno] = useState({
    _id: "Cargando...",
    nombre: "Cargando...",
    email: "Cargando...",
    password: "Cargando...",
    role: "Cargando...",
    descripcion_personal: "Cargando...",
    maestros_inscritos: ["Cargando..."],
    cursos_inscritos: ["Cargando..."],
    answers: ["Cargando..."],
  });

  const [lista_de_cursos, setLista_de_cursos] = useState([]);

  const cargarDatosAlumno = async () => {
    try {
      const response = await axios.post(
        "https://lms-facultad-de-quimica.onrender.com/api/buscar-usuario-actual"
      );
      if (response.data.Status === 201 && response.data.docs) {
        let alumno = response.data.docs;
        setObj_con_datos_alumno((obj_anterior_con_datos_alumno) => ({
          ...obj_anterior_con_datos_alumno,
          _id: alumno._id,
          nombre: alumno.nombre,
          email: alumno.email,
          password: alumno.password,
          role: alumno.role,
          descripcion_personal: alumno.descripcion_personal,
          maestros_inscritos: alumno.maestros_inscritos,
          cursos_inscritos: alumno.cursos_inscritos,
          answers: alumno.answers,
        }));
      } else {
        console.log("Error?");
      }
    } catch (error) {
      console.error("Error buscando al alumno actual:", error);
    }
  };

  const cargarCursosDisponibles = async () => {
    if (obj_con_datos_alumno._id !== "Cargando..." && obj_con_datos_alumno._id) {
      try {
        // Usamos map para obtener un array de promesas
        const promesasCursos = obj_con_datos_alumno.cursos_inscritos.map(
          async (id_curso_inscrito) => {
            const response = await axios.post(
              "https://lms-facultad-de-quimica.onrender.com/api/buscar-cursos",
              {
                palabra_a_buscar: `#: ${id_curso_inscrito}`,
              }
            );
            if (response.data.Status === 301 && response.data.docs[0]) {
              return response.data.docs[0]; // Devuelve el curso si se encuentra
            } else {
              console.error(
                `Error buscando el curso ${id_curso_inscrito} del alumno actual ${obj_con_datos_alumno._id}`
              );
              return null; // Devuelve null si no encuentra el curso
            }
          }
        );

        // Espera a que todas las promesas se resuelvan
        const resultadosCursos = await Promise.all(promesasCursos);

        // Filtra los cursos nulos (errores) y actualiza el estado
        const cursosValidos = resultadosCursos.filter((curso) => curso !== null);
        setLista_de_cursos(cursosValidos);
      } catch (error) {
        console.error("Error buscando los cursos del alumno actual", error);
      }
    }
  };

  useEffect(() => {
    cargarDatosAlumno();
  }, []);

  useEffect(() => {
    if (obj_con_datos_alumno._id !== "Cargando...") {
      cargarCursosDisponibles();
    }
  }, [obj_con_datos_alumno]);

  return (
    <>
      <h1>Contestar curso</h1>
      <p>
        Aquí podrás explorar tus cursos inscritos para contestar el que esté disponible y desees.
      </p>
      <ul>
        {lista_de_cursos.length > 0 ? (
          // Construir la tarjeta de curso bonita con bootstrap y continuar con contestar el curso y guardar las respuestas del usuario
          // Después de que eso funcione trabaja en exportar todas las respuestas de todos los usuarios en un archivo .csv al solicitarlo en admin-dashboard/recoleccion-de-datos
          lista_de_cursos.map((curso, index) => (
            <div
              className="d-flex flex-wrap justify-content-start align-items-center"
              key={`curso-${index}`}>
              {/* <li >{curso.nombre}</li>)) */}
              <div className="card" style={{ width: "18rem" }}>
                {/* <img src="..." className="card-img-top" alt="..."/> */}
                <div className="card-body">
                  <h5 className="card-title">{curso.nombre}</h5>
                  <p className="card-text">{curso.descripcion}</p>
                  <a
                    href={`/cursos/contestar-curso/${curso._id}`}
                    className="btn btn-primary btn-lg">
                    Contestar curso
                  </a>
                </div>
              </div>
            </div>
          ))
        ) : (
          <>
            <p>No tiene cursos aún, vuelva pronto!</p>
          </>
        )}
      </ul>
    </>
  );
}

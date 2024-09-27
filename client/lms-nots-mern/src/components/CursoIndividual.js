import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function CursoIndividual({ datos_curso, role_usuario }) {
  const navigate = useNavigate();

  const confirmarBorrarCurso = (id_curso, nombre_curso) => {
    Swal.fire({
      title: `Seguro que desea borrar el curso\n ${nombre_curso}?`,
      showDenyButton: true,
      confirmButtonText: "Si, borrar",
      denyButtonText: "No, cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        borrarCurso(id_curso);
      }
    });
  };

  const borrarCurso = (id_curso) => {
    axios
      .post("https://lms-facultad-de-quimica.onrender.com/api/borrar-curso", {
        id_curso: id_curso,
        role: role_usuario,
      })
      .then((response) => {
        console.log(response.data);
        if (response.data.Status === 206) {
          Swal.fire({
            title: "Borrado exitosamente",
            showDenyButton: false,
            confirmButtonText: "Continuar",
            icon: "success",
          }).then((result) => {
            // console.log(result);
            if (result) {
              navigate(0);
            }
          });
        } else {
          Swal.fire({
            title: "No tiene autorización",
            showDenyButton: false,
            confirmButtonText: "Continuar",
            icon: "error",
            iconColor: "orange",
          });
          //   .then((result) => {
          //   console.log(result);
          //   if (result) {
          //     navigate(0);
          //   }
          // });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div>
      <h3>{datos_curso.nombre}</h3>
      <p className="text-start">Temas: {datos_curso.temas}</p>
      <p className="text-start">Descripción del curso: {datos_curso.descripcion}</p>
      <p className="text-start">Alumnos inscritos: {datos_curso.enrolled_users}</p>
      <p className="text-start">Maestros: {datos_curso.teachers}</p>
      <div className="container d-flex justify-content-center align-content-center">
        {/* Ruta dinámica, ya que el isUsuario cambia según el usuario a editar */}
        {role_usuario === "admin" ? (
          <Link
            className="btn btn-success w-25"
            to={`/admin-dashboard/editar-curso/${datos_curso._id}`}>
            <p className="m-0 p-0">Editar</p>
          </Link>
        ) : (
          <></>
        )}
        {role_usuario === "maestro" ? (
          <Link className="btn btn-success w-25" to={`/dashboard/editar-curso/${datos_curso._id}`}>
            <p className="m-0 p-0">Editar</p>
          </Link>
        ) : (
          <></>
        )}
        {role_usuario === "alumno" ? (
          <Link className="btn btn-success w-25" to={`/perfil/editar-curso/${datos_curso._id}`}>
            <p className="m-0 p-0">Editar</p>
          </Link>
        ) : (
          <></>
        )}
        {/* &nbsp; = no break-space, lo que quiere decir que el 1er botón y el 2ndo siempre estarán separados por un poco de espacio pero nunca en una línea diferente sin importar el layout, googleando &nbsp se entiende lo que hace.
          Pero básicamente agrega un espacio entre elementos y además evita que este espacio se pueda "romper" por un salto de línea, evitando así que por cuestiones de tamaño de pantalla y layout, el elemento 1 quede arriba y el elemento 2 abajo.
          Referencia: http://codexexempla.org/articulos/2008/nbsp.php */}
        &nbsp;
        <button
          className="btn btn-danger ms-3 w-25"
          onClick={() => {
            confirmarBorrarCurso(datos_curso._id, datos_curso.nombre);
          }}
          data-bs-toggle="tooltip"
          data-bs-placement="top"
          data-bs-title="Tooltip on top">
          Borrar
        </button>
        <hr className="mt-3"></hr>
      </div>
    </div>
  );
}

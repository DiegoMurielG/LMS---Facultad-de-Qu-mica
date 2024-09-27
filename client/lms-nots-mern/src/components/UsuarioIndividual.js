import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function UsuarioIndividual(props) {
  const { usuario, role_usuario } = props;
  const [warning, setWarning] = useState(null);
  const [deleted, setDeleted] = useState(null);
  const [maestrosInscritos, setMaestrosInscritos] = useState("");
  const [dataMaestrosInscritos, setDataMaestrosInscritos] = useState([]);
  let listaMaestrosInscritos = ["Ningún maestro inscrito"];
  const navigate = useNavigate();

  axios.defaults.withCredentials = true;
  useEffect(() => {
    // =========================================================
    // ============== S U S P E N D I D A ======================
    // =========================================================
    // Estado: Por hacer...
    axios
      .post("http://localhost:5000/api/buscar-nombres-profesores", {
        ids_maestros_inscritos: usuario.maestros_inscritos,
      })
      .then((response) => {
        // alert(JSON.stringify(response.data));
        // setDataMaestrosInscritos(response.data.docs);
        setDataMaestrosInscritos(["Hola!, estoy pendiente"]);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);
  // useEffect(() => {
  //   console.log(`usuario: ${JSON.stringify(usuario)}`);
  //   // if (usuario.maestros_inscritos.length > 0) {
  //   //   alert("Tiene maestros inscritos");
  //   // }
  //   // console.log(`usuario.maestros_inscritos: ${usuario.maestros_inscritos}`);
  //   let temp = [];
  //   let a = null;
  //   if (usuario.maestros_inscritos.length > 0) {
  //     usuario.maestros_inscritos.forEach((maestro) => {
  //       a = async () => {
  //         await axios
  //           .post("http://localhost:5000/api/buscar-nombre-profesor", {
  //             maestro_inscrito: maestro,
  //           })
  //           .then((response) => {
  //             console.log(
  //               `[...dataMaestrosInscritos, response.data.docs]: ${[response.data.docs]}`
  //             );
  //             // temp.push(response.data.docs);
  //             // a = response.data.docs;
  //             // alert(typeof a);
  //             // return a;
  //             return response.data.docs;
  //           })
  //           .catch((error) => {
  //             console.log(error);
  //           });
  //         // temp.push(
  //         // );
  //       };
  //       temp.push(a);
  //     });

  //     console.log(JSON.stringify(temp));
  //     console.log(`temp: ${temp}`);
  //     // setDataMaestrosInscritos([...dataMaestrosInscritos, response.data.docs]);
  //   } else {
  //     setDataMaestrosInscritos(["No está inscrito con ningún maestro"]);
  //   }
  // }, []);

  // console.log(dataMaestrosInscritos);
  if (dataMaestrosInscritos.length > 0) {
    listaMaestrosInscritos = dataMaestrosInscritos.map((maestro, index) => {
      return <p key={index}>{maestro} </p>;
    });
  }
  // console.log(listaMaestrosInscritos);
  // const listaMaestrosInscritos = "Hola!";

  // useEffect(() => {
  //   console.log(`usuario.maestros_inscritos: ${usuario.maestros_inscritos}`);
  //   if (usuario.maestros_inscritos) {
  //     if (usuario.maestros_inscritos.length > 0) {
  //       const tmpMaestrosInscritos = ""; //maestrosInscritos + ", " + response.data.docs;
  //       let nombresMaestrosInscritos = []
  //       usuario.maestros_inscritos.forEach((maestro) => {
  //         axios
  //           .post("http://localhost:5000/api/buscar-nombre-profesor", {
  //             maestro_inscrito: maestro,
  //           })
  //           .then((response) => {
  //             // setMaestrosInscritos(tmpMaestrosInscritos);
  //             console.log(response.data.docs);
  //             tmpMaestrosInscritos.concat(", ", response.data.docs);
  //             nombresMaestrosInscritos.push(response.data.docs)
  //             // tmpMaestrosInscritos += response.data.docs;
  //             // tmpMaestrosInscritos += ", " + response.data.docs;
  //             // console.log(`response.data.docs: ${JSON.stringify(response.data)}`);
  //             // // setMaestrosInscritos(response.data.docs.toString());
  //             // if (maestrosInscritos) {
  //             //   setMaestrosInscritos(response.data.docs);
  //             //   // setMaestrosInscritos("Solo 1 maestro");
  //             // } else {
  //             //   setMaestrosInscritos(maestrosInscritos + ", " + response.data.docs);
  //             //   // setMaestrosInscritos("Más de 1 maestro");
  //             // }
  //             // if (maestrosInscritos === "") {
  //             //   setMaestrosInscritos
  //             //   setMaestrosInscritos(response.data.docs);
  //             //   console.log(`maestrosInscritos:${maestrosInscritos}`);
  //             // } else {
  //             // }
  //           })
  //           .catch((error) => {
  //             console.log(error);
  //           });
  //         // console.log(`tmpMaestrosInscritos: ${tmpMaestrosInscritos}`);
  //         // alert(maestrosInscritos);
  //       });
  //       listaMaestrosInscritos = nombresMaestrosInscritos.map((maestro, index) => {

  //       })
  //       setMaestrosInscritos(tmpMaestrosInscritos);
  //       console.log(`maestrosInscritos:${maestrosInscritos}`);
  //     } else {
  //       setMaestrosInscritos("No está inscrito con ningún maestro");
  //     }
  //   }
  // }, []);

  const confirmarBorrarUsuario = (id_usuario, nombre_usuario) => {
    Swal.fire({
      title: `Seguro que desea borrar al usuario ${nombre_usuario}?`,
      showDenyButton: true,
      confirmButtonText: "Si, borrar",
      denyButtonText: "No, cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        borrarUsuario(id_usuario);
      }
    });
  };

  const borrarUsuario = (id_usuario) => {
    axios
      .post("http://localhost:5000/api/borrar-usuario", {
        id_usuario: id_usuario,
        role: usuario.role,
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
      {deleted ? (
        <></>
      ) : (
        <div className="container d-flex w-75 flex-column justify-content-center align-content-center mb-5">
          <table className="table table-striped table-hover">
            <tbody>
              {/* <tr>
                <th className="text-end" scope="row">
                  Id:
                </th>
                <td className="text-start">{usuario._id}</td>
              </tr> */}
              <tr>
                <th className="text-end" scope="row">
                  Nombre:
                </th>
                <td className="text-start">{usuario.nombre}</td>
              </tr>
              <tr>
                <th className="text-end" scope="row">
                  Correo:
                </th>
                <td className="text-start" colSpan="2">
                  {usuario.email}
                </td>
              </tr>
              {/* <tr>
                <th className="text-end" scope="row">
                  Contraseña hasheada:
                </th>
                <td className="text-start">{usuario.password}</td>
              </tr> */}
              <tr>
                <th className="text-end" scope="row">
                  Rol:
                </th>
                <td className="text-start">{usuario.role}</td>
              </tr>
              <tr>
                <th className="text-end" scope="row">
                  Descripición personal:
                </th>
                <td className="text-start">{usuario.descripcion_personal}</td>
              </tr>
              <tr>
                <th className="text-end" scope="row">
                  Maestros inscritos:
                </th>
                {/* <td className="text-start">{maestrosInscritos}</td> */}
                <td className="text-start">{listaMaestrosInscritos}</td>
              </tr>
              <tr>
                <th className="text-end" scope="row">
                  Cursos inscritos:
                </th>
                <td className="text-start">{usuario.cursos_inscritos}</td>
              </tr>
            </tbody>
          </table>
          <div className="container d-flex justify-content-center align-content-center">
            {/* Ruta dinámica, ya que el isUsuario cambia según el usuario a editar */}
            {role_usuario === "admin" ? (
              <Link
                className="btn btn-success w-25"
                to={`/admin-dashboard/editar-usuario/${usuario._id}`}>
                <p className="m-0 p-0">Editar</p>
              </Link>
            ) : (
              <></>
            )}
            {role_usuario === "maestro" ? (
              <Link
                className="btn btn-success w-25"
                to={`/dashboard/editar-usuario/${usuario._id}`}>
                <p className="m-0 p-0">Editar</p>
              </Link>
            ) : (
              <></>
            )}
            {role_usuario === "alumno" ? (
              <Link className="btn btn-success w-25" to={`/perfil/editar-usuario/${usuario._id}`}>
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
                confirmarBorrarUsuario(usuario._id, usuario.nombre);
              }}
              data-bs-toggle="tooltip"
              data-bs-placement="top"
              data-bs-title="Tooltip on top">
              Borrar
            </button>
            <hr className="mt-3"></hr>
          </div>
        </div>
      )}
    </div>
  );
}

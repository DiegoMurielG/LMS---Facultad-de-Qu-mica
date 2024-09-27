import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";

export default function EditarUsuario() {
  const params = useParams();
  const [user_id, setUser_id] = useState("");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("");
  const [descripcion_personal, setDescripcion_personal] = useState("");
  const [permiso_editar_descrip_personal, setPermiso_editar_descrip_personal] = useState(true);
  const navigate = useNavigate();
  // let permiso_editar_descrip_personal = false;

  const obtenerDatausuario = () => {
    axios
      .post("https://lms-facultad-de-quimica.onrender.com/api/obtener-data-usuario", {
        id_usuario: params.id_usuario,
      })
      .then((response) => {
        console.log(response);
        const data_usuario = response.data.docs;
        setUser_id(data_usuario._id);
        setNombre(data_usuario.nombre);
        setEmail(data_usuario.email);
        setPassword(data_usuario.password);
        setRol(data_usuario.role);
        setDescripcion_personal(data_usuario.descripcion_personal);
        // setPermiso_editar_descrip_personal(puede_editar_descrip_personal);
        console.log(email);
        // puede_editar_descrip_personal().then((data) => {
        //   if (data) {
        //     console.log(`El permiso es ${data.permiso}`);
        //     setPermiso_editar_descrip_personal(data.permiso);
        //   }
        //   console.log(`El permiso es ${data}`);
        // });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // const useMountEffect = (fun) => useEffect(fun, []);
  // useMountEffect(obtenerDatausuario);

  useEffect(() => {
    obtenerDatausuario();
  }, []);

  // useEffect(() => {
  //   if (email) {
  //     puede_editar_descrip_personal().then((data) => {
  //       if (data) {
  //         console.log(`El permiso es ${data.permiso}`);
  //         setPermiso_editar_descrip_personal(data.permiso);
  //       }
  //       console.log(`El permiso es ${data}`);
  //     });
  //     // setPermiso_editar_descrip_personal(false);
  //     // permiso_editar_descrip_personal = puede_editar_descrip_personal();
  //   }
  // }, [email]);

  const editarUsuario = () => {
    axios
      .post("https://lms-facultad-de-quimica.onrender.com/api/actualizar-data-usuario", {
        id_usuario: params.id_usuario,
        nombre: nombre,
        email: email,
        descripcion_personal: descripcion_personal,
      })
      .then((response) => {
        console.log(response.data);
        setNombre(response.data.docs.nombre);
        setEmail(response.data.docs.email);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const confirmarBorrarUsuario = (id_usuario, nombre_usuario, role_usuario) => {
    Swal.fire({
      title: `Seguro que desea borrar al usuario ${nombre_usuario}?`,
      showDenyButton: true,
      confirmButtonText: "Si, borrar",
      denyButtonText: "No, cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        borrarUsuario(id_usuario, role_usuario);
      }
    });
  };

  const borrarUsuario = (id_usuario, role_usuario) => {
    axios
      .post("https://lms-facultad-de-quimica.onrender.com/api/borrar-usuario", {
        id_usuario: id_usuario,
        role: role_usuario,
      })
      .then((response) => {
        console.log(response.data);
        Swal.fire({
          title: "Borrado exitosamente",
          showDenyButton: false,
          confirmButtonText: "Continuar",
          icon: "success",
        }).then((result) => {
          console.log(result);
          if (result) {
            handleReturnToDashboard();
          }
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleReturnToDashboard = () => {
    axios
      .post("https://lms-facultad-de-quimica.onrender.com/api/obtener-role-usuario")
      .then((response) => {
        if (response.data.Status === 220) {
          navigate("/admin-dashboard/administrar-usuarios");
        } else if (response.data.Status === 221) {
          navigate("/dashboard/administrar-usuarios");
        } else {
          // response.data.Status === 222
          alert("NO PUEDES BORRAR USUARIOS");
          navigate("/");
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  function puede_editar_descrip_personal() {
    return new Promise((resolve, reject) => {
      // alert(email);
      console.log(`email a comparar ${email}`);
      axios
        .post("https://lms-facultad-de-quimica.onrender.com/api/puede-editar-descrip-personal", {
          email: email,
        })
        .then((response) => {
          console.log(response.data.permiso);
          if (response.data.permiso) {
            // return true;
            resolve(response.data);
          }
        })
        .catch((error) => {
          console.log(error);
        });
      // return false;
      resolve(false);
    });
  }

  return (
    <div className="containerw w-50 d-flex flex-column justify-content-center align-content-center mb-5">
      <div className="d-flex justify-content-center align-items-center">
        <h2 className="mb-3 me-3">Editar usuario</h2>
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

      <form onSubmit={editarUsuario}>
        <table className="table table-striped table-hover">
          <tbody>
            <tr>
              <th className="text-end w-25" scope="row">
                Id:
              </th>
              <td className="text-start">
                <input type="text" className="w-100" value={user_id} disabled></input>
              </td>
            </tr>
            <tr>
              <th className="text-end w-25" scope="row">
                Nombre:
              </th>
              <td className="text-start">
                <input
                  type="text"
                  value={nombre}
                  className="w-100"
                  onChange={(e) => {
                    setNombre(e.target.value);
                  }}></input>
              </td>
            </tr>
            <tr>
              <th className="text-end w-25" scope="row">
                Correo:
              </th>
              <td className="text-start" colSpan="2">
                <input
                  type="email"
                  value={email}
                  className="w-100"
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}></input>
              </td>
            </tr>
            <tr>
              <th className="text-end w-25" scope="row">
                Contraseña hasheada:
              </th>
              <td className="text-start">
                <input type="text" value={password} className="w-100" disabled></input>
              </td>
            </tr>
            <tr>
              <th className="text-end w-25" scope="row">
                Rol:
              </th>
              <td className="text-start">
                <input type="text" value={rol} className="w-100" disabled></input>
              </td>
            </tr>
            <tr>
              <th className="text-end w-25" scope="row">
                Descripción personal:
              </th>
              <td className="text-start">
                <input
                  type="text"
                  value={descripcion_personal}
                  className="w-100"
                  disabled={!permiso_editar_descrip_personal}
                  onChange={(e) => {
                    if (permiso_editar_descrip_personal) {
                      setDescripcion_personal(e.target.value);
                    }
                  }}></input>
              </td>
            </tr>
          </tbody>
        </table>
        <div className="container d-flex justify-content-center align-content-center">
          {/* Ruta dinámica, ya que el isUsuario cambia según el usuario a editar */}
          <button type="subbmit" className="btn btn-success w-25">
            Editar
          </button>
          {/* &nbsp; = no break-space, lo que quiere decir que el 1er botón y el 2ndo siempre estarán separados por un poco de espacio pero nunca en una línea diferente sin importar el layout, googleando &nbsp se entiende lo que hace.
          Pero básicamente agrega un espacio entre elementos y además evita que este espacio se pueda "romper" por un salto de línea, evitando así que por cuestiones de tamaño de pantalla y layout, el elemento 1 quede arriba y el elemento 2 abajo.
          Referencia: http://codexexempla.org/articulos/2008/nbsp.php */}
          &nbsp;
          <button
            className="btn btn-danger ms-3 w-25"
            type="button"
            onClick={() => {
              confirmarBorrarUsuario(params.id_usuario, nombre, rol);
            }}
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            data-bs-title="Tooltip on top">
            Borrar
          </button>
          <hr className="mt-3"></hr>
        </div>
      </form>
    </div>
  );
}

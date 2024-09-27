import axios from "axios";
import { useEffect, useState } from "react";
import UsuarioIndividual from "./UsuarioIndividual";

export default function AdministrarUsuarioPropio() {
  const [datos_usuarios, setDatos_usuarios] = useState([]);
  const [role_usuario, setRole_usuario] = useState("alumno");
  axios.defaults.withCredentials = true;
  // Mostrar tu usario al cargar la página
  useEffect(() => {
    axios
      .post("https://lms-facultad-de-quimica.onrender.com/api/obtener-role-usuario")
      .then((response) => {
        console.log(response.data);
        if (response.data.Status === 220) {
          setRole_usuario("admin");
          axios
            .post("https://lms-facultad-de-quimica.onrender.com/api/admin/buscar-usuario-actual")
            .then((response) => {
              // setDatos_usuarios([]);
              // setDatos_usuarios(response.data);
              // asignarListaUsuarios();
              console.log(response.data);
              // setDatos_usuarios(response.data?.docs);
              setDatos_usuarios(response.data?.docs);
              console.log(`Datos_usuarios: ${typeof datos_usuarios.maestros_inscritos}`);
            })
            .catch((error) => {
              console.log(error);
            });
        } else if (response.data.Status === 221) {
          setRole_usuario("maestro");
          axios
            .post("https://lms-facultad-de-quimica.onrender.com/api/buscar-usuario-actual")
            .then((response) => {
              // setDatos_usuarios([]);
              // setDatos_usuarios(response.data);
              // asignarListaUsuarios();
              console.log(response.data);
              setDatos_usuarios(response.data?.docs);
            })
            .catch((error) => {
              console.log(error);
            });
        } else {
          // response.data.Status === 222
          setRole_usuario("alumno");
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  // Mapeamos cada usuario de la lista obtenida desde la DB
  // const listaUsuarios = () => {
  //   return (
  //     <div key={0}>
  //       <UsuarioIndividual usuario={datos_usuarios} />
  //     </div>
  //   );
  // };

  return (
    <div className="d-flex flex-column justify-content-center align-content-center">
      <div className="d-flex justify-content-center align-items-center">
        <h2 className="mb-3 me-3">Usted es</h2>
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
      {<UsuarioIndividual usuario={datos_usuarios} role_usuario={role_usuario} />}
    </div>
  );
}

import axios from "axios";
import { useEffect, useState } from "react";
import UsuarioIndividual from "./UsuarioIndividual";
import AdministrarUsuarioPropio from "./AdministrarUsuarioPropio";
import TituloUsuariosEncontrados from "./TituloUsuariosEncontrados";

export default function BuscarUsuarios() {
  const [word_to_search, setWord_to_search] = useState("");
  const [filter, setFilter] = useState("todos");
  const [datos_usuarios, setDatos_usuarios] = useState([]);
  const [lista_usuarios, setLista_usuarios] = useState(<></>);
  const [cliked_busqueda, setCliked_busqueda] = useState(false);
  const [role_usuario, setRole_usuario] = useState("alumno");
  // let lista_usuarios

  axios.defaults.withCredentials = true;

  // Mostrar tu usario al cargar la página
  useEffect(() => {
    axios
      .post("http://localhost:5000/api/obtener-role-usuario")
      .then((response) => {
        console.log(response.data);
        if (response.data.Status === 220) {
          setRole_usuario("admin");
        } else if (response.data.Status === 221) {
          setRole_usuario("maestro");
        } else {
          // response.data.Status === 222
          setRole_usuario("alumno");
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  function asignarListaUsuarios() {
    setLista_usuarios(<></>);
    setLista_usuarios(
      datos_usuarios.map((usuario, index) => {
        return (
          <div className="bg-dark" key={index}>
            <UsuarioIndividual usuario={usuario} role_usuario={role_usuario} />
          </div>
        );
      })
    );
    // const lista_usuarios = [datos_usuarios].map((usuario, index) => {
    //   return (
    //     <div key={index}>
    //       <UsuarioIndividual usuario={usuario} />
    //     </div>
    //   );
    // });
    // return lista_usuarios;
    // console.log(datos_usuarios);
    // return lista_usuarios;
  }

  const handleSearchUsers = (e) => {
    e.preventDefault();
    // console.log(`Buscar a ${word_to_search} con el filtro de ${filter}`);
    axios
      .post("http://localhost:5000/api/admin/buscar-usuarios", {
        palabra_a_buscar: word_to_search,
        filtro: filter,
      })
      .then((response) => {
        console.log(response.data);
        // setDatos_usuarios([]);
        setDatos_usuarios(response.data.docs);
        console.log(datos_usuarios);
        asignarListaUsuarios();
        // lista_usuarios = [datos_usuarios].map((usuario, index) => {
        //   return (
        //     <div key={index}>
        //       <UsuarioIndividual usuario={usuario} />
        //     </div>
        //   );
        // });
        setCliked_busqueda(true);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <>
      <AdministrarUsuarioPropio />
      <div className="d-flex flex-column justify-content-center align-content-center mb-5">
        <h1 className="mb-3">Buscar usuarios</h1>
        <form className="w-100 mb-3" onSubmit={handleSearchUsers}>
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por nombre o email y ..."
              aria-label="Text input with segmented dropdown button"
              onChange={(e) => {
                setWord_to_search(e.target.value);
              }}
            />
            <select
              className="form-select"
              defaultValue="todos"
              id="inputGroupSelect01"
              onChange={(e) => {
                setFilter(e.target.value);
              }}>
              <option value="todos">Mostrar a tod@s</option>
              <option value="maestros">Mostrar solo maestr@s</option>
              <option value="alumnos">Mostrar solo alumn@s</option>
            </select>
            <button type="submit" className="btn btn-outline-primary">
              Buscar
            </button>
          </div>
        </form>
        <TituloUsuariosEncontrados cliked_search={cliked_busqueda} />
        {lista_usuarios.length > 0 ? lista_usuarios : <h2>No se encontrarón usuarios</h2>}
      </div>
    </>
  );
}

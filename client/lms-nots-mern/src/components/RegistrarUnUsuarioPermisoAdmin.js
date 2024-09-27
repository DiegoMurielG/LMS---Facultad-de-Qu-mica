import axios from "axios";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import Swal from "sweetalert2";
import InputBuscador from "./InputBuscador";

export default function RegistrarUnUsuarioPermisoAdmin(props) {
  const { visibilidadRegistrarUnUsuario, warning } = props;
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [descripcionPersonal, setDescripcionPersonal] = useState("");
  const [maestrosBuscados, setMaestrosBuscados] = useState("");
  const [maestrosDisponibles, setMaestrosDisponibles] = useState([]);
  const [maestrosSeleccionados, setMaestrosSeleccionados] = useState([]);
  const [cursosDisponibles, setCursosDisponibles] = useState([]);
  const [cursosBuscados, setCursosBuscados] = useState("");
  const [cursosSeleccionados, setCursosSeleccionados] = useState([]);
  // const [cursos, setCursos] = useState("");

  // let warning = null;

  const handleSubmitPermisoAdmin = (e) => {
    e.preventDefault();
    console.log(`maestrosSeleccionados: ${maestrosSeleccionados}`);
    let tmpMaestrosSeleccionados = [];
    maestrosSeleccionados.forEach((maestro) => {
      tmpMaestrosSeleccionados.push(maestro._id);
    });
    axios
      .post("http://localhost:5000/api/registrar-usuario-permiso-admin", {
        nombre: nombre,
        email: email,
        password: password,
        descripcion_personal: descripcionPersonal,
        maestros_inscritos: tmpMaestrosSeleccionados,
        cursos_inscritos: cursosSeleccionados,
      })
      .then((response) => {
        // alert(`${response.data.message}`);
        // warning = response.data.message;
        console.log(response);
        if (response.data.status === 205) {
          Swal.fire({
            title: `${response.data.message}`,
            showDenyButton: false,
            confirmButtonText: "Continuar",
            icon: "success",
          });
        } else {
          Swal.fire({
            title: `${response.data.message}`,
            showDenyButton: false,
            confirmButtonText: "Continuar",
            confirmButtonColor: "red",
            icon: "error",
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleBuscarMaestros = (e) => {
    // console.log(e);
    setMaestrosBuscados(e.target.value);
    console.log(`maestrosBuscados: ${maestrosBuscados}`);
    axios
      .post("http://localhost:5000/api/admin/buscar-usuarios", {
        palabra_a_buscar: maestrosBuscados,
        filtro: "maestros",
      })
      .then((response) => {
        console.log(response.data);
        // setDatos_usuarios([]);
        setMaestrosDisponibles(response.data.docs);
        // maestrosDisponibles = response.data.docs;
        // console.log(maestrosDisponibles);
        // asignarListaUsuarios();
        // setMaestrosDisponibles(
        //   [maestrosDisponibles].map((maestro, index) => {

        //   })
        // )
        // lista_usuarios = [datos_usuarios].map((usuario, index) => {
        //   return (
        //     <div key={index}>
        //       <UsuarioIndividual usuario={usuario} />
        //     </div>
        //   );
        // });
        // setCliked_busqueda(true);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleBuscarCursos = (e) => {
    // console.log(e);
    setCursosBuscados(e.target.value);
    console.log(`cursosBuscados: ${cursosBuscados}`);
    axios
      .post("http://localhost:5000/api/admin/buscar-usuarios", {
        palabra_a_buscar: cursosBuscados,
        filtro: "cursos",
      })
      .then((response) => {
        console.log(response.data);
        setMaestrosDisponibles(response.data.docs);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <>
      {/* Form con permisos de admin */}
      <form
        onSubmit={handleSubmitPermisoAdmin}
        id="registrar-usuario"
        className={visibilidadRegistrarUnUsuario === "visible" ? " w-50" : "collapse"}>
        {/* Nombre */}
        <div className="form-floating mb-3">
          <input
            type="text"
            name="nombre"
            className="form-control"
            id="floatingInput-nombre"
            autoComplete="on"
            placeholder="Tu nombre"
            onChange={(e) => {
              setNombre(e.target.value);
            }}
          />
          <label htmlFor="floatingInput-nombre">Nombre</label>
        </div>
        {/* Correo */}
        <div className="form-floating mb-3">
          <input
            type="email"
            name="email"
            className="form-control"
            id="floatingInput-email"
            autoComplete="on"
            placeholder="tu@correo.com"
            onChange={(e) => {
              setEmail(e.target.value);
            }}
          />
          <label htmlFor="floatingInput-email">Dirección de correo</label>
        </div>
        {/* Contraseña */}
        <div className="form-floating mb-3">
          <input
            type="password"
            name="passwprd"
            className="form-control"
            id="floatingInput-password"
            autoComplete="on"
            placeholder="Contraseña"
            minLength={6}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />
          <label htmlFor="floatingInput-password" className="important">
            Constraseña
          </label>
        </div>

        {/* Descripción personal */}
        <div className="form-floating mb-3">
          <textarea
            // type="text"
            // name="descripcionPersonal"
            className="form-control"
            id="floatingInput-descripcionPersonal"
            autoComplete="off"
            onChange={(e) => {
              setDescripcionPersonal(e.target.value);
              console.log(`descripcionPersonal: ${descripcionPersonal}`);
            }}
          />
          <label htmlFor="floatingInput-descripcionPersonal" className="important">
            Descripción personal
          </label>
        </div>

        {/* Maestros incritos */}
        <div className="form-floating mb-3">
          <InputBuscador
            name="maestrosBuscados"
            id="floatingInput-maestros"
            placeholder="Busca maestros por nombre o correo"
            label="Maestros que lo administran"
            onChange={(e) => {
              // console.log(e);
              handleBuscarMaestros(e);
            }}
            value={maestrosBuscados}
            // searching={"maestros"}
            elementosDisponibles={maestrosDisponibles}
            elementosSeleccionados={maestrosSeleccionados}
            setElementosSeleccionados={setMaestrosSeleccionados}
            aQuienAsignamos="alumno"
            queBuscamos="maestro"
          />
          {/* <input
            type="text"
            name="maestrosBuscados"
            className="form-control"
            id=""
            autoComplete="on"
            placeholder="Contraseña"
            minLength={6}
            onChange={(e) => {
              setMaestrosBuscados(e.target.value);
            }}
          /> */}
        </div>

        {/* Cursos */}
        {/* <div className="form-floating mb-3">
          <InputBuscador
            name="cursosBuscados"
            id="floatingInput-cursos"
            placeholder="Busca cursos por nombre"
            label="Cursos a los que pertenece"
            onChange={(e) => {
              handleBuscarCursos(e);
            }}
            value={cursosBuscados}
            elementosDisponibles={cursosDisponibles}
          />
        </div> */}

        <button type="submit" className="btn btn-success w-100 rounded-50 mb-1">
          Registrar Usuario
        </button>
        {warning ? <span className="important text-danger">{warning}</span> : <></>}
      </form>
    </>
  );
}

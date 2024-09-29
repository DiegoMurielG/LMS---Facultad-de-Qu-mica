import { Link, useNavigate } from "react-router-dom";
import BuscarCursos from "./BuscarCursos";
import CrearUnCurso from "./CrearUnCurso";
import axios from "axios";
import { useEffect, useState } from "react";

export default function AdministrarCursos() {
  const [role_usuario, setRole_usuario] = useState("alumno");
  const navigate = useNavigate();

  const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL, // Usa la URL de la variable de entorno
    withCredentials: true, // Si necesitas enviar cookies
  });
  // axios.defaults.withCredentials = true;
  // Mostrar tu usario al cargar la página
  useEffect(() => {
    api
      .post("/obtener-role-usuario")
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

  return (
    <div className="container d-flex flex-column w-50">
      <h1>Administrar cursos</h1>
      <p className="fs-1">CRUD de cursos</p>
      <p className="fs-1">
        Aquí puedes administrar cursos{" "}
        <b>
          <i>(CRUD de cursos)</i>
        </b>
      </p>
      <ul>
        <li>Crear cursos</li>
        <li>Ver cursos</li>
        <li>Actualizar cursos</li>
        <li>Borrar cursos</li>
      </ul>
      {/* Contenedor de buscar cursos */}
      <div>
        <BuscarCursos />

        {/* Crear un curso */}
        <div>
          <h1>Crear un curso</h1>
        </div>
        {role_usuario === "admin" ? (
          <Link
            className="btn btn-outline-success w-25"
            to={`/admin-dashboard/administrar-cursos/crear-curso`}>
            <p className="p-0 m-0">Crear</p>
          </Link>
        ) : (
          <></>
        )}
        {role_usuario === "maestro" ? (
          <Link
            className="btn btn-outline-success w-25"
            to={`/dashboard/administrar-cursos/crear-curso`}>
            <p>Crear</p>
          </Link>
        ) : (
          <></>
        )}
        {role_usuario === "alumno" ? navigate("/") : <></>}
        {/* <CrearUnCurso /> */}
      </div>
    </div>
  );
}

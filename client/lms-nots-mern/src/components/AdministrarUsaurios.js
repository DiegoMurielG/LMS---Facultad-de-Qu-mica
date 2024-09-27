import BuscarUsuarios from "./BuscarUsuarios";
import RegistrarUnUsuario from "./RegistrarUnUsuario";

export default function AdministrarUsaurios() {
  return (
    <div className="container d-flex flex-column">
      <h1>Administrar Usuarios</h1>
      <p className="fs-1">
        Aquí puedes administrar usuarios{" "}
        <b>
          <i>(CRUD de usuarios)</i>
        </b>
      </p>
      <ul>
        <li>Crear usuarios</li>
        <li>Ver usuarios</li>
        <li>Actualizar usuarios</li>
        <li>Borrar usuarios</li>
      </ul>
      {/* Contenedor de buscar usuarios */}
      <div>
        <BuscarUsuarios />
        <RegistrarUnUsuario />
      </div>
    </div>
  );
}

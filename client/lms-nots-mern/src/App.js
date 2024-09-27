import logo from "./logo.svg";
import "./App.css";
import Signup from "./components/RegistrarUnUsuario.js";
import Login from "./components/Login.js";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminDashboard from "./components/AdminDashboard.js";
import Dashboard from "./components/Dashboard.js";
import Home from "./components/Home.js";
import { Tooltip } from "bootstrap";

function App() {
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  const tooltipList = [...tooltipTriggerList].map(
    (tooltipTriggerEl) => new Tooltip(tooltipTriggerEl)
  );
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/registrar-usuario" element={<Signup />}></Route>
          <Route path="/" element={<Login />}></Route>
          <Route path="/admin-dashboard" element={<AdminDashboard />}></Route>
          <Route path="/admin-dashboard/:opcion_navbar" element={<AdminDashboard />}></Route>
          <Route
            path="/admin-dashboard/editar-usuario/:id_usuario"
            element={<AdminDashboard />}></Route>
          <Route
            path="/admin-dashboard/administrar-cursos/crear-curso"
            element={<AdminDashboard />}></Route>
          <Route
            path="/admin-dashboard/editar-curso/:id_curso"
            element={<AdminDashboard />}></Route>
          <Route path="/dashboard" element={<Dashboard />}></Route>
          <Route path="/dashboard/:opcion_navbar" element={<Dashboard />}></Route>
          <Route path="/dashboard/editar-usuario/:id_usuario" element={<Dashboard />}></Route>
          <Route path="/home" element={<Home />}></Route>
          <Route path="/home/:opcion_navbar" element={<Home />}></Route>
          <Route path="/cursos/contestar-curso/:id_curso" element={<Home />}></Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;

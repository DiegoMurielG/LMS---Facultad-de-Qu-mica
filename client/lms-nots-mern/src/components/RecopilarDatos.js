import axios from "axios";
import { useEffect, useState } from "react";

export default function RecopilarDatos() {
  const [isExporting, setIsExporting] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL;
  const [cursos, setCursos] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState(["todos"]);

  const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL, // Usa la URL de la variable de entorno
    withCredentials: true, // Si necesitas enviar cookies
  });

  // On page load get all the courses from the DB
  useEffect(() => {
    async function buscarCursos() {
      try {
        const response = await api.post("/buscar-cursos", {
          palabra_a_buscar: "",
          filtro: "todos",
        });

        const data = await response.data.docs;
        setCursos(data);
      } catch (error) {
        console.error("Error al obtener los cursos:\n", error);
      }
    }

    buscarCursos();
  }, []);

  const handleGuardarDatosCsv = async () => {
    if (isExporting) return; // Evitar múltiples llamadas
    setIsExporting(true);

    // Lógica para exportar CSV
    try {
      const response = await fetch(`${API_URL}/exportar-respuestas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ selectedCourses }),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Error al obtener el archivo CSV: ${response.status} - ${errorMessage}`);
      }

      // Crear un enlace temporal para descargar el archivo
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = "respuestas_usuarios.csv";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al descargar el CSV:", error);
    } finally {
      setIsExporting(false); // Rehabilitar el botón
    }
  };

  // const handleGuardarDatosCsv = async () => {
  //   if (isExporting) return; // Evitar múltiples llamadas
  //   setIsExporting(true);

  //   // Lógica para exportar CSV
  //   try {
  //     try {
  //       const response = await fetch(`${API_URL}/exportar-respuestas`, {
  //         method: "GET",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //       });

  //       if (!response.ok) {
  //         throw new Error("Error al obtener el archivo CSV");
  //       }

  //       // Crear un enlace temporal para descargar el archivo
  //       const blob = await response.blob();
  //       const url = window.URL.createObjectURL(blob);
  //       const a = document.createElement("a");
  //       a.style.display = "none";
  //       a.href = url;
  //       a.download = "respuestas_usuarios.csv";
  //       document.body.appendChild(a);
  //       a.click();
  //       window.URL.revokeObjectURL(url);
  //     } catch (error) {
  //       console.error("Error al descargar el CSV:", error);
  //     }
  //   } finally {
  //     setIsExporting(false); // Rehabilitar el botón
  //   }
  // };

  const handleCourseSelection = (event) => {
    const { value, checked } = event.target;
    setSelectedCourses((prevSelectedCourses) => {
      if (value === "todos") {
        return checked ? ["todos"] : [];
      } else {
        if (checked) {
          return prevSelectedCourses.includes("todos") ? [value] : [...prevSelectedCourses, value];
        } else {
          return prevSelectedCourses.filter((course) => course !== value);
        }
      }
    });
  };

  return (
    <div className="container d-flex flex-column w-50">
      <h1>Recopilar datos</h1>
      <p className="fs-1">Exportar datos guardados de los alumnos</p>

      <p>Selecione los cursos de los cuales desea descargar las respuestas</p>

      <div className="d-flex flex-column justify-content-center align-items-start mb-3 p-3 border border-secondary rounded-3 text-start">
        {cursos.map((curso) => (
          <div className="form-check" key={`flexCheckDefault-course-${curso._id}`}>
            <input
              className="form-check-input"
              type="checkbox"
              value={curso._id}
              id={`flexCheckDefault-course-${curso._id}`}
              onChange={handleCourseSelection}
              checked={selectedCourses.includes(curso._id)}
            />
            <label className="form-check-label" htmlFor={`flexCheckDefault-course-${curso._id}`}>
              {curso.nombre}
            </label>
          </div>
        ))}
        <div className="form-check d-flex align-items-center" key={`flexCheckDefault-course-todos`}>
          <input
            className="form-check-input"
            type="checkbox"
            value={"todos"}
            id={`flexCheckDefault-course-todos`}
            onChange={(e) => {
              handleCourseSelection(e);
            }}
            checked={selectedCourses.includes("todos")}
          />
          <label className="form-check-label fs-3 ms-2" htmlFor="flexCheckDefault-course-todos">
            {"Todos los cursos"}
          </label>
        </div>
      </div>

      <p>
        Haz clic en el botón para descargar un archivo CSV con las respuestas de los alumnos de los
        cursos seleccionados.
      </p>
      <button
        className="btn btn-lg btn-success"
        onClick={(e) => {
          e.preventDefault();
          handleGuardarDatosCsv();
        }}>
        Descargar datos
      </button>
    </div>
  );
}

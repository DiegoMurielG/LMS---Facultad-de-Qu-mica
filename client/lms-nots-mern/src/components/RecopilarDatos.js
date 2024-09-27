import { useState } from "react";

export default function RecopilarDatos() {
  const [isExporting, setIsExporting] = useState(false);
  const handleGuardarDatosCsv = async () => {
    if (isExporting) return; // Evitar múltiples llamadas
    setIsExporting(true);

    // Lógica para exportar CSV
    try {
      try {
        const response = await fetch(
          "https://lms-facultad-de-quimica.onrender.com/api/exportar-respuestas",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Error al obtener el archivo CSV");
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
      }
    } finally {
      setIsExporting(false); // Rehabilitar el botón
    }
  };

  return (
    <div className="container d-flex flex-column w-50">
      <h1>Recopilar datos</h1>
      <p className="fs-1">Exportar datos guardados de los alumnos</p>
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

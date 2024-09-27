import { useState } from "react";
import ButtonToggleView from "./ButtonToggleView";
import RegistrarPregunta from "./RegistrarPregunta";
import RespuestaOpcionMultiple from "./RespuestaOpcionMultiple";

export default function RespuestaVideoInteractivo() {
  // { actividades = [] }
  const [data_preguntas, setData_preguntas] = useState([
    // { pregunta_1, tiempo en el que aparece en el video },
    // { pregunta_2, tiempo en el que aparece en el video }
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();

    setData_preguntas((prevData_preguntas) => {
      let updatedData_Preguntas = [...prevData_preguntas];
    });
  };
  return (
    <div className="d-flex flex-column justify-content-center align-items-center">
      <p className="text-warning fw-bold">
        Por ahora, el video solo funciona de manera secuencial y con preguntas de opción múltiple.
      </p>
      {/* Agregar elemento de video Dummy con src HARDCODED*/}
      {/* Referencia a la etiqueta <video /> */}
      {/* https://www.w3schools.com/html/html5_video.asp?WT.mc_id=14117-DEV-tuts-article8 */}
      <video width={"320"} height={"240"} controls={true}>
        <source
          src="http://localhost:5000/public/media/videos/Que_es_la_Quimica.mp4"
          type="video/mp4"
        />
        Su navegador no soporta videos, cambie a Chrome, Firefox, Opera u Edge para vizualizar el
        contenido.
      </video>
      {/* Agregar una sección para colocar objetos de preguntas de tipo opción múltiple (<RegistrarPregunta />) y colocar un tiempo en el cuál esas preguntas saldrán de forma secuencial */}
      {/* Agregar un <ButtonToggleView /> que contenga los objetos de preguntas del video, en este caso el data_contenidos será un arreglo de preguntas donde la estructura es data_contenidos=[{pregunta_1, tiempo en el que aparece en el video}, {pregunta_2, tiempo en el que aparece en el video}] */}
      <ButtonToggleView
        data_contenidos={data_preguntas}
        componenteAMostrar={"pregunta"}
        mensajeBtn={"Ver preguntas del video"}
        mensajeVacio={"No hay preguntas aún, añada una!"}
      />
      <RegistrarPregunta handleSubmitExterno={handleSubmit} />
      {/* actividades={actividades} */}
    </div>
  );
}

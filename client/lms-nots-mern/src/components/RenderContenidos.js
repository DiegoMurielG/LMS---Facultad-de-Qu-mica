import axios from "axios";
import { useState, useEffect } from "react";

export default function RenderContenidos({
  contenidos,
  tipo_contenido_a_renderizar,
  contents_pregunta,
}) {
  const [contenidosCargados, setContenidosCargados] = useState([]);

  useEffect(() => {
    // Función para buscar y cargar todos los contenidos de manera asíncrona
    const fetchContenidos = async () => {
      const contenidosPromises = contenidos.map(async (id_contenido) => {
        try {
          const response = await axios.post(
            "https://lms-facultad-de-quimica.onrender.com/api/buscar-contenido",
            {
              palabra_a_buscar: id_contenido,
            }
          );
          if (response.data.docs.length > 0) {
            return response.data.docs[0];
          } else {
            return {
              contentType: "retroalimentacion",
              text: "No se encontró el contenido",
              pictures: [],
            };
          }
        } catch (error) {
          console.error("Error buscando el contenido:", error);
          return {
            contentType: "error",
            text: "Error al cargar el contenido",
            pictures: [],
          };
        }
      });

      // Esperar a que todas las promesas se resuelvan
      const resultadosContenidos = await Promise.all(contenidosPromises);
      setContenidosCargados(resultadosContenidos);
    };

    fetchContenidos();
  }, [contenidos]);

  const handleRenderContent = (texto, arreglo_objetos_imagenes) => {
    let arreglo_objetos_contenido = [];
    let tmpTexto = texto;
    let cantidadDeImagenes = [...texto.matchAll(/<img name="/gm)].length;
    let tamanioInicioEtiquetaImg = 5;
    let cantidadDeLinks = [...texto.matchAll(/<a href="/gm)].length;
    let tamanioInicioEtiquetaLink = 3;
    let tamanioFinAbiertoEtiquetaLink = 3; //" >
    let tamanioEtiquetaCierreLink = 4; //</a>
    let tamanioNombre = 6;
    let tamanioSrc = 7;
    let tamanioFinSrc = 4;

    if (cantidadDeImagenes <= 0 && cantidadDeLinks <= 0) {
      return <p>{texto}</p>;
    }

    const cantidadObjetosARenderizar = cantidadDeImagenes + cantidadDeLinks;

    // Si el contenido tiene imágenes
    for (let i = 0; i < cantidadObjetosARenderizar; i++) {
      // Buscamos coincidencia por coincidencia y según el resultado renderizamos un objeto u otro.
      let coincidenciaBusquedaObjetoARenderizar = tmpTexto.search(/name="|href="/);
      if (tmpTexto[coincidenciaBusquedaObjetoARenderizar + 1] == "n") {
        // Tenemos una img porque inicia con name=""
        let indexNombreImg = tmpTexto.search(/name="/) + tamanioNombre;
        let indexFinNombreImg = tmpTexto.search(/" src="/);
        let indexSrcImg = indexFinNombreImg + tamanioSrc;
        let indexFinSrcImg = tmpTexto.search(/" \/>/);
        // Agregamos el texto hasta antes de la imágen
        arreglo_objetos_contenido.push(
          <p>{tmpTexto.slice(0, indexNombreImg - (tamanioInicioEtiquetaImg + tamanioNombre))}</p>
        );

        // Agregamos la imágen
        arreglo_objetos_contenido.push(
          <img
            style={{
              width: "100%",
              maxWidth: "320px",
              height: "100%",
              maxHeight: "180px",
            }}
            key={`img-${i}`}
            name={arreglo_objetos_imagenes[i]?.name}
            src={`https://lms-facultad-de-quimica.onrender.com${arreglo_objetos_imagenes[i]?.path}`}
            alt={arreglo_objetos_imagenes[i]?.name}
          />
        );

        tmpTexto = tmpTexto.slice(indexFinSrcImg + tamanioFinSrc);
        // }

        // Si ya no hay imágenes y queda texto al final, agregarlo
        if (tmpTexto != "") {
          arreglo_objetos_contenido.push(<p>{tmpTexto}</p>);
        }
      } else {
        // Tenemos un link porque inicia conr href=""
        let indexHrefLink = tmpTexto.search(/href="/) + tamanioNombre;
        let indexFinEtiquetaAbiertaLink = tmpTexto.search(/" >/);
        // let indexSrcImg = indexFinNombreImg + tamanioSrc;
        let indexFinEtiquetaCierreLink = tmpTexto.search(/<\/a>/);
        // Agregamos el texto hasta antes del link
        arreglo_objetos_contenido.push(
          <p>{tmpTexto.slice(0, indexHrefLink - (tamanioInicioEtiquetaLink + tamanioNombre))}</p>
        );

        // Agregamos el link
        arreglo_objetos_contenido.push(
          <a
            className="link-opacity-75-hover"
            key={`link-${i}`}
            href={tmpTexto.slice(indexHrefLink, indexFinEtiquetaAbiertaLink)}>
            {tmpTexto.slice(
              indexFinEtiquetaAbiertaLink + tamanioFinAbiertoEtiquetaLink,
              indexFinEtiquetaCierreLink
            )}
          </a>
        );

        tmpTexto = tmpTexto.slice(indexFinEtiquetaCierreLink + tamanioEtiquetaCierreLink);
        // }

        // Si ya no hay links y queda texto al final, agregarlo
        if (tmpTexto != "") {
          arreglo_objetos_contenido.push(<p>{tmpTexto}</p>);
        }
      }
    }

    return arreglo_objetos_contenido;
  };

  return (
    <div className="mb-3">
      {contenidosCargados.map((contenido, index) => {
        // Solo mostrar los contenidos previos si es "instrucciones"
        if (
          tipo_contenido_a_renderizar === "instrucciones" &&
          contents_pregunta.includes(contenido._id) &&
          contenido.contentType === "instrucciones"
        ) {
          return (
            <div
              key={`contenido-${index}`}
              className="d-flex flex-column justify-content-center align-items-center">
              <h3 className="text-secondary-emphasis mb-3">
                {contenido.contentType.charAt(0).toUpperCase() + contenido.contentType.slice(1)}
              </h3>
              <hr className="mb-3" />
              {handleRenderContent(contenido.text, contenido.pictures)}
            </div>
          );
        } else if (
          tipo_contenido_a_renderizar === "retroalimentacion" &&
          contents_pregunta.includes(contenido._id) &&
          contenido.contentType === "retroalimentacion"
        ) {
          return (
            <div
              key={`contenido-${index}`}
              className="d-flex flex-column justify-content-center align-items-center">
              <h3 className="text-secondary-emphasis mb-3">
                {contenido.contentType.charAt(0).toUpperCase() +
                  contenido.contentType.slice(1, 15) +
                  "ó" +
                  contenido.contentType.slice(16)}
              </h3>
              <hr className="mb-3" />
              {handleRenderContent(contenido.text, contenido.pictures)}
            </div>
          );
        } else {
          return null;
        }
      })}
    </div>
  );
}

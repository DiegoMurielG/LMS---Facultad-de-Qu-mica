import axios from "axios";
import { useState, useEffect } from "react";

export default function RenderContenidos({
  contenidos,
  tipo_contenido_a_renderizar,
  contents_pregunta,
}) {
  const [contenidosCargados, setContenidosCargados] = useState([]);

  const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL, // Usa la URL de la variable de entorno
    withCredentials: true, // Si necesitas enviar cookies
  });

  const STATIC_FILES_URL = process.env.REACT_APP_STATIC_FILES_URL;
  // Variable que ingresa el usuario en el frontend al agregar un contenido para acceder a losr archivos según el entorno
  const files = STATIC_FILES_URL;

  useEffect(() => {
    // Función para buscar y cargar todos los contenidos de manera asíncrona
    const fetchContenidos = async () => {
      const contenidosPromises = contenidos.map(async (id_contenido) => {
        try {
          const response = await api.post("/buscar-contenido", {
            palabra_a_buscar: id_contenido,
          });
          if (response.data.docs.length > 0) {
            return response.data.docs[0];
          } else {
            return {
              contentType: "retroalimentacion",
              text: "No se encontró el contenido",
              pictures: [],
              links: [],
            };
          }
        } catch (error) {
          console.error("Error buscando el contenido:", error);
          return {
            contentType: "error",
            text: "Error al cargar el contenido",
            pictures: [],
            links: [],
          };
        }
      });

      // Esperar a que todas las promesas se resuelvan
      const resultadosContenidos = await Promise.all(contenidosPromises);
      setContenidosCargados(resultadosContenidos);
      // console.log(`resultadosContenidos:`, resultadosContenidos);
    };

    fetchContenidos();
  }, [contenidos]);

  // const handleRenderContent = (texto, arreglo_objetos_imagenes) => {
  //   let arreglo_objetos_contenido = [];
  //   let tmpTexto = texto;
  //   let cantidadDeImagenes = [...texto.matchAll(/<img name="/gm)].length;
  //   let tamanioInicioEtiquetaImg = 5;
  //   let tamanioInicioEtiquetaLink = 3;
  //   let cantidadDeLinks = [...texto.matchAll(/<a href="/gm)].length;
  //   let tamanioFinAbiertoEtiquetaLink = 3; //" >
  //   let tamanioEtiquetaCierreLink = 4; //</a>
  //   let tamanioNombre = 6;
  //   let tamanioSrc = 7;
  //   let tamanioFinSrc = 4;

  //   if (cantidadDeImagenes <= 0 && cantidadDeLinks <= 0) {
  //     return <p>{texto}</p>;
  //   }

  //   const cantidadObjetosARenderizar = cantidadDeImagenes + cantidadDeLinks;

  //   // Si el contenido tiene imágenes
  //   for (let i = 0; i < cantidadObjetosARenderizar; i++) {
  //     // Buscamos coincidencia por coincidencia y según el resultado renderizamos un objeto u otro.
  //     let coincidenciaBusquedaObjetoARenderizar = tmpTexto.search(/name="|href="/);
  //     // console.log(
  //     //   `tmpTexto.slice(coincidenciaBusquedaObjetoARenderizar):`,
  //     //   tmpTexto.slice(coincidenciaBusquedaObjetoARenderizar)
  //     // );
  //     if (
  //       tmpTexto
  //         .slice(
  //           coincidenciaBusquedaObjetoARenderizar,
  //           coincidenciaBusquedaObjetoARenderizar + tamanioNombre
  //         )
  //         .match(/name="/) != []
  //     ) {
  //       // Tenemos una img porque inicia con name=""
  //       let indexNombreImg = tmpTexto.search(/name="/) + tamanioNombre;
  //       let indexFinNombreImg = tmpTexto.search(/" src="/);
  //       let indexSrcImg = indexFinNombreImg + tamanioSrc;
  //       let indexFinSrcImg = tmpTexto.search(/" \/>/);
  //       // Agregamos el texto hasta antes de la imágen
  //       arreglo_objetos_contenido.push(
  //         <p>{tmpTexto.slice(0, indexNombreImg - (tamanioInicioEtiquetaImg + tamanioNombre))}</p>
  //       );

  //       // Agregamos la imágen
  //       arreglo_objetos_contenido.push(
  //         <img
  //           style={{
  //             width: "100%",
  //             minWidth: "320px",
  //             maxWidth: "1500px",
  //             // aspectRatio: 16 / 9,
  //             // height: "100%",
  //             // maxHeight: "180px",
  //           }}
  //           className="mb-3"
  //           key={`img-${i}`}
  //           name={arreglo_objetos_imagenes[i]?.name}
  //           src={
  //             `${STATIC_FILES_URL}/${arreglo_objetos_imagenes[i]?.path.replace("files/", "")}` ||
  //             "error"
  //           }
  //           alt={arreglo_objetos_imagenes[i]?.name}
  //         />
  //       );

  //       tmpTexto = tmpTexto.slice(indexFinSrcImg + tamanioFinSrc);
  //       // }

  //       // Si ya no hay imágenes y queda texto al final, agregarlo
  //       if (tmpTexto != "") {
  //         arreglo_objetos_contenido.push(<p>{tmpTexto}</p>);
  //       }
  //     } else {
  //       // Tenemos un link porque inicia con href=""
  //       let indexHrefLink = tmpTexto.search(/href="/) + tamanioNombre;
  //       let indexFinEtiquetaAbiertaLink = tmpTexto.search(/" >/);
  //       // let indexSrcImg = indexFinNombreImg + tamanioSrc;
  //       let indexFinEtiquetaCierreLink = tmpTexto.search(/<\/a>/);
  //       // Agregamos el texto hasta antes del link
  //       arreglo_objetos_contenido.push(
  //         <p>{tmpTexto.slice(0, indexHrefLink - (tamanioInicioEtiquetaLink + tamanioNombre))}</p>
  //       );

  //       // Agregamos el link
  //       arreglo_objetos_contenido.push(
  //         <a
  //           className="link-opacity-75-hover"
  //           key={`link-${i}`}
  //           target="_blank"
  //           href={tmpTexto.slice(indexHrefLink, indexFinEtiquetaAbiertaLink)}>
  //           {tmpTexto.slice(
  //             indexFinEtiquetaAbiertaLink + tamanioFinAbiertoEtiquetaLink,
  //             indexFinEtiquetaCierreLink
  //           )}
  //         </a>
  //       );

  //       tmpTexto = tmpTexto.slice(indexFinEtiquetaCierreLink + tamanioEtiquetaCierreLink);
  //       // }

  //       // Si ya no hay links y queda texto al final, agregarlo
  //       if (tmpTexto != "") {
  //         arreglo_objetos_contenido.push(<p>{tmpTexto}</p>);
  //       }
  //     }
  //   }

  //   return arreglo_objetos_contenido;
  // };

  const handleRenderContent = (texto, arreglo_objetos_imagenes, arreglo_objetos_links) => {
    let arreglo_objetos_contenido = [];
    let tmpTexto = texto;

    // Definimos tamaños de etiquetas de img y a
    let tamanioEtiquetaImg = 5; // <img
    let tamanioEtiquetaLink = 3; // <a
    let tamanioNombre = 6;
    let tamanioHref = 6; // href="
    let tamanioSrc = 7; // src="
    let tamanioEtiquetaCierreImg = 4; // "/>
    let tamanioEtiquetaCierreLink = 4; // </a>

    // Contamos la cantidad de imágenes y links
    let cantidadDeImagenes = [...texto.matchAll(/<img name="/gm)].length;
    let cantidadDeLinks = [...texto.matchAll(/<a href="/gm)].length;

    if (cantidadDeImagenes <= 0 && cantidadDeLinks <= 0) {
      return <p>{texto}</p>;
    }

    // Copiamos las listas de imágenes y links para irlas modificando
    let listaImgAInsertar = [...arreglo_objetos_imagenes];
    let listaLinksAInsertar = [...arreglo_objetos_links];

    // Procesamos todo el texto buscando etiquetas <img> y <a>
    while (tmpTexto.length > 0) {
      let indexImg = tmpTexto.search(/<img name="/);
      let indexLink = tmpTexto.search(/<a href="/);

      // Si encontramos primero una imagen
      if (indexImg !== -1 && (indexLink === -1 || indexImg < indexLink)) {
        // Extraemos el texto antes de la imagen
        let textoAntesDeImg = tmpTexto.slice(0, indexImg);
        if (textoAntesDeImg) {
          arreglo_objetos_contenido.push(<p>{textoAntesDeImg}</p>);
        }

        // Procesamos la imagen
        let indexFinImg = tmpTexto.indexOf("/>", indexImg) + tamanioEtiquetaCierreImg;
        let imgObjeto = listaImgAInsertar.shift();

        if (imgObjeto) {
          const direccionImg = files + "/" + imgObjeto.path.replace("files/", "") || "error";
          arreglo_objetos_contenido.push(
            <img
              style={{
                width: "100%",
                minWidth: "320px",
                maxWidth: "1500px",
              }}
              className="mb-3"
              key={`img-${imgObjeto.name}`}
              src={direccionImg}
              alt={imgObjeto.name || "error"}
            />
          );
        }

        // Reducimos el texto quitando la parte procesada
        tmpTexto = tmpTexto.slice(indexFinImg);
      }
      // Si encontramos primero un link
      else if (indexLink !== -1 && (indexImg === -1 || indexLink < indexImg)) {
        // Extraemos el texto antes del link
        let textoAntesDeLink = tmpTexto.slice(0, indexLink);
        if (textoAntesDeLink) {
          arreglo_objetos_contenido.push(<p>{textoAntesDeLink}</p>);
        }

        // Procesamos el link
        let indexFinLink = tmpTexto.indexOf("</a>", indexLink) + tamanioEtiquetaCierreLink;
        let linkObjeto = listaLinksAInsertar.shift();

        if (linkObjeto) {
          // Verificamos si el link tiene protocolo, y si no lo tiene, agregamos https://
          let hrefLink = linkObjeto.href.match(/^https?:\/\//)
            ? linkObjeto.href
            : `https://${linkObjeto.href}`;

          arreglo_objetos_contenido.push(
            <a
              className="link-opacity-75-hover"
              key={`link-${linkObjeto.href}`}
              target="_blank"
              href={hrefLink || "error"}>
              {linkObjeto.text || "error"}
            </a>
          );
        }

        // Reducimos el texto quitando la parte procesada
        tmpTexto = tmpTexto.slice(indexFinLink);
      }
      // Si no quedan más imágenes ni links, terminamos el texto restante
      else {
        arreglo_objetos_contenido.push(<p>{tmpTexto}</p>);
        tmpTexto = "";
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
              {handleRenderContent(contenido.text, contenido.pictures, contenido.links)}
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
              {handleRenderContent(contenido.text, contenido.pictures, contenido.links)}
            </div>
          );
        } else {
          return null;
        }
      })}
    </div>
  );
}

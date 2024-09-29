import axios from "axios";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

/**
 *
 * @param {String} data_contenido - Texto del contenido
 * @param {String="instrucciones, retroalimentacion"} tipo - Tipo de contenido
 * @returns
 */
export default function RegistrarContenido({
  data_contenido,
  setData_contenido,
  idContenido,
  setIdContenido,
  tipo,
}) {
  const [agregandoContenido, setAgregandoContenido] = useState(false);
  // const [data_contenido, setData_contenido] = useState(data_contenido);
  const [registrandoContenido, setRegistrandoContenido] = useState(true);
  // const [idContenido, setIdContenido] = useState("");
  const [editandoContenido, setEditandoContenido] = useState(false);

  const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL, // Usa la URL de la variable de entorno
    withCredentials: true, // Si necesitas enviar cookies
  });

  // Al cargar el componente, ver si hay o no contenido
  useEffect(() => {
    if (data_contenido) {
      setAgregandoContenido(true);
    }
  }, []);

  useEffect(() => {
    if (idContenido == "" && data_contenido == "") {
      // Se reseteó el formulario
      // setEditandoContenido(false);
      setAgregandoContenido(false);
      setRegistrandoContenido(true);
    }
  }, [data_contenido, idContenido]);

  const handleAgregarContenido = (e) => {
    e.preventDefault();
    // Mientras no haya datos
    if (!data_contenido) {
      setAgregandoContenido(true);
    }
  };

  function obtenerObjetoConImagenesEnContenido(data_contenido) {
    let imagenesDelContenido = [];
    let tmpData_contenido = data_contenido;
    let cantidadDeImagenes = [...data_contenido.matchAll(/<img name="/gm)].length;
    let tamanioNombre = 6;
    let tamanioSrc = 7;
    let tamanioFinSrc = 4;

    for (let i = 0; i < cantidadDeImagenes; i++) {
      let indexNombreImg = tmpData_contenido.search(/name="/) + tamanioNombre;
      let indexFinNombreImg = tmpData_contenido.search(/" src="/);
      let indexSrcImg = tmpData_contenido.search(/" src="/) + tamanioSrc;
      // Tenemos que tener un espacio a fuerza en: " />
      let indexFinSrcImg = tmpData_contenido.search(/" \/>/);
      imagenesDelContenido.push({
        name: tmpData_contenido.slice(indexNombreImg, indexFinNombreImg),
        path: tmpData_contenido.slice(indexSrcImg, indexFinSrcImg),
      });
      tmpData_contenido = tmpData_contenido.slice(indexFinSrcImg + tamanioFinSrc);
    }
    // cantidadDeImagenes.forEach((imagen) => {
    //   let indexNombreImg = tmpData_contenido.search(/name="/) + tamanioNombre;
    //   let indexFinNombreImg = tmpData_contenido.search(/" src="/);
    //   let indexSrcImg = tmpData_contenido.search(/" src="/) + tamanioSrc;
    //   // Tenemos que tener un espacio a fuerza en: " />
    //   let indexFinSrcImg = tmpData_contenido.search(/" \/>/);
    //   imagenesDelContenido.push({
    //     name: tmpData_contenido.slice(indexNombreImg, indexFinNombreImg),
    //     path: tmpData_contenido.slice(indexSrcImg, indexFinSrcImg),
    //   });
    //   tmpData_contenido = tmpData_contenido.slice(indexFinSrcImg + tamanioFinSrc);
    // });

    console.log(`imagenesDelContenido: ${JSON.stringify(imagenesDelContenido)}`);
    return imagenesDelContenido;
  }

  function obtenerObjetoConLinksEnContenido(data_contenido) {
    let linksDelContenido = [];
    let tmpData_contenido = data_contenido;
    let regexLink = /<a href="(.*?)">(.*?)<\/a>/gm;

    let match;
    while ((match = regexLink.exec(tmpData_contenido)) !== null) {
      linksDelContenido.push({
        href: match[1], // Captura el valor de href
        text: match[2], // Captura el texto dentro del <a>
      });
    }

    console.log(`linksDelContenido: ${JSON.stringify(linksDelContenido)}`);
    return linksDelContenido;
  }

  const handleRegistrarContenido = (e) => {
    e.preventDefault();

    let imagenesDelContenido = obtenerObjetoConImagenesEnContenido(data_contenido);
    let linksDelContenido = obtenerObjetoConLinksEnContenido(data_contenido);
    // tmpData_contenido.forEach((caracter) => {});

    // Buscamos dentro de la DB si el contenido existe
    api
      .post("/registrar-contenido", {
        texto: data_contenido,
        tipo: tipo,
        imagenes: imagenesDelContenido,
        links: linksDelContenido,
      })
      .then((response) => {
        if (response.data.Status === 705) {
          setRegistrandoContenido(false);
          setEditandoContenido(true);
          setIdContenido(response.data.content_id);
          Swal.fire({
            title: response.data.message,
            showCancelButton: false,
            confirmButtonText: "Continuar",
            icon: "success",
          });
        }
      })
      .catch((error) => {
        console.error(`Error creando el contenido.\n${error}`);
      });
    // axios
    //   .post("https://lms-facultad-de-quimica.onrender.com/api/registrar-contenido", {
    //     texto: data_contenido,
    //     tipo: tipo,
    //     imagenes: imagenesDelContenido,
    //     links: linksDelContenido,
    //   })
    //   .then((response) => {
    //     if (response.data.Status === 705) {
    //       setRegistrandoContenido(false);
    //       setEditandoContenido(true);
    //       setIdContenido(response.data.content_id);
    //       Swal.fire({
    //         title: response.data.message,
    //         showCancelButton: false,
    //         confirmButtonText: "Continuar",
    //         icon: "success",
    //       });
    //     }
    //   })
    //   .catch((error) => {
    //     console.error(`Error creando el contenido.\n${error}`);
    //   });
    // Si existe, lo actualizamos
    // Si no existe, lo creamos
  };

  const handleEditarContenido = (e) => {
    e.preventDefault();

    let imagenesDelContenido = obtenerObjetoConImagenesEnContenido(data_contenido);
    let linksDelContenido = obtenerObjetoConLinksEnContenido(data_contenido);

    // Buscamos dentro de la DB si el contenido existe
    api
      .post("/editar-contenido", {
        id_contenido: idContenido,
        texto: data_contenido,
        tipo: tipo,
        imagenes: imagenesDelContenido,
        links: linksDelContenido,
      })
      .then((response) => {
        if (response.data.Status === 707) {
          Swal.fire({
            title: response.data.message,
            showCancelButton: false,
            confirmButtonText: "Continuar",
            icon: "success",
          });
        }
      })
      .catch((error) => {
        console.error(`Error actualizando el contenido.\n${error}`);
      });
    // // Buscamos dentro de la DB si el contenido existe
    // axios
    //   .post("https://lms-facultad-de-quimica.onrender.com/api/editar-contenido", {
    //     id_contenido: idContenido,
    //     texto: data_contenido,
    //     tipo: tipo,
    //     imagenes: imagenesDelContenido,
    //   })
    //   .then((response) => {
    //     if (response.data.Status === 707) {
    //       Swal.fire({
    //         title: response.data.message,
    //         showCancelButton: false,
    //         confirmButtonText: "Continuar",
    //         icon: "success",
    //       });
    //     }
    //   })
    //   .catch((error) => {
    //     console.error(`Error actualizando el contenido.\n${error}`);
    //   });
  };

  const handleVaciarContenido = (e) => {
    e.preventDefault();
    Swal.fire({
      title: `Seguro que desea borrar el contenido actual?`,
      showDenyButton: true,
      confirmButtonText: "Si, borrar",
      denyButtonText: "No, cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        vaciarContenido();
      }
    });
  };

  const vaciarContenido = () => {
    setAgregandoContenido(false);
    setData_contenido("");
  };
  const handleBorrarContenido = (e) => {
    e.preventDefault();
    Swal.fire({
      title: `Seguro que desea borrar el contenido actual?`,
      showDenyButton: true,
      confirmButtonText: "Si, borrar",
      denyButtonText: "No, cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        borrarContenido();
      }
    });
  };

  const borrarContenido = () => {
    api
      .post("/borrar-contenido", {
        id_contenido: idContenido,
      })
      .then((response) => {
        if (response.data.Status === 706) {
          setEditandoContenido(false);
          setRegistrandoContenido(true);
          setAgregandoContenido(false);
          setIdContenido("");
          setData_contenido("");
          Swal.fire({
            title: response.data.message,
            showCancelButton: false,
            confirmButtonText: "Continuar",
            icon: "success",
          });
        }
      })
      .catch((error) => {
        console.error(`Error borrando el contenido.\n${error}`);
      });
    // axios
    //   .post("https://lms-facultad-de-quimica.onrender.com/api/borrar-contenido", {
    //     id_contenido: idContenido,
    //   })
    //   .then((response) => {
    //     if (response.data.Status === 706) {
    //       setEditandoContenido(false);
    //       setRegistrandoContenido(true);
    //       setAgregandoContenido(false);
    //       setIdContenido("");
    //       setData_contenido("");
    //       Swal.fire({
    //         title: response.data.message,
    //         showCancelButton: false,
    //         confirmButtonText: "Continuar",
    //         icon: "success",
    //       });
    //     }
    //   })
    //   .catch((error) => {
    //     console.error(`Error borrando el contenido.\n${error}`);
    //   });
  };
  return (
    <div className="contanier d-flex justify-content-center align-items-center mb-3">
      {agregandoContenido ? (
        <div>
          <div className="form-floating">
            <textarea
              className="form-control"
              placeholder="Leave a comment here"
              id="floatingTextarea1-contenido"
              style={{ height: "150px" }}
              value={data_contenido}
              onChange={(e) => {
                setData_contenido(e.target.value);
              }}></textarea>
            <label htmlFor="floatingTextarea1-contenido">Contenido</label>
          </div>
          {registrandoContenido && idContenido == "" ? (
            <button
              className="btn btn-success"
              type="button"
              onClick={(e) => {
                handleRegistrarContenido(e);
              }}>
              Añadir contenido
            </button>
          ) : (
            <button
              className="btn btn-success"
              type="button"
              onClick={(e) => {
                handleEditarContenido(e);
              }}>
              Editar contenido
            </button>
          )}
          &nbsp;
          {registrandoContenido && idContenido == "" ? (
            <button
              className="btn btn-danger"
              type="button"
              onClick={(e) => {
                handleVaciarContenido(e);
              }}>
              Eliminar contenido
            </button>
          ) : (
            <button
              className="btn btn-danger"
              type="button"
              onClick={(e) => {
                handleBorrarContenido(e);
              }}>
              Eliminar contenido
            </button>
          )}
        </div>
      ) : (
        // <form
        //   onSubmit={(e) => {
        //     handleCrearOActualizarContenido(e);
        //   }}>
        // </form>
        // <form
        //   onSubmit={(e) => {
        //     handleAgregarContenido(e);
        //   }}>
        // </form>
        <button
          className="btn btn-success p-1"
          type="button"
          onClick={(e) => {
            handleAgregarContenido(e);
          }}>
          Añadir contenido
        </button>
      )}
    </div>
  );
}

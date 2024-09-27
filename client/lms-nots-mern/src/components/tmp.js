import { useEffect, useState } from "react";
import Swal from "sweetalert2";

export default function RespuestaCompletarNumerosTabla({
  listaElementosTabla,
  setListaElementosTabla,
}) {
  const [numeroColumnas, setNumeroColumnas] = useState(2);
  const [numeroFilas, setNumeroFilas] = useState(2);
  const [tabla, setTabla] = useState(<></>);

  const generateUniqueId = (length = 16) => {
    const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let id = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      id += characters[randomIndex];
    }
    return Date.now().toString(16) + id;
  };

  const crearRespuesta = () => {
    return {
      id: generateUniqueId(),
      respuesta: "",
      correcta: false,
      valorRespuesta: 0,
      completar: false,
      texto: false,
      numerico: false,
      aparecer_al_completar_tabla: false,
    };
  };

  const handleActualizarCelda = (e, i, j) => {
    const { name, value, type, checked } = e.target;
    const nombre_input = e.target.getAttribute("nombre_input");

    setListaElementosTabla((prevCeldas) => {
      const updatedCeldas = [...prevCeldas];
      const updatedFila = [...updatedCeldas[i]];

      if (type === "checkbox" && name === "completar") {
        updatedFila[j] = {
          ...updatedFila[j],
          completar: checked,
          texto: !checked ? false : updatedFila[j].texto,
          numerico: !checked ? false : updatedFila[j].numerico,
        };
      } else if (type === "checkbox" && name === "aparecer") {
        updatedFila[j] = {
          ...updatedFila[j],
          aparecer_al_completar_tabla: checked,
        };
        updatedCeldas.forEach((fila) => {
          fila[j] = {
            ...fila[j],
            aparecer_al_completar_tabla: checked,
            completar: false,
            texto: false,
            numerico: false,
          };
        });
      } else if (type === "radio") {
        updatedFila[j] = {
          ...updatedFila[j],
          texto: nombre_input === "texto" ? checked : false,
          numerico: nombre_input === "numerico" ? checked : false,
        };
      } else {
        updatedFila[j] = {
          ...updatedFila[j],
          respuesta: value,
        };
      }

      updatedCeldas[i] = updatedFila;

      return updatedCeldas;
    });
  };

  const crearTabla = () => {
    return (
      <table className="table">
        <thead>
          <tr>
            {listaElementosTabla[0]?.slice(0, numeroColumnas).map((celda, j) => (
              <th
                scope="col"
                key={j}
                className={
                  celda.aparecer_al_completar_tabla
                    ? "bg-body-secondary rounded-2 border-light-subtle border-2"
                    : ""
                }>
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control fw-bold text-info-emphasis"
                    id={`floatingInput-Header-Tabla-${0}-${j}`}
                    placeholder={"Edítame!"}
                    value={celda.respuesta}
                    onChange={(e) => handleActualizarCelda(e, 0, j)}
                  />
                  <label htmlFor={`floatingInput-Header-Tabla-${j}`}>Edítame!</label>
                </div>
                {j > 1 ? (
                  <>
                    <label className="text-secondary-emphasis">
                      <input
                        type="checkbox"
                        name="aparecer"
                        nombre_input="aparecer"
                        checked={celda.aparecer_al_completar_tabla}
                        onChange={(e) => handleActualizarCelda(e, 0, j)}
                        className="me-1"
                      />
                      Aparecer al completar tabla
                    </label>
                  </>
                ) : (
                  <></>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {listaElementosTabla.slice(1, numeroFilas).map((fila, i) => (
            <tr key={i + 1}>
              {fila.slice(0, numeroColumnas).map((celda, j) => (
                <td
                  key={j}
                  className={
                    celda.aparecer_al_completar_tabla
                      ? "bg-body-secondary rounded-2 border-light-subtle border-2"
                      : ""
                  }>
                  <div
                    className={(() => {
                      let tmpClassName = "";
                      if (j === 0 && i === 0) {
                        tmpClassName =
                          "d-flex flex-column justify-content-center align-items-center bg-body-tertiary rounded-2 border-light-subtle border-2 m-1";
                      } else {
                        tmpClassName =
                          "d-flex flex-column justify-content-center align-items-center bg-body-tertiary rounded-2 border-light-subtle border-2 m-1 p-1";
                      }
                      return tmpClassName;
                    })()}>
                    <div className="form-floating mb-1 w-100">
                      <input
                        type="text"
                        className={
                          j === 0 ? "form-control fw-bold text-info-emphasis" : "form-control"
                        }
                        id={`floatingInput-Body-Tabla-${i + 1}-${j}`}
                        placeholder={(() => {
                          if (celda.texto && !celda.numerico) {
                            return "Texto";
                          } else if (celda.numerico && !celda.texto) {
                            return "Numérico";
                          } else {
                            return "Edítame!";
                          }
                        })()}
                        value={celda.respuesta}
                        name="respuesta"
                        onChange={(e) => handleActualizarCelda(e, i + 1, j)}
                      />
                      <label htmlFor={`floatingInput-Header-Tabla-${j}`}>
                        {(() => {
                          if (celda.texto && !celda.numerico) {
                            return "Texto";
                          } else if (celda.numerico && !celda.texto) {
                            return "Numérico";
                          } else {
                            return "Edítame!";
                          }
                        })()}
                      </label>
                    </div>
                    {j !== 0 && !celda.aparecer_al_completar_tabla ? (
                      <div className="d-flex flex-column justify-content-center align-items-baseline">
                        <label className="text-secondary-emphasis">
                          <input
                            type="checkbox"
                            name="completar"
                            nombre_input="completar"
                            checked={celda.completar}
                            onChange={(e) => handleActualizarCelda(e, i + 1, j)}
                            className="me-1"
                          />
                          Rellenar por usuario
                        </label>
                        {celda.completar && (
                          <div className="d-flex flex-column justify-content-center align-items-baseline">
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="radio"
                                name={`flexRadio-Grupo-${i}-${j}`}
                                nombre_input="texto"
                                id={`flexRadio-Texto-${i}-${j}`}
                                checked={celda.texto}
                                onChange={(e) => handleActualizarCelda(e, i + 1, j)}
                              />
                              <label
                                className="form-check-label"
                                htmlFor={`flexRadio-Texto-${i}-${j}`}>
                                Texto
                              </label>
                            </div>
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="radio"
                                name={`flexRadio-Grupo-${i}-${j}`}
                                nombre_input="numerico"
                                id={`flexRadio-Numerico-${i}-${j}`}
                                checked={celda.numerico}
                                onChange={(e) => handleActualizarCelda(e, i + 1, j)}
                              />
                              <label
                                className="form-check-label"
                                htmlFor={`flexRadio-Numerico-${i}-${j}`}>
                                Rango numérico
                              </label>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const handleCrearTabla = () => {
    let elementosTabla = [...listaElementosTabla];

    for (let i = 0; i < numeroFilas; i++) {
      if (!elementosTabla[i]) {
        let elementosFila = [];
        for (let j = 0; j < numeroColumnas; j++) {
          elementosFila.push(crearRespuesta());
        }
        elementosTabla.push(elementosFila);
      } else {
        let elementosFila = [...elementosTabla[i]];
        for (let j = 0; j < numeroColumnas; j++) {
          if (!elementosFila[j]) {
            elementosFila.push(crearRespuesta());
          }
        }
        elementosTabla[i] = elementosFila;
      }
    }
    setListaElementosTabla(elementosTabla);
  };

  useEffect(() => {
    handleCrearTabla();
  }, [numeroColumnas, numeroFilas]);

  useEffect(() => {
    setTabla(crearTabla());
  }, [listaElementosTabla]);

  // useEffect(() => {
  //   if (listaElementosTabla != []) {
  //     setTabla(crearTabla());
  //   }
  // }, []);

  return (
    <div className="App d-flex flex-column justify-content-center align-items-center">
      <div className="d-flex flex-column justify-content-center align-items-center">
        <h4 className="text-secondary-emphasis">Configurar tabla</h4>
        <div className="d-flex flex-column justify-content-center align-items-end">
          <label className="text-secondary-emphasis my-1">
            Número de columnas
            <input
              type="number"
              value={numeroColumnas}
              onChange={(e) => {
                if (e.target.value < 1 || e.target.value > 25 || e.target.value === "") {
                  setNumeroColumnas(1);
                  Swal.fire({
                    title: "Ingrese un valor válido para la cantidad de columnas",
                    text: "El valor de las columnas para esta tabla debe de ser igual o mayor a 1.",
                    showCancelButton: false,
                    confirmButtonText: "Continuar",
                    icon: "warning",
                  });
                } else {
                  setNumeroColumnas(Number(e.target.value));
                }
              }}
              className="ms-2 form-control w-auto d-inline-block"
            />
          </label>
          <label className="text-secondary-emphasis my-1">
            Número de filas
            <input
              type="number"
              value={numeroFilas}
              onChange={(e) => {
                if (e.target.value < 1 || e.target.value > 25 || e.target.value === "") {
                  setNumeroFilas(1);
                  Swal.fire({
                    title: "Ingrese un valor válido para la cantidad de filas",
                    text: "El valor de las filas para esta tabla debe de ser igual o mayor a 1.",
                    showCancelButton: false,
                    confirmButtonText: "Continuar",
                    icon: "warning",
                  });
                } else {
                  setNumeroFilas(Number(e.target.value));
                }
              }}
              className="ms-2 form-control w-auto d-inline-block"
            />
          </label>
        </div>
        {/* <button onClick={handleCrearTabla} className="btn btn-primary mt-3">
          Crear Tabla
        </button> */}
      </div>
      <div className="mt-4">{tabla}</div>
    </div>
  );
}

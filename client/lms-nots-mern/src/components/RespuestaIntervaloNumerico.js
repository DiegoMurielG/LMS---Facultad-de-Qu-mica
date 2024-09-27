import { useEffect, useState } from "react";
import Swal from "sweetalert2";

export default function RespuestaIntervaloNumerico({
  listaRespuestas,
  setListaRespuestas,
  valorPuntosPregunta,
  isDisabled = true,
  contestadaCorrectamente = false,
  preguntaContestada = false,
}) {
  // ============ Crear objeto respuesta:{valor: número,intervalo: tupla numérica,respuestaEsCorrecta: bool}
  // Con los datos ingresados por el usuario
  // Mostrar y ocultar los límites de la pregunta junto según el valor de isDisables para cuando se renderize la pregrunta para contestar
  // Colocar el input como error (el estilo de error en formulario de Bootstrap) si la respuesta es incorrecta, colcoarlo como bueno si es correcta y mostrar la retroalimentación al final junto con el # de intentos.
  useEffect(() => {
    setListaRespuestas((lista_pasada) => {
      return [
        {
          valor: 0,
          intervalo: [0, 0],
        },
      ];
    });
  }, []);

  const handleModificarIntervalo = (e, tipo_de_intervalo) => {
    const nuevoValor = parseFloat(e.target.value);
    setListaRespuestas((lista_pasada) => {
      const nueva_lista = [...lista_pasada];
      if (nueva_lista[0]) {
        if (tipo_de_intervalo === "Límite inferior") {
          if (nuevoValor > nueva_lista[0].intervalo[1]) {
            Swal.fire({
              title: "Ingrese un valor válido para el límite numérico inferior de la pregunta",
              text: `El límite numérico inferior para esta pregunta debe de ser igual o menor a ${nueva_lista[0].intervalo[1]}.`,
              showCancelButton: false,
              confirmButtonText: "Continuar",
              icon: "warning",
            });
            return lista_pasada;
          }

          nueva_lista[0] = {
            ...nueva_lista[0],
            intervalo: [nuevoValor, nueva_lista[0].intervalo[1]],
          };
        } else if (tipo_de_intervalo === "Límite superior") {
          if (nuevoValor < nueva_lista[0].intervalo[0]) {
            Swal.fire({
              title: "Ingrese un valor válido para el límite numérico superior de la pregunta",
              text: `El límite numérico superior para esta pregunta debe de ser igual o mayor a ${nueva_lista[0].intervalo[0]}.`,
              showCancelButton: false,
              confirmButtonText: "Continuar",
              icon: "warning",
            });
            return lista_pasada;
          }

          nueva_lista[0] = {
            ...nueva_lista[0],
            intervalo: [nueva_lista[0].intervalo[0], nuevoValor],
          };
        }
      }
      return nueva_lista;
    });
  };

  return (
    <div className="d-flex flex-column justify-content-center align-items-center">
      <div className="d-flex justify-content-center align-items-end mb-3">
        <p className="m-0 me-2">Valor por contestar correctamente: </p>
        <p className="text-secondary-emphasis fs-3 m-0">{valorPuntosPregunta} puntos</p>
        {/* <h4 className="m-0">{valorPuntosPregunta} puntos</h4> */}
      </div>
      <div className="d-flex flex-column justify-content-between align-items-center w-100 mb-3">
        <p className="text-warning">
          Redondea tu respuesta a 2 decimales, de lo contrario tu respuesta puede ser marcada como
          incorrecta.
        </p>
        <div className="form-floating me-1 w-100">
          <input
            type="text"
            className={
              preguntaContestada
                ? contestadaCorrectamente
                  ? "form-control is-valid" // Cuando contestadaCorrectamente es true
                  : "form-control is-invalid" // Cuando contestadaCorrectamente es false
                : // <div className="invalid-feedback">Respuesta incorrecta.</div>
                  "form-control" // Cuando preguntaContestada es false (es 0)
            }
            placeholder="Ingrese una respuesta"
            disabled={isDisabled}
            id="floatingInput-respuesta-abierta"
            value={listaRespuestas[0]?.valor || ""}
            onChange={(e) => {
              setListaRespuestas((lista_anterior) => {
                const nueva_lista = [...lista_anterior];
                if (nueva_lista[0]) {
                  nueva_lista[0] = {
                    ...nueva_lista[0],
                    valor: e.target.value,
                  };
                }
                return nueva_lista;
              });
            }}
          />
          <label htmlFor="floatingInput-respuesta-abierta">Ingrese una respuesta</label>
        </div>
      </div>
      <div
        className={
          isDisabled
            ? "d-block d-flex flex-column justify-content-center align-items-center"
            : "d-none d-flex flex-column justify-content-center align-items-center"
        }>
        <div className="w-100 mb-2">
          <p className="m-0">Ingrese los límites numéricos válidos para su respuesta.</p>
        </div>
        <div className="d-flex justify-content-center align-items-center">
          <div className="form-floating me-1">
            <input
              type="number"
              className="form-control"
              placeholder="Límite inferior"
              disabled={!isDisabled}
              id="floatingInput-respuesta-numerica-limite-inferior"
              data-bs-toggle="tooltip"
              data-bs-title="El límite superior se considera dentro del rango de evaluación"
              value={listaRespuestas[0]?.intervalo[0] || 0}
              onChange={(e) => {
                handleModificarIntervalo(e, "Límite inferior");
              }}
            />
            <label htmlFor="floatingInput-respuesta-numerica-limite-inferior">
              Límite inferior
            </label>
          </div>
          <div className="form-floating ms-1">
            <input
              type="number"
              className="form-control"
              placeholder="Límite superior"
              disabled={!isDisabled}
              id="floatingInput-respuesta-numerica-limite-superior"
              data-bs-toggle="tooltip"
              data-bs-title="Así verá el usuario el campo para responder"
              value={listaRespuestas[0]?.intervalo[1] || 0}
              onChange={(e) => {
                handleModificarIntervalo(e, "Límite superior");
              }}
            />
            <label htmlFor="floatingInput-respuesta-numerica-limite-superior">
              Límite superior
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

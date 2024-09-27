export default function RespuestaAbierta({
  data_respuesta,
  setData_respuesta,
  valorPuntosPregunta = 0,
  isDisabled = true,
  contestadaCorrectamente = false,
  preguntaContestada = false,
}) {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center">
      <div className="d-flex justify-content-center align-items-end mb-3">
        <p className="m-0 me-2">Valor por contestar correctamente: </p>
        <p className="text-secondary-emphasis fs-3 m-0">{valorPuntosPregunta} puntos</p>
        {/* <h4 className="m-0">{valorPuntosPregunta} puntos</h4> */}
      </div>
      <div className="form-floating w-100">
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
          data-bs-toggle="tooltip"
          data-bs-title="Así verá el usuario el campo para responder"
          value={data_respuesta}
          onChange={(e) => {
            setData_respuesta(e.target.value);
          }}
        />
        <label htmlFor="floatingInput-respuesta-abierta">Ingrese una respuesta</label>
      </div>
    </div>
  );
}

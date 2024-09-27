export default function TituloCursosEncontrados({ cliked_search }) {
  return (
    <>
      {cliked_search ? (
        <div className="container d-flex justify-content-center align-content-center">
          <h1 className="mb-3 me-3">Cursos encontrados</h1>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            fill="currentColor"
            className="bi bi-arrow-90deg-right"
            viewBox="0 0 16 16"
            style={{ transform: "rotate(90deg)" }}>
            <path
              fillRule="evenodd"
              d="M14.854 4.854a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708.708L13.293 4H3.5A2.5 2.5 0 0 0 1 6.5v8a.5.5 0 0 0 1 0v-8A1.5 1.5 0 0 1 3.5 5h9.793l-3.147 3.146a.5.5 0 0 0 .708.708z"
            />
          </svg>
        </div>
      ) : (
        <></>
      )}
    </>
  );
}

export default function ChipAutocompletado({ value, handleRemoveThisChip }) {
  return (
    <div className="d-flex mx-2 my-3 p-0 justify-content-center align-items-center border-end border-3 border-light-subtle">
      <p className="px-1 m-0">{value.nombre}</p>
      <button
        onClick={handleRemoveThisChip}
        className="btn rounded-5 d-flex justify-content-center align-items-center p-1 me-1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          className="bi bi-x-lg"
          viewBox="0 0 16 16">
          <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
        </svg>
      </button>
    </div>
  );
}

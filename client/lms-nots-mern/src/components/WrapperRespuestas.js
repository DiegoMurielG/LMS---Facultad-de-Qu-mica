export default function WrapperRespuestas({ children }) {
  return (
    <div className="d-flex justify-content-center align-items-center flex-column">
      <h3 className="mb-3">Respuestas</h3>
      {children}
    </div>
  );
}

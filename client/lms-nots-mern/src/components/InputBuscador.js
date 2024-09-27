import axios from "axios";
import { useEffect, useState } from "react";
// import { Navigate } from "react-router-dom";
import Swal from "sweetalert2";
import ChipAutocompletado from "./ChipAutocompletado";

export default function InputBuscador({
  name,
  id,
  placeholder,
  label,
  onChange,
  value,
  // searching,
  elementosDisponibles,
  elementosSeleccionados,
  setElementosSeleccionados,
  aQuienAsignamos,
  queBuscamos,
}) {
  // const navigate = Navigate();
  // const [elementosSeleccionados, setElementosSeleccionados] = useState([]);
  // let elementosSeleccionados = [];
  // elementosDisponibles.forEach((element) => {
  //   console.log(element.nombre);
  // });
  // console.log(`elementosDisponibles: ${elementosDisponibles}`);

  const handleAutocomplete = (e, elemento) => {
    if (e) {
      e.preventDefault();
    }

    let elementoEstaSeleccionado = elementosSeleccionados.find((elem) => {
      // console.log(`elem._id: ${elem._id}`);
      // console.log(`elemento: ${elemento._id}`);
      return elem._id === elemento._id;
    });

    if (!elementoEstaSeleccionado) {
      setElementosSeleccionados([...elementosSeleccionados, elemento]);
    } else {
      Swal.fire({
        title: `El ${queBuscamos} ${elemento.nombre} ya fué asignado al ${aQuienAsignamos}`,
        showCancelButton: false,
        confirmButtonText: "Continuar",
        icon: "warning",
      });
    }
    // if (searching === "maestros") {

    // } else if (searching === "cursos") {
    // } else {
    //   Swal.fire({
    //     title: "Error, loging out",
    //     showCancelButton: false,
    //     confirmButtonText: "Continuar",
    //     icon: "error",
    //     confirmButtonColor: "red",
    //   });
    //   navigate("/");
    // }
  };

  // useEffect(() => {
  //   if (elementosSeleccionados.length > 0) {
  //     elementosSeleccionados.forEach((elemento) => {
  //       handleAutocomplete(null, elemento);
  //     });
  //   }
  // }, [elementosSeleccionados]);

  const handleRemoveThisChip = (e, chipValue) => {
    // Remove the chip searching its value in elementosSeleccionados array, then update the value of the array of elementosSeleccionados so it dosn´t have the chip to ve removed
    e.preventDefault();
    // console.log(`e: ${e.name}`);
    // Somthing like setElementosSeleccionados(
    //   elementosSeleccionados.pop(
    //     elementosSeleccionados.find(e.target.value)
    //   )
    // )
    setElementosSeleccionados(
      elementosSeleccionados.filter((elem) => elem.nombre !== chipValue.nombre)
    );
    // console.log(`elementosDisponibles: ${elementosDisponibles}`);
  };

  return (
    <div className="w-100 d-flex flex-column bg-body-secondary border-3 border-light-subtle rounded-3">
      <div className="d-flex border-5 border-light">
        {elementosSeleccionados.length > 0 ? (
          elementosSeleccionados.map((chipValue, index) => (
            <div key={index}>
              <ChipAutocompletado
                value={chipValue}
                handleRemoveThisChip={(e) => {
                  handleRemoveThisChip(e, chipValue);
                }}
              />
            </div>
          ))
        ) : (
          <></>
        )}
      </div>
      <div className="form-floating">
        <input
          type="text"
          name={name}
          className="form-control"
          id={id}
          placeholder={placeholder}
          autoComplete="off"
          value={value}
          onChange={onChange}
        />
        <label htmlFor={id} className="important">
          {label}
        </label>
      </div>
      {elementosDisponibles.length > 0 ? (
        <div className="d-flex flex-wrap w-100 px-3 py-2 justify-content-center align-items-center">
          {elementosDisponibles.map((elemento, index) => (
            <button
              className="btn btn-outline-light p-2 mx-1 my-1 border-2 border-light-subtle rounded-3"
              key={index}
              onClick={(e) => {
                handleAutocomplete(e, elemento);
              }}>
              {elemento.nombre}
            </button>
          ))}
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}

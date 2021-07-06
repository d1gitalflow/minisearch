import { useEffect, useRef } from "react";
//abstracted component / reusable component
export const InputWithLabel = ({ id, label, value, onInputChange, type = 'text', children, isFocus }) => {

    const handleChange = (ev) => {
      onInputChange(ev)
    }
  
    const inputRef = useRef();
    useEffect(() => {
      if (isFocus && inputRef.current) {
        inputRef.current.focus();
      }
    }, [isFocus])
    return (
      <>
        <label htmlFor={id} >{children}</label>
        
        <input
          id={id}
          type={type}
          value={value}
          onChange={handleChange}
  
          ref={inputRef}
        ></input>
      </>
    )
  }
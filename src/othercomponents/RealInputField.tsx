import { useRef } from "react";


export function RealInputField(props: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>) {

  const inputfieldRef = useRef<HTMLInputElement>(null);
  return <input {...props} onChange={(ev) => {
    if (props.onChange)
      props.onChange(ev);
    setTimeout(() => {
      console.log("timed", ev.target?.value, ev.currentTarget?.value, inputfieldRef.current);
      ev.target.focus();
    },300);
  }
  }
    ref={inputfieldRef}
  />;
}
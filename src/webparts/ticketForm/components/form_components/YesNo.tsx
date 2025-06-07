import * as React from "react";
import styles from "../TicketForm.module.scss";

interface TextAreaProps {
  field: string;
  id: string;
  value: boolean | undefined;
  setValue: (value: boolean) => void;
  failedSubmit: boolean;
}

const YesNo: React.FC<TextAreaProps> = ({
  field,
  id,
  value,
  setValue,
  failedSubmit,
}) => {
  return (
    <div className={styles.radioDiv}>
      <label htmlFor={id}>{field}</label>
      <div
        className={styles.radioFlex}
        style={{ marginBottom: "0", justifyContent: "normal", gap: "10px" }}
      >
        <label
          htmlFor={"yes"}
          style={{
            width: "10%",
            height: "30px",
            borderRadius: "20px",
            ...(failedSubmit && value === undefined
              ? { border: "1px solid red" }
              : !value && value !== undefined
              ? { border: "1px solid green", color: "green" }
              : { border: "1px solid grey" }),
          }}
        >
          Yes
          <input
            id={"yes"}
            type="radio"
            name={id}
            value={"yes"}
            onChange={() => {
              setValue(false);
            }}
          />
        </label>

        <label
          htmlFor={"no"}
          style={{
            width: "10%",
            height: "30px",
            borderRadius: "20px",
            ...(failedSubmit && value === undefined
              ? { border: "1px solid red" }
              : value && value !== undefined
              ? { border: "1px solid red", color: "red" }
              : { border: "1px solid grey" }),
          }}
        >
          No
          <input
            id={"no"}
            type="radio"
            name={id}
            value={"no"}
            onChange={() => {
              setValue(true);
            }}
          />
        </label>
      </div>
    </div>
  );
};

export default YesNo;

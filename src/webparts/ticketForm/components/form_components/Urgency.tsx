import * as React from "react";
import styles from "../TicketForm.module.scss";

interface UrgencyProps {
  urgency: string;
  setUrgency: (urgency: string) => void;
  invalid: boolean;
}

const Urgency: React.FC<UrgencyProps> = ({ urgency, setUrgency, invalid }) => {
  const urgencyStrings: string[] = ["Critical", "High", "Medium", "Low"];

  const urgencyClass: Record<string, string> = {
    Critical: styles.critical,
    High: styles.high,
    Medium: styles.medium,
    Low: styles.low,
  };

  return (
    <div className={styles.radioDiv}>
      <label>Urgency</label>
      <div className={styles.radioFlex}>
        {urgencyStrings.map((item, i) => (
          <label
            key={item}
            className={urgencyClass[item]}
            style={
              invalid
                ? {
                    backgroundColor: "white",
                    color: "red",
                    border: "1px solid red",
                  }
                : item !== urgency
                ? {
                    backgroundColor: "white",
                    color: "black",
                    border: "1px solid black",
                  }
                : {}
            }
            htmlFor={`urgency-${i}`}
          >
            <input
              id={`urgency-${i}`}
              type="radio"
              name="urgency"
              value={item}
              onChange={() => {
                setUrgency(item);
              }}
            />
            <span>{item}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default Urgency;

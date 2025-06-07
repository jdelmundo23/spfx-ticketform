import * as React from "react";
import styles from "../TicketForm.module.scss";

interface SubmittedProps {
  hasTeamsContext: boolean;
  setFormCount: () => void;
  resetForm: () => void;
  scrollToTop: () => void;
}

const Submitted: React.FC<SubmittedProps> = ({
  hasTeamsContext,
  setFormCount,
  resetForm,
  scrollToTop
}) => {

  React.useEffect(() => scrollToTop(), [])

  return (
    <section
      className={`${styles.ticketForm} ${hasTeamsContext ? styles.teams : ""}`}
    >
      <div className={styles.submittedModal}>
        <h1>Ticket Submitted</h1>
        <p>Your request has been received<br/>You will receive email updates on the status of your ticket</p>
        <button
          onClick={() => {
            setFormCount();
            resetForm();
          }}
        >NEW TICKET</button>
      </div>
    </section>
  );
};

export default Submitted;

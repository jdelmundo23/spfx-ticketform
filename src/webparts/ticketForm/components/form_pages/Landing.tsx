import * as React from "react";
import styles from "../TicketForm.module.scss";

interface LandingProps {
  hasTeamsContext: boolean;
  setIT: () => void;
  setFacilities: () => void;
}

const Landing: React.FC<LandingProps> = ({ hasTeamsContext, setIT, setFacilities }) => {
  return (
    <section
      className={`${styles.ticketForm} ${hasTeamsContext ? styles.teams : ""}`}
    >
      <div className={styles.Landing}>
        <button onClick={setIT}>
            IT Help Desk
        </button>
        <button onClick={setFacilities}>
            Facilities Help Desk
        </button>
      </div>
    </section>
  );
};

export default Landing;

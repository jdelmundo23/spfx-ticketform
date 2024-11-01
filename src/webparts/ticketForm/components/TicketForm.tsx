import * as React from "react";
import { useState } from "react";
import type { ITicketFormProps } from "./ITicketFormProps";
import "@pnp/sp/webs";
import "@pnp/sp/lists/web";
import "@pnp/sp/items";
import "@pnp/sp/attachments";
import "@pnp/sp/fields";
import "@pnp/sp/folders";
import "@pnp/sp/sites";
import "@pnp/sp/files";
import "@pnp/sp/site-users/web";
import "@pnp/sp/site-groups/web";
import "@pnp/graph/groups";
import "@pnp/graph/members";
import Landing from "./form_pages/Landing";
import IT from "./form_pages/IT";
import Facilities from "./form_pages/Facilities";
import Submitted from "./form_pages/Submitted";
import styles from "./TicketForm.module.scss";
import APIContext, { createAPIContext } from "../context/APIContext";
import { checkAdminStatus } from "../api/data";

const TicketForm: React.FC<ITicketFormProps> = (props) => {
  const { hasTeamsContext, userDisplayName, userId, sp, context } = props;

  const [formCount, setFormCount] = useState<number>(0);
  const [formID, setFormID] = useState<number>(0);
  const [isFadeIn, setIsFadeIn] = useState<boolean>(false);
  const [isSiteAdmin, setIsSiteAdmin] = useState<boolean>(false);

  const page = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    checkAdminStatus(sp)
      .then((data) => setIsSiteAdmin(data))
      .catch((error) => console.error("Unhandled promise rejection:", error));

    setIsFadeIn(true);
  }, []);

  let formHTML: React.ReactElement = <></>;

  switch (formID) {
    case 0:
      formHTML = (
        <Landing
          hasTeamsContext={hasTeamsContext}
          setIT={() => setFormID(1)}
          setFacilities={() => setFormID(2)}
        />
      );
      break;
    case 1:
      formHTML = (
        <IT
          key={formCount}
          userDisplayName={userDisplayName}
          userId={userId}
          resetForm={() => setFormID(0)}
          completeForm={() => setFormID(3)}
          isSiteAdmin={isSiteAdmin}
        />
      );
      break;
    case 2:
      formHTML = (
        <Facilities
          key={formCount}
          userDisplayName={userDisplayName}
          userId={userId}
          resetForm={() => setFormID(0)}
          completeForm={() => setFormID(3)}
          isSiteAdmin={isSiteAdmin}
        />
      );
      break;
    case 3:
      formHTML = (
        <Submitted
          hasTeamsContext={hasTeamsContext}
          setFormCount={() => setFormCount(formCount + 1)}
          resetForm={() => setFormID(0)}
          scrollToTop={() => page.current?.scrollIntoView({ behavior: "smooth" })}
        />
      );
  }

  return (
    <div ref={page} key={formID} className={`${styles.whitePage} ${hasTeamsContext ? styles.teams : ""}`}>
      <APIContext.Provider value={createAPIContext(context)}>
        <div className={isFadeIn ? styles.fadeIn : ""}>{formHTML}</div>
      </APIContext.Provider>
    </div>
  );
};

export default TicketForm;

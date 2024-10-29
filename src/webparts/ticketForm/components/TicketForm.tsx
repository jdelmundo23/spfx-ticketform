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
import Landing from "./Landing";
import IT from "./IT";
import Facilities from "./Facilities";
import Submitted from "./Submitted";
import styles from "./TicketForm.module.scss";
import { spPost, SPQueryable } from "@pnp/sp";
import { AssignFrom } from "@pnp/core";
import { body } from "@pnp/queryable";
import APIContext, { createAPIContext } from "../context/APIContext";
import { checkAdminStatus } from "../api/data";

interface ticketProps {
  Title: string;
  Urgency: string;
  Description: string;
  UserId: number;
  Department: string;
  Branch: string;
  Restarted: boolean | undefined;
  HasAttachments: boolean;
  Status?: string;
  AssignedToId?: number;
}

interface facTicketProps {
  Title: string;
  Priority: string;
  Description: string;
  RequestorId: number;
  Branch: string;
  HasAttachments: boolean;
}

const TicketForm: React.FC<ITicketFormProps> = (props) => {
  const { hasTeamsContext, userDisplayName, userId, sp, context } = props;

  const [formCount, setFormCount] = useState<number>(0);
  const [formID, setFormID] = useState<number>(0);
  const [isFadeIn, setIsFadeIn] = useState<boolean>(false);
  const [isSiteAdmin, setIsSiteAdmin] = useState<boolean>(false);

  const page = React.useRef<HTMLDivElement>(null);


  const addResolutionComment = async (
    id: number,
    resolution: string
  ): Promise<void> => {
    const spQueryable = SPQueryable(
      `${context.pageContext.site.absoluteUrl}/_api/web/lists/GetByTitle('IT')/items(${id})/Comments`
    ).using(AssignFrom(sp.web));

    await spPost(spQueryable, body({ text: "Resolution: " + resolution }));
  };

  React.useEffect(() => {
    checkAdminStatus(sp)
      .then((data) => setIsSiteAdmin(data))
      .catch((error) => console.error("Unhandled promise rejection:", error));

    setIsFadeIn(true);
  }, []);

  const submitTicket = async (
    title: string,
    ticketUserId: number,
    urgency: string,
    description: string,
    files: File[],
    department: string,
    branch: string,
    restarted: boolean | undefined,
    status: string,
    resolution: string
  ): Promise<void> => {
    const item: ticketProps = {
      Title: title,
      Urgency: urgency,
      Description: description,
      UserId: ticketUserId,
      Department: department,
      Branch: branch,
      Restarted: restarted,
      HasAttachments: files.length > 0 ? true : false,
      Status: status,
      AssignedToId: (await sp.web.currentUser()).Id,
    };

    if (!status) {
      delete item.Status;
      delete item.AssignedToId;
    }

    if (status === "Not Started") {
      delete item.AssignedToId;
    }

    try {
      const response = await sp.web.lists.getByTitle("IT").items.add(item);

      if (resolution) {
        await addResolutionComment(response.ID, resolution);
      }

      if (files.length > 0) {
        const web = await sp.web();

        try {
          const url = `${web.ServerRelativeUrl}/Helpdesk Documents/IT Help Desk/${response.ID}`;
          const folderResult = await sp.web.folders.addUsingPath(url);
          const folder = sp.web.getFolderByServerRelativePath(
            folderResult.ServerRelativeUrl
          );
          for (const file of files) {
            const arrayBuffer = await file.arrayBuffer();
            await folder.files.addUsingPath(file.name, arrayBuffer);
          }
        } catch {
          console.error("Failed to create document library.");
        }
      }
      setFormID(3);
    } catch {
      console.error("Failed to submit ticket.");
    }
  };

  const submitFacTicket = async (
    title: string,
    ticketUserId: number,
    priority: string,
    description: string,
    files: File[],
    branch: string
  ): Promise<void> => {
    const item: facTicketProps = {
      Title: title,
      Priority: priority,
      Description: description,
      RequestorId: ticketUserId,
      Branch: branch,
      HasAttachments: files.length > 0 ? true : false,
    };
    try {
      const test = await sp.web.lists.getByTitle("Facilities").fields();
      console.log(test.filter((field) => field.Required === true));

      const response = await sp.web.lists
        .getByTitle("Facilities")
        .items.add(item);

      if (files.length > 0) {
        const web = await sp.web();

        try {
          const url = `${web.ServerRelativeUrl}/Helpdesk Documents/Facilities/${response.ID}`;
          const folderResult = await sp.web.folders.addUsingPath(url);
          const folder = sp.web.getFolderByServerRelativePath(
            folderResult.ServerRelativeUrl
          );
          for (const file of files) {
            const arrayBuffer = await file.arrayBuffer();
            await folder.files.addUsingPath(file.name, arrayBuffer);
          }
        } catch {
          console.error("failed to create document library");
        }
      }
      setFormID(3);
    } catch {
      console.error("failed to submit ticket");
    }
  };

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
          hasTeamsContext={hasTeamsContext}
          userDisplayName={userDisplayName}
          userId={userId}
          submitTicket={submitTicket}
          resetForm={() => setFormID(0)}
          isSiteAdmin={isSiteAdmin}
        />
      );
      break;
    case 2:
      formHTML = (
        <Facilities
          key={formCount}
          hasTeamsContext={hasTeamsContext}
          userDisplayName={userDisplayName}
          userId={userId}
          submitFacTicket={submitFacTicket}
          resetForm={() => setFormID(0)}
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
    <div ref={page} key={formID} className={styles.whitePage}>
      <APIContext.Provider value={createAPIContext(context)}>
        <div className={isFadeIn ? styles.fadeIn : ""}>{formHTML}</div>
      </APIContext.Provider>
    </div>
  );
};

export default TicketForm;

import * as React from "react";
import { useState } from "react";
import type { ITicketFormProps } from "./ITicketFormProps";
import "@pnp/sp/webs";
import "@pnp/sp/lists/web";
import "@pnp/sp/items";
import "@pnp/sp/attachments";
import "@pnp/sp/fields";
import "@pnp/sp/folders";
import "@pnp/sp/files";
import "@pnp/sp/site-users/web";
import Landing from "./Landing";
import IT from "./IT";
import Facilities from "./Facilities";
import Submitted from "./Submitted";
import styles from "./TicketForm.module.scss";
import { PermissionKind } from "@pnp/sp/security";
import { ISiteUserInfo } from "@pnp/sp/site-users/types";

interface ticketProps {
  Title: string;
  Urgency: string;
  Description: string;
  UserId: number;
  Department: string;
  Branch: string;
  Restarted: boolean;
  HasAttachments: boolean;
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
  const { hasTeamsContext, userDisplayName, userId, sp } = props;

  const [formCount, setFormCount] = useState<number>(0);
  const [formID, setFormID] = useState<number>(0);
  const [isFadeIn, setIsFadeIn] = useState<boolean>(false);
  const [isSiteAdmin, setIsSiteAdmin] = useState<boolean>(false);

  const page = React.useRef<HTMLDivElement>(null);

  const scrollToTop = (): void => {
    page.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    setIsFadeIn(true);
  });

  React.useEffect(() => {
    const checkAdminStatus = async (): Promise<void> => {
      try {
        const web = sp.web;

        const permissions = await web.getCurrentUserEffectivePermissions();

        if (
          web.hasPermissions(permissions, PermissionKind.ManageWeb) &&
          web.hasPermissions(permissions, PermissionKind.ManagePermissions) &&
          web.hasPermissions(permissions, PermissionKind.CreateGroups)
        ) {
          setIsSiteAdmin(true);
        } else {
          setIsSiteAdmin(false);
        }
      } catch (error) {
        console.error("Error checking permissions:", error);
      }
    };
    checkAdminStatus().catch((error) =>
      console.error("Unhandled promise rejection:", error)
    );
  }, []);

  const getSiteUsers = async (): Promise<ISiteUserInfo[]> => {
    const users = await sp.web.siteUsers();
    const validUsers = users.filter((user) => user.UserPrincipalName);
    return validUsers;
  };

  const submitTicket = async (
    title: string,
    ticketUserId: number,
    urgency: string,
    description: string,
    files: File[],
    department: string,
    branch: string,
    restarted: boolean
  ): Promise<void> => {
    const item: ticketProps = {
      Title: title,
      Urgency: urgency,
      Description: description,
      UserId: ticketUserId,
      Department: department,
      Branch: branch,
      Restarted: restarted,
      HasAttachments: files.length > 0 ? true : false
    };

    try {
      const response = await sp.web.lists.getByTitle("IT").items.add(item);

      if (files.length > 0) {
        try {
          const url = `${process.env.SHAREPOINT_SITE_URL}/Helpdesk Documents/IT Help Desk/${response.ID}`;
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
      HasAttachments: files.length > 0 ? true : false
    };
    try {
      const test = await sp.web.lists.getByTitle("Facilities").fields();
      console.log(test.filter((field) => field.Required === true));

      const response = await sp.web.lists
        .getByTitle("Facilities")
        .items.add(item);

      if (files.length > 0) {
        try {
          const url = `${process.env.SHAREPOINT_SITE_URL}/Helpdesk Documents/Facilities/${response.ID}`;
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

  const getFieldChoices = async (
    listName: string,
    fieldName: string
  ): Promise<string[]> => {
    const list = sp.web.lists.getByTitle(listName);
    const r = await list.fields();
    const fields = r.filter((field) => field.Title === fieldName);
    return fields[0].Choices ?? [];
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
          getFieldChoices={getFieldChoices}
          resetForm={() => setFormID(0)}
          isSiteAdmin={isSiteAdmin}
          getSiteUsers={getSiteUsers}
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
          getFieldChoices={getFieldChoices}
          resetForm={() => setFormID(0)}
          isSiteAdmin={isSiteAdmin}
          getSiteUsers={getSiteUsers}
        />
      );
      break;
    case 3:
      formHTML = (
        <Submitted
          hasTeamsContext={hasTeamsContext}
          setFormCount={() => setFormCount(formCount + 1)}
          resetForm={() => setFormID(0)}
          scrollToTop={scrollToTop}
        />
      );
  }

  return (
    <div ref={page} key={formID} className={styles.whitePage}>
      <div className={isFadeIn ? styles.fadeIn : ""}>{formHTML}</div>
    </div>
  );
};

export default TicketForm;

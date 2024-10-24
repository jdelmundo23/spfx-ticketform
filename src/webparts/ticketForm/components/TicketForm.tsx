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
import { PermissionKind } from "@pnp/sp/security";
import { IMember } from "@pnp/graph/members";
import { spPost, SPQueryable } from "@pnp/sp";
import { AssignFrom } from "@pnp/core";
import { body } from "@pnp/queryable";

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
  const { hasTeamsContext, userDisplayName, userId, sp, graph } = props;

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

  const getUsersFromGroup = async (title: string) : Promise<IMember[]> => {
    const data = await graph.groups();
    const id = data.find(group => group.displayName === title)?.id;
    
    const members: IMember[] | undefined = id ? await graph.groups.getById(id).members() : undefined;
    
    return members ?? [];
  }

  const getUserID = async (upn: string | undefined) : Promise<number> => {
    if (upn) {
      const result = await sp.web.ensureUser(upn);
      return result.Id;
    }
    return 0;
  }

  const addResolutionComment = async (id: number, resolution: string) : Promise<void> => {
    const spQueryable = SPQueryable(`https://bankofwalterboro.sharepoint.com/sites/BOLITHELPDESK/_api/web/lists/GetByTitle('IT')/items(${id})/Comments`).using(AssignFrom(sp.web));

    await spPost(spQueryable, body({text: 'Resolution: ' + resolution}));
  }

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
      AssignedToId: (await sp.web.currentUser()).Id
    };

    if (!status) {
      delete item.Status;
      delete item.AssignedToId;
    }

    if (status === 'Not Started') {
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
          getUsersFromGroup={getUsersFromGroup}
          getUserID={getUserID}
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
          getUsersFromGroup={getUsersFromGroup}
          getUserID={getUserID}
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

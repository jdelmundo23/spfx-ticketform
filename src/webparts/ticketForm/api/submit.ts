import { AssignFrom } from "@pnp/core";
import { body } from "@pnp/queryable";
import { SPFI, spPost, SPQueryable } from "@pnp/sp";
import { IContextInfo } from "@pnp/sp/context-info";
import { replaceQuotes } from "./util";

const addResolutionComment = async (
  id: number,
  resolution: string,
  sp: SPFI
): Promise<void> => {
  const context: IContextInfo = await sp.site.getContextInfo();
  const spQueryable = SPQueryable(
    `${context.SiteFullUrl}/_api/web/lists/GetByTitle('IT')/items(${id})/Comments`
  ).using(AssignFrom(sp.web));

  await spPost(spQueryable, body({ text: "Resolution: " + resolution }));
};

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

export const submitTicket = async (
  title: string,
  ticketUserId: number,
  urgency: string,
  description: string,
  files: File[],
  department: string,
  branch: string,
  restarted: boolean | undefined,
  status: string,
  resolution: string,
  sp: SPFI | undefined
): Promise<void> => {
  if (sp) {
    const item: ticketProps = {
      Title: replaceQuotes(title),
      Urgency: urgency,
      Description: replaceQuotes(description),
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
        await addResolutionComment(response.ID, resolution, sp);
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
    } catch {
      console.error("Failed to submit ticket.");
    }
  }
};


export const submitFacTicket = async (
  title: string,
  ticketUserId: number,
  priority: string,
  description: string,
  files: File[],
  branch: string,
  sp: SPFI | undefined
): Promise<void> => {
  const item: facTicketProps = {
    Title: title,
    Priority: priority,
    Description: description,
    RequestorId: ticketUserId,
    Branch: branch,
    HasAttachments: files.length > 0 ? true : false,
  };
  if (sp) {
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
    } catch {
      console.error("failed to submit ticket");
    }
  }
};

import { IMember } from "@pnp/graph/members";
import { GraphFI } from "@pnp/graph";
import { SPFI } from "@pnp/sp";
import { PermissionKind } from "@pnp/sp/security";

export const getUsersFromGroup = async (
  title: string,
  graph: GraphFI | undefined
): Promise<IMember[]> => {
  if (graph) {
    const data = await graph.groups();
    const id = data.find((group) => group.displayName === title)?.id;

    const members: IMember[] | undefined = id
      ? await graph.groups.getById(id).members()
      : undefined;

    return members ?? [];
  }
  return [];
};

export const getUserID = async (
  upn: string | undefined,
  sp: SPFI | undefined
): Promise<number> => {
  if (upn && sp) {
    const result = await sp.web.ensureUser(upn);
    return result.Id;
  }
  return 0;
};

export const getFieldChoices = async (
  listName: string,
  fieldName: string,
  sp: SPFI | undefined
): Promise<string[]> => {
  if (sp) {
    const list = sp.web.lists.getByTitle(listName);
    const r = await list.fields();
    const fields = r.filter((field) => field.Title === fieldName);
    return fields[0].Choices ?? [];
  }
  return []
};

export const checkAdminStatus = async (
  sp: SPFI | undefined
): Promise<boolean> => {
  if (sp) {
    try {
      const web = sp.web;
  
      const permissions = await web.getCurrentUserEffectivePermissions();
  
      if (
        web.hasPermissions(permissions, PermissionKind.ManageWeb) &&
        web.hasPermissions(permissions, PermissionKind.ManagePermissions) &&
        web.hasPermissions(permissions, PermissionKind.CreateGroups)
      ) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Error checking permissions:", error);
    }
  }
  return false;
};

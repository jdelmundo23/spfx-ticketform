import { WebPartContext } from '@microsoft/sp-webpart-base';
import { GraphFI } from '@pnp/graph';
import {SPFI} from "@pnp/sp"

export interface ITicketFormProps {
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
  userId: number;
  sp: SPFI;
  graph: GraphFI;
  context: WebPartContext
}

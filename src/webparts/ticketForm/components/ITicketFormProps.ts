import { SPHttpClient } from '@microsoft/sp-http'
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { GraphFI } from '@pnp/graph';
import {SPFI} from "@pnp/sp"

export interface ITicketFormProps {
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
  userId: number;
  currentSiteUrl: string,
  spHttpClient: SPHttpClient
  sp: SPFI;
  graph: GraphFI;
  context: WebPartContext
}

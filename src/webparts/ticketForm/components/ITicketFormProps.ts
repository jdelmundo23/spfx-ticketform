import { SPHttpClient } from '@microsoft/sp-http'
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
}

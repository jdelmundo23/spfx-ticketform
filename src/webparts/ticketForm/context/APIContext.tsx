import { WebPartContext } from '@microsoft/sp-webpart-base'
import { GraphFI, graphfi, SPFx as graphSPFx } from '@pnp/graph'
import { spfi, SPFI, SPFx } from '@pnp/sp'
import { createContext } from 'react'

interface APIContextType {
    sp: SPFI,
    graph: GraphFI
}

export const createAPIContext = (context: WebPartContext) : APIContextType => {
    return {
        sp: spfi().using(SPFx(context)),
        graph: graphfi().using(graphSPFx(context))
    }
}

const APIContext = createContext<APIContextType | undefined>(undefined);

export default APIContext;
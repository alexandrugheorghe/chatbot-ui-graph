import { Annotation } from "@langchain/langgraph"
import { BaseMessage } from "@langchain/core/messages"
import { z } from "zod"
import { supervisorSchema } from "@/app/api/chat/graph/agents/supervisor"
import { clarifierSchema } from "@/app/api/chat/graph/agents/clarifier"

export type GithubGraphMessage = BaseMessage & {
  originatorNode: GithubGraphNodes
  next?: z.infer<typeof supervisorSchema>
  clarification?: z.infer<typeof clarifierSchema>
}

export const GithubGraphState = Annotation.Root({
  githubToken: Annotation<string>({
    reducer: (a, b) => {
      return b ?? a
    }
  }),
  messages: Annotation<GithubGraphMessage[]>({
    reducer: (a, b) => {
      return a.concat(b)
    }
  })
})

export enum GithubGraphNodes {
  // Delegates which node should go next
  "SUPERVISOR_AGENT" = "SUPERVISOR_AGENT",
  // Gives user choices to clarify his intent
  "CLARIFIER_AGENT" = "CLARIFIER_AGENT",
  // Queries the Github API in accordance with the user's intent
  "GITHUB_API_INTEGRATOR_AGENT" = "GITHUB_API_INTEGRATOR_AGENT"
}

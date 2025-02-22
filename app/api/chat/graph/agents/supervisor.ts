import {
  GithubGraphMessage,
  GithubGraphNodes,
  GithubGraphState
} from "@/app/api/chat/graph/types"
import { RunnableConfig } from "@langchain/core/runnables"
import { ChatPromptTemplate } from "@langchain/core/prompts"
import { supervisorPromptGenerator } from "@/app/api/chat/graph/agents/prompts"
import { ChatOpenAI } from "@langchain/openai"
import { z } from "zod"

export const supervisorSchema = z.object({
  nextAgent: z.string().describe("The next agent that should be delegated."),
  nextAgentInstructions: z
    .string()
    .describe("The instructions that should be given to the next agent."),
  nextAgentChoiceExplanation: z
    .string()
    .describe("The explanation for the choice of next agent.")
})

export const SupervisorExecutorFactory = () => {
  return async (
    state: typeof GithubGraphState.State,
    config?: RunnableConfig
  ): Promise<Partial<typeof GithubGraphState.State>> => {
    const supervisorPrompt = ChatPromptTemplate.fromTemplate(
      supervisorPromptGenerator(Object.values(GithubGraphNodes))
    )

    const model = new ChatOpenAI({
      model: "gpt-4-0125-preview"
    }).withStructuredOutput(supervisorSchema)

    const response = await supervisorPrompt.pipe(model).invoke(state)

    const message = {
      content: "",
      originatorNode: GithubGraphNodes.SUPERVISOR_AGENT,
      next: response
    } as GithubGraphMessage

    return {
      ...state,
      messages: [...state.messages, message]
    }
  }
}

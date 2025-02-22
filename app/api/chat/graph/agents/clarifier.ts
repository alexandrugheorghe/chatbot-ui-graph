import {
  GithubGraphMessage,
  GithubGraphNodes,
  GithubGraphState
} from "@/app/api/chat/graph/types"
import { RunnableConfig } from "@langchain/core/runnables"
import { ChatPromptTemplate } from "@langchain/core/prompts"
import { clarifierPromptGenerator } from "@/app/api/chat/graph/agents/prompts"
import { ChatOpenAI } from "@langchain/openai"
import { z } from "zod"

export const clarifierSchema = z.object({
  question: z
    .string()
    .describe("The question that should clarify the user query."),
  options: z.array(
    z.object({
      label: z
        .string()
        .describe(
          "The label of the option that will be displayed to the user."
        ),
      value: z
        .string()
        .describe("The value that will be used in the next message.")
    })
  )
})

export const ClarifierExecutorFactory = () => {
  return async (
    state: typeof GithubGraphState.State,
    config?: RunnableConfig
  ): Promise<Partial<typeof GithubGraphState.State>> => {
    const supervisorPrompt = ChatPromptTemplate.fromTemplate(
      clarifierPromptGenerator()
    )

    const model = new ChatOpenAI({
      model: "gpt-4-0125-preview"
    }).withStructuredOutput(clarifierSchema)

    const response = await supervisorPrompt.pipe(model).invoke(state)

    const message = {
      content: "",
      originatorNode: GithubGraphNodes.CLARIFIER_AGENT,
      clarification: response
    } as GithubGraphMessage

    return {
      ...state,
      messages: [...state.messages, message]
    }
  }
}

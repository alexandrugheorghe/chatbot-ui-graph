import {
  GithubGraphMessage,
  GithubGraphNodes,
  GithubGraphState
} from "@/app/api/chat/graph/types"
import { RunnableConfig } from "@langchain/core/runnables"
import { ChatPromptTemplate } from "@langchain/core/prompts"
import { clarifierPromptGenerator } from "@/app/api/chat/graph/agents/prompts"
import { ChatOpenAI } from "@langchain/openai"
import { createReactAgent } from "@langchain/langgraph/prebuilt"

export const GithubIntegratorExecutorFactory = () => {
  return async (
    state: typeof GithubGraphState.State,
    config?: RunnableConfig
  ): Promise<Partial<typeof GithubGraphState.State>> => {
    const supervisorPrompt = ChatPromptTemplate.fromTemplate(
      clarifierPromptGenerator()
    )

    const model = new ChatOpenAI({
      model: "gpt-4-0125-preview"
    })

    const agent = createReactAgent({
      llm: model,
      tools: [],
      prompt: supervisorPrompt
    })

    const response = await agent.invoke({
      messages: state.messages
    })

    return {
      ...state,
      messages: [
        ...response.messages.map((message, index) => {
          if (index === state.messages.length - 1) {
            return {
              ...message,
              originatorNode: GithubGraphNodes.GITHUB_API_INTEGRATOR_AGENT
            } as GithubGraphMessage
          }
          return message as GithubGraphMessage
        })
      ]
    }
  }
}

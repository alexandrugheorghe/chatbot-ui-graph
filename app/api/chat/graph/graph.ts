import { StateGraph } from "@langchain/langgraph"
import { GithubGraphNodes, GithubGraphState } from "@/app/api/chat/graph/types"
import { SupervisorExecutorFactory } from "@/app/api/chat/graph/agents/supervisor"
import { ClarifierExecutorFactory } from "@/app/api/chat/graph/agents/clarifier"
import { GithubIntegratorExecutorFactory } from "@/app/api/chat/graph/agents/githubIntegrator"

const graph = new StateGraph(GithubGraphState)
  .addNode(GithubGraphNodes.SUPERVISOR_AGENT, SupervisorExecutorFactory())
  .addNode(GithubGraphNodes.CLARIFIER_AGENT, ClarifierExecutorFactory())
  .addNode(
    GithubGraphNodes.GITHUB_API_INTEGRATOR_AGENT,
    GithubIntegratorExecutorFactory()
  )

const compiledGraph = graph.compile()

export default compiledGraph

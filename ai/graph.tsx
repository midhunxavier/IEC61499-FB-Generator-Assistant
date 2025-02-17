import { BaseMessage } from "@langchain/core/messages";
import { RunnableConfig } from "@langchain/core/runnables";
import { StateGraph, START, END } from "@langchain/langgraph";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { iec61499FbTool } from "./tools";
import { ChatOpenAI } from "@langchain/openai";
import { MemorySaver } from "@langchain/langgraph";

interface AgentExecutorState {
  input: string;
  chat_history: BaseMessage[];
  /**
   * The plain text result of the LLM if
   * no tool was used.
   */
  result?: string;
  /**
   * The parsed tool result that was called.
   */
  toolCall?: {
    name: string;
    parameters: Record<string, any>;
  };
  /**
   * The result of a tool.
   */
  toolResult?: Record<string, any>;
}

const invokeModel = async (
  state: AgentExecutorState,
  config?: RunnableConfig
): Promise<Partial<AgentExecutorState>> => {
  const initialPrompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      `You are a helpful assistant to generate or modify the IEC 61499 function block (FB).\n `,
    ],
    new MessagesPlaceholder({
      variableName: "chat_history",
      optional: true,
    }),
    ["human", "{input}"],
  ]);

  const tools = [iec61499FbTool];

  const llm = new ChatOpenAI({
    temperature: 0,
    model: "gpt-4o-mini",
    streaming: true,
  }).bindTools(tools);
  const chain = initialPrompt.pipe(llm);
  const result = await chain.invoke(
    {
      input: state.input,
      chat_history: state.chat_history || [],
    },
    config
  );

  if (result.tool_calls && result.tool_calls.length > 0) {
    return {
      toolCall: {
        name: result.tool_calls[0].name,
        parameters: result.tool_calls[0].args,
      },
    };
  }
  return {
    result: result.content as string,
  };
};

const invokeToolsOrReturn = (state: AgentExecutorState) => {
  if (state.toolCall) {
    return "invokeTools";
  }
  if (state.result) {
    return END;
  }
  throw new Error("No tool call or result found.");
};

const invokeTools = async (
  state: AgentExecutorState,
  config?: RunnableConfig
): Promise<Partial<AgentExecutorState>> => {
  if (!state.toolCall) {
    throw new Error("No tool call found.");
  }
  const toolMap = {
    [iec61499FbTool.name]: iec61499FbTool,
  };

  const selectedTool = toolMap[state.toolCall.name];
  if (!selectedTool) {
    throw new Error("No tool found in tool map.");
  }

  const toolParams = {
    description: state.toolCall.parameters.description,
    prev_fb: state.result ? JSON.stringify(state.result, null, 2) : "",
  };

  const toolResult = await selectedTool.invoke(toolParams, config);
  return {
    toolResult: JSON.parse(toolResult),
  };
};

export function agentExecutor() {
  const workflow = new StateGraph<AgentExecutorState>({
    channels: {
      input: null,
      chat_history: null,
      result: null,
      toolCall: null,
      toolResult: null,
    },
  })
    .addNode("invokeModel", invokeModel)
    .addNode("invokeTools", invokeTools)
    .addConditionalEdges("invokeModel", invokeToolsOrReturn)
    .addEdge(START, "invokeModel")
    .addEdge("invokeTools", END);

  const graph = workflow.compile();
  return graph;
}

import { BaseMessage } from "@langchain/core/messages";
import { RunnableConfig } from "@langchain/core/runnables";
import { StateGraph, START, END } from "@langchain/langgraph";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { iec61499FbTool } from "./tools";
import { ChatOpenAI } from "@langchain/openai";

// import { ChatBedrockConverse } from "@langchain/aws";

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
      `You are a helpful assistant to build ECC state machine diagram. 
      Your task is to generate an ECC state machine based on the user's description. 
      Follow these steps to ensure the logic is clear and follows IEC 61499 standards:
      
      1. Start with the "START" state.
      2. Identify all the necessary states for implementing the logic and give them clear, simple names (avoid spaces or special characters).
      3. Define the transitions between states, triggered by specific events or data conditions. Each transition should be accompanied by a condition or event.
      4. Determine the actions to be performed in each state. Each action should include:
          - Associated "Algorithms" that will be executed when entering the state.
          - Any event outputs that are triggered by this state.
      5. Make sure the transitions and conditions between states are well-defined and ensure a clear flow from one state to another.
      
      Format the output as follows:
      - ECC States: List the names of all the states.
      - ECC Transitions: For each transition, specify the source state, target state, and the event or condition that triggers the transition.
      - ECC State Actions: For each state, describe the actions performed, including the algorithms and any output events.
      - Algorithms should be generated in Structured Text (ST) 
    
       You're provided a iec61499FbTool which helps to draw the ECC state diagram.
       Your job is to provide the all necessary information available to build the ECC diagram.
       Whenever you change anything on ECC always call iec61499FbTool to draw it.
       whether or not you have a tool which can handle the users input, or respond with plain text.`,
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
    model: "gpt-4o",
    streaming: true,
  }).bindTools(tools);

  // const llm = new ChatBedrockConverse({
  //   model: "anthropic.claude-3-sonnet-20240229-v1:0",
  //   region: process.env.BEDROCK_AWS_REGION,
  //   credentials: {
  //     accessKeyId: process.env.BEDROCK_AWS_ACCESS_KEY_ID ?? "",
  //     secretAccessKey: process.env.BEDROCK_AWS_SECRET_ACCESS_KEY ?? "",
  //   },
  //   temperature: 0,
  //   maxTokens: 4096,
  //   maxRetries: 2,
  // }).bindTools(tools);

  const chain = initialPrompt.pipe(llm);
  const result = await chain.invoke(
    {
      input: state.input,
      chat_history: state.chat_history,
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
  const toolResult = await selectedTool.invoke(
    state.toolCall.parameters as any,
    config
  );
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

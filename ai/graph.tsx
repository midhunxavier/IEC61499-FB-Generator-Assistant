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
      `You are a helpful assistant to build IEC 61499 Function Block according to the user requirements. 

    Format the output as follows:
    - FB Interface List: List the names of all the events and data inputs and outputs.
    - ECC States: List the names of all the states.
    - ECC Transitions: For each transition, specify the source state, target state, and the event or condition that triggers the transition.
    - ECC State Actions: For each state, describe the actions performed, including the algorithms and any output events.
    - Algorithms: should be generated in Structured Text (ST) 
    
       You're provided a iec61499FbTool which helps to develop IEC 61499FB , draw ECC and download xml.
       Your task is to provide all the necessary information, including a fully formatted output, to build an IEC 61499 Function Block (FB) for the iec61499FbTool. 
          Note that the iec61499FbTool does not retain memory of previously generated outputs, so ensure the provided details are complete and self-contained for each request
          
       Whenever you change anything on IEC 61499 FB then always call iec61499FbTool update it and redraw it.
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

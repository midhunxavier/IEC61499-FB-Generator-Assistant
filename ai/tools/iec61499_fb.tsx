import { z } from "zod";
import { Octokit } from "octokit";
import { tool } from "@langchain/core/tools";
import { CUSTOM_UI_YIELD_NAME } from "@/utils/server";
import { dispatchCustomEvent } from "@langchain/core/callbacks/dispatch/web";
import EccGen from "@/components/prebuilt/iec61499fb/ecc_gen";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import EccGenTable from "@/components/prebuilt/iec61499fb/ecc_table";
import InterfaceListTable from "@/components/prebuilt/iec61499fb/fbTable";
import AlgorithmGen from "@/components/prebuilt/iec61499fb/algorithm";
import FbInterfaceGen from "@/components/prebuilt/iec61499fb/fbinterface";
import DownloadGen from "@/components/prebuilt/iec61499fb/download";

const exampleECC = {
  ECState: [
    { Name: "Idle", Comment: "Initial state" },
    { Name: "Running", Comment: "When algorithm is running" },
    { Name: "Stopped", Comment: "When algorithm stops" },
  ],
  ECTransition: [
    { Source: "Idle", Destination: "Running", Condition: "Start" },
    { Source: "Running", Destination: "Stopped", Condition: "Stop" },
  ],
};

const varDeclaration = z.object({
  Name: z.string().describe("The name of the variable"),
  Type: z.string().describe("The type of the variable (e.g., INT, BOOL)"),
  Comment: z.string().optional().describe("Optional comment for the variable"),
});

const event = z.object({
  Name: z.string().describe("The name of the event"),
  Comment: z.string().optional().describe("Optional comment for the event"),
  With: z
    .array(
      z.object({
        Var: z.string().describe("The variable associated with this event"),
      })
    )
    .optional()
    .describe("The list of associated variables"),
});

const ecState = z.object({
  Name: z.string().describe("The name of the state"),
  Comment: z.string().optional().describe("Optional comment for the state"),
});

const ecTransition = z.object({
  Source: z.string().describe("Source state of the transition"),
  Destination: z.string().describe("Destination state of the transition"),
  Condition: z.string().describe("Condition under which the transition occurs"),
});

const algorithm = z.object({
  Name: z.string().describe("The name of the algorithm"),
  Comment: z.string().optional().describe("Optional comment for the algorithm"),
  ST: z.string().describe("Structured Text code for the algorithm"),
});

const ecAction = z.object({
  Algorithm: z.string().describe("The name of the algorithm to be executed"),
  Output: z
    .string()
    .optional()
    .describe("Optional output event triggered by the action"),
});

const BasicFbSchema = z.object({
  BasicFB: z.object({
    ECC: z.object({
      ECState: z
        .array(
          ecState.extend({
            ECAction: z
              .array(ecAction)
              .optional()
              .describe("List of EC actions for the state"),
          })
        )
        .describe("List of ECC states, with optional EC actions"),
      ECTransition: z.array(ecTransition).describe("List of ECC transitions"),
    }),
    Algorithm: z
      .array(algorithm)
      .describe("List of algorithms associated with this FBType"),
  }),
});

const ecc_schema = z.object({
  ECC: z.object({
    ECState: z
      .array(
        ecState.extend({
          ECAction: z
            .array(ecAction)
            .optional()
            .describe("List of EC actions for the state"),
        })
      )
      .describe("List of ECC states, with optional EC actions"),
    ECTransition: z.array(ecTransition).describe("List of ECC transitions"),
  }),
  Algorithm: z
    .array(algorithm)
    .describe("List of algorithms associated with this FBType"),
});

const fbTypeSchema = z.object({
  GUID: z.string().describe("The unique identifier for the FBType"),
  Name: z.string().describe("The name of the FBType"),
  Comment: z.string().optional().describe("Optional comment for the FBType"),
  Namespace: z
    .string()
    .optional()
    .describe("Optional namespace for the FBType"),
  Identification: z.object({
    Standard: z.string().describe("The standard used for identification"),
  }),
  VersionInfo: z.object({
    Version: z.string().describe("The version of the FBType"),
    Author: z.string().describe("The author of the FBType"),
    Date: z.string().describe("The date the FBType was created"),
    Remarks: z.string().optional().describe("Additional remarks"),
  }),
  InterfaceList: z.object({
    EventInputs: z.array(event).describe("List of input events"),
    EventOutputs: z.array(event).describe("List of output events"),
    InputVars: z.array(varDeclaration).describe("List of input variables"),
    OutputVars: z.array(varDeclaration).describe("List of output variables"),
  }),
  BasicFB: z.object({
    ECC: z.object({
      ECState: z
        .array(
          ecState.extend({
            ECAction: z
              .array(ecAction)
              .optional()
              .describe("List of EC actions for the state"),
          })
        )
        .describe("List of ECC states, with optional EC actions"),
      ECTransition: z.array(ecTransition).describe("List of ECC transitions"),
    }),
    Algorithm: z
      .array(algorithm)
      .describe("List of algorithms associated with this FBType"),
  }),
});

const fbTypeSchemaLite = z.object({
  InterfaceList: z.object({
    EventInputs: z.array(event).describe("List of input events"),
    EventOutputs: z.array(event).describe("List of output events"),
    InputVars: z.array(varDeclaration).describe("List of input variables"),
    OutputVars: z.array(varDeclaration).describe("List of output variables"),
  }),
  BasicFB: z.object({
    ECC: z.object({
      ECState: z
        .array(
          ecState.extend({
            ECAction: z
              .array(ecAction)
              .optional()
              .describe("List of EC actions for the state"),
          })
        )
        .describe("List of ECC states, with optional EC actions"),
      ECTransition: z.array(ecTransition).describe("List of ECC transitions"),
    }),
    Algorithm: z
      .array(algorithm)
      .describe("List of algorithms associated with this FBType"),
  }),
});

const user_question = z.object({
  description: z
    .string()
    .describe("Description to generate or edit ECC state machine"),
});

async function iec61499_fb(input: z.infer<typeof user_question>) {
  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      `You are an expert in generating  IEC 61499 Function block based on the user's description.

    First task is to identify the  IEC 61499 Function block interface. 
    Follow these steps to ensure the logic is clear and follows IEC 61499 standards:
    
    1. Identify the Event inputs and outputs
    2. Identify the Input and output variables and its datatypes.
    3. Datatypes should follow iec 61131-3 standard.

    Next task is to generate an ECC state machine based on the user's description and the identfied function block interface list. 
    Follow these steps to ensure the logic is clear and follows IEC 61499 standards:
    
    1. Start with the "START" state.
    2. Identify all the necessary states for implementing the logic and give them clear, simple names (avoid spaces or special characters).
    3. Define the transitions between states, triggered by specific events or data conditions (use from fb interface list). Each transition should be accompanied by a condition or event.
    4. Determine the actions (ecActions) to be performed in each state. Each action should include:
        - Associated "Algorithms" that will be executed when entering the state.
        - Any event outputs (use from fb interface list) that are triggered by this state.
    5. Make sure the transitions and conditions between states are well-defined and ensure a clear flow from one state to another.
    
    User description of the IEC 61499 FB to be generated:`,
    ],
    ["human", "{input}"],
  ]);

  const llm = new ChatOpenAI({
    temperature: 0,
    model: "gpt-4o-mini",
    streaming: true,
  });

  const structuredLlm = llm.withStructuredOutput(fbTypeSchemaLite);
  const chain = prompt.pipe(structuredLlm);

  const result = await chain.invoke({ input: input.description });

  return {
    result: result,
  };
}

export const iec61499FbTool = tool(
  async (input, config) => {
    await dispatchCustomEvent(
      CUSTOM_UI_YIELD_NAME,
      {
        output: {
          value: <p>{JSON.stringify(input, null, 2)}</p>,
          type: "append",
        },
      },
      config
    );
    const result = await iec61499_fb(input);
    if (typeof result === "string") {
      await dispatchCustomEvent(
        CUSTOM_UI_YIELD_NAME,
        {
          output: {
            value: <p>{JSON.stringify(result, null, 2)}</p>,
            type: "update",
          },
        },
        config
      );
      return result;
    }

    await dispatchCustomEvent(
      CUSTOM_UI_YIELD_NAME,
      {
        output: {
          value: (
            <div className="flex flex-col gap-6">
              <FbInterfaceGen InterfaceList={result.result.InterfaceList} />
              <EccGenTable ecc={result.result.BasicFB.ECC} />
              <AlgorithmGen algorithms={result.result.BasicFB.Algorithm} />
              <EccGen ecc={result.result.BasicFB.ECC} />
              <pre className="bg-gray-100 p-4 rounded-lg">
                {JSON.stringify(result, null, 2)}
              </pre>
              <DownloadGen result={result.result} />
            </div>
          ),
          type: "update",
        },
      },
      config
    );
    return JSON.stringify(result, null);
  },
  {
    name: "iec61499fb_tool",
    description: "This tool helps to generate or edit IEC 61499 FB",
    schema: user_question,
  }
);

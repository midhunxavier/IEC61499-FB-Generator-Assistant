import { cookies } from "next/headers";
import { getCurrentUser } from "aws-amplify/auth/server";
import { generateServerClientUsingCookies } from "@aws-amplify/adapter-nextjs/data";
import { Schema } from "../amplify/data/resource";

import { createServerRunner } from "@aws-amplify/adapter-nextjs";
import outputs from "@/amplify_outputs.json";

export const cookieBasedClient = generateServerClientUsingCookies<Schema>({
  config: outputs,
  cookies,
});

export const { runWithAmplifyServerContext } = createServerRunner({
  config: outputs,
});

export async function isAuthenticated() {
  try {
    const currentUser = await runWithAmplifyServerContext({
      nextServerContext: { cookies },
      operation: (context) => getCurrentUser(context),
    });
    return !!currentUser;
  } catch (error) {
    return false;
  }
}

export async function AuthGetCurrentUserServer() {
  try {
    const currentUser = await runWithAmplifyServerContext({
      nextServerContext: { cookies },
      operation: (contextSpec) => getCurrentUser(contextSpec),
    });
    return currentUser;
  } catch (error) {
    return null;
  }
}

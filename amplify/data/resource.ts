import { a, defineData, type ClientSchema } from "@aws-amplify/backend";

const schema = a.schema({
  Quota: a
    .model({
      usedTokens: a.integer(),
      remainingTokens: a.integer(),
      accessStatus: a.enum(["Granted", "Pending", "Revoked"]),
    })
    .authorization((allow) => [allow.publicApiKey()]),
});

export type Schema = ClientSchema<typeof schema>;
export const data = defineData({
  schema,
});

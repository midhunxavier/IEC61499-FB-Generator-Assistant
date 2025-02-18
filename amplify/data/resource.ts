import { a, defineData, type ClientSchema } from "@aws-amplify/backend";

const schema = a.schema({
  QuotaLimit: a
    .model({
      usedTokens: a.integer(),
      remainingTokens: a.integer(),
      allowedTokens: a.integer(),
    })
    .authorization((allow) => [allow.publicApiKey()]),
});

export type Schema = ClientSchema<typeof schema>;
export const data = defineData({
  schema,
});

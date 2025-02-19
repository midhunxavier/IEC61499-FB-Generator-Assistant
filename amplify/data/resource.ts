import { a, defineData, type ClientSchema } from "@aws-amplify/backend";

const schema = a.schema({
  QuotaLimit: a
    .model({
      usedTokens: a.integer(),
      remainingTokens: a.integer(),
      allowedTokens: a.integer().default(5000),
    })
    .authorization((allow) => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: { expiresInDays: 30 },
  },
});

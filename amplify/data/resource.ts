import { a, defineData, type ClientSchema } from "@aws-amplify/backend";

const schema = a.schema({
  Credits: a
    .model({
      email: a.email(),
      tokens: a.integer(),
    })
    .authorization((allow) => [allow.publicApiKey()]),
});

export type Schema = ClientSchema<typeof schema>;
export const data = defineData({
  schema,
});

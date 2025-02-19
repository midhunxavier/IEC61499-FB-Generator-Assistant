"use client";

import Chat from "@/components/prebuilt/chat";
import type { Schema } from "../amplify/data/resource";
import React, { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/data";

const client = generateClient<Schema>({
  authMode: "userPool",
});

export default function HomeChat() {
  const [quotaLimit, setQuotaLimit] = useState<
    Schema["QuotaLimit"]["type"] | null
  >(null);

  const getQuota = async () => {
    const { data: quotaLimitList, errors } =
      await client.models.QuotaLimit.list();

    if (quotaLimitList.length != 0) {
      setQuotaLimit(quotaLimitList[0]);
      return;
    }

    // If no quota entry exists, create a new one
    if (quotaLimitList.length === 0) {
      await client.models.QuotaLimit.create({
        usedTokens: 0,
        remainingTokens: 5000,
        allowedTokens: 5000,
      });

      const newQuotaLimit = {
        usedTokens: 0,
        remainingTokens: 5000,
        allowedTokens: 5000,
        id: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setQuotaLimit(newQuotaLimit);
    }
  };

  // Only fetch quota once on component mount
  useEffect(() => {
    getQuota();
  }, []);

  return (
    <div className="w-full min-w-[600px] flex flex-col gap-4">
      <p className="text-[28px] text-center font-medium">FBuilder AI</p>

      {/* Display a loading state if quotaLimit is still null */}
      {!quotaLimit ? (
        <p>Loading...</p>
      ) : (quotaLimit.usedTokens ?? 0) < (quotaLimit.allowedTokens ?? 0) ? (
        /* If usedTokens is below threshold, show the Chat component */
        <Chat />
      ) : (
        /* Otherwise show a message that the quota is exceeded */
        <p className="text-red-600 font-semibold">
          Token usage has exceeded the allowed limit. Please contact the team to
          get more tokens.
        </p>
      )}
    </div>
  );
}

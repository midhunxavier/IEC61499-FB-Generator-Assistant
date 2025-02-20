"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Divider, Flex } from "@aws-amplify/ui-react";
import { signOut } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import { Hub } from "aws-amplify/utils";
import { useTransition } from "react";
import { getCurrentUser } from "aws-amplify/auth";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

const client = generateClient<Schema>({
  authMode: "userPool",
});

const defaultRoutes = [
  {
    href: "/",
    label: "Docs",
    loggedIn: false,
  },
  {
    href: "/",
    label: "Product",
    loggedIn: false,
  },
  {
    href: "/",
    label: "Solution",
    loggedIn: false,
  },
  {
    href: "contactus",
    label: "Contact us",
    loggedIn: false,
  },
];

export default function NavBar({ isSignedIn }: { isSignedIn: boolean }) {
  const [authCheck, setAuthCheck] = useState(isSignedIn);
  const [isPending, startTransition] = useTransition();
  const [user, setuser] = useState<string | null>(null);

  const getUser = async () => {
    const { username, userId, signInDetails } = await getCurrentUser();
    if (signInDetails && signInDetails?.loginId) {
      setuser(signInDetails?.loginId);
    }
  };

  const router = useRouter();
  useEffect(() => {
    const hubListenerCancel = Hub.listen("auth", (data) => {
      switch (data.payload.event) {
        case "signedIn":
          setAuthCheck(true);
          startTransition(() => router.push("/"));
          startTransition(() => router.refresh());
          break;
        case "signedOut":
          setAuthCheck(false);
          startTransition(() => router.push("/"));
          startTransition(() => router.refresh());
          break;
      }
    });

    return () => hubListenerCancel();
  }, [router]);

  useEffect(() => {
    if (authCheck) {
      getUser();
    } else {
      setuser(null);
    }
  }, [authCheck]);

  const signOutSignIn = async () => {
    if (authCheck) {
      await signOut();
    } else {
      router.push("/signin");
    }
  };

  return (
    <>
      <Flex
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        padding={"1rem"}
      >
        <div style={{ flexGrow: 1 }}>
          <a
            href="/"
            className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
          >
            FBuilder AI
          </a>
        </div>

        {authCheck && user && (
          <div style={{ textAlign: "right" }}>
            Hi {user}, welcome to FBuilder AI!
          </div>
        )}
        <div style={{ flexGrow: 1, textAlign: "right" }}>
          <button
            onClick={signOutSignIn}
            className="text-sm font-semibold leading-6 text-gray-900"
          >
            {authCheck ? "Sign Out" : "Sign In"}{" "}
            <span aria-hidden="true">&rarr;</span>
          </button>
        </div>
      </Flex>
      <Divider size="small"></Divider>
    </>
  );
}

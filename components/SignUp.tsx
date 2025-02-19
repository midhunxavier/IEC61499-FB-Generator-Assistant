"use client";

import "@aws-amplify/ui-react/styles.css";

import { redirect } from "next/navigation";
import { AuthUser } from "aws-amplify/auth";
import { withAuthenticator } from "@aws-amplify/ui-react";
import { useEffect } from "react";

const SignUp = ({ user }: { user?: AuthUser }) => {
  useEffect(() => {
    if (user) {
      redirect("/");
    }
  }, [user]);
  return null;
};

export default withAuthenticator(SignUp);

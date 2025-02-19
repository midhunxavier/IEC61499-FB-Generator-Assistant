import "./globals.css";
import type { Metadata } from "next";

import Auth from "@/components/auth/Auth";
import NavBar from "@/components/NavBar";
import { isAuthenticated } from "@/utils/amplify-utils";
import { EndpointsContext } from "./agent";
import ConfigureAmplifyClientSide from "@/components/ConfigureAmplify";

export const metadata: Metadata = {
  title: "IEC 61499 FB Generator Assistant",
  description: "Helps to develop IEC 61499 FB",
};

const RootLayout: React.FC<{ children: React.ReactNode }> = async ({
  children,
}) => {
  const isSignedIn = await isAuthenticated();
  return (
    <html lang="en">
      <body>
        {<NavBar isSignedIn={isSignedIn} />}
        <div style={{ display: "flex", flex: 1 }}>
          <main style={{ flex: 1, padding: "2rem" }}>
            <ConfigureAmplifyClientSide />

            <div className="flex flex-col p-4 md:p-12 h-[100vh]">
              <EndpointsContext>
                <Auth>{children} </Auth>
              </EndpointsContext>
            </div>
          </main>
        </div>
      </body>
    </html>
  );
};

export default RootLayout;

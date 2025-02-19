import "@aws-amplify/ui-react/styles.css";
import { Metadata } from "next";
import LandingPage from "@/components/LandingPage";

export const metadata: Metadata = {
  title: "Home FBuilder AI",
};

const Home = async () => {
  return <div>{<LandingPage />}</div>;
};

export default Home;

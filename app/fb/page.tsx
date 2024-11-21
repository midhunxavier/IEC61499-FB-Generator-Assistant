"use client";
import EccGen from "@/components/prebuilt/iec61499fb/ecc_gen";

const exampleECC = {
  ECState: [
    { Name: "Idle", Comment: "Initial state" },
    { Name: "Running", Comment: "When algorithm is running" },
    { Name: "Stopped", Comment: "When algorithm stops" },
  ],
  ECTransition: [
    { Source: "Idle", Destination: "Running", Condition: "Start" },
    { Source: "Running", Destination: "Stopped", Condition: "Stop" },
  ],
};

const IndexPage: React.FC = () => {
  return (
    <div>
      <h1>ECC State Machine Example</h1>
      {/* Pass the ECC data as a prop to the Home component */}
      <EccGen ecc={exampleECC} />
    </div>
  );
};

export default IndexPage;

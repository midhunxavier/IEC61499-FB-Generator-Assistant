"use client";
import MermaidDiagram from "@/components/prebuilt/iec61499fb/ecc";
import React, { useEffect, useState } from "react";

type ECState = {
  Name: string;
  Comment?: string;
  ECAction?: Array<{
    Algorithm: string;
    Output?: string;
  }>;
};

type ECTransition = {
  Source: string;
  Destination: string;
  Condition: string;
};

type ECC = {
  ECState: ECState[];
  ECTransition: ECTransition[];
};

// Function to generate Mermaid state diagram string
const generateMermaidDiagram = (ecc: ECC): string => {
  const states = ecc.ECState.map((state) => state.Name).join("\n    ");
  const transitions = ecc.ECTransition.map(
    (transition) =>
      `${transition.Source} --> ${transition.Destination}: ${transition.Condition}`
  ).join("\n    ");

  return `
    stateDiagram-v2
    ${states}
    ${transitions}
  `;
};

type HomeProps = {
  ecc: ECC; // ECC data passed as a prop
};

const EccGen: React.FC<HomeProps> = ({ ecc }) => {
  // State to store the generated diagram
  const [diagram, setDiagram] = useState<string>("");

  // Use effect to generate the diagram when the component mounts
  useEffect(() => {
    const generatedDiagram = generateMermaidDiagram(ecc);
    setDiagram(generatedDiagram);
  }, [ecc]);

  return (
    <div>
      <h3 className="text-1xl font-bold mb-6">ECC State Machine</h3>
      {/* Pass the generated diagram as a prop to MermaidDiagram component */}
      <MermaidDiagram diagram={diagram} />
    </div>
  );
};

export default EccGen;

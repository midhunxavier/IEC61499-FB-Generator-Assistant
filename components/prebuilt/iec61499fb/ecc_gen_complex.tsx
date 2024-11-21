"use client";
import MermaidDiagram from "@/components/prebuilt/iec61499fb/ecc";
import React, { useEffect } from "react";

type ECAction = {
  Algorithm: string;
  Output?: string;
};

type ECState = {
  Name: string;
  Comment?: string;
  ECAction?: ECAction[];
};

type ECTransition = {
  Source: string;
  Destination: string;
  Condition: string;
};

type Algorithm = {
  Name: string;
  Comment?: string;
  ST: string;
};

type ECC = {
  ECState: ECState[];
  ECTransition: ECTransition[];
};

type BasicFB = {
  ECC: ECC;
  Algorithm: Algorithm[];
};

type HomeProps = {
  basicFB: BasicFB; // Pass BasicFB data instead of ECC
};

const EccGen: React.FC<HomeProps> = ({ basicFB }) => {
  // Find the algorithm data for each ECAction by matching names
  const getAlgorithmData = (algorithmName: string) =>
    basicFB.Algorithm.find((algo) => algo.Name === algorithmName);

  useEffect(() => {
    // Logic on mount, if needed
  }, []);

  return (
    <div>
      <h1>Basic Function Block (BasicFB) Overview</h1>

      {/* Display ECStates */}
      <div>
        <h2>States</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
          {basicFB.ECC.ECState.map((state, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #ccc",
                padding: "16px",
                borderRadius: "8px",
                width: "300px",
              }}
            >
              <h3>{state.Name}</h3>
              {state.Comment && (
                <p>
                  <strong>Comment:</strong> {state.Comment}
                </p>
              )}

              {state.ECAction && state.ECAction.length > 0 && (
                <div>
                  <h4>Actions</h4>
                  <ul>
                    {state.ECAction.map((action, i) => {
                      const algoData = getAlgorithmData(action.Algorithm);
                      return (
                        <li key={i}>
                          <p>
                            <strong>Algorithm:</strong> {action.Algorithm}
                          </p>
                          {action.Output && (
                            <p>
                              <strong>Output:</strong> {action.Output}
                            </p>
                          )}
                          {algoData && (
                            <div>
                              <p>
                                <strong>Algorithm Comment:</strong>{" "}
                                {algoData.Comment || "None"}
                              </p>
                              <pre>
                                <strong>ST Code:</strong> {algoData.ST}
                              </pre>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EccGen;

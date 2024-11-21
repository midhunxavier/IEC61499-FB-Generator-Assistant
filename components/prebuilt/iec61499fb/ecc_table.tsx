"use client";
import React, { useEffect } from "react";

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

type HomeProps = {
  ecc: ECC; // ECC data passed as a prop
};

const EccGenTable: React.FC<HomeProps> = ({ ecc }) => {
  useEffect(() => {
    // Any logic that needs to run on mount can go here
  }, []);

  return (
    <div>
      <h1>ECC Overview</h1>

      {/* Display ECStates */}
      <div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
          {ecc.ECState.map((state, index) => (
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
                    {state.ECAction.map((action, i) => (
                      <li key={i}>
                        <p>
                          <strong>Algorithm:</strong> {action.Algorithm}
                        </p>
                        {action.Output && (
                          <p>
                            <strong>Output:</strong> {action.Output}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <button> Download</button>
    </div>
  );
};

export default EccGenTable;

"use client";
import React from "react";
import { Card } from "flowbite-react";

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
  ecc: ECC;
};

const EccGenTable: React.FC<HomeProps> = ({ ecc }) => {
  return (
    <div>
      <h1 className="text-xl font-bold mb-6">ECC Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ecc.ECState.map((state, index) => (
          <Card key={index} className="max-w-sm">
            <h5 className="text-2xs font-bold tracking-tight text-gray-900 dark:text-white">
              {state.Name}
            </h5>
            {state.Comment && (
              <p className="font-normal text-gray-700 dark:text-gray-400">
                <strong>Comment:</strong> {state.Comment}
              </p>
            )}
            {state.ECAction && state.ECAction.length > 0 && (
              <div>
                <h6 className="text-lg font-semibold text-gray-900 dark:text-white mt-4">
                  Actions
                </h6>
                <div className="flex flex-col gap-4 mt-2">
                  {state.ECAction.map((action, i) => (
                    <Card key={i} className="bg-gray-100 dark:bg-gray-800">
                      <p className="font-normal text-gray-700 dark:text-gray-400">
                        <strong>Algorithm:</strong> {action.Algorithm}
                      </p>
                      {action.Output && (
                        <p className="font-normal text-gray-700 dark:text-gray-400">
                          <strong>Output:</strong> {action.Output}
                        </p>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EccGenTable;

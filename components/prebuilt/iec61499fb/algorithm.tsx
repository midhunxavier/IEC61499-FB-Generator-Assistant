"use client";
import React from "react";
import { Card } from "flowbite-react";

type Algorithm = {
  Name: string;
  ST: string;
};

type HomeProps = {
  algorithms: Algorithm[];
};

const AlgorithmGen: React.FC<HomeProps> = ({ algorithms }) => {
  return (
    <div>
      <h3 className="text-xl font-bold mb-6">Algorithms</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {algorithms.length > 0 &&
          algorithms.map((algorithm, index) => (
            <Card key={index} className="max-w-sm">
              <h5 className="text-2xs font-bold tracking-tight text-gray-900 dark:text-white">
                {algorithm.Name}
              </h5>
              {algorithm.ST && (
                <p className="font-normal text-gray-700 dark:text-gray-400">
                  <strong></strong> {algorithm.ST}
                </p>
              )}
            </Card>
          ))}
      </div>
    </div>
  );
};

export default AlgorithmGen;

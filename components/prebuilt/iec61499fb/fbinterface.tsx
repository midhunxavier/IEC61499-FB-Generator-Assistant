"use client";
import React from "react";
import { Table } from "flowbite-react";

type FbInterface = {
  EventInputs: Event[];
  EventOutputs: Event[];
  InputVars: VarDeclaration[];
  OutputVars: VarDeclaration[];
};

type VarDeclaration = {
  Name: string;
  Type: string;
};

type Event = {
  Name: string;
  Comment?: string;
  With?: { Var: string }[]; // Made optional
};

type InterfaceList = {
  InterfaceList: FbInterface;
};

const FbInterfaceGen: React.FC<InterfaceList> = ({ InterfaceList }) => {
  return (
    <div className="overflow-x-auto">
      <h1 className="text-2xl font-bold mb-4">FbInterface</h1>
      <Table>
        <Table.Head>
          <Table.HeadCell>Category</Table.HeadCell>
          <Table.HeadCell>Name</Table.HeadCell>
          <Table.HeadCell>Type / With</Table.HeadCell>
          <Table.HeadCell>Comment</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          {/* EventInputs */}
          {InterfaceList.EventInputs.map((event, index) => (
            <Table.Row
              key={`EventInputs-${index}`}
              className="bg-white dark:border-gray-700 dark:bg-gray-800"
            >
              <Table.Cell>EventInputs</Table.Cell>
              <Table.Cell>{event.Name}</Table.Cell>
              <Table.Cell>
                {event.With?.map((w) => w.Var).join(", ") || "-"}
              </Table.Cell>
              <Table.Cell>{event.Comment || "-"}</Table.Cell>
            </Table.Row>
          ))}

          {/* EventOutputs */}
          {InterfaceList.EventOutputs.map((event, index) => (
            <Table.Row
              key={`EventOutputs-${index}`}
              className="bg-white dark:border-gray-700 dark:bg-gray-800"
            >
              <Table.Cell>EventOutputs</Table.Cell>
              <Table.Cell>{event.Name}</Table.Cell>
              <Table.Cell>
                {event.With?.map((w) => w.Var).join(", ") || "-"}
              </Table.Cell>
              <Table.Cell>{event.Comment || "-"}</Table.Cell>
            </Table.Row>
          ))}

          {/* InputVars */}
          {InterfaceList.InputVars.map((input, index) => (
            <Table.Row
              key={`InputVars-${index}`}
              className="bg-white dark:border-gray-700 dark:bg-gray-800"
            >
              <Table.Cell>InputVars</Table.Cell>
              <Table.Cell>{input.Name}</Table.Cell>
              <Table.Cell>{input.Type}</Table.Cell>
              <Table.Cell>-</Table.Cell>
            </Table.Row>
          ))}

          {/* OutputVars */}
          {InterfaceList.OutputVars.map((output, index) => (
            <Table.Row
              key={`OutputVars-${index}`}
              className="bg-white dark:border-gray-700 dark:bg-gray-800"
            >
              <Table.Cell>OutputVars</Table.Cell>
              <Table.Cell>{output.Name}</Table.Cell>
              <Table.Cell>{output.Type}</Table.Cell>
              <Table.Cell>-</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
};

export default FbInterfaceGen;

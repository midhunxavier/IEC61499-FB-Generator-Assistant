"use client";
import React, { useEffect } from "react";

// Define types for variable declarations and events

type VarDeclaration = {
  Name: string;
  Type: string;
  Comment?: string;
};

type Event = {
  Name: string;
  Comment?: string;
  With?: { Var: string }[];
};

type InterfaceListType = {
  EventInputs: Event[];
  EventOutputs: Event[];
  InputVars: VarDeclaration[];
  OutputVars: VarDeclaration[];
};

interface InterfaceListProps {
  data: InterfaceListType;
}

const InterfaceListTable: React.FC<InterfaceListProps> = ({ data }) => {
  return (
    <div>
      <h2>Event Inputs</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Comment</th>
            <th>With Variables</th>
          </tr>
        </thead>
        <tbody>
          {data.EventInputs.map((event, index) => (
            <tr key={index}>
              <td>{event.Name}</td>
              <td>{event.Comment || "-"}</td>
              <td>
                {event.With
                  ? event.With.map((withVar, i) => (
                      <div key={i}>{withVar.Var}</div>
                    ))
                  : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Event Outputs</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Comment</th>
            <th>With Variables</th>
          </tr>
        </thead>
        <tbody>
          {data.EventOutputs.map((event, index) => (
            <tr key={index}>
              <td>{event.Name}</td>
              <td>{event.Comment || "-"}</td>
              <td>
                {event.With
                  ? event.With.map((withVar, i) => (
                      <div key={i}>{withVar.Var}</div>
                    ))
                  : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Input Variables</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Comment</th>
          </tr>
        </thead>
        <tbody>
          {data.InputVars.map((variable, index) => (
            <tr key={index}>
              <td>{variable.Name}</td>
              <td>{variable.Type}</td>
              <td>{variable.Comment || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Output Variables</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Comment</th>
          </tr>
        </thead>
        <tbody>
          {data.OutputVars.map((variable, index) => (
            <tr key={index}>
              <td>{variable.Name}</td>
              <td>{variable.Type}</td>
              <td>{variable.Comment || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InterfaceListTable;

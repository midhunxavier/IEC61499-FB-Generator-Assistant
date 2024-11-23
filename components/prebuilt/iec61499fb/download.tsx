"use client";
import React from "react";

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

type InterfaceList = {
  EventInputs: Array<{
    Name: string;
    Comment?: string;
    With?: Array<{ Var: string }>;
  }>;
  EventOutputs: Array<{
    Name: string;
    Comment?: string;
    With?: Array<{ Var: string }>;
  }>;
  InputVars: Array<{
    Name: string;
    Type: string;
    Comment?: string;
  }>;
  OutputVars: Array<{
    Name: string;
    Type: string;
    Comment?: string;
  }>;
};

type BasicFB = {
  ECC: ECC;
  Algorithm: Algorithm[];
};

type FBTypeLite = {
  InterfaceList: InterfaceList;
  BasicFB: BasicFB;
};

type DownloadGenProps = {
  result: FBTypeLite;
};

const generateXML = (result: FBTypeLite): string => {
  const { InterfaceList, BasicFB } = result;

  const eventInputs = InterfaceList.EventInputs.map(
    (input) =>
      `<Event Name="${input.Name}">
          ${
            input.With
              ? input.With.map((w) => `<With Var="${w.Var}" />`).join("\n")
              : ""
          }
        </Event>`
  ).join("\n");

  const eventOutputs = InterfaceList.EventOutputs.map(
    (output) => `<Event Name="${output.Name}" />`
  ).join("\n");

  const inputVars = InterfaceList.InputVars.map(
    (input) => `<VarDeclaration Name="${input.Name}" Type="${input.Type}" />`
  ).join("\n");

  const outputVars = InterfaceList.OutputVars.map(
    (output) => `<VarDeclaration Name="${output.Name}" Type="${output.Type}" />`
  ).join("\n");

  const ecStates = BasicFB.ECC.ECState.map(
    (state) =>
      `<ECState Name="${state.Name}">
          ${
            state.ECAction?.map(
              (action) =>
                `<ECAction Algorithm="${action.Algorithm}" ${
                  action.Output ? `Output="${action.Output}"` : ""
                } />`
            ).join("\n") || ""
          }
        </ECState>`
  ).join("\n");

  const ecTransitions = BasicFB.ECC.ECTransition.map(
    (transition) =>
      `<ECTransition Source="${transition.Source}" Destination="${transition.Destination}" Condition="${transition.Condition}" />`
  ).join("\n");

  const algorithms = BasicFB.Algorithm.map(
    (algorithm) =>
      `<Algorithm Name="${algorithm.Name}">
          <ST><![CDATA[${algorithm.ST}]]></ST>
        </Algorithm>`
  ).join("\n");

  return `<?xml version="1.0" encoding="utf-8"?>
  <!DOCTYPE FBType SYSTEM "../LibraryElement.dtd">
  <FBType GUID="12345678-abcd-efgh-ijkl-1234567890ab" Name="ADDER" Comment="Basic Function Block Type" Namespace="Main">
    <Identification Standard="61499-2" />
    <VersionInfo Organization="Your Organization" Version="1.0" Author="Your Name" Date="${new Date().toISOString()}" />
    <InterfaceList>
      <EventInputs>
        ${eventInputs}
      </EventInputs>
      <EventOutputs>
        ${eventOutputs}
      </EventOutputs>
      <InputVars>
        ${inputVars}
      </InputVars>
      <OutputVars>
        ${outputVars}
      </OutputVars>
    </InterfaceList>
    <BasicFB>
      <ECC>
        ${ecStates}
        ${ecTransitions}
      </ECC>
      ${algorithms}
    </BasicFB>
  </FBType>`;
};

const DownloadGen: React.FC<DownloadGenProps> = ({ result }) => {
  const handleDownload = () => {
    const xml = generateXML(result);
    const blob = new Blob([xml], { type: "application/xml" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "function_block.xml";
    link.click();
  };

  return (
    <div className="p-4">
      <button
        onClick={handleDownload}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Download XML
      </button>
    </div>
  );
};

export default DownloadGen;

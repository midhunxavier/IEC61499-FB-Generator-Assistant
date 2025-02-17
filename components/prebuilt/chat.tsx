"use client";

import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { EndpointsContext } from "@/app/agent";
import { useActions } from "@/utils/client";
import { HumanMessageText } from "./message";
import { Content } from "@radix-ui/react-dropdown-menu";

export interface ChatProps {}

function convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      resolve(base64String.split(",")[1]); // Remove the data URL prefix
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
}

function FileUploadMessage({ file }: { file: File }) {
  return (
    <div className="flex w-full max-w-fit ml-auto">
      <p>File uploaded: {file.name}</p>
    </div>
  );
}

export default function Chat() {
  const actions = useActions<typeof EndpointsContext>();

  const [elements, setElements] = useState<JSX.Element[]>([]);
  const [newElements, setNewElements] = useState<JSX.Element[]>([]);
  const [history, setHistory] = useState<[role: string, content: string][]>([]);
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File>();

  async function onSubmit(input: string) {
    let base64File: string | undefined = undefined;
    let fileText: string | undefined = undefined;
    let fileExtension =
      selectedFile?.type.split("/")[1] || selectedFile?.name.split(".").pop();

    if (selectedFile) {
      if (
        fileExtension === "txt" ||
        fileExtension === "xml" ||
        fileExtension === "fbt"
      ) {
        fileText = await readTextFile(selectedFile);
      } else {
        base64File = await convertFileToBase64(selectedFile);
      }
    }

    const element = await actions.agent({
      input,
      chat_history: [
        ...history,
        ["assistant", fileText ?? ""], // Ensures fileText is never undefined
      ],
      file:
        base64File && fileExtension
          ? { base64: base64File, extension: fileExtension }
          : undefined,
    });

    const newElement = (
      <div className="flex flex-col w-full gap-1 mt-auto" key={Date.now()}>
        {selectedFile && <FileUploadMessage file={selectedFile} />}
        <HumanMessageText content={input} />
        <div className="flex flex-col gap-1 w-full max-w-fit mr-auto">
          {element.ui}
        </div>
      </div>
    );

    setElements((prev) => [...prev, newElement]);
    setNewElements([newElement]);
    setInput("");
    setSelectedFile(undefined);

    // Consume the value stream and store the final tool result
    (async () => {
      let lastEvent = await element.lastEvent;
      let finalAssistantResponse = "No result received.";

      if (typeof lastEvent === "object") {
        if (lastEvent["invokeModel"]?.["result"]) {
          finalAssistantResponse = lastEvent["invokeModel"]["result"];
        } else if (lastEvent["invokeTools"]?.["toolResult"]) {
          finalAssistantResponse = `Tool result: ${JSON.stringify(lastEvent["invokeTools"]["toolResult"], null, 2)}`;
        } else {
          console.log("Unexpected event:", lastEvent);
        }
      }

      // Ensure final tool result is always appended
      setHistory((prev) => [
        ...prev,
        ["user", input],
        ["assistant", finalAssistantResponse],
      ]);
    })();
  }

  return (
    <div className="w-[70vw] h-[80vh] flex flex-row gap-4 mx-auto border-[1px] border-gray-200 rounded-lg p-3 shadow-sm bg-gray-50/25">
      {/* Left Side - Previously Generated FBs */}
      <div className="w-1/2 overflow-y-auto flex flex-col-reverse p-3 border-r border-gray-200">
        <h2 className="text-lg font-semibold mb-2">Previously Generated FBs</h2>
        <div className="flex flex-col w-full gap-1">{elements}</div>
      </div>

      {/* Right Side - Final FB Result */}
      <div className="w-1/2 overflow-y-auto flex flex-col-reverse p-3">
        <h2 className="text-lg font-semibold mb-2">Final FB Result</h2>
        <div className="flex flex-col w-full gap-1">{newElements}</div>
      </div>

      {/* Input Form Below */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[70vw] flex flex-row gap-2 p-3 bg-white shadow-lg rounded-lg border border-gray-200">
        <Input
          placeholder="Develop IEC 61499 PID controller FB?"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault(); // Prevents accidental form submission reloading the page
              onSubmit(input);
            }
          }}
        />
        <div className="w-[300px]">
          <Input
            placeholder="Upload"
            id="file-upload"
            type="file"
            accept="image/*, .txt, .xml, .fbt"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                setSelectedFile(e.target.files[0]);
              }
            }}
          />
        </div>
        <Button type="submit" onClick={() => onSubmit(input)}>
          Submit
        </Button>
      </div>
    </div>
  );
}

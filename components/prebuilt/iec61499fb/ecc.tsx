"use client";
import React, { useEffect, useState, useRef } from "react";
import mermaid from "mermaid";

interface MermaidDiagramProps {
  diagram: string;
}

const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ diagram }) => {
  const [isClient, setIsClient] = useState(false);
  const mermaidRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Indicate that we are on the client-side
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && mermaidRef.current) {
      mermaid.initialize({ startOnLoad: true });
      mermaid.contentLoaded();
    }
  }, [isClient, diagram]);

  if (!isClient) {
    return null; // Avoid rendering on the server
  }

  return (
    <div>
      <div ref={mermaidRef}>
        <pre className="mermaid">{diagram}</pre>
      </div>
    </div>
  );
};

export default MermaidDiagram;

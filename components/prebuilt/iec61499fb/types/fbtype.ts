// types/fbType.ts

export interface VarDeclaration {
  Name: string;
  Type: string;
  Comment?: string;
}

export interface Event {
  Name: string;
  Comment?: string;
  With?: {
    Var: string;
  }[];
}

export interface ECState {
  Name: string;
  Comment?: string;
  x: number;
  y: number;
}

export interface ECTransition {
  Source: string;
  Destination: string;
  Condition: string;
  x: number;
  y: number;
  BezierPoints?: string;
}

export interface Algorithm {
  Name: string;
  Comment?: string;
  ST: string;
}

export interface FBType {
  GUID: string;
  Name: string;
  Comment?: string;
  Namespace?: string;
  Identification: {
    Standard: string;
  };
  VersionInfo: {
    Version: string;
    Author: string;
    Date: string;
    Remarks?: string;
  };
  InterfaceList: {
    EventInputs: Event[];
    EventOutputs: Event[];
    InputVars: VarDeclaration[];
    OutputVars: VarDeclaration[];
  };
  BasicFB: {
    ECC: {
      ECState: ECState[];
      ECTransition: ECTransition[];
    };
    Algorithm: Algorithm[];
  };
}

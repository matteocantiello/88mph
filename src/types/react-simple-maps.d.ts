declare module "react-simple-maps" {
  import { ComponentType, CSSProperties, ReactNode } from "react";

  interface ProjectionConfig {
    center?: [number, number];
    rotate?: [number, number, number];
    scale?: number;
    parallels?: [number, number];
  }

  interface ComposableMapProps {
    projection?: string;
    projectionConfig?: ProjectionConfig;
    width?: number;
    height?: number;
    className?: string;
    style?: CSSProperties;
    children?: ReactNode;
  }

  interface GeographyStyleObject {
    default?: CSSProperties;
    hover?: CSSProperties;
    pressed?: CSSProperties;
  }

  interface GeographyObject {
    rsmKey: string;
    svgPath: string;
    type: string;
    id?: string;
    properties: Record<string, unknown>;
    geometry: {
      type: string;
      coordinates: number[][][];
    };
  }

  interface GeographyProps {
    geography: GeographyObject;
    style?: GeographyStyleObject;
    className?: string;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    tabIndex?: number;
    onClick?: (event: React.MouseEvent) => void;
    onMouseEnter?: (event: React.MouseEvent) => void;
    onMouseLeave?: (event: React.MouseEvent) => void;
    onMouseDown?: (event: React.MouseEvent) => void;
    onMouseUp?: (event: React.MouseEvent) => void;
    onFocus?: (event: React.FocusEvent) => void;
    onBlur?: (event: React.FocusEvent) => void;
  }

  interface GeographiesRenderProps {
    geographies: GeographyObject[];
    outline?: { rsmKey: string; svgPath: string };
    borders?: { rsmKey: string; svgPath: string };
    path: (geo: GeographyObject) => string;
    projection: (coords: [number, number]) => [number, number];
  }

  interface GeographiesProps {
    geography: string | object | unknown[];
    children: (renderProps: GeographiesRenderProps) => ReactNode;
    parseGeographies?: (features: GeographyObject[]) => unknown;
    className?: string;
  }

  export const ComposableMap: ComponentType<ComposableMapProps>;
  export const Geography: ComponentType<GeographyProps>;
  export const Geographies: ComponentType<GeographiesProps>;
}

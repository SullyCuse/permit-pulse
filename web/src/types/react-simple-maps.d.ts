declare module 'react-simple-maps' {
  import { ReactNode, CSSProperties } from 'react'

  interface ProjectionConfig {
    scale?: number
    center?: [number, number]
    rotate?: [number, number, number]
  }

  interface ComposableMapProps {
    projection?: string
    projectionConfig?: ProjectionConfig
    width?: number
    height?: number
    style?: CSSProperties
    children?: ReactNode
  }

  interface GeographiesProps {
    geography: string | object
    children: (args: { geographies: Geography[] }) => ReactNode
  }

  interface Geography {
    rsmKey: string
    id: string | number
    [key: string]: unknown
  }

  interface GeographyProps {
    key?: string
    geography: Geography
    fill?: string
    stroke?: string
    strokeWidth?: number
    style?: {
      default?: CSSProperties
      hover?: CSSProperties
      pressed?: CSSProperties
    }
  }

  export function ComposableMap(props: ComposableMapProps): JSX.Element
  export function Geographies(props: GeographiesProps): JSX.Element
  export function Geography(props: GeographyProps): JSX.Element
}

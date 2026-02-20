export type ChartDataSerie = [string, ...(number | null)[]]

export type ChartGeneratedData = {
  data: {
    x?: string
    xs?: { [key: string]: string }
    columns: ChartDataSerie[]
    type?: any
    types?: { [key: string]: any }
    names?: { [key: string]: string }
    colors?: { [key: string]: string }
    regions?: { [key: string]: any[] }
  }
  classes?: string[]
  area?: { [key: string]: any }
}

export enum TendencyType {
  Shorter = 'Shorter',
  Longer = 'Longer',
}

export type ForecastDeltaPoint = {
  dateUtc: number
  netAmount: number
}

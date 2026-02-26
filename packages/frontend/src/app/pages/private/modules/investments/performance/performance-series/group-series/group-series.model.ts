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
    groups?: string[][]
  }
  classes?: string[]
  area?: { [key: string]: any }
}

export enum Timeframe {
  Month = 'Month',
  Quarter = 'Quarter',
  Year = 'Year',
}
export enum ValueType {
  Percentage = 'Percentage',
  Currency = 'Currency',
}

export type WalletsTimeframeGroupValue = {
  timeSignature: number
  timeframeLabel: string
  wallets: {
    [key: string]: {
      walletName: string
      inputValue: Big | null
      grossAmount: Big | null
      netAmount: Big | null
    }
  }
}

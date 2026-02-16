import { LiquidationSerieDataPointDTO } from '../../../../../../../infra/gateways/investments/investments-gateway.model'

export type ChartDataSerie = [string, ...number[]]

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

export type UnifiedLiquidationSerieDataPointDTO = Omit<LiquidationSerieDataPointDTO, 'type'>

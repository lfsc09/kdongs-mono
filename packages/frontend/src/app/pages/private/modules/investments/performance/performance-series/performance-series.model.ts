import { LiquidationSerieDataPointDTO } from '../../../../../../infra/gateways/investments/investments-gateway.model'

export type UnifiedLiquidationSerieDataPointDTO = Omit<LiquidationSerieDataPointDTO, 'type'>

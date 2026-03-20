import { AnalyticSerieDataPoint } from '@kdongs/domain/dto/investment/analytic/liquidation-series-dto'

export type UnifiedAnalyticSerieDataPoint = Omit<AnalyticSerieDataPoint, 'type'>

import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'user.login': { paramsTuple?: []; params?: {} }
    'user.logout': { paramsTuple?: []; params?: {} }
    'analytic.performance': { paramsTuple?: []; params?: {} }
    'analytic.liquidation_series': { paramsTuple?: []; params?: {} }
    'wallets.index': { paramsTuple?: []; params?: {} }
    'wallets.create': { paramsTuple?: []; params?: {} }
    'wallets.store': { paramsTuple?: []; params?: {} }
    'wallets.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'wallets.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'wallets.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'wallets.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'wallets.movements.index': { paramsTuple: [ParamValue]; params: {'wallet_id': ParamValue} }
    'wallets.movements.create': { paramsTuple: [ParamValue]; params: {'wallet_id': ParamValue} }
    'wallets.movements.store': { paramsTuple: [ParamValue]; params: {'wallet_id': ParamValue} }
    'wallets.movements.show': { paramsTuple: [ParamValue,ParamValue]; params: {'wallet_id': ParamValue,'id': ParamValue} }
    'wallets.movements.edit': { paramsTuple: [ParamValue,ParamValue]; params: {'wallet_id': ParamValue,'id': ParamValue} }
    'wallets.movements.update': { paramsTuple: [ParamValue,ParamValue]; params: {'wallet_id': ParamValue,'id': ParamValue} }
    'wallets.movements.destroy': { paramsTuple: [ParamValue,ParamValue]; params: {'wallet_id': ParamValue,'id': ParamValue} }
  }
  POST: {
    'user.login': { paramsTuple?: []; params?: {} }
    'wallets.store': { paramsTuple?: []; params?: {} }
    'wallets.movements.store': { paramsTuple: [ParamValue]; params: {'wallet_id': ParamValue} }
  }
  DELETE: {
    'user.logout': { paramsTuple?: []; params?: {} }
    'wallets.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'wallets.movements.destroy': { paramsTuple: [ParamValue,ParamValue]; params: {'wallet_id': ParamValue,'id': ParamValue} }
  }
  GET: {
    'analytic.performance': { paramsTuple?: []; params?: {} }
    'analytic.liquidation_series': { paramsTuple?: []; params?: {} }
    'wallets.index': { paramsTuple?: []; params?: {} }
    'wallets.create': { paramsTuple?: []; params?: {} }
    'wallets.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'wallets.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'wallets.movements.index': { paramsTuple: [ParamValue]; params: {'wallet_id': ParamValue} }
    'wallets.movements.create': { paramsTuple: [ParamValue]; params: {'wallet_id': ParamValue} }
    'wallets.movements.show': { paramsTuple: [ParamValue,ParamValue]; params: {'wallet_id': ParamValue,'id': ParamValue} }
    'wallets.movements.edit': { paramsTuple: [ParamValue,ParamValue]; params: {'wallet_id': ParamValue,'id': ParamValue} }
  }
  HEAD: {
    'analytic.performance': { paramsTuple?: []; params?: {} }
    'analytic.liquidation_series': { paramsTuple?: []; params?: {} }
    'wallets.index': { paramsTuple?: []; params?: {} }
    'wallets.create': { paramsTuple?: []; params?: {} }
    'wallets.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'wallets.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'wallets.movements.index': { paramsTuple: [ParamValue]; params: {'wallet_id': ParamValue} }
    'wallets.movements.create': { paramsTuple: [ParamValue]; params: {'wallet_id': ParamValue} }
    'wallets.movements.show': { paramsTuple: [ParamValue,ParamValue]; params: {'wallet_id': ParamValue,'id': ParamValue} }
    'wallets.movements.edit': { paramsTuple: [ParamValue,ParamValue]; params: {'wallet_id': ParamValue,'id': ParamValue} }
  }
  PUT: {
    'wallets.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'wallets.movements.update': { paramsTuple: [ParamValue,ParamValue]; params: {'wallet_id': ParamValue,'id': ParamValue} }
  }
  PATCH: {
    'wallets.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'wallets.movements.update': { paramsTuple: [ParamValue,ParamValue]; params: {'wallet_id': ParamValue,'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}
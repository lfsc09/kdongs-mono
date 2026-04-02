/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'user.login': {
    methods: ["POST"]
    pattern: '/login'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user/user').loginValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user/user').loginValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/user/user_controller').default['login']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/user/user_controller').default['login']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'user.logout': {
    methods: ["DELETE"]
    pattern: '/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/user/user_controller').default['logout']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/user/user_controller').default['logout']>>>
    }
  }
  'analytic.performance': {
    methods: ["GET","HEAD"]
    pattern: '/investments/performance'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/investment/analytic').performanceValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/investment/analytic_controller').default['performance']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/investment/analytic_controller').default['performance']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'analytic.liquidation_series': {
    methods: ["GET","HEAD"]
    pattern: '/investments/liquidation-series'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/investment/analytic').liquidationSeriesValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/investment/analytic_controller').default['liquidationSeries']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/investment/analytic_controller').default['liquidationSeries']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'wallets.index': {
    methods: ["GET","HEAD"]
    pattern: '/investments/wallets'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/investment/wallet').indexValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/investment/wallet_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/investment/wallet_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'wallets.create': {
    methods: ["GET","HEAD"]
    pattern: '/investments/wallets/create'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/investment/wallet_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/investment/wallet_controller').default['create']>>>
    }
  }
  'wallets.store': {
    methods: ["POST"]
    pattern: '/investments/wallets'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/investment/wallet').storeValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/investment/wallet').storeValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/investment/wallet_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/investment/wallet_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'wallets.show': {
    methods: ["GET","HEAD"]
    pattern: '/investments/wallets/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/investment/wallet').showValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/investment/wallet_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/investment/wallet_controller').default['show']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'wallets.edit': {
    methods: ["GET","HEAD"]
    pattern: '/investments/wallets/:id/edit'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/investment/wallet').editValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/investment/wallet_controller').default['edit']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/investment/wallet_controller').default['edit']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'wallets.update': {
    methods: ["PUT","PATCH"]
    pattern: '/investments/wallets/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/investment/wallet').updateValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/investment/wallet').updateValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/investment/wallet_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/investment/wallet_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'wallets.destroy': {
    methods: ["DELETE"]
    pattern: '/investments/wallets/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/investment/wallet').deleteValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/investment/wallet').deleteValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/investment/wallet_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/investment/wallet_controller').default['destroy']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'wallets.movements.index': {
    methods: ["GET","HEAD"]
    pattern: '/investments/wallets/:wallet_id/movements'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { wallet_id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/investment/wallet_movement').indexValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/investment/wallet_movement_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/investment/wallet_movement_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'wallets.movements.create': {
    methods: ["GET","HEAD"]
    pattern: '/investments/wallets/:wallet_id/movements/create'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { wallet_id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/investment/wallet_movement_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/investment/wallet_movement_controller').default['create']>>>
    }
  }
  'wallets.movements.store': {
    methods: ["POST"]
    pattern: '/investments/wallets/:wallet_id/movements'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/investment/wallet_movement').storeValidator)>>
      paramsTuple: [ParamValue]
      params: { wallet_id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/investment/wallet_movement').storeValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/investment/wallet_movement_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/investment/wallet_movement_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'wallets.movements.show': {
    methods: ["GET","HEAD"]
    pattern: '/investments/wallets/:wallet_id/movements/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { wallet_id: ParamValue; id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/investment/wallet_movement').showValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/investment/wallet_movement_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/investment/wallet_movement_controller').default['show']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'wallets.movements.edit': {
    methods: ["GET","HEAD"]
    pattern: '/investments/wallets/:wallet_id/movements/:id/edit'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { wallet_id: ParamValue; id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/investment/wallet_movement').editValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/investment/wallet_movement_controller').default['edit']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/investment/wallet_movement_controller').default['edit']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'wallets.movements.update': {
    methods: ["PUT","PATCH"]
    pattern: '/investments/wallets/:wallet_id/movements/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/investment/wallet_movement').updateValidator)>>
      paramsTuple: [ParamValue, ParamValue]
      params: { wallet_id: ParamValue; id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/investment/wallet_movement').updateValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/investment/wallet_movement_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/investment/wallet_movement_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'wallets.movements.destroy': {
    methods: ["DELETE"]
    pattern: '/investments/wallets/:wallet_id/movements/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/investment/wallet_movement').deleteValidator)>>
      paramsTuple: [ParamValue, ParamValue]
      params: { wallet_id: ParamValue; id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/investment/wallet_movement').deleteValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/investment/wallet_movement_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/investment/wallet_movement_controller').default['destroy']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
}

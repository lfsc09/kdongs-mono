/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'user.login': {
    methods: ["POST"],
    pattern: '/login',
    tokens: [{"old":"/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['user.login']['types'],
  },
  'user.logout': {
    methods: ["DELETE"],
    pattern: '/logout',
    tokens: [{"old":"/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['user.logout']['types'],
  },
  'analytic.performance': {
    methods: ["GET","HEAD"],
    pattern: '/investments/performance',
    tokens: [{"old":"/investments/performance","type":0,"val":"investments","end":""},{"old":"/investments/performance","type":0,"val":"performance","end":""}],
    types: placeholder as Registry['analytic.performance']['types'],
  },
  'analytic.liquidation_series': {
    methods: ["GET","HEAD"],
    pattern: '/investments/liquidation-series',
    tokens: [{"old":"/investments/liquidation-series","type":0,"val":"investments","end":""},{"old":"/investments/liquidation-series","type":0,"val":"liquidation-series","end":""}],
    types: placeholder as Registry['analytic.liquidation_series']['types'],
  },
  'wallets.index': {
    methods: ["GET","HEAD"],
    pattern: '/investments/wallets',
    tokens: [{"old":"/investments/wallets","type":0,"val":"investments","end":""},{"old":"/investments/wallets","type":0,"val":"wallets","end":""}],
    types: placeholder as Registry['wallets.index']['types'],
  },
  'wallets.create': {
    methods: ["GET","HEAD"],
    pattern: '/investments/wallets/create',
    tokens: [{"old":"/investments/wallets/create","type":0,"val":"investments","end":""},{"old":"/investments/wallets/create","type":0,"val":"wallets","end":""},{"old":"/investments/wallets/create","type":0,"val":"create","end":""}],
    types: placeholder as Registry['wallets.create']['types'],
  },
  'wallets.store': {
    methods: ["POST"],
    pattern: '/investments/wallets',
    tokens: [{"old":"/investments/wallets","type":0,"val":"investments","end":""},{"old":"/investments/wallets","type":0,"val":"wallets","end":""}],
    types: placeholder as Registry['wallets.store']['types'],
  },
  'wallets.show': {
    methods: ["GET","HEAD"],
    pattern: '/investments/wallets/:id',
    tokens: [{"old":"/investments/wallets/:id","type":0,"val":"investments","end":""},{"old":"/investments/wallets/:id","type":0,"val":"wallets","end":""},{"old":"/investments/wallets/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['wallets.show']['types'],
  },
  'wallets.edit': {
    methods: ["GET","HEAD"],
    pattern: '/investments/wallets/:id/edit',
    tokens: [{"old":"/investments/wallets/:id/edit","type":0,"val":"investments","end":""},{"old":"/investments/wallets/:id/edit","type":0,"val":"wallets","end":""},{"old":"/investments/wallets/:id/edit","type":1,"val":"id","end":""},{"old":"/investments/wallets/:id/edit","type":0,"val":"edit","end":""}],
    types: placeholder as Registry['wallets.edit']['types'],
  },
  'wallets.update': {
    methods: ["PUT","PATCH"],
    pattern: '/investments/wallets/:id',
    tokens: [{"old":"/investments/wallets/:id","type":0,"val":"investments","end":""},{"old":"/investments/wallets/:id","type":0,"val":"wallets","end":""},{"old":"/investments/wallets/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['wallets.update']['types'],
  },
  'wallets.destroy': {
    methods: ["DELETE"],
    pattern: '/investments/wallets/:id',
    tokens: [{"old":"/investments/wallets/:id","type":0,"val":"investments","end":""},{"old":"/investments/wallets/:id","type":0,"val":"wallets","end":""},{"old":"/investments/wallets/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['wallets.destroy']['types'],
  },
  'wallets.movements.index': {
    methods: ["GET","HEAD"],
    pattern: '/investments/wallets/:wallet_id/movements',
    tokens: [{"old":"/investments/wallets/:wallet_id/movements","type":0,"val":"investments","end":""},{"old":"/investments/wallets/:wallet_id/movements","type":0,"val":"wallets","end":""},{"old":"/investments/wallets/:wallet_id/movements","type":1,"val":"wallet_id","end":""},{"old":"/investments/wallets/:wallet_id/movements","type":0,"val":"movements","end":""}],
    types: placeholder as Registry['wallets.movements.index']['types'],
  },
  'wallets.movements.create': {
    methods: ["GET","HEAD"],
    pattern: '/investments/wallets/:wallet_id/movements/create',
    tokens: [{"old":"/investments/wallets/:wallet_id/movements/create","type":0,"val":"investments","end":""},{"old":"/investments/wallets/:wallet_id/movements/create","type":0,"val":"wallets","end":""},{"old":"/investments/wallets/:wallet_id/movements/create","type":1,"val":"wallet_id","end":""},{"old":"/investments/wallets/:wallet_id/movements/create","type":0,"val":"movements","end":""},{"old":"/investments/wallets/:wallet_id/movements/create","type":0,"val":"create","end":""}],
    types: placeholder as Registry['wallets.movements.create']['types'],
  },
  'wallets.movements.store': {
    methods: ["POST"],
    pattern: '/investments/wallets/:wallet_id/movements',
    tokens: [{"old":"/investments/wallets/:wallet_id/movements","type":0,"val":"investments","end":""},{"old":"/investments/wallets/:wallet_id/movements","type":0,"val":"wallets","end":""},{"old":"/investments/wallets/:wallet_id/movements","type":1,"val":"wallet_id","end":""},{"old":"/investments/wallets/:wallet_id/movements","type":0,"val":"movements","end":""}],
    types: placeholder as Registry['wallets.movements.store']['types'],
  },
  'wallets.movements.show': {
    methods: ["GET","HEAD"],
    pattern: '/investments/wallets/:wallet_id/movements/:id',
    tokens: [{"old":"/investments/wallets/:wallet_id/movements/:id","type":0,"val":"investments","end":""},{"old":"/investments/wallets/:wallet_id/movements/:id","type":0,"val":"wallets","end":""},{"old":"/investments/wallets/:wallet_id/movements/:id","type":1,"val":"wallet_id","end":""},{"old":"/investments/wallets/:wallet_id/movements/:id","type":0,"val":"movements","end":""},{"old":"/investments/wallets/:wallet_id/movements/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['wallets.movements.show']['types'],
  },
  'wallets.movements.edit': {
    methods: ["GET","HEAD"],
    pattern: '/investments/wallets/:wallet_id/movements/:id/edit',
    tokens: [{"old":"/investments/wallets/:wallet_id/movements/:id/edit","type":0,"val":"investments","end":""},{"old":"/investments/wallets/:wallet_id/movements/:id/edit","type":0,"val":"wallets","end":""},{"old":"/investments/wallets/:wallet_id/movements/:id/edit","type":1,"val":"wallet_id","end":""},{"old":"/investments/wallets/:wallet_id/movements/:id/edit","type":0,"val":"movements","end":""},{"old":"/investments/wallets/:wallet_id/movements/:id/edit","type":1,"val":"id","end":""},{"old":"/investments/wallets/:wallet_id/movements/:id/edit","type":0,"val":"edit","end":""}],
    types: placeholder as Registry['wallets.movements.edit']['types'],
  },
  'wallets.movements.update': {
    methods: ["PUT","PATCH"],
    pattern: '/investments/wallets/:wallet_id/movements/:id',
    tokens: [{"old":"/investments/wallets/:wallet_id/movements/:id","type":0,"val":"investments","end":""},{"old":"/investments/wallets/:wallet_id/movements/:id","type":0,"val":"wallets","end":""},{"old":"/investments/wallets/:wallet_id/movements/:id","type":1,"val":"wallet_id","end":""},{"old":"/investments/wallets/:wallet_id/movements/:id","type":0,"val":"movements","end":""},{"old":"/investments/wallets/:wallet_id/movements/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['wallets.movements.update']['types'],
  },
  'wallets.movements.destroy': {
    methods: ["DELETE"],
    pattern: '/investments/wallets/:wallet_id/movements/:id',
    tokens: [{"old":"/investments/wallets/:wallet_id/movements/:id","type":0,"val":"investments","end":""},{"old":"/investments/wallets/:wallet_id/movements/:id","type":0,"val":"wallets","end":""},{"old":"/investments/wallets/:wallet_id/movements/:id","type":1,"val":"wallet_id","end":""},{"old":"/investments/wallets/:wallet_id/movements/:id","type":0,"val":"movements","end":""},{"old":"/investments/wallets/:wallet_id/movements/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['wallets.movements.destroy']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}

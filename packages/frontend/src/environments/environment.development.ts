export const environment = {
  production: false,
  title: 'Kdongs',
  host: 'kdongs',
  apiUrl: 'http://localhost:3333',
  token: {
    // lifespan (miliseconds) (1 day)
    lifespan: 60 * 60 * 24 * 1000,
    // re-process token interval (miliseconds) (5 min)
    interval: 5 * 60 * 1000,
  },
}

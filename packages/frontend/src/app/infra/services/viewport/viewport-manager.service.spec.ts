import { BreakpointObserver } from '@angular/cdk/layout'
import { TestBed } from '@angular/core/testing'
import { viewportSizes } from './viewport-manager.model'
import { ViewportManagerService } from './viewport-manager.service'

describe('ViewportManagerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BreakpointObserver, ViewportManagerService],
    })
  })

  it('The service should set "_currentViewport" to "lg" when the breakpoint is "lg"', () => {
    spyOn<any>(TestBed.inject(BreakpointObserver), 'observe').and.returnValue({
      subscribe: (callback: (result: { breakpoints: { [key: string]: boolean } }) => void) => {
        callback({
          breakpoints: {
            [viewportSizes.sm]: false,
            [viewportSizes.md]: false,
            [viewportSizes.lg]: true,
          },
        })
      },
    })
    const service = TestBed.inject(ViewportManagerService)
    expect(service.currentViewport()).toBe('lg')
  })

  it('The service should set "_currentViewport" to "undefined" when breakpoint is empty', () => {
    spyOn<any>(TestBed.inject(BreakpointObserver), 'observe').and.returnValue({
      subscribe: (callback: (result: { breakpoints: { [key: string]: boolean } }) => void) => {
        callback({ breakpoints: {} })
      },
    })
    const service = TestBed.inject(ViewportManagerService)
    expect(service.currentViewport()).toBeUndefined()
  })

  it('The service should set "_currentViewport" to "undefined" when correct breakpoint was not found', () => {
    spyOn<any>(TestBed.inject(BreakpointObserver), 'observe').and.returnValue({
      subscribe: (callback: (result: { breakpoints: { [key: string]: boolean } }) => void) => {
        callback({
          breakpoints: {
            [viewportSizes.sm]: false,
            [viewportSizes.md]: false,
            [viewportSizes.lg]: false,
          },
        })
      },
    })
    const service = TestBed.inject(ViewportManagerService)
    expect(service.currentViewport()).toBeUndefined()
  })
})

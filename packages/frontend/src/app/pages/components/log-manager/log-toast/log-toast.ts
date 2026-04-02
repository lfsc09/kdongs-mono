import { Component, input } from '@angular/core'
import { LogDetail, LogSeverity } from '../../../../infra/services/log/log-manager.model'

@Component({
  selector: 'kdongs-cp-log-toast',
  template: `
    <div
      class="py-2 px-3 flex flex-col gap-3 border rounded-md text-sm text-gray-500 dark:text-gray-400 {{
        colors[severity()]
      }}"
    >
      <div class="flex items-center gap-2">
        @if (icon()) {
          <i class="{{ icon() }}"></i>
        }
        <h3 class="font-semibold" [class.underline]="message()">{{ title() }}</h3>
      </div>
      @if (message()) {
        <p>{{ message() }}</p>
      }
    </div>
  `,
  host: {
    '[animate.enter]': 'animation[animate()].enter',
    '[animate.leave]': 'animation[animate()].leave',
  },
})
export class LogToast {
  /**
   * SIGNALS
   */
  title = input<LogDetail['title']>()
  message = input<LogDetail['message']>()
  icon = input<LogDetail['icon']>()
  severity = input<LogDetail['severity']>(LogSeverity.info)
  animate = input<'up' | 'down' | 'left' | 'right'>('left')

  /**
   * VARS
   */
  protected colors = {
    [LogSeverity.error]: 'border-red-400 bg-red-50',
    [LogSeverity.warning]: 'border-yellow-400 bg-yellow-50',
    [LogSeverity.success]: 'border-lime-400 bg-lime-50',
    [LogSeverity.info]: 'border-indigo-400 bg-indigo-50',
  }

  protected animation = {
    up: {
      enter: 'animate-slide-up-in',
      leave: 'animate-slide-up-out',
    },
    down: {
      enter: 'animate-slide-down-in',
      leave: 'animate-slide-down-out',
    },
    left: {
      enter: 'animate-slide-left-in',
      leave: 'animate-slide-left-out',
    },
    right: {
      enter: 'animate-slide-right-in',
      leave: 'animate-slide-right-out',
    },
  }
}

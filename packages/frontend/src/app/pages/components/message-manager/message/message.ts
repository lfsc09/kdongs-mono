import { Component, input } from '@angular/core'
import {
  MessageDetail,
  MessageSeverity,
} from '../../../../infra/services/message/message-manager.model'

@Component({
  selector: 'kdongs-cp-message',
  template: `
    <div
      class="py-2 px-3 flex flex-col gap-3 border rounded-md text-sm text-mirage-500 dark:text-mirage-400 {{
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
export class Message {
  /**
   * SIGNALS
   */
  title = input<MessageDetail['title']>()
  message = input<MessageDetail['message']>()
  icon = input<MessageDetail['icon']>()
  severity = input<MessageDetail['severity']>(MessageSeverity.INFO)
  animate = input<'up' | 'down' | 'left' | 'right'>('left')

  /**
   * VARS
   */
  protected colors = {
    [MessageSeverity.ERROR]: 'border-red-400 bg-red-50',
    [MessageSeverity.WARNING]: 'border-yellow-400 bg-yellow-50',
    [MessageSeverity.SUCCESS]: 'border-green-400 bg-green-50',
    [MessageSeverity.INFO]: 'border-cyan-400 bg-cyan-50',
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

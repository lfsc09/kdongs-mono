import { Component, input } from '@angular/core';
import {
  MessageDetail,
  MessageSeverity,
} from '../../../../infra/services/error/message-manager.model';

@Component({
  selector: 'kdongs-cp-message',
  template: `
    <div
      class="py-2 px-3 flex flex-col gap-1 border rounded-md text-mirage-500 dark:text-mirage-400 {{
        colors[severity()]
      }}"
    >
      <h3 class="font-semibold underline">{{ title() }}</h3>
      <p>{{ message() }}</p>
    </div>
  `,
})
export class Message {
  /**
   * SIGNALS
   */
  title = input<MessageDetail['title']>();
  message = input<MessageDetail['message']>();
  severity = input<MessageDetail['severity']>(MessageSeverity.INFO);

  /**
   * VARS
   */
  protected colors = {
    [MessageSeverity.ERROR]: 'border-red-400 bg-red-50',
    [MessageSeverity.WARNING]: 'border-yellow-400 bg-yellow-50',
    [MessageSeverity.SUCCESS]: 'border-green-400 bg-green-50',
    [MessageSeverity.INFO]: 'border-blue-400 bg-blue-50',
  };
}

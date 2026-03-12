import { Directive, ElementRef, inject, input } from '@angular/core'

@Directive({
  selector: '[kdongsInputDecimal]',
  host: {
    '(keydown)': 'handleKeydown($event)',
    '(paste)': 'handlePaste($event)',
  },
})
export class InputDecimalDirective {
  /**
   * SIGNALS
   */
  kdongsInputDecimal = input<number>()

  /**
   * VARS
   */
  private readonly DECIMAL_SEPARATOR = '.'
  private readonly _el = inject<ElementRef<HTMLInputElement>>(ElementRef)

  /**
   * FUNCTIONS
   */
  /**
   * Allow only digits and one decimal separator, respecting max decimals and cursor position
   * Always allow navigation, editing, and clipboard shortcuts
   */
  protected handleKeydown(event: KeyboardEvent): void {
    if (
      event.ctrlKey ||
      event.metaKey ||
      [
        'Backspace',
        'Delete',
        'Tab',
        'Escape',
        'Enter',
        'ArrowLeft',
        'ArrowRight',
        'ArrowUp',
        'ArrowDown',
        'Home',
        'End',
      ].includes(event.key)
    )
      return

    const el = this._el.nativeElement
    const value = el.value
    const start = el.selectionStart ?? value.length
    const end = el.selectionEnd ?? value.length

    // Allow digits, unless it would exceed max decimal digits
    if (/^\d$/.test(event.key)) {
      const maxDecimals = this.kdongsInputDecimal()
      if (maxDecimals !== undefined) {
        const newValue = value.slice(0, start) + event.key + value.slice(end)
        const dotIdx = newValue.indexOf(this.DECIMAL_SEPARATOR)
        if (dotIdx !== -1 && newValue.slice(dotIdx + 1).length > maxDecimals) event.preventDefault()
      }
      return
    }

    // Allow one decimal separator if not already present and not at the start
    if (event.key === this.DECIMAL_SEPARATOR && !value.includes(this.DECIMAL_SEPARATOR)) {
      if (/\d/.test(value.slice(0, start))) return
      event.preventDefault()
      return
    }

    // Otherwise, prevent the input
    event.preventDefault()
  }

  /**
   * Sanitize the pasted value to extract a valid decimal number, respecting max decimals and cursor position.
   * Non-digit, non-dot characters are stripped; only the first dot is kept; decimals are truncated if needed.
   */
  protected handlePaste(event: ClipboardEvent): void {
    event.preventDefault()
    const pasted = event.clipboardData?.getData('text') ?? ''
    const input = this._el.nativeElement
    const current = input.value
    const start = input.selectionStart ?? current.length
    const end = input.selectionEnd ?? current.length

    // Sanitize pasted text: strip everything except digits and the first dot
    let dotSeen = false
    const sanitized = pasted
      .split('')
      .filter(char => {
        if (/\d/.test(char)) return true
        if (char === this.DECIMAL_SEPARATOR && !dotSeen) {
          dotSeen = true
          return true
        }
        return false
      })
      .join('')

    // Build what the value would be after paste
    const beforeCursor = current.slice(0, start)
    const afterCursor = current.slice(end)
    let next = beforeCursor + sanitized + afterCursor

    // Remove any duplicate dots that could arise from merging with existing value
    const firstDot = next.indexOf(this.DECIMAL_SEPARATOR)
    if (firstDot !== -1) {
      next = next.slice(0, firstDot + 1) + next.slice(firstDot + 1).replace(/\./g, '')
    }

    // Strip leading dot (no leading dot allowed)
    next = next.replace(/^\./, '')

    if (next === '') return

    // Truncate decimal digits if max is set
    const maxDecimals = this.kdongsInputDecimal()
    if (maxDecimals !== undefined) {
      const dotIdx = next.indexOf(this.DECIMAL_SEPARATOR)
      if (dotIdx !== -1 && next.slice(dotIdx + 1).length > maxDecimals)
        next = next.slice(0, dotIdx + 1 + maxDecimals)
    }

    input.value = next
    const newCursor = next.length - afterCursor.length || next.length
    input.setSelectionRange(newCursor, newCursor)
    input.dispatchEvent(new Event('input', { bubbles: true }))
  }
}

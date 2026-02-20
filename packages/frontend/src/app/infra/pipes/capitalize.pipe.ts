import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
  name: 'capitalize',
})
export class CapitalizePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    return formatCapitalized(value)
  }
}

export function formatCapitalized(value: string | null | undefined): string {
  if (value === null || value === undefined) {
    return ''
  }

  return value.charAt(0).toUpperCase() + value.slice(1)
}

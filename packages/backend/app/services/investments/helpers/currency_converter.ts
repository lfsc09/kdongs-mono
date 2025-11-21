import Big from 'big.js'

/**
 * A helper class for currency conversion.
 */
export class CurrencyConverter {
  private currencyConvertionRates: Map<string, number> = new Map()

  constructor() {
    // FIXME: Example rates; in a real application, these would be fetched from an API or database
    this.currencyConvertionRates.set('USD_BRL', 5.33)
    this.currencyConvertionRates.set('BRL_USD', 0.19)
    this.currencyConvertionRates.set('USD_EUR', 0.87)
    this.currencyConvertionRates.set('EUR_USD', 1.16)
    this.currencyConvertionRates.set('EUR_BRL', 6.16)
    this.currencyConvertionRates.set('BRL_EUR', 0.16)
  }

  /**
   * Converts an amount from one currency to another.
   * @param amount The amount to convert.
   * @param fromCurrency The currency code of the amount's current currency.
   * @param toCurrency The currency code to convert the amount to.
   * @returns The converted amount.
   * @throws Error if the conversion rate is not found.
   * @example
   * const converter = new CurrencyConverter();
   * const amountInBRL = converter.convert(new Big(100), 'USD', 'BRL'); // Converts 100 USD to BRL
   */
  convert(amount: Big, fromCurrency: string, toCurrency: string): Big {
    if (fromCurrency === toCurrency) {
      return amount
    }

    const rateKey = `${fromCurrency}_${toCurrency}`
    const rate = this.currencyConvertionRates.get(rateKey)

    if (!rate) {
      throw new Error(`Conversion rate from ${fromCurrency} to ${toCurrency} not found.`)
    }

    return amount.mul(rate)
  }
}

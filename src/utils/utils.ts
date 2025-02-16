export function sleep (ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function pick<T, K extends keyof T> (obj: T, ...keys: K[]): Pick<T, K> {
  return keys.reduce((o, k) => ((o[k] = obj[k]), o), {} as Pick<T, K>)
}

export function randomString (len = 25): string {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  const charactersLength = characters.length
  for (let i = 0; i < len; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

//random integer between up to bound
export function randomInt (max: number) {
  max = Math.floor(max)
  return Math.floor(Math.random() * max) // The maximum is exclusive and the minimum is inclusive
}

/**
 *
 * @param group Array to split into chunks
 * @param size  Size of the chunks
 * @param length Max number of chunks to return (default: Infinity)
 * @returns Array of chunks
 */
export function groupArray<T> (
  group: Array<T>,
  size: number,
  length: number = Infinity
) {
  return group
    .reduce(
      (
        accumulator: Array<Array<T>>,
        current: T,
        index: number,
        original: Array<T>
      ) =>
        index % size == 0
          ? accumulator.concat([original.slice(index, index + size)])
          : accumulator,
      []
    )
    .filter((single, index) => index < length)
}


export function lazy<T>(getter: (...values: any[]) => T): (...args: any[]) => { value: T } {
  return (...args: any[]) => {
    return {
      get value() {
        const value = getter(...args);
        Object.defineProperty(this, 'value', { value });
        return value;
      }
    };
  };
}

// Fonction pour générer une chaîne à partir de l'expression régulière
export function generateStringFromRegex (regex: RegExp, ...values: string[]): string {
  // Convertir l'expression régulière en chaîne de caractères
  const regexString = regex.source

  // Remplacer les groupes de capture par les valeurs fournies
  let resultString = regexString;
  const captureGroupRegex = /\((?!\?)\s*(?:[^()]*?(?:\([^()]*?\)[^()]*?)*?)\s*\)/
  values.forEach(value => {
    // Expression régulière pour trouver les groupes de capture
    resultString = resultString.replace(captureGroupRegex, value)
  })

  resultString = resultString.replace(/\(|\)|\?|\:|\[.+\]|\+/g, "")

  return resultString
}

const lookup: [string, number][] = [
  ['M', 1000],
  ['CM', 900],
  ['D', 500],
  ['CD', 400],
  ['C', 100],
  ['XC', 90],
  ['L', 50],
  ['XL', 40],
  ['X', 10],
  ['IX', 9],
  ['V', 5],
  ['IV', 4],
  ['I', 1]
]

const romanNumberSanitizeTable = {
  '𝐌': 'M',
  '𝐃': 'D',
  '𝐂': 'C',
  '𝐋': 'L',
  '𝐗': 'X',
  '𝐕': 'V',
  '𝐈': 'I'
}

export function intToRoman (num: number): string {
  let romanizedNumber = lookup.reduce((acc, [k, v]) => {
    acc += k.repeat(Math.floor(num / v))
    num = num % v
    return acc
  }, '')

  for (const [roman, sanitized] of Object.entries(romanNumberSanitizeTable)) {
    romanizedNumber = romanizedNumber.replaceAll(sanitized, roman)
  }

  return romanizedNumber
}

export function romanToInt (s: string) {
  let result = 0,
    current,
    previous = 0

  for (const [roman, sanitized] of Object.entries(romanNumberSanitizeTable)) {
    s = s.replaceAll(roman, sanitized)
  }

  for (const char of s.split('').reverse()) {
    let translation = lookup.find(r => r[0] === char)
    if (!Array.isArray(translation))
      throw Error(`Can't translate roman number '${s}'`)
    current = translation[1]
    if (current >= previous) {
      result += current
    } else {
      result -= current
    }
    previous = current
  }
  return result
}

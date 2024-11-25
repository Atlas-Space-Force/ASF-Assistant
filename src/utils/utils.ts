export function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export function pick<T, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K> {
	return keys.reduce((o, k) => ((o[k] = obj[k]), o), {} as Pick<T, K>);
}

export function randomString(len = 25): string {
	const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	let result = "";
	const charactersLength = characters.length;
	for (let i = 0; i < len; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}

//random integer between up to bound
export function randomInt(max: number) {
	max = Math.floor(max);
	return Math.floor(Math.random() * max); // The maximum is exclusive and the minimum is inclusive
}

/**
 *
 * @param group Array to split into chunks
 * @param size  Size of the chunks
 * @param length Max number of chunks to return (default: Infinity)
 * @returns Array of chunks
 */
export function groupArray<T>(group: Array<T>, size: number, length: number = Infinity) {
	return group
		.reduce(
			(accumulator: Array<Array<T>>, current: T, index: number, original: Array<T>) =>
				index % size == 0 ? accumulator.concat([original.slice(index, index + size)]) : accumulator,
			[]
		)
		.filter((single, index) => index < length);
}
export function formatNumber(number: number): string {
	if (number === 0) return "0";

	const absoluteNumber: number = Math.abs(number);
	const isNegative: boolean = number < 0;

	if (absoluteNumber < 1000) return `${isNegative ? "-" : ""}${absoluteNumber}`;

	const suffixes: Array<string> = ["", "K", "M", "B", "T"];
	const tier: number = Math.min(Math.floor(Math.log10(absoluteNumber) / 3), suffixes.length - 1);

	return `${isNegative ? "-" : ""}${(absoluteNumber / Math.pow(10, tier * 3)).toFixed(1).replace(/\.0$/, "")}${suffixes[tier]}`;
}

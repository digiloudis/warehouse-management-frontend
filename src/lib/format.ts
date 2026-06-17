export function formatNumber(number: number): string {
	// 0 - 999
	if (number < 1000) {
		return number.toString(); // < 0-999
	}

	// 1,000 - 999,999
	if (number < 1000000) {
		return (number / 1000).toFixed(1).replace(/\.0$/, "") + "k";
	}

	// 1,000,000+
	return (number / 1000000).toFixed(1).replace(/\.0$/, "") + "m";
}

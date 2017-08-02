export default function round (value, precision = 2) {
    const MULTIPLIER = Math.pow(10, precision);
    return Math.round(value * MULTIPLIER) / MULTIPLIER;
}

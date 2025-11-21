export function totalsFromMarks(marksObj) {
const entries = Object.entries(marksObj || {});
const total = entries.reduce((sum, [, val]) => sum + Number(val || 0), 0);
const count = entries.length || 1;
const percentage = Number(((total / (count * 100)) * 100).toFixed(2));
return { total, percentage };
}
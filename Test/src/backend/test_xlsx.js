const XLSX = require('xlsx');

// Create a dummy workbook simulating the user's file
const wb = XLSX.utils.book_new();
const wsData = [
    ["BẢNG CHẤM CÔNG THÁNG 2 NĂM 2026", "", "", "", "", "", ""],
    ["Từ ngày 26/01/2026 đến ngày 25/02/2026", "", "", "", "", "", ""],
    ["Mã NV", "Họ Tên", 26, "", 27, "", 28],
    ["", "", "T5", "Sáng", "T6", "Sáng", "T7"],
    ["BB010", "Cao Như Quỳnh", "X", "", "X", "", "X"]
];

const ws = XLSX.utils.aoa_to_sheet(wsData);
ws['!merges'] = [
    { s: { r: 2, c: 2 }, e: { r: 2, c: 3 } }, // Merge "26" over 2 cols
    { s: { r: 2, c: 4 }, e: { r: 2, c: 5 } }  // Merge "27" over 2 cols
];
XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
console.log("Rows:", rows);

const headerRow = rows[2];
let maNVColIdx = 0;
const dayColumns = [];
let lastDay = -1;

headerRow.forEach((h, idx) => {
    if (idx <= maNVColIdx) return;
    const str = String(h).trim();
    if (str === '' && lastDay !== -1) {
        dayColumns.push({ idx, day: lastDay });
        return;
    }

    const nMatch = str.match(/^0*([1-9]|[12][0-9]|3[01])$/);
    if (nMatch) {
        lastDay = parseInt(nMatch[1], 10);
        dayColumns.push({ idx, day: lastDay });
    } else if (!isNaN(Number(h)) && Number(h) >= 1 && Number(h) <= 31) {
        lastDay = Math.floor(Number(h));
        dayColumns.push({ idx, day: lastDay });
    } else {
        lastDay = -1;
    }
});

console.log("Day columns detected:", dayColumns);

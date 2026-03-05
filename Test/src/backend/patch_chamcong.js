const fs = require('fs');

const filePath = 'D:\\BBSW\\Test\\src\\components\\pages\\ChamCong.tsx';
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

let closingLineIdx = -1;
for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].replace(/\r/g, '').trim();
    if (trimmed === '}' && i > 0 && lines[i - 1].replace(/\r/g, '').trim() === ');') {
        closingLineIdx = i;
    }
}

console.log('Last "});" closing brace at line:', closingLineIdx + 1, 'of', lines.length);

if (closingLineIdx > 0 && closingLineIdx < lines.length - 2) {
    const cleaned = lines.slice(0, closingLineIdx + 1).join('\n') + '\n';
    fs.writeFileSync(filePath, cleaned, 'utf8');
    console.log('✅ Done. New file lines:', cleaned.split('\n').length);
} else {
    console.log('No cleanup needed or pattern not found');
    // Print last 15 lines for debug
    lines.slice(-15).forEach((l, i) => console.log(lines.length - 14 + i, ':', l.replace(/\r/g, '')));
}

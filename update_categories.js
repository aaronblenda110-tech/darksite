const fs = require('fs');
const filepath = 'c:\\Users\\Administrator\\Documents\\WEBKU\\NB\\data.js';
let content = fs.readFileSync(filepath, 'utf8');

let match = content.match(/const\s+videoData\s*=\s*(\[[\s\S]*?\]);/);
if (match) {
    let videoData = JSON.parse(match[1]);
    
    videoData.forEach(v => {
        if (v.id >= 222 && v.id <= 240 && v.category === "Umum") {
            v.category = "Asian";
        } else if (v.category === "Umum") {
            v.category = "Amateur";
        }
    });

    let newJson = JSON.stringify(videoData, null, 4);
    let newContent = content.replace(match[0], `const videoData = ${newJson};`);
    fs.writeFileSync(filepath, newContent);
    console.log("Success");
} else {
    console.log("Failed to match json array");
}

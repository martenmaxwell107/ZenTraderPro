
const fs = require('fs');
const path = require('path');
const https = require('https');

const configPath = path.join(__dirname, '..', 'config.json');
if (!fs.existsSync(configPath)) {
  console.error('Missing config.json');
  process.exit(1);
}
const { siteUrl } = JSON.parse(fs.readFileSync(configPath, 'utf8'));
if (!siteUrl || !/^https?:\/\//i.test(siteUrl)) {
  console.error('Set "siteUrl" in config.json (e.g., https://yourname.netlify.app)');
  process.exit(1);
}

console.log('Fetching HTML from', siteUrl);
https.get(siteUrl, (res) => {
  if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
    // follow redirect
    https.get(res.headers.location, (res2) => handleResponse(res2));
  } else {
    handleResponse(res);
  }
}).on('error', (e) => {
  console.error('Request failed:', e.message);
  process.exit(1);
});

function handleResponse(res) {
  if (res.statusCode !== 200) {
    console.error('HTTP', res.statusCode);
    process.exit(1);
  }
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const out = path.join(__dirname, '..', 'index.html');
    fs.writeFileSync(out, data, 'utf8');
    console.log('Wrote', out, '(' + data.length + ' bytes)');
  });
}

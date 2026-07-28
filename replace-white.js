const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('app').concat(walk('components'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes("background: 'white'") || content.includes('background: "white"')) {
    content = content.replace(/background:\s*'white'/g, "background: 'var(--white)'");
    content = content.replace(/background:\s*"white"/g, "background: 'var(--white)'");
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated ' + file);
  }
});

const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'src', 'app', 'components');
const servicesDir = path.join(__dirname, 'src', 'app', 'services');
const guardsDir = path.join(__dirname, 'src', 'app', 'guards');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

walkDir(componentsDir, (filePath) => {
  if (filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // We want to replace paths like `../../../services/xxx` or `../../services/xxx` 
    // with the exact correct path.
    // Calculate the path from the file's directory to the services directory.
    let fileDir = path.dirname(filePath);
    let relToServices = path.relative(fileDir, servicesDir).replace(/\\/g, '/');
    let relToGuards = path.relative(fileDir, guardsDir).replace(/\\/g, '/');
    
    // Ensure it starts with './' or '../'
    if (!relToServices.startsWith('.')) relToServices = './' + relToServices;
    if (!relToGuards.startsWith('.')) relToGuards = './' + relToGuards;

    let modified = false;

    // A regex to match any `../` or `./` followed by `services/`
    let newContent = content.replace(/(?:\.\.\/|\.\/)+services\//g, (match) => {
        modified = true;
        return `${relToServices}/`;
    });

    newContent = newContent.replace(/(?:\.\.\/|\.\/)+guards\//g, (match) => {
        modified = true;
        return `${relToGuards}/`;
    });

    if (modified) {
        fs.writeFileSync(filePath, newContent);
        console.log(`Updated imports in ${filePath}`);
    }
  }
});

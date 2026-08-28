const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'src', 'app', 'components');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

// Adjust depths
// components/admin/analytics/analytics.ts -> depth 3 (components -> admin -> analytics -> file)
// original depth: components/analytics/analytics.ts -> depth 2

walkDir(componentsDir, (filePath) => {
  if (filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Calculate new relative path to services
    // If it's in components/admin/users/users.ts:
    // dirname = components/admin/users
    // componentsDir = components
    // relative = admin/users (2 levels -> need ../../ to reach components, then ../services -> ../../../services)
    
    let relToComponents = path.relative(componentsDir, path.dirname(filePath));
    let levels = relToComponents.split(path.sep).length;
    
    // default was 1 level: components/users -> ../../services
    // now it might be 2 levels: components/admin/users -> ../../../services
    // or 3 levels: components/shared/hr/employees -> ../../../../services
    
    let dots = Array(levels + 2).fill('..').join('/');
    
    // We only want to replace if the old one was exactly pointing to services or guards
    // Old pattern: ../../services/xxx
    let modified = false;
    
    let newContent = content.replace(/(\.\.\/)+services\//g, (match) => {
        modified = true;
        return `${dots}/services/`;
    });

    newContent = newContent.replace(/(\.\.\/)+guards\//g, (match) => {
        modified = true;
        return `${dots}/guards/`;
    });

    if (modified) {
        fs.writeFileSync(filePath, newContent);
        console.log(`Updated imports in ${filePath}`);
    }
  }
});

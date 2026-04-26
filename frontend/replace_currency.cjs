const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) { 
            results.push(file);
        }
    });
    return results;
}

const files = walk('./src');
let changedFiles = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Replace JSX dollar signs: ${some.price} -> ₨{some.price}
    // Also covers ${some.totalAmount}, ${some.subtotal}, ${some.tax}, etc.
    content = content.replace(/\$(\{[^}]*(price|totalAmount|subtotal|tax|discount|fee|amount|value)[^}]*\})/gi, '₨$1');
    
    // Replace string literals: `$$${some.price}` -> `₨${some.price}`
    content = content.replace(/`\$\$\{([^}]+)\}/g, '`₨\\$\\{$1\\}');
    
    // Replace `$${some.discountValue} OFF`
    content = content.replace(/`\$\$\{([^}]+)\}([^`]*)`/g, '`₨\\$\\{$1\\}$2`');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        changedFiles++;
        console.log('Updated:', file);
    }
});
console.log('Total files changed:', changedFiles);

const fs = require('fs');
const path = require('path');

const javaControllerDir = 'C:\\D\\btlwebtrentruong\\backend\\src\\main\\java\\com\\example\\project\\controller';
const csControllerDir = 'C:\\D\\btlwebtrentruong\\dotnet_backend\\Controllers';

function getFiles(dir, filter) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results = results.concat(getFiles(fullPath, filter));
        } else if (filter(file)) {
            results.push(fullPath);
        }
    });
    return results;
}

function extractJavaEndpoints(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const endpoints = [];
    let currentAnnotations = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.match(/^@(GetMapping|PostMapping|PutMapping|DeleteMapping|PatchMapping|RequestMapping)/)) {
            currentAnnotations.push(line);
        } else if (currentAnnotations.length > 0 && (line.includes('public ') && (line.includes('(') || lines[i+1]?.includes('(')))) {
            let sig = line;
            if (!sig.includes('(') && lines[i+1]?.includes('(')) {
                sig += ' ' + lines[i+1].trim();
            }
            const matchName = sig.match(/public\s+[^\s<]+(?:<[^>]+>)?\s+([a-zA-Z0-9_]+)\s*\(/);
            const methodName = matchName ? matchName[1] : sig;
            endpoints.push({
                annotations: currentAnnotations,
                methodName: methodName,
                signature: sig.split('{')[0].trim()
            });
            currentAnnotations = [];
        } else if (!line.startsWith('@') && currentAnnotations.length > 0) {
            if (!line.startsWith('//') && !line.startsWith('/*') && !line.startsWith('*')) {
                currentAnnotations = [];
            }
        }
    }
    return endpoints;
}

function extractCsEndpoints(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const endpoints = [];
    let currentAttributes = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.match(/^\[(HttpGet|HttpPost|HttpPut|HttpDelete|HttpPatch|Route)/)) {
            currentAttributes.push(line);
        } else if (currentAttributes.length > 0 && line.includes('public ') && (line.includes('(') || lines[i+1]?.includes('('))) {
            let sig = line;
            if (!sig.includes('(') && lines[i+1]?.includes('(')) {
                sig += ' ' + lines[i+1].trim();
            }
            const matchName = sig.match(/public\s+(?:async\s+)?[^\s<]+(?:<[^>]+>)?\s+([a-zA-Z0-9_]+)\s*\(/);
            const methodName = matchName ? matchName[1] : sig;
            endpoints.push({
                attributes: currentAttributes,
                methodName: methodName,
                signature: sig.split('{')[0].trim()
            });
            currentAttributes = [];
        } else if (!line.startsWith('[') && currentAttributes.length > 0) {
            if (!line.startsWith('//') && !line.startsWith('/*') && !line.startsWith('*')) {
                currentAttributes = [];
            }
        }
    }
    return endpoints;
}

const javaFiles = getFiles(javaControllerDir, f => f.endsWith('.java'));
const csFiles = getFiles(csControllerDir, f => f.endsWith('.cs'));

const report = {};

javaFiles.forEach(jf => {
    const className = path.basename(jf, '.java');
    const cf = csFiles.find(f => path.basename(f, '.cs') === className);
    const jEndpoints = extractJavaEndpoints(jf);
    const cEndpoints = cf ? extractCsEndpoints(cf) : [];

    report[className] = {
        javaCount: jEndpoints.length,
        csCount: cEndpoints.length,
        javaEndpoints: jEndpoints,
        csEndpoints: cEndpoints
    };
});

fs.writeFileSync('C:\\D\\btlwebtrentruong\\api_test_tool\\detailed_audit_report.json', JSON.stringify(report, null, 2));
console.log('Detailed audit report written to api_test_tool/detailed_audit_report.json');

// In ra tóm tắt các controller có chênh lệch lớn
for (const [cls, data] of Object.entries(report)) {
    if (data.javaCount !== data.csCount) {
        console.log(`\n--------------------------------------------------`);
        console.log(`Controller: ${cls} (Java: ${data.javaCount} | C#: ${data.csCount})`);
        console.log(`Java Endpoints:`);
        data.javaEndpoints.forEach(ep => {
            console.log(`  - [${ep.methodName}] ${ep.annotations.join(' ')}`);
        });
        console.log(`C# Endpoints:`);
        data.csEndpoints.forEach(ep => {
            console.log(`  - [${ep.methodName}] ${ep.attributes.join(' ')}`);
        });
    }
}

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

function parseJavaController(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const className = path.basename(filePath, '.java');
    
    // Class level RequestMapping
    const classMappingMatch = content.match(/@RequestMapping\(([^)]+)\)/);
    let classBaseRoutes = [''];
    if (classMappingMatch) {
        const raw = classMappingMatch[1];
        const stringMatches = raw.match(/"([^"]+)"/g);
        if (stringMatches) {
            classBaseRoutes = stringMatches.map(s => s.replace(/"/g, ''));
        }
    }

    // Methods
    const methods = [];
    const lines = content.split('\n');
    let currentAnnotations = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('@GetMapping') || line.startsWith('@PostMapping') || 
            line.startsWith('@PutMapping') || line.startsWith('@DeleteMapping') ||
            (line.startsWith('@RequestMapping') && i > 30)) {
            currentAnnotations.push(line);
        } else if (currentAnnotations.length > 0 && (line.includes('public ') || line.includes('ApiResponse<'))) {
            const funcSig = line;
            methods.push({
                annotations: currentAnnotations,
                signature: funcSig
            });
            currentAnnotations = [];
        } else if (!line.startsWith('@') && currentAnnotations.length > 0) {
            // maybe multi-line annotation or comment
            if (!line.startsWith('//') && !line.startsWith('/*') && !line.startsWith('*')) {
                currentAnnotations = [];
            }
        }
    }

    return {
        className,
        filePath,
        classBaseRoutes,
        methods
    };
}

function parseCsController(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const className = path.basename(filePath, '.cs');
    
    // Class level Route
    const classRouteMatches = content.match(/\[Route\("([^"]+)"\)\]/g);
    let classBaseRoutes = [''];
    if (classRouteMatches) {
        classBaseRoutes = classRouteMatches.map(m => m.replace(/\[Route\("([^"]+)"\)\]/, '$1'));
    }

    const methods = [];
    const lines = content.split('\n');
    let currentAttributes = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('[HttpGet') || line.startsWith('[HttpPost') || 
            line.startsWith('[HttpPut') || line.startsWith('[HttpDelete')) {
            currentAttributes.push(line);
        } else if (currentAttributes.length > 0 && line.includes('public async Task') || line.includes('public IActionResult') || line.includes('public Task<IActionResult>')) {
            const funcSig = line;
            methods.push({
                attributes: currentAttributes,
                signature: funcSig
            });
            currentAttributes = [];
        } else if (!line.startsWith('[') && currentAttributes.length > 0) {
            if (!line.startsWith('//') && !line.startsWith('/*') && !line.startsWith('*')) {
                currentAttributes = [];
            }
        }
    }

    return {
        className,
        filePath,
        classBaseRoutes,
        methods
    };
}

const javaFiles = getFiles(javaControllerDir, f => f.endsWith('.java'));
const csFiles = getFiles(csControllerDir, f => f.endsWith('.cs'));

console.log(`JAVA CONTROLLERS COUNT: ${javaFiles.length}`);
console.log(`C# CONTROLLERS COUNT: ${csFiles.length}`);

const javaMap = {};
javaFiles.forEach(f => {
    const parsed = parseJavaController(f);
    javaMap[parsed.className] = parsed;
});

const csMap = {};
csFiles.forEach(f => {
    const parsed = parseCsController(f);
    csMap[parsed.className] = parsed;
});

console.log('\n=========================================');
console.log('AUDIT CONTROLLERS MAPPING (JAVA vs C#):');
console.log('=========================================');

let totalJavaMethods = 0;
let totalCsMethods = 0;

for (const jClass of Object.keys(javaMap).sort()) {
    const jCtrl = javaMap[jClass];
    const cCtrl = csMap[jClass];
    totalJavaMethods += jCtrl.methods.length;

    if (!cCtrl) {
        console.log(`❌ THIẾU CONTROLLER: ${jClass} (Java có ${jCtrl.methods.length} methods)`);
    } else {
        totalCsMethods += cCtrl.methods.length;
        const diff = cCtrl.methods.length - jCtrl.methods.length;
        console.log(`✔ [MAP 1:1] ${jClass.padEnd(35)} | Java: ${jCtrl.methods.length.toString().padStart(2)} methods | C#: ${cCtrl.methods.length.toString().padStart(2)} methods ${diff !== 0 ? `(diff: ${diff > 0 ? '+' : ''}${diff})` : ''}`);
    }
}

// Check extra C# controllers
for (const cClass of Object.keys(csMap).sort()) {
    if (!javaMap[cClass]) {
        console.log(`➕ CONTROLLER BỔ SUNG Ở C#: ${cClass} (${csMap[cClass].methods.length} methods)`);
        totalCsMethods += csMap[cClass].methods.length;
    }
}

console.log('\n=========================================');
console.log(`TỔNG HỢP METHODS: Java = ${totalJavaMethods} | C# = ${totalCsMethods}`);
console.log('=========================================');

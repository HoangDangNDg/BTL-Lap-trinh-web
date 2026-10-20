const fs = require('fs');
const path = require('path');

const BACKEND_SRC_DIR = path.join(__dirname, '../src/main/java/com/example/project');
const ENTITY_DIR = path.join(BACKEND_SRC_DIR, 'entity');
const DTO_DIR = path.join(BACKEND_SRC_DIR, 'dto');
const CONTROLLER_DIR = path.join(BACKEND_SRC_DIR, 'controller');

const GENERATED_TYPES_DIR = path.join(__dirname, 'src/kieu_du_lieu/tao_tu_dong');
const GENERATED_SERVICES_DIR = path.join(__dirname, 'src/dich_vu/tao_tu_dong');

fs.mkdirSync(GENERATED_TYPES_DIR, { recursive: true });
fs.mkdirSync(GENERATED_SERVICES_DIR, { recursive: true });

function mapJavaTypeToTS(javaType) {
  if (!javaType) return 'any';
  javaType = javaType.replace(/(?:[a-zA-Z0-9_]+\.)+/g, '').trim();
  
  const collectionMatch = javaType.match(/^(?:List|Set|Collection)<(.+)>$/);
  if (collectionMatch) {
    return `${mapJavaTypeToTS(collectionMatch[1])}[]`;
  }
  
  const mapMatch = javaType.match(/^Map<(.+?),\s*(.+)>$/);
  if (mapMatch) {
    return `Record<${mapJavaTypeToTS(mapMatch[1])}, ${mapJavaTypeToTS(mapMatch[2])}>`;
  }
  
  const optionalMatch = javaType.match(/^Optional<(.+)>$/);
  if (optionalMatch) {
    return mapJavaTypeToTS(optionalMatch[1]);
  }
  
  const apiRespMatch = javaType.match(/^ApiResponse<(.+)>$/);
  if (apiRespMatch) {
    return `ApiResponse<${mapJavaTypeToTS(apiRespMatch[1])}>`;
  }

  switch (javaType) {
    case 'String': case 'UUID': case 'LocalDate': case 'LocalDateTime': case 'Date': case 'LocalTime': return 'string';
    case 'Integer': case 'int': case 'Long': case 'long': case 'Double': case 'double': case 'Float': case 'float': case 'BigDecimal': case 'Short': case 'short': case 'Byte': case 'byte': return 'number';
    case 'Boolean': case 'boolean': return 'boolean';
    case 'Object': return 'any';
    case 'Void': case 'void': return 'void';
    default: return javaType;
  }
}

const modelsMap = new Map();
const customTypes = new Set();

function processJavaModels(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      processJavaModels(fullPath);
    } else if (file.name.endsWith('.java')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      const classMatch = content.match(/public\s+(class|enum|record)\s+(\w+)/);
      if (!classMatch) continue;
      
      const kind = classMatch[1];
      const isEnum = kind === 'enum';
      const isRecord = kind === 'record';
      const className = classMatch[2];
      customTypes.add(className);
      
      const dependencies = new Set();
      let tsCode = '';
      
      if (isEnum) {
        const enumBodyMatch = content.match(/public\s+enum\s+\w+\s*\{([\s\S]*?)\}/);
        if (enumBodyMatch) {
          const enumValues = enumBodyMatch[1].split(',')
            .map(e => e.trim().split(/[\s\(]/)[0])
            .filter(e => e && !e.includes(';') && !e.includes('}'));
          tsCode = `export type ${className} = ${enumValues.map(e => `'${e}'`).join(' | ') || 'string'};\n`;
        }
      } else if (isRecord) {
        tsCode = `export interface ${className} {\n`;
        const recordBodyMatch = content.match(/public\s+record\s+\w+\s*\(([\s\S]*?)\)/);
        if (recordBodyMatch) {
          const params = recordBodyMatch[1].split(',');
          for (let p of params) {
            p = p.replace(/\/\/.*$/gm, '').trim();
            if (!p) continue;
            const parts = p.trim().split(/\s+/);
            if (parts.length >= 2) {
              const rawType = parts.slice(0, -1).join(' ');
              const name = parts[parts.length - 1];
              const tsType = mapJavaTypeToTS(rawType);
              tsCode += `  ${name}?: ${tsType};\n`;
              const typeMatch = tsType.match(/[A-Z]\w+/g);
              if (typeMatch) {
                typeMatch.forEach(t => {
                  if (t !== className && t !== 'ApiResponse' && t !== 'Record' && t !== 'Array') {
                    dependencies.add(t);
                  }
                });
              }
            }
          }
        }
        tsCode += `}\n`;
      } else {
        tsCode = `export interface ${className} {\n`;
        
        const fieldRegex = /(?:private|protected)\s+([\w<>,\s]+?)\s+(\w+)\s*(?:=|;)/g;
        let fieldMatch;
        while ((fieldMatch = fieldRegex.exec(content)) !== null) {
          const rawType = fieldMatch[1];
          const name = fieldMatch[2];
          const tsType = mapJavaTypeToTS(rawType);
          tsCode += `  ${name}?: ${tsType};\n`;
          
          const typeMatch = tsType.match(/[A-Z]\w+/g);
          if (typeMatch) {
            typeMatch.forEach(t => {
              if (t !== className && t !== 'ApiResponse' && t !== 'Record' && t !== 'Array') {
                dependencies.add(t);
              }
            });
          }
        }
        tsCode += `}\n`;
      }
      modelsMap.set(className, { code: tsCode, dependencies });
    }
  }
}

processJavaModels(ENTITY_DIR);
processJavaModels(DTO_DIR);

const modelIndexExports = [`export interface ApiResponse<T> {\n  code: number;\n  message: string;\n  data: T;\n}\n`];

for (const [className, data] of modelsMap.entries()) {
  let fileContent = '';
  const validDeps = Array.from(data.dependencies).filter(d => customTypes.has(d));
  
  validDeps.forEach(d => {
    fileContent += `import { ${d} } from './${d}';\n`;
  });
  if (validDeps.length > 0) fileContent += '\n';
  
  fileContent += data.code;
  fs.writeFileSync(path.join(GENERATED_TYPES_DIR, `${className}.ts`), fileContent.trim() + '\n');
  modelIndexExports.push(`export * from './${className}';`);
}

fs.writeFileSync(path.join(GENERATED_TYPES_DIR, 'index.ts'), modelIndexExports.join('\n') + '\n');
console.log(`Generated types at ${GENERATED_TYPES_DIR}`);

const servicesMap = new Map();

function processControllers(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    if (!file.endsWith('Controller.java')) continue;
    const fullPath = path.join(dir, file);
    const content = fs.readFileSync(fullPath, 'utf8');
    
    const className = file.replace('.java', '');
    const serviceName = 'dichVu' + className.replace('Controller', '');
    
    const baseRouteMatch = content.match(/@RequestMapping\("([^"]+)"\)/);
    let baseRoute = baseRouteMatch ? baseRouteMatch[1] : '';
    if (baseRoute.endsWith('/')) baseRoute = baseRoute.slice(0, -1);
    
    let serviceFunctions = [];
    const usedTypes = new Set(['ApiResponse']);
    
    const methodRegex = /@(Get|Post|Put|Delete|Patch)Mapping(?:\(["']([^"']*)["']\))?[\s\S]*?public\s+([\w<>,?.\s]+?)\s+(\w+)\s*\(([^)]*)\)/g;
    
    let methodMatch;
    while ((methodMatch = methodRegex.exec(content)) !== null) {
      const httpMethod = methodMatch[1].toLowerCase();
      let pathStr = methodMatch[2] || '';
      if (pathStr && !pathStr.startsWith('/')) pathStr = '/' + pathStr;
      const rawReturnType = methodMatch[3];
      const methodName = methodMatch[4];
      const paramsRaw = methodMatch[5];
      
      const fullPath = (baseRoute + pathStr).replace(/\/+/g, '/');
      
      let tsReturnType = mapJavaTypeToTS(rawReturnType);
      const unwrappedMatch = tsReturnType.match(/^ApiResponse<(.+)>$/);
      const actualReturnType = unwrappedMatch ? unwrappedMatch[1] : (tsReturnType !== 'void' && tsReturnType !== 'any' ? tsReturnType : 'any');
      
      const params = [];
      const queryParams = [];
      let bodyParam = null;
      let pathParams = [];
      
      function splitParamList(paramStr) {
        const result = [];
        let current = '';
        let depth = 0;
        for (let i = 0; i < paramStr.length; i++) {
          const char = paramStr[i];
          if (char === '<' || char === '(') {
            depth++;
            current += char;
          } else if (char === '>' || char === ')') {
            depth--;
            current += char;
          } else if (char === ',' && depth === 0) {
            result.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        if (current.trim()) result.push(current.trim());
        return result;
      }

      if (paramsRaw.trim()) {
        const paramList = splitParamList(paramsRaw);
        for (const p of paramList) {
          if (p.includes('HttpServletRequest') || p.includes('HttpServletResponse') || p.includes('JwtUserDetails') || p.includes('Principal')) continue;
          
          let cleanP = p.replace(/@\w+(\([^)]*\))?\s*/g, '').trim();
          let lastSpaceIdx = cleanP.lastIndexOf(' ');
          if (lastSpaceIdx === -1) continue;
          
          let pTypeRaw = cleanP.substring(0, lastSpaceIdx).trim();
          let pName = cleanP.substring(lastSpaceIdx + 1).trim();
          let pTsType = mapJavaTypeToTS(pTypeRaw);
          
          if (p.includes('@PathVariable')) {
            const pvMatch = p.match(/@PathVariable(?:\("([^"]+)"\))?/);
            const pvName = (pvMatch && pvMatch[1]) ? pvMatch[1] : pName;
            pathParams.push({ name: pName, tsName: pvName, type: pTsType });
            params.push(`${pName}: ${pTsType}`);
          } else if (p.includes('@RequestBody')) {
            bodyParam = pName;
            params.push(`${pName}: ${pTsType}`);
          } else if (p.includes('@RequestParam')) {
            const rpMatch = p.match(/@RequestParam(?:\("([^"]+)"\))?/);
            const rpName = (rpMatch && rpMatch[1]) ? rpMatch[1] : pName;
            queryParams.push({ name: pName, queryName: rpName });
            params.push(`${pName}: ${pTsType}`);
          } else {
            params.push(`${pName}: ${pTsType}`);
          }
          
          const typeMatch = pTsType.match(/[A-Z]\w+/g);
          if (typeMatch) typeMatch.forEach(t => usedTypes.add(t));
        }
      }
      
      const typeMatchReturn = actualReturnType.match(/[A-Z]\w+/g);
      if (typeMatchReturn) typeMatchReturn.forEach(t => usedTypes.add(t));

      let urlStr = '`' + fullPath.replace(/{([^}]+)}/g, (match, p1) => {
        const mapped = pathParams.find(p => p.tsName === p1);
        return mapped ? '${' + mapped.name + '}' : '${' + p1 + '}';
      }) + '`';
      
      let configObj = [];
      if (queryParams.length > 0) {
        configObj.push(`params: { ${queryParams.map(q => q.name === q.queryName ? q.name : `'${q.queryName}': ${q.name}`).join(', ')} }`);
      }
      
      let axiosArgs = [urlStr];
      if (httpMethod === 'post' || httpMethod === 'put' || httpMethod === 'patch') {
        axiosArgs.push(bodyParam || '{}');
      }
      if (configObj.length > 0) {
        axiosArgs.push(`{ ${configObj.join(', ')} }`);
      }
      
      serviceFunctions.push(`
  ${methodName}: async (${params.join(', ')}): Promise<${actualReturnType}> => {
    const response = await api.${httpMethod}(${axiosArgs.join(', ')});
    return response as any;
  }`);
    }
    
    if (serviceFunctions.length > 0) {
      const importsToInclude = Array.from(usedTypes).filter(t => customTypes.has(t) || t === 'ApiResponse');
      
      let servicesOutput = `import api from '../api';\n`;
      if (importsToInclude.length > 0) {
        servicesOutput += `import { ${importsToInclude.join(', ')} } from '../../kieu_du_lieu/tao_tu_dong';\n`;
      }
      servicesOutput += `\nexport const ${serviceName} = {\n${serviceFunctions.join(',\n')}\n};\n`;
      
      servicesMap.set(serviceName, servicesOutput);
    }
  }
}

processControllers(CONTROLLER_DIR);

const servicesIndexExports = [];
for (const [serviceName, code] of servicesMap.entries()) {
  fs.writeFileSync(path.join(GENERATED_SERVICES_DIR, `${serviceName}.ts`), code.trim() + '\n');
  servicesIndexExports.push(`export * from './${serviceName}';`);
}

fs.writeFileSync(path.join(GENERATED_SERVICES_DIR, 'index.ts'), servicesIndexExports.join('\n') + '\n');
console.log(`Generated services at ${GENERATED_SERVICES_DIR}`);

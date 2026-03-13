import fs from 'fs';
import path from 'path';

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('<IconMapper') && !content.includes('import { IconMapper }')) {
      const parts = filePath.split(path.sep);
      let prefix = '../'.repeat(parts.length - 2) || './';
      if (filePath.includes('components/')) {
        prefix = './';
      } else if (filePath.includes('pages/')) {
        prefix = '../components/';
      }
      
      const importStr = `import { IconMapper } from '${prefix}IconMapper';\n`;
      const lastImport = content.lastIndexOf('import ');
      if (lastImport !== -1) {
          const end = content.indexOf('\n', lastImport);
          content = content.slice(0, end + 1) + importStr + content.slice(end + 1);
      } else {
          content = importStr + content;
      }
      fs.writeFileSync(filePath, content);
      console.log(`Fixed imports in ${filePath}`);
  }
}

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
          processDir(fullPath);
      } else if (fullPath.endsWith('.tsx') && !fullPath.endsWith('IconMapper.tsx')) {
          processFile(fullPath);
      }
  }
}

processDir('./pages');
processDir('./components');

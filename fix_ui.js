import fs from 'fs';
import path from 'path';

// ensure IconMapper exists
const mapperPath = path.join('./components', 'IconMapper.tsx');
if (!fs.existsSync(mapperPath)) {
  fs.writeFileSync(mapperPath, `import React from 'react';
import * as PhosphorIcons from '@phosphor-icons/react';

const materialToPhosphor: Record<string, string> = {
  'insights': 'Lightbulb',
  'workspace_premium': 'Crown',
  'search': 'MagnifyingGlass',
  'close': 'X',
  'notifications': 'Bell',
  'dashboard': 'SquaresFour',
  'model_training': 'PlayCircle',
  'groups': 'Users',
  'trending_up': 'ChartLineUp',
  'history': 'ClockCounterClockwise',
  'person': 'User',
  'lock_reset': 'LockKey',
  'settings': 'Gear',
  'logout': 'SignOut',
  'menu': 'List',
  'bolt': 'Lightning',
  'psychology': 'Brain',
  'account_tree': 'TreeStructure',
  'arrow_forward': 'ArrowRight',
  'psychology_alt': 'Brain',
  'account_balance_wallet': 'Wallet',
  'school': 'GraduationCap',
  'more_horiz': 'DotsThree',
  'play_arrow': 'Play',
  'hourglass_top': 'Hourglass',
  'check_circle': 'CheckCircle',
  'verified': 'SealCheck',
  'warning': 'Warning',
  'error': 'WarningCircle',
  'equalizer': 'Faders',
  'science': 'Flask',
  'timeline': 'ChartLine',
  'flag': 'Flag',
  'sync_alt': 'ArrowsLeftRight',
  'balance': 'Scales',
  'rocket_launch': 'RocketLaunch',
  'save': 'FloppyDisk',
  'download': 'DownloadSimple',
  'create_new_folder': 'FolderPlus',
  'work_history': 'Clock',
  'open_in_new': 'ArrowSquareOut',
  'chat_bubble': 'ChatCircle',
  'favorite': 'Heart',
  'sprint': 'PersonSimpleRun',
  'share': 'ShareNetwork',
  'timer': 'Timer',
  'visibility_off': 'EyeClosed',
  'auto_awesome': 'MagicWand',
  'add_circle': 'PlusCircle',
  'neurology': 'Brain'
};

interface IconMapperProps {
  name: string;
  className?: string;
  weight?: 'bold' | 'regular' | 'fill' | 'light' | 'thin' | 'duotone';
}

export const IconMapper: React.FC<IconMapperProps> = ({ name, className, weight = 'bold' }) => {
  const PhosphorName = materialToPhosphor[name] || 'Lightning';
  const IconComponent = (PhosphorIcons as any)[PhosphorName];
  if (!IconComponent) return null;
  return <IconComponent className={className} weight={weight} />;
};
`);
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // text contrast
  content = content.replace(/text-slate-500/g, 'text-slate-600');
  
  // Accessibility fixes
  if (filePath.endsWith('SharedHeader.tsx')) {
    content = content.replace(/<input\s+value=\{searchValue\}/, '<input aria-label="Tìm kiếm kịch bản cộng đồng" value={searchValue}');
  }
  
  if (filePath.endsWith('SimulationFlow.tsx')) {
     content = content.replace(/<label(.*?)>/g, (match, p1) => {
        if (p1.includes('htmlFor')) return match;
        return `<label htmlFor={slider.id}${p1}>`;
     });
     content = content.replace(/<input(.*?)type="range"/g, (match, p1) => {
        if (p1.includes('id=')) return match;
        return `<input id={slider.id}${p1}type="range"`;
     });
  }

  let needsIconMapper = false;
  
  const spanRegex = /<span([^>]*className=[^>]*material-symbols-outlined[^>]*)>\s*([a-zA-Z_]+|\{.*?\})\s*<\/span>/gs;
  
  content = content.replace(spanRegex, (match, attrs, innerContent) => {
      needsIconMapper = true;
      let nameProp = innerContent.trim();
      if (!nameProp.startsWith('{')) {
          nameProp = `"${nameProp}"`;
      }
      
      let cleanAttrs = attrs.replace('material-symbols-outlined', '');
      
      return `<IconMapper name=${nameProp} ${cleanAttrs.trim()} />`;
  });
  
  if ((needsIconMapper || content.includes('<IconMapper')) && !content.includes("import { IconMapper }")) {
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
          const nextNewline = content.indexOf('\n', lastImport);
          content = content.slice(0, nextNewline + 1) + importStr + content.slice(nextNewline + 1);
      } else {
          content = importStr + content;
      }
  }

  // Ensure AnimatedBackground is used in pages
  if (filePath.includes('pages/') && !content.includes('AnimatedBackground') && !filePath.includes('LandingPage')) {
      const parts = filePath.split(path.sep);
      const prefix = '../components/';
      const importStr = `import { AnimatedBackground } from '${prefix}AnimatedBackground';\n`;
      
      // Add import
      const firstImport = content.indexOf('import ');
      content = importStr + content;

      // Replace wrapper div with AnimatedBackground
      // Look for the main return block and the first div
      content = content.replace(/return\s*\(\s*<div([^>]*)>/, 'return (\n    <AnimatedBackground$1>');
      content = content.replace(/<\/div>\s*\)\s*;\s*\}\s*;\s*export default/, '</AnimatedBackground>\n  );\n};\n\nexport default');
      // If it's a direct div return
      content = content.replace(/className="([^"]*min-h-screen[^"]*)"/, 'className="$1"');
  }

  if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log(`Updated ${filePath}`);
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

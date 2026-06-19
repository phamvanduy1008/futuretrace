import React from 'react';
import * as PhosphorIcons from '@phosphor-icons/react';

const materialToPhosphor: Record<string, string> = {
  'insights': 'Lightbulb',
  'workspace_premium': 'Crown',
  'search': 'MagnifyingGlass',
  'close': 'X',
  'notifications': 'Bell',
  'help': 'Question',
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
  'neurology': 'Brain',
  'lock': 'Lock',
  'verified_user': 'ShieldCheck',
  'person_add': 'UserPlus',
  'mail': 'EnvelopeSimple',
  'key': 'Key',
  'arrow_back': 'ArrowLeft',
  'add': 'Plus',
  'search_off': 'MagnifyingGlass',
  'chevron_right': 'CaretRight',
  'chevron_left': 'CaretLeft',
  'folder_open': 'FolderOpen',
  'folder': 'Folder',
  'bookmark': 'BookmarkSimple',
  'delete': 'Trash',
  'expand_more': 'CaretDown',
  'list_alt': 'ClipboardText',
  'pending': 'ClockClockwise',
  'circle': 'Circle',
  'inbox_customize': 'Package',
  'work': 'Briefcase',
  'content_copy': 'Copy',
  'toll': 'Coin',
  'change': 'ArrowsCounterClockwise',
  'nut': 'Nut',
  'lightning': 'Lightning',
  'lightbulb': 'Lightbulb',
  'diamond': 'SketchLogo',
  'store': 'Storefront',
  'profile': 'UserCircle',
  'hourglass_empty': 'HourglassLow',
  'block': 'Prohibit',
  'refresh': 'ArrowClockwise'
};

interface IconMapperProps {
  name: string;
  className?: string;
  weight?: 'bold' | 'regular' | 'fill' | 'light' | 'thin' | 'duotone';
  style?: React.CSSProperties;
}

export const IconMapper: React.FC<IconMapperProps> = ({ name, className, weight = 'bold', style }) => {
  const PhosphorName = materialToPhosphor[name] || 'Lightning';
  const IconComponent = (PhosphorIcons as any)[PhosphorName];
  if (!IconComponent) return null;
  return <IconComponent size={20} className={className} weight={weight} style={style} />;
};

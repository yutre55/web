import * as LucideIcons from 'lucide-react';

export const getIcon = (name) => {
  const Icon = LucideIcons[name] || LucideIcons['Activity'] || LucideIcons['Shield'] || (() => null);
  return Icon;
};

export const Icons = {
  Shield: getIcon('Shield'),
  User: getIcon('User'),
  Lock: getIcon('Lock'),
  ChevronRight: getIcon('ChevronRight'),
  Activity: getIcon('Activity'),
  Zap: getIcon('Zap'),
  Terminal: getIcon('Terminal'),
  LayoutDashboard: getIcon('LayoutDashboard') || getIcon('Layout'),
  ShoppingCart: getIcon('ShoppingCart'),
  Package: getIcon('Package'),
  LogOut: getIcon('LogOut'),
  Search: getIcon('Search'),
  Bell: getIcon('Bell'),
  Cpu: getIcon('Cpu'),
  Globe: getIcon('Globe'),
  Database: getIcon('Database'),
  Key: getIcon('Key'),
  Plus: getIcon('Plus'),
  X: getIcon('X'),
  Fingerprint: getIcon('Fingerprint') || getIcon('Lock'),
  BarChart3: getIcon('BarChart3') || getIcon('BarChart'),
  Radio: getIcon('Radio'),
  ShieldCheck: getIcon('ShieldCheck') || getIcon('Shield'),
  Eye: getIcon('Eye'),
  EyeOff: getIcon('EyeOff'),
  Mail: getIcon('Mail'),
  MessageSquare: getIcon('MessageSquare'),
  Trophy: getIcon('Trophy'),
  Target: getIcon('Target'),
  Users: getIcon('Users'),
  Menu: getIcon('Menu'),
  Send: getIcon('Send'),
  HelpCircle: getIcon('HelpCircle'),
  Info: getIcon('Info'),
  Camera: getIcon('Camera'),
};

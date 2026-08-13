import React from 'react';
import {
  LayoutDashboard,
  Database,
  Cpu,
  BarChart2,
  TrendingUp,
  Bot,
  FileText,
  Settings,
  User,
  Mail,
  Phone
} from 'lucide-react';

export type ActiveTab =
  | 'overview'
  | 'dataset'
  | 'engines'
  | 'analytics'
  | 'rul'
  | 'agent'
  | 'reports'
  | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const navItems = [
    { id: 'overview' as ActiveTab, label: 'Mission Overview', icon: LayoutDashboard },
    { id: 'dataset' as ActiveTab, label: 'Dataset Workspace', icon: Database },
    { id: 'engines' as ActiveTab, label: 'Fleet Telemetry', icon: Cpu },
    { id: 'analytics' as ActiveTab, label: 'Sensor Analytics', icon: BarChart2 },
    { id: 'rul' as ActiveTab, label: 'RUL Prediction', icon: TrendingUp },
    { id: 'agent' as ActiveTab, label: 'Hermes AI Agent', icon: Bot },
    { id: 'reports' as ActiveTab, label: 'Propulsion Reports', icon: FileText },
    { id: 'settings' as ActiveTab, label: 'System Settings', icon: Settings }
  ];

  return (
    <aside className="w-64 bg-[#14171A] text-[#FAF9F6] border-r border-[#23272B] flex flex-col justify-between shrink-0 min-h-[calc(100vh-3.5rem)] select-none font-sans">
      <div className="p-3 space-y-4">
        <div>
          <div className="px-3 py-2 text-[10px] font-mono tracking-widest text-[#8C8B80] uppercase font-medium border-b border-[#23272B] mb-2 flex items-center justify-between">
            <span>CONSOLE NAVIGATION</span>
            <span className="text-[#A6362A] font-bold">MRO-v2</span>
          </div>
          <nav className="space-y-0.5">
            {navItems.map(item => {
              const Icon = item.icon;
              const isSelected = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-medium transition-colors cursor-pointer rounded-none text-left ${
                    isSelected
                      ? 'bg-[#1F2327] text-white border-l-[3px] border-l-[#A6362A]'
                      : 'text-[#8C8B80] hover:text-white hover:bg-[#1A1E22]'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#A6362A]' : 'text-[#8C8B80]'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Developer Credits & System Info Footer */}
      <div className="p-3.5 border-t border-[#23272B] bg-[#101214] text-[11px] text-[#8C8B80] space-y-2 font-mono">
        <div className="space-y-1 border-b border-[#23272B] pb-2">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-[#A6362A] font-bold uppercase tracking-wider">DEVELOPED BY</span>
            <span className="text-[#8C8B80]">AI & DS</span>
          </div>
          <p className="text-xs text-white font-semibold flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-[#A6362A]" />
            <span>Sudarson B</span>
          </p>
          <div className="text-[10px] space-y-0.5 text-[#8C8B80]">
            <p className="truncate flex items-center gap-1 hover:text-white transition-colors">
              <Mail className="w-3 h-3 text-[#2F6E5C]" />
              <a href="mailto:sudarsonbalu@gmail.com">sudarsonbalu@gmail.com</a>
            </p>
            <p className="flex items-center gap-1 hover:text-white transition-colors">
              <Phone className="w-3 h-3 text-[#2F6E5C]" />
              <a href="tel:+919361138890">+91 9361138890</a>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-0.5 text-[10px]">
          <span className="text-white font-medium">NASA GRC C-MAPSS</span>
          <span className="text-[#2F6E5C] bg-[#2F6E5C]/15 px-1 py-0.5 border border-[#2F6E5C]/30">ONLINE</span>
        </div>
      </div>
    </aside>
  );
};

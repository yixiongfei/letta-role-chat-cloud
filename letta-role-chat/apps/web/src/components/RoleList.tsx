import React from 'react';
import { Role } from '../types';
import { UserCircle, Plus } from 'lucide-react';

interface RoleListProps {
  roles: Role[];
  selectedRoleId?: string;
  onSelectRole: (role: Role) => void;
  onCreateClick: () => void;
}

export const RoleList: React.FC<RoleListProps> = ({ roles, selectedRoleId, onSelectRole, onCreateClick }) => {
  return (
    <div className="w-64 bg-gray-50 border-r h-full flex flex-col">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="font-bold text-gray-700">Agents</h2>
        <button 
          onClick={onCreateClick}
          className="p-1 hover:bg-gray-200 rounded-full transition-colors"
        >
          <Plus size={20} className="text-blue-600" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {roles.map((role) => (
          <div
            key={role.id}
            onClick={() => onSelectRole(role)}
            className={`p-4 cursor-pointer flex items-center gap-3 hover:bg-gray-100 transition-colors ${
              selectedRoleId === role.id ? 'bg-blue-50 border-r-4 border-blue-500' : ''
            }`}
          >
            <UserCircle className="text-gray-400" size={32} />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{role.name}</p>
              <p className="text-xs text-gray-500 truncate">{role.persona}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

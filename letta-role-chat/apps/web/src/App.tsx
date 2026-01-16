import { useState, useEffect } from 'react';
import { RoleList } from './components/RoleList';
import { ChatWindow } from './components/ChatWindow';
import { RoleEditor } from './components/RoleEditor';
import { Role } from './types';
import { api } from './services/api';
import { MessageSquare } from 'lucide-react';

function App() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      const data = await api.getRoles();
      setRoles(data);
      if (data.length > 0 && !selectedRole) {
        setSelectedRole(data[0]);
      }
    } catch (error) {
      console.error('Failed to load roles', error);
    }
  };

  const handleCreateRole = async (roleData: { name: string; persona: string; human: string }) => {
    try {
      const newRole = await api.createRole(roleData);
      setRoles(prev => [...prev, newRole]);
      setSelectedRole(newRole);
      setIsEditorOpen(false);
    } catch (error) {
      console.error('Failed to create role', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
      <RoleList 
        roles={roles} 
        selectedRoleId={selectedRole?.id} 
        onSelectRole={setSelectedRole}
        onCreateClick={() => setIsEditorOpen(true)}
      />
      
      <main className="flex-1 flex flex-col min-w-0">
        {selectedRole ? (
          <ChatWindow role={selectedRole} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <MessageSquare size={64} className="mb-4 opacity-20" />
            <p className="text-lg">Select an agent to start chatting</p>
            <button 
              onClick={() => setIsEditorOpen(true)}
              className="mt-4 text-blue-600 hover:underline"
            >
              or create a new one
            </button>
          </div>
        )}
      </main>

      {isEditorOpen && (
        <RoleEditor 
          onSave={handleCreateRole} 
          onClose={() => setIsEditorOpen(false)} 
        />
      )}
    </div>
  );
}

export default App;

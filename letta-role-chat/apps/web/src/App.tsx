import { useState, useEffect } from 'react';
import { RoleList } from './components/RoleList';
import { ChatWindow } from './components/ChatWindow';
import { RoleEditor } from './components/RoleEditor';
import { Role } from './types';
import { api } from './services/api';
import { MessageSquare, RefreshCw } from 'lucide-react';

function App() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

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

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await api.syncRoles();
      await loadRoles();
    } catch (error) {
      console.error('Sync failed', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCreateRole = async (roleData: { name: string; persona: string; human: string }) => {
    try {
      const newRole = await api.createRole(roleData);
      setRoles(prev => [newRole, ...prev]);
      setSelectedRole(newRole);
      setIsEditorOpen(false);
    } catch (error) {
      console.error('Failed to create role', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
      <div className="flex flex-col border-r bg-gray-50">
        <div className="p-4 border-b flex items-center justify-between bg-white">
          <h1 className="font-bold text-xl text-blue-600">Letta Chat</h1>
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${isSyncing ? 'animate-spin text-blue-400' : 'text-gray-500'}`}
            title="Sync from Letta Cloud"
          >
            <RefreshCw size={20} />
          </button>
        </div>
        <RoleList 
          roles={roles} 
          selectedRoleId={selectedRole?.id} 
          onSelectRole={setSelectedRole}
          onCreateClick={() => setIsEditorOpen(true)}
        />
      </div>
      
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

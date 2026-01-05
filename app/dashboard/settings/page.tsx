import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar activePage="settings" />
      
      <div className="flex-1 ml-64">
        <DashboardHeader title="Settings" />
        
        <main className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>
              <p className="text-gray-600">Settings functionality coming soon.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
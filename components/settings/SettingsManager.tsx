import { useState } from 'react';
import { ProfileSettings } from './ProfileSettings';
import { SecuritySettings } from './SecuritySettings';
import { PreferenceSettings } from './PreferenceSettings';
import { LinkedAccounts } from './LinkedAccounts';

export function SettingsManager() {
  const [activeTab, setActiveTab] = useState('profile');

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings />;
      case 'security':
        return <SecuritySettings />;
      case 'preferences':
        return <PreferenceSettings />;
      case 'linked-accounts':
        return <LinkedAccounts />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex space-x-4">
        {/* Tab navigation */}
      </div>
      {renderContent()}
    </div>
  );
}
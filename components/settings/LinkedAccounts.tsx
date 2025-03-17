import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function LinkedAccounts() {
  const { data: session } = useSession();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Linked Accounts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Add your linked accounts content here */}
          <p>Manage your linked social accounts and external services.</p>
        </div>
      </CardContent>
    </Card>
  );
}
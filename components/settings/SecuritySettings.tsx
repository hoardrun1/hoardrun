import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Shield, Key, Smartphone, Eye } from 'lucide-react';

export function SecuritySettings() {
  const [securityScore, setSecurityScore] = useState(85);
  const [securityFeatures, setSecurityFeatures] = useState([
    {
      title: '2FA Authentication',
      icon: Shield,
      status: 'enabled',
      action: 'Configure'
    },
    {
      title: 'Biometric Login',
      icon: Smartphone,
      status: 'available',
      action: 'Enable'
    },
    {
      title: 'Password Manager',
      icon: Key,
      status: 'disabled',
      action: 'Setup'
    },
    {
      title: 'Privacy Settings',
      icon: Eye,
      status: 'enabled',
      action: 'Review'
    }
  ]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Security Score</CardTitle>
          <CardDescription>Your account security status</CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={securityScore} className="h-2" />
          <p className="mt-2 text-sm text-muted-foreground">
            Your account is {securityScore}% secure. Complete the recommended actions to improve your security.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {securityFeatures.map((feature, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <feature.icon className="h-5 w-5" />
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </div>
              <CardDescription>
                Status: <span className="capitalize">{feature.status}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant={feature.status === 'enabled' ? 'outline' : 'default'}>
                {feature.action}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      setSuccess('密码已修改');
      setOldPassword('');
      setNewPassword('');
    } catch {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-lg">
      <h1 className="text-2xl font-bold mb-6">个人中心</h1>

      <Card>
        <CardHeader>
          <CardTitle>修改密码</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="password"
            placeholder="原密码"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
          <Input
            type="password"
            placeholder="新密码（至少6位）"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleChangePassword()}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}
          <Button className="w-full" onClick={handleChangePassword} disabled={loading}>
            {loading ? '修改中...' : '确认修改'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

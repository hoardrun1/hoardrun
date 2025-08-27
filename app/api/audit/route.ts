import { NextResponse } from 'next/server';
import { AuditService } from '@/lib/audit-service'
import { getCustomSession } from '@/lib/auth-session'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const session = await getCustomSession();
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const logs = await AuditService.getUserLogs(session.user.id);
    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}

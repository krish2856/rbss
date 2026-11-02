import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { memoryStore, pool, isUsingPostgres } from '../db/db';

export async function getDashboardMetrics(req: Request, res: Response): Promise<void> {
  let totalMembers = 0;
  let pendingApprovals = 0;
  let matrimonyProfiles = 0;
  let upcomingEvents = 0;
  let totalDonations = 0;
  let totalExpenses = 0;

  if (isUsingPostgres && pool) {
    const resM = await pool.query(`SELECT COUNT(*)::int as count FROM users WHERE role = 'member'`);
    totalMembers = resM.rows[0]?.count || 0;

    const resP = await pool.query(`SELECT COUNT(*)::int as count FROM users WHERE is_approved = false`);
    pendingApprovals = resP.rows[0]?.count || 0;

    const resMat = await pool.query(`SELECT COUNT(*)::int as count FROM matrimony_profiles WHERE is_approved = true`);
    matrimonyProfiles = resMat.rows[0]?.count || 0;

    const resEv = await pool.query(`SELECT COUNT(*)::int as count FROM events WHERE end_time >= NOW()`);
    upcomingEvents = resEv.rows[0]?.count || 0;

    const resD = await pool.query(`SELECT COALESCE(SUM(amount), 0)::float as sum FROM donations WHERE payment_status = 'completed'`);
    totalDonations = resD.rows[0]?.sum || 0;

    const resExp = await pool.query(`SELECT COALESCE(SUM(amount), 0)::float as sum FROM expenses`);
    totalExpenses = resExp.rows[0]?.sum || 0;
  } else {
    totalMembers = memoryStore.users.filter((u) => u.is_approved).length;
    pendingApprovals = memoryStore.users.filter((u) => !u.is_approved).length;
    matrimonyProfiles = memoryStore.matrimony_profiles.length;
    upcomingEvents = memoryStore.events.length;
    totalDonations = memoryStore.donations.reduce((sum, d) => sum + Number(d.amount), 0);
    totalExpenses = memoryStore.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  }

  res.json({
    success: true,
    metrics: {
      totalMembers,
      pendingApprovals,
      matrimonyProfiles,
      upcomingEvents,
      totalDonations,
      totalExpenses,
      netTreasuryBalance: totalDonations - totalExpenses,
      totalBloodDonors: memoryStore.blood_donors.length,
      totalBusinesses: memoryStore.businesses.length,
    },
  });
}

export async function getPendingMembers(req: Request, res: Response): Promise<void> {
  let pendingList: any[] = [];

  if (isUsingPostgres && pool) {
    const result = await pool.query(`
      SELECT u.id, u.phone, u.created_at, mp.*
      FROM users u
      LEFT JOIN member_profiles mp ON u.id = mp.user_id
      WHERE u.is_approved = false
      ORDER BY u.created_at DESC
    `);
    pendingList = result.rows;
  } else {
    pendingList = memoryStore.users
      .filter((u) => !u.is_approved)
      .map((u) => {
        const prof = memoryStore.member_profiles.find((p) => p.user_id === u.id);
        return {
          id: u.id,
          phone: u.phone,
          created_at: u.created_at,
          ...prof,
        };
      });
  }

  res.json({ success: true, pendingMembers: pendingList });
}

export async function approveMember(req: Request, res: Response): Promise<void> {
  const { userId } = req.params;
  const adminId = req.user?.id || 'admin';

  if (isUsingPostgres && pool) {
    await pool.query(`UPDATE users SET is_approved = true WHERE id = $1`, [userId]);
    await pool.query(
      `INSERT INTO audit_logs (id, admin_id, action, target_type, target_id)
       VALUES ($1, $2, 'APPROVE_MEMBER', 'user', $3)`,
      [uuidv4(), adminId, userId]
    );
  } else {
    const user = memoryStore.users.find((u) => u.id === userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    user.is_approved = true;
    memoryStore.audit_logs.unshift({
      id: `al-${uuidv4().substring(0, 8)}`,
      admin_id: adminId,
      action: 'APPROVE_MEMBER',
      target_type: 'user',
      target_id: userId,
      details: { verified_phone: user.phone, verified_village: '' },
      ip_address: (req.ip || '127.0.0.1') as any,
      created_at: new Date(),
    } as any);
  }

  res.json({ success: true, message: 'Member verified and approved successfully.' });
}

export async function rejectMember(req: Request, res: Response): Promise<void> {
  const { userId } = req.params;
  const adminId = req.user?.id || 'admin';

  if (isUsingPostgres && pool) {
    await pool.query(`DELETE FROM users WHERE id = $1`, [userId]);
  } else {
    const idx = memoryStore.users.findIndex((u) => u.id === userId);
    if (idx !== -1) {
      memoryStore.users.splice(idx, 1);
    }
  }

  res.json({ success: true, message: 'Application declined.' });
}

export async function updateUserRole(req: Request, res: Response): Promise<void> {
  const { userId, role } = req.body;
  const validRoles = ['super_admin', 'president', 'secretary', 'treasurer', 'committee', 'member'];

  if (!userId || !validRoles.includes(role)) {
    res.status(400).json({ success: false, message: `Invalid userId or role. Allowed: ${validRoles.join(', ')}` });
    return;
  }

  if (isUsingPostgres && pool) {
    await pool.query(`UPDATE users SET role = $1 WHERE id = $2`, [role, userId]);
  } else {
    const user = memoryStore.users.find((u) => u.id === userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    (user as any).role = role;
  }

  res.json({ success: true, message: `User role updated to ${role}.` });
}

export async function getAuditLogs(req: Request, res: Response): Promise<void> {
  let logs: any[] = [];
  if (isUsingPostgres && pool) {
    const resLogs = await pool.query(`
      SELECT al.*, u.phone as admin_phone, mp.full_name as admin_name
      FROM audit_logs al
      LEFT JOIN users u ON al.admin_id = u.id
      LEFT JOIN member_profiles mp ON u.id = mp.user_id
      ORDER BY al.created_at DESC LIMIT 100
    `);
    logs = resLogs.rows;
  } else {
    logs = memoryStore.audit_logs.map((al) => {
      const u = memoryStore.users.find((x) => x.id === al.admin_id);
      const prof = memoryStore.member_profiles.find((p) => p.user_id === al.admin_id);
      return {
        ...al,
        admin_phone: u?.phone || 'admin',
        admin_name: prof?.full_name || 'System Admin',
      };
    });
  }

  res.json({ success: true, logs });
}

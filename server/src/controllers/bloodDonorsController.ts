import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { memoryStore, pool, isUsingPostgres } from '../db/db';

export async function getBloodDonors(req: Request, res: Response): Promise<void> {
  const { blood_group, city } = req.query;

  let list: any[] = [];
  if (isUsingPostgres && pool) {
    let sql = `SELECT * FROM blood_donors WHERE is_available = true`;
    const params: any[] = [];
    let idx = 1;

    if (blood_group) {
      sql += ` AND blood_group = $${idx}`;
      params.push(blood_group);
      idx++;
    }
    if (city) {
      sql += ` AND city ILIKE $${idx}`;
      params.push(`%${city}%`);
      idx++;
    }

    sql += ` ORDER BY full_name ASC`;
    const result = await pool.query(sql, params);
    list = result.rows;
  } else {
    list = memoryStore.blood_donors.filter((bd) => {
      if (!bd.is_available) return false;
      if (blood_group && bd.blood_group !== blood_group) return false;
      if (city && !bd.city.toLowerCase().includes((city as string).toLowerCase())) return false;
      return true;
    });
  }

  res.json({ success: true, donors: list });
}

export async function registerBloodDonor(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { full_name, blood_group, city, phone, emergency_notes } = req.body;
  if (!full_name || !blood_group || !city || !phone) {
    res.status(400).json({ success: false, message: 'Name, blood group, city and phone are required.' });
    return;
  }

  const id = `bd-${uuidv4().substring(0, 8)}`;
  const donor = {
    id,
    user_id: req.user.id,
    full_name,
    blood_group,
    city,
    phone,
    is_available: true,
    last_donated_date: new Date().toISOString().split('T')[0],
    emergency_notes: emergency_notes || 'Registered volunteer',
  };

  if (isUsingPostgres && pool) {
    await pool.query(
      `INSERT INTO blood_donors (id, user_id, full_name, blood_group, city, phone, is_available, last_donated_date, emergency_notes)
       VALUES ($1, $2, $3, $4, $5, $6, true, CURRENT_DATE, $7)
       ON CONFLICT (id) DO NOTHING`,
      [id, req.user.id, full_name, blood_group, city, phone, donor.emergency_notes]
    );
  } else {
    memoryStore.blood_donors.push(donor);
  }

  res.status(201).json({ success: true, message: 'Thank you for registering as a voluntary blood donor.', donor });
}

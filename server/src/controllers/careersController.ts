import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { memoryStore, pool, isUsingPostgres } from '../db/db';

export async function getCareers(req: Request, res: Response): Promise<void> {
  const { type } = req.query; // 'scholarship' | 'job' | 'internship' | 'guidance'

  let list: any[] = [];
  if (isUsingPostgres && pool) {
    let sql = `SELECT * FROM education_careers WHERE 1=1`;
    const params: any[] = [];
    if (type) {
      sql += ` AND type = $1`;
      params.push(type);
    }
    sql += ` ORDER BY created_at DESC`;
    const result = await pool.query(sql, params);
    list = result.rows;
  } else {
    list = memoryStore.education_careers
      .filter((c) => (type ? c.type === type : true))
      .sort((a, b) => (a.deadline ? a.deadline.localeCompare(b.deadline) : 0));
  }

  res.json({ success: true, items: list });
}

export async function createCareer(req: Request, res: Response): Promise<void> {
  const { type, title, organization, description, eligibility, apply_link, contact_info, deadline } = req.body;
  if (!type || !title || !description) {
    res.status(400).json({ success: false, message: 'Type, title, and description are required.' });
    return;
  }

  const id = `ec-${uuidv4().substring(0, 8)}`;
  const item = {
    id,
    type,
    title,
    organization: organization || 'Rajgor Samaj Education Cell',
    description,
    eligibility: eligibility || '',
    apply_link: apply_link || '',
    contact_info: contact_info || '',
    deadline: deadline || '2026-12-31',
  };

  if (isUsingPostgres && pool) {
    await pool.query(
      `INSERT INTO education_careers (id, type, title, organization, description, eligibility, apply_link, contact_info, deadline)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [id, type, title, item.organization, description, item.eligibility, item.apply_link, item.contact_info, item.deadline]
    );
  } else {
    memoryStore.education_careers.unshift(item as any);
  }

  res.status(201).json({ success: true, message: 'Opportunity posted.', item });
}

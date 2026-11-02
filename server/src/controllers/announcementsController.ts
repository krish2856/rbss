import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { memoryStore, pool, isUsingPostgres } from '../db/db';

export async function getAnnouncements(req: Request, res: Response): Promise<void> {
  const { category, urgent } = req.query;

  let list: any[] = [];

  if (isUsingPostgres && pool) {
    let sql = `SELECT * FROM announcements WHERE 1=1`;
    const params: any[] = [];
    let idx = 1;

    if (category) {
      sql += ` AND category = $${idx}`;
      params.push(category);
      idx++;
    }
    if (urgent === 'true') {
      sql += ` AND is_urgent = true`;
    }

    sql += ` ORDER BY is_pinned DESC, is_urgent DESC, publish_date DESC`;
    const result = await pool.query(sql, params);
    list = result.rows;
  } else {
    list = memoryStore.announcements
      .filter((a) => {
        if (category && a.category !== category) return false;
        if (urgent === 'true' && !a.is_urgent) return false;
        return true;
      })
      .sort((a, b) => {
        if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
        if (a.is_urgent !== b.is_urgent) return a.is_urgent ? -1 : 1;
        return new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime();
      });
  }

  res.json({ success: true, announcements: list });
}

export async function createAnnouncement(req: Request, res: Response): Promise<void> {
  const { title, title_gu, category, content, image_url, is_pinned, is_urgent } = req.body;

  if (!title || !category || !content) {
    res.status(400).json({ success: false, message: 'Title, category, and content are required.' });
    return;
  }

  const id = `anc-${uuidv4().substring(0, 8)}`;
  const item = {
    id,
    title,
    title_gu: title_gu || title,
    category,
    content,
    image_url: image_url || '',
    is_pinned: !!is_pinned,
    is_urgent: !!is_urgent,
    publish_date: new Date(),
    created_by: req.user?.id || 'admin',
  };

  if (isUsingPostgres && pool) {
    await pool.query(
      `INSERT INTO announcements (id, title, title_gu, category, content, image_url, is_pinned, is_urgent, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [id, title, item.title_gu, category, content, item.image_url, item.is_pinned, item.is_urgent, item.created_by]
    );
  } else {
    memoryStore.announcements.unshift(item);
  }

  res.status(201).json({ success: true, message: 'Announcement published.', announcement: item });
}

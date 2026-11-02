import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { memoryStore, pool, isUsingPostgres } from '../db/db';

export async function getEvents(req: Request, res: Response): Promise<void> {
  const { category, type } = req.query; // type: 'upcoming' | 'past'

  let list: any[] = [];
  const now = new Date();

  if (isUsingPostgres && pool) {
    let sql = `
      SELECT e.*, COUNT(r.id)::int as rsvp_count
      FROM events e
      LEFT JOIN event_rsvps r ON e.id = r.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let idx = 1;

    if (category) {
      sql += ` AND e.category = $${idx}`;
      params.push(category);
      idx++;
    }
    if (type === 'upcoming') {
      sql += ` AND e.end_time >= NOW()`;
    } else if (type === 'past') {
      sql += ` AND e.end_time < NOW()`;
    }

    sql += ` GROUP BY e.id ORDER BY e.start_time ASC`;
    const result = await pool.query(sql, params);
    list = result.rows;
  } else {
    list = memoryStore.events
      .filter((e) => {
        if (category && e.category !== category) return false;
        const endTime = new Date(e.end_time);
        if (type === 'upcoming' && endTime < now) return false;
        if (type === 'past' && endTime >= now) return false;
        return true;
      })
      .map((e) => {
        const count = memoryStore.event_rsvps.filter((r) => r.event_id === e.id).length;
        const userRsvp = req.user
          ? memoryStore.event_rsvps.find((r) => r.event_id === e.id && r.user_id === req.user?.id)
          : null;
        return {
          ...e,
          rsvp_count: count,
          is_registered: !!userRsvp,
        };
      })
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  }

  res.json({ success: true, events: list });
}

export async function getEventById(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  let event: any = null;

  if (isUsingPostgres && pool) {
    const resEv = await pool.query(`SELECT * FROM events WHERE id = $1`, [id]);
    event = resEv.rows[0];
  } else {
    event = memoryStore.events.find((e) => e.id === id);
  }

  if (!event) {
    res.status(404).json({ success: false, message: 'Event not found.' });
    return;
  }

  const rsvps = memoryStore.event_rsvps.filter((r) => r.event_id === id);
  const myRsvp = req.user ? rsvps.find((r) => r.user_id === req.user?.id) : null;

  res.json({
    success: true,
    event: {
      ...event,
      total_rsvps: rsvps.length,
      is_registered: !!myRsvp,
      my_rsvp: myRsvp,
    },
  });
}

export async function rsvpEvent(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { id } = req.params;
  const { guest_count, notes } = req.body;
  const userId = req.user.id;
  const rsvpId = `rsvp-${uuidv4().substring(0, 8)}`;

  if (isUsingPostgres && pool) {
    await pool.query(
      `INSERT INTO event_rsvps (id, event_id, user_id, guest_count, notes, status)
       VALUES ($1, $2, $3, $4, $5, 'confirmed')
       ON CONFLICT (event_id, user_id) DO UPDATE SET
         guest_count = EXCLUDED.guest_count,
         notes = EXCLUDED.notes`,
      [rsvpId, id, userId, guest_count || 1, notes || '']
    );
  } else {
    const existing = memoryStore.event_rsvps.find((r) => r.event_id === id && r.user_id === userId);
    if (existing) {
      existing.guest_count = guest_count || 1;
      existing.notes = notes || existing.notes;
    } else {
      memoryStore.event_rsvps.push({
        id: rsvpId,
        event_id: id,
        user_id: userId,
        guest_count: guest_count || 1,
        notes: notes || '',
        status: 'confirmed',
        created_at: new Date(),
      });
    }
  }

  res.json({ success: true, message: 'Registration confirmed for event.' });
}

export async function createEvent(req: Request, res: Response): Promise<void> {
  const {
    title,
    title_gu,
    description,
    category,
    venue_name,
    address,
    city,
    start_time,
    end_time,
    banner_url,
    max_attendees,
  } = req.body;

  if (!title || !description || !venue_name || !city || !start_time || !end_time) {
    res.status(400).json({ success: false, message: 'Title, description, venue, city, and dates are required.' });
    return;
  }

  const eventId = `ev-${uuidv4().substring(0, 8)}`;
  const newEv = {
    id: eventId,
    title,
    title_gu: title_gu || title,
    description,
    category: category || 'cultural',
    venue_name,
    address: address || '',
    city,
    start_time: new Date(start_time),
    end_time: new Date(end_time),
    banner_url: banner_url || 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1000&fit=crop&q=80',
    max_attendees: max_attendees || 500,
    registration_open: true,
    created_by: req.user?.id || 'admin',
  };

  if (isUsingPostgres && pool) {
    await pool.query(
      `INSERT INTO events (
        id, title, title_gu, description, category, venue_name, address, city,
        start_time, end_time, banner_url, max_attendees, created_by
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [
        newEv.id,
        newEv.title,
        newEv.title_gu,
        newEv.description,
        newEv.category,
        newEv.venue_name,
        newEv.address,
        newEv.city,
        newEv.start_time,
        newEv.end_time,
        newEv.banner_url,
        newEv.max_attendees,
        newEv.created_by,
      ]
    );
  } else {
    memoryStore.events.push(newEv as any);
  }

  res.status(201).json({ success: true, message: 'Event published.', event: newEv });
}

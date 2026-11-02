import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { memoryStore, pool, isUsingPostgres } from '../db/db';

export async function getBusinesses(req: Request, res: Response): Promise<void> {
  const { category, city, search } = req.query;

  let list: any[] = [];
  if (isUsingPostgres && pool) {
    let sql = `SELECT * FROM businesses WHERE is_approved = true`;
    const params: any[] = [];
    let idx = 1;

    if (category) {
      sql += ` AND category ILIKE $${idx}`;
      params.push(`%${category}%`);
      idx++;
    }
    if (city) {
      sql += ` AND city ILIKE $${idx}`;
      params.push(`%${city}%`);
      idx++;
    }
    if (search) {
      sql += ` AND (business_name ILIKE $${idx} OR description ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }

    sql += ` ORDER BY created_at DESC`;
    const result = await pool.query(sql, params);
    list = result.rows;
  } else {
    list = memoryStore.businesses.filter((b) => {
      if (!b.is_approved) return false;
      if (category && !b.category.toLowerCase().includes((category as string).toLowerCase())) return false;
      if (city && !b.city.toLowerCase().includes((city as string).toLowerCase())) return false;
      if (
        search &&
        !b.business_name.toLowerCase().includes((search as string).toLowerCase()) &&
        !b.description.toLowerCase().includes((search as string).toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }

  res.json({ success: true, businesses: list });
}

export async function createBusiness(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { business_name, category, description, address, city, phone, email, website, instagram, logo_url } = req.body;
  if (!business_name || !category || !description || !city || !phone) {
    res.status(400).json({ success: false, message: 'Business name, category, description, city, and phone are required.' });
    return;
  }

  const id = `biz-${uuidv4().substring(0, 8)}`;
  const item = {
    id,
    user_id: req.user.id,
    business_name,
    category,
    description,
    address: address || '',
    city,
    phone,
    email: email || '',
    website: website || '',
    instagram: instagram || '',
    logo_url: logo_url || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=300&fit=crop&q=80',
    is_approved: true, // auto-approve or admin approve
    created_at: new Date(),
  };

  if (isUsingPostgres && pool) {
    await pool.query(
      `INSERT INTO businesses (id, user_id, business_name, category, description, address, city, phone, email, website, instagram, logo_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [id, item.user_id, business_name, category, description, item.address, city, phone, item.email, item.website, item.instagram, item.logo_url]
    );
  } else {
    memoryStore.businesses.unshift(item);
  }

  res.status(201).json({ success: true, message: 'Business listing added.', business: item });
}

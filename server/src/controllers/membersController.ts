import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { memoryStore, pool, isUsingPostgres } from '../db/db';

export async function getMembers(req: Request, res: Response): Promise<void> {
  const { search, city, village, gotra, profession, page = 1, limit = 20 } = req.query;

  const isAdmin = req.user && ['super_admin', 'president', 'secretary', 'treasurer', 'committee'].includes(req.user.role);

  let profiles: any[] = [];

  if (isUsingPostgres && pool) {
    let sql = `
      SELECT mp.*, u.phone, u.is_approved, u.role
      FROM member_profiles mp
      JOIN users u ON mp.user_id = u.id
      WHERE u.is_approved = true
    `;
    const params: any[] = [];
    let idx = 1;

    if (search) {
      sql += ` AND (mp.full_name ILIKE $${idx} OR mp.surname ILIKE $${idx} OR mp.native_village ILIKE $${idx} OR mp.current_city ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }
    if (city) {
      sql += ` AND mp.current_city ILIKE $${idx}`;
      params.push(`%${city}%`);
      idx++;
    }
    if (village) {
      sql += ` AND mp.native_village ILIKE $${idx}`;
      params.push(`%${village}%`);
      idx++;
    }
    if (gotra) {
      sql += ` AND mp.gotra ILIKE $${idx}`;
      params.push(`%${gotra}%`);
      idx++;
    }
    if (profession) {
      sql += ` AND (mp.occupation ILIKE $${idx} OR mp.education ILIKE $${idx})`;
      params.push(`%${profession}%`);
      idx++;
    }

    sql += ` ORDER BY mp.full_name ASC LIMIT $${idx} OFFSET $${idx + 1}`;
    params.push(Number(limit), (Number(page) - 1) * Number(limit));

    const result = await pool.query(sql, params);
    profiles = result.rows;
  } else {
    // In-memory filter
    profiles = memoryStore.member_profiles
      .filter((p) => {
        const user = memoryStore.users.find((u) => u.id === p.user_id);
        if (!user || (!user.is_approved && !isAdmin)) return false;

        const q = (search as string || '').toLowerCase();
        if (
          q &&
          !p.full_name.toLowerCase().includes(q) &&
          !p.surname.toLowerCase().includes(q) &&
          !p.native_village.toLowerCase().includes(q) &&
          !p.current_city.toLowerCase().includes(q)
        ) {
          return false;
        }

        if (city && !p.current_city.toLowerCase().includes((city as string).toLowerCase())) return false;
        if (village && !p.native_village.toLowerCase().includes((village as string).toLowerCase())) return false;
        if (gotra && !p.gotra.toLowerCase().includes((gotra as string).toLowerCase())) return false;
        if (profession && !(p.occupation || '').toLowerCase().includes((profession as string).toLowerCase())) return false;

        return true;
      })
      .map((p) => {
        const user = memoryStore.users.find((u) => u.id === p.user_id);
        return {
          ...p,
          phone: user?.phone,
          is_approved: user?.is_approved,
          role: user?.role,
        };
      });
  }

  // Mask private phone numbers if requester is not admin and privacy enabled
  const sanitized = profiles.map((p) => {
    const isOwner = req.user && req.user.id === p.user_id;
    const canSeePhone = isAdmin || isOwner || p.phone_visible;
    return {
      ...p,
      phone: canSeePhone ? p.phone : (p.phone ? `${p.phone.substring(0, 3)}****${p.phone.substring(7)}` : ''),
      is_phone_masked: !canSeePhone,
    };
  });

  res.json({
    success: true,
    total: sanitized.length,
    page: Number(page),
    members: sanitized,
  });
}

export async function getMemberById(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const isAdmin = req.user && ['super_admin', 'president', 'secretary', 'treasurer', 'committee'].includes(req.user.role);

  let profile: any = null;
  let family: any[] = [];

  if (isUsingPostgres && pool) {
    const resProf = await pool.query(
      `SELECT mp.*, u.phone, u.is_approved, u.role
       FROM member_profiles mp
       JOIN users u ON mp.user_id = u.id
       WHERE mp.id = $1 OR mp.user_id = $1`,
      [id]
    );
    profile = resProf.rows[0];
    if (profile) {
      const resFam = await pool.query(`SELECT * FROM family_details WHERE member_id = $1`, [profile.id]);
      family = resFam.rows;
    }
  } else {
    profile = memoryStore.member_profiles.find((p) => p.id === id || p.user_id === id);
    if (profile) {
      const user = memoryStore.users.find((u) => u.id === profile.user_id);
      profile = {
        ...profile,
        phone: user?.phone,
        is_approved: user?.is_approved,
        role: user?.role,
      };
      family = memoryStore.family_details.filter((f) => f.member_id === profile.id);
    }
  }

  if (!profile) {
    res.status(404).json({ success: false, message: 'Member profile not found.' });
    return;
  }

  const isOwner = req.user && req.user.id === profile.user_id;
  const canSeePhone = isAdmin || isOwner || profile.phone_visible;

  res.json({
    success: true,
    member: {
      ...profile,
      phone: canSeePhone ? profile.phone : `${profile.phone?.substring(0, 3)}****${profile.phone?.substring(7)}`,
      is_phone_masked: !canSeePhone,
      family,
    },
  });
}

export async function updateProfile(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const userId = req.user.id;
  const updateData = req.body;

  if (isUsingPostgres && pool) {
    await pool.query(
      `UPDATE member_profiles SET
        full_name = COALESCE($1, full_name),
        father_name = COALESCE($2, father_name),
        surname = COALESCE($3, surname),
        gotra = COALESCE($4, gotra),
        kuldevi = COALESCE($5, kuldevi),
        native_village = COALESCE($6, native_village),
        current_city = COALESCE($7, current_city),
        education = COALESCE($8, education),
        occupation = COALESCE($9, occupation),
        company_or_business = COALESCE($10, company_or_business),
        blood_group = COALESCE($11, blood_group),
        phone_visible = COALESCE($12, phone_visible),
        bio = COALESCE($13, bio),
        photo_url = COALESCE($14, photo_url),
        address = COALESCE($15, address),
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $16`,
      [
        updateData.full_name,
        updateData.father_name,
        updateData.surname,
        updateData.gotra,
        updateData.kuldevi,
        updateData.native_village,
        updateData.current_city,
        updateData.education,
        updateData.occupation,
        updateData.company_or_business,
        updateData.blood_group,
        updateData.phone_visible,
        updateData.bio,
        updateData.photo_url,
        updateData.address,
        userId,
      ]
    );
  } else {
    const profile = memoryStore.member_profiles.find((p) => p.user_id === userId);
    if (!profile) {
      res.status(404).json({ success: false, message: 'Profile not found' });
      return;
    }
    Object.assign(profile, updateData);
  }

  res.json({ success: true, message: 'Profile updated successfully.' });
}

export async function addFamilyMember(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { full_name, relation, age, education, occupation } = req.body;
  if (!full_name || !relation) {
    res.status(400).json({ success: false, message: 'Full name and relation are required.' });
    return;
  }

  let profile = memoryStore.member_profiles.find((p) => p.user_id === req.user?.id);
  const memberId = profile ? profile.id : req.user.id;
  const famId = `fd-${uuidv4().substring(0, 8)}`;

  const newFam = {
    id: famId,
    member_id: memberId,
    full_name,
    relation,
    age: age ? Number(age) : null,
    education: education || '',
    occupation: occupation || '',
    marital_status: 'Single',
  };

  if (isUsingPostgres && pool) {
    await pool.query(
      `INSERT INTO family_details (id, member_id, full_name, relation, age, education, occupation)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [famId, memberId, full_name, relation, newFam.age, education || '', occupation || '']
    );
  } else {
    memoryStore.family_details.push(newFam as any);
  }

  res.status(201).json({ success: true, message: 'Family member added.', familyMember: newFam });
}

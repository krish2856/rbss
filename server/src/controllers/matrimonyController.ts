import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { memoryStore, pool, isUsingPostgres } from '../db/db';

export async function getMatrimonyProfiles(req: Request, res: Response): Promise<void> {
  const { gender, minAge, maxAge, gotra, manglik, city, education } = req.query;

  let profiles: any[] = [];

  if (isUsingPostgres && pool) {
    let sql = `
      SELECT mp.*, prof.full_name, prof.surname, prof.gotra, prof.kuldevi,
             prof.gender, prof.dob, prof.native_village, prof.current_city,
             prof.education, prof.occupation, prof.blood_group, prof.photo_url as default_photo,
             u.phone
      FROM matrimony_profiles mp
      JOIN member_profiles prof ON mp.member_id = prof.id
      JOIN users u ON mp.user_id = u.id
      WHERE mp.is_approved = true AND mp.is_hidden = false
    `;
    const params: any[] = [];
    let idx = 1;

    if (gender) {
      sql += ` AND prof.gender = $${idx}`;
      params.push(gender);
      idx++;
    }
    if (gotra) {
      sql += ` AND prof.gotra ILIKE $${idx}`;
      params.push(`%${gotra}%`);
      idx++;
    }
    if (manglik) {
      sql += ` AND mp.manglik = $${idx}`;
      params.push(manglik);
      idx++;
    }
    if (city) {
      sql += ` AND prof.current_city ILIKE $${idx}`;
      params.push(`%${city}%`);
      idx++;
    }

    sql += ` ORDER BY mp.is_featured DESC, mp.created_at DESC`;
    const result = await pool.query(sql, params);
    profiles = result.rows;
  } else {
    profiles = memoryStore.matrimony_profiles
      .filter((mat) => mat.is_approved && !mat.is_hidden)
      .map((mat) => {
        const prof = memoryStore.member_profiles.find((p) => p.id === mat.member_id || p.user_id === mat.user_id);
        const user = memoryStore.users.find((u) => u.id === mat.user_id);
        return {
          ...mat,
          full_name: prof?.full_name || 'Samaj Member',
          surname: prof?.surname || '',
          gotra: prof?.gotra || '',
          kuldevi: prof?.kuldevi || '',
          gender: prof?.gender || 'male',
          dob: prof?.dob || '1995-01-01',
          native_village: prof?.native_village || '',
          current_city: prof?.current_city || '',
          education: prof?.education || '',
          occupation: prof?.occupation || '',
          blood_group: prof?.blood_group || '',
          default_photo: prof?.photo_url || '',
          phone: user?.phone || '',
        };
      })
      .filter((p) => {
        if (gender && p.gender !== gender) return false;
        if (gotra && !p.gotra.toLowerCase().includes((gotra as string).toLowerCase())) return false;
        if (manglik && p.manglik !== manglik) return false;
        if (city && !p.current_city.toLowerCase().includes((city as string).toLowerCase())) return false;
        return true;
      });
  }

  // Calculate age and mask contact info unless user has accepted interest
  const sanitized = profiles.map((p) => {
    const birthYear = p.dob ? new Date(p.dob).getFullYear() : 1995;
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;

    // Contact info is hidden by default in matrimony until mutual interest accept
    return {
      ...p,
      age,
      contact_phone: 'Protected (Available after interest accepted)',
      photos: (p.photos && p.photos.length > 0) ? p.photos : [p.default_photo],
    };
  });

  res.json({
    success: true,
    total: sanitized.length,
    profiles: sanitized,
  });
}

export async function getMatrimonyProfileById(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const currentUserId = req.user?.id;

  let mat: any = null;
  let prof: any = null;
  let user: any = null;
  let interestState: any = null;

  if (isUsingPostgres && pool) {
    const resMat = await pool.query(`SELECT * FROM matrimony_profiles WHERE id = $1 OR user_id = $1`, [id]);
    mat = resMat.rows[0];
    if (mat) {
      const resProf = await pool.query(`SELECT * FROM member_profiles WHERE id = $1 OR user_id = $2`, [mat.member_id, mat.user_id]);
      prof = resProf.rows[0];
      const resUser = await pool.query(`SELECT phone FROM users WHERE id = $1`, [mat.user_id]);
      user = resUser.rows[0];

      if (currentUserId) {
        const resInt = await pool.query(
          `SELECT * FROM matrimony_interests WHERE (sender_user_id = $1 AND receiver_user_id = $2) OR (sender_user_id = $2 AND receiver_user_id = $1)`,
          [currentUserId, mat.user_id]
        );
        interestState = resInt.rows[0];
      }
    }
  } else {
    mat = memoryStore.matrimony_profiles.find((m) => m.id === id || m.user_id === id);
    if (mat) {
      prof = memoryStore.member_profiles.find((p) => p.id === mat.member_id || p.user_id === mat.user_id);
      user = memoryStore.users.find((u) => u.id === mat.user_id);

      if (currentUserId) {
        interestState = memoryStore.matrimony_interests.find(
          (mi) =>
            (mi.sender_user_id === currentUserId && mi.receiver_user_id === mat.user_id) ||
            (mi.sender_user_id === mat.user_id && mi.receiver_user_id === currentUserId)
        );
      }
    }
  }

  if (!mat || !prof) {
    res.status(404).json({ success: false, message: 'Matrimony profile not found.' });
    return;
  }

  const birthYear = prof.dob ? new Date(prof.dob).getFullYear() : 1995;
  const age = new Date().getFullYear() - birthYear;

  const isOwner = currentUserId === mat.user_id;
  const isAdmin = req.user && ['super_admin', 'president', 'secretary'].includes(req.user.role);
  const isMutualAccepted = interestState && interestState.status === 'accepted';
  const canSeeContact = isOwner || isAdmin || isMutualAccepted;

  res.json({
    success: true,
    profile: {
      ...mat,
      full_name: prof.full_name,
      surname: prof.surname,
      gotra: prof.gotra,
      kuldevi: prof.kuldevi,
      gender: prof.gender,
      dob: prof.dob,
      age,
      native_village: prof.native_village,
      native_taluka: prof.native_taluka,
      current_city: prof.current_city,
      education: prof.education,
      occupation: prof.occupation,
      company_or_business: prof.company_or_business,
      blood_group: prof.blood_group,
      photos: mat.photos?.length ? mat.photos : [prof.photo_url],
      contact_phone: canSeeContact ? user?.phone : 'Contact locked until interest is accepted',
      canSeeContact,
      interestStatus: interestState ? interestState.status : 'none',
      isSender: interestState ? interestState.sender_user_id === currentUserId : false,
    },
  });
}

export async function upsertMatrimonyProfile(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const userId = req.user.id;
  const {
    height_cm,
    weight_kg,
    complexion,
    rashi,
    nakshatra,
    manglik,
    diet,
    annual_income,
    partner_expectations,
    hobbies,
    photos,
  } = req.body;

  let memberProfile: any = null;
  if (isUsingPostgres && pool) {
    const pRes = await pool.query(`SELECT id FROM member_profiles WHERE user_id = $1`, [userId]);
    memberProfile = pRes.rows[0];
  } else {
    memberProfile = memoryStore.member_profiles.find((p) => p.user_id === userId);
  }

  if (!memberProfile) {
    res.status(400).json({ success: false, message: 'Please create your member profile first.' });
    return;
  }

  const profileId = `mat-${uuidv4().substring(0, 8)}`;

  if (isUsingPostgres && pool) {
    await pool.query(
      `INSERT INTO matrimony_profiles (
        id, user_id, member_id, height_cm, weight_kg, complexion, rashi, nakshatra,
        manglik, diet, annual_income, partner_expectations, hobbies, photos,
        is_verified, is_approved
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
      ON CONFLICT (user_id) DO UPDATE SET
        height_cm = EXCLUDED.height_cm,
        weight_kg = EXCLUDED.weight_kg,
        complexion = EXCLUDED.complexion,
        rashi = EXCLUDED.rashi,
        nakshatra = EXCLUDED.nakshatra,
        manglik = EXCLUDED.manglik,
        diet = EXCLUDED.diet,
        annual_income = EXCLUDED.annual_income,
        partner_expectations = EXCLUDED.partner_expectations,
        hobbies = EXCLUDED.hobbies,
        photos = EXCLUDED.photos,
        updated_at = CURRENT_TIMESTAMP`,
      [
        profileId,
        userId,
        memberProfile.id,
        height_cm || 170,
        weight_kg || 65,
        complexion || 'Fair',
        rashi || 'Mesh',
        nakshatra || '',
        manglik || 'no',
        diet || 'pure_vegetarian',
        annual_income || 'Not disclosed',
        partner_expectations || '',
        hobbies || '',
        photos || [],
        true,
        true,
      ]
    );
  } else {
    const existing = memoryStore.matrimony_profiles.find((m) => m.user_id === userId);
    if (existing) {
      Object.assign(existing, {
        height_cm,
        weight_kg,
        complexion,
        rashi,
        nakshatra,
        manglik,
        diet,
        annual_income,
        partner_expectations,
        hobbies,
        photos: photos || existing.photos,
      });
    } else {
      memoryStore.matrimony_profiles.push({
        id: profileId,
        user_id: userId,
        member_id: memberProfile.id,
        height_cm: height_cm || 170,
        weight_kg: weight_kg || 65,
        complexion: complexion || 'Fair',
        rashi: rashi || 'Mesh',
        nakshatra: nakshatra || '',
        manglik: manglik || 'no',
        diet: diet || 'pure_vegetarian',
        annual_income: annual_income || 'Not disclosed',
        partner_expectations: partner_expectations || '',
        hobbies: hobbies || '',
        biodata_pdf_url: '',
        photos: photos || [],
        is_verified: true,
        is_approved: true,
        is_featured: false,
        is_hidden: false,
        created_at: new Date(),
      });
    }
  }

  res.json({ success: true, message: 'Matrimony biodata published successfully.' });
}

export async function sendInterest(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { receiver_user_id, note } = req.body;
  const sender_user_id = req.user.id;

  if (sender_user_id === receiver_user_id) {
    res.status(400).json({ success: false, message: 'Cannot send interest to yourself.' });
    return;
  }

  const interestId = `mi-${uuidv4().substring(0, 8)}`;

  if (isUsingPostgres && pool) {
    await pool.query(
      `INSERT INTO matrimony_interests (id, sender_user_id, receiver_user_id, note, status)
       VALUES ($1, $2, $3, $4, 'pending')
       ON CONFLICT (sender_user_id, receiver_user_id) DO UPDATE SET
         note = EXCLUDED.note,
         status = 'pending',
         updated_at = CURRENT_TIMESTAMP`,
      [interestId, sender_user_id, receiver_user_id, note || 'Jay Parshuram. We are interested in your biodata.']
    );
  } else {
    const existing = memoryStore.matrimony_interests.find(
      (mi) => mi.sender_user_id === sender_user_id && mi.receiver_user_id === receiver_user_id
    );
    if (existing) {
      existing.status = 'pending';
      existing.note = note || existing.note;
    } else {
      memoryStore.matrimony_interests.push({
        id: interestId,
        sender_user_id,
        receiver_user_id,
        status: 'pending',
        note: note || 'Jay Parshuram. We are interested in your biodata.',
        contact_shared: false,
        created_at: new Date(),
      });
    }
  }

  res.json({ success: true, message: 'Interest expressed successfully.' });
}

export async function getMyInterests(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const userId = req.user.id;

  let sent: any[] = [];
  let received: any[] = [];

  if (isUsingPostgres && pool) {
    const resSent = await pool.query(
      `SELECT mi.*, prof.full_name, prof.surname, prof.gotra, prof.current_city, prof.photo_url, u.phone
       FROM matrimony_interests mi
       JOIN member_profiles prof ON mi.receiver_user_id = prof.user_id
       JOIN users u ON mi.receiver_user_id = u.id
       WHERE mi.sender_user_id = $1 ORDER BY mi.created_at DESC`,
      [userId]
    );
    sent = resSent.rows;

    const resRecv = await pool.query(
      `SELECT mi.*, prof.full_name, prof.surname, prof.gotra, prof.current_city, prof.photo_url, u.phone
       FROM matrimony_interests mi
       JOIN member_profiles prof ON mi.sender_user_id = prof.user_id
       JOIN users u ON mi.sender_user_id = u.id
       WHERE mi.receiver_user_id = $1 ORDER BY mi.created_at DESC`,
      [userId]
    );
    received = resRecv.rows;
  } else {
    sent = memoryStore.matrimony_interests
      .filter((mi) => mi.sender_user_id === userId)
      .map((mi) => {
        const prof = memoryStore.member_profiles.find((p) => p.user_id === mi.receiver_user_id);
        const user = memoryStore.users.find((u) => u.id === mi.receiver_user_id);
        return {
          ...mi,
          full_name: prof?.full_name,
          surname: prof?.surname,
          gotra: prof?.gotra,
          current_city: prof?.current_city,
          photo_url: prof?.photo_url,
          phone: mi.status === 'accepted' ? user?.phone : 'Unlocked on accept',
        };
      });

    received = memoryStore.matrimony_interests
      .filter((mi) => mi.receiver_user_id === userId)
      .map((mi) => {
        const prof = memoryStore.member_profiles.find((p) => p.user_id === mi.sender_user_id);
        const user = memoryStore.users.find((u) => u.id === mi.sender_user_id);
        return {
          ...mi,
          full_name: prof?.full_name,
          surname: prof?.surname,
          gotra: prof?.gotra,
          current_city: prof?.current_city,
          photo_url: prof?.photo_url,
          phone: mi.status === 'accepted' ? user?.phone : 'Unlocked on accept',
        };
      });
  }

  res.json({
    success: true,
    sent,
    received,
  });
}

export async function respondInterest(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { interest_id, action } = req.body; // action: 'accept' | 'reject'
  if (!interest_id || !['accept', 'reject'].includes(action)) {
    res.status(400).json({ success: false, message: 'Valid interest_id and action (accept/reject) required.' });
    return;
  }

  const newStatus = action === 'accept' ? 'accepted' : 'rejected';

  if (isUsingPostgres && pool) {
    await pool.query(
      `UPDATE matrimony_interests
       SET status = $1, contact_shared = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 AND receiver_user_id = $4`,
      [newStatus, action === 'accept', interest_id, req.user.id]
    );
  } else {
    const item = memoryStore.matrimony_interests.find(
      (mi) => mi.id === interest_id && mi.receiver_user_id === req.user?.id
    );
    if (!item) {
      res.status(404).json({ success: false, message: 'Interest request not found.' });
      return;
    }
    item.status = newStatus;
    item.contact_shared = action === 'accept';
  }

  res.json({
    success: true,
    message: action === 'accept' ? 'Interest accepted! Contact details are now mutually unlocked.' : 'Interest declined.',
  });
}

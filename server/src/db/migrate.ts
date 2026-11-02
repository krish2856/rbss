import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { initialSeedData } from './seedData';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL is not set.');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function runMigration() {
  console.log('Connecting to Neon PostgreSQL database...');
  const client = await pool.connect();
  console.log('Connected to Neon successfully!');

  try {
    console.log('Executing schema.sql...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await client.query(schemaSql);
    console.log('All 17 tables, indexes, and constraints created successfully on Neon!');

    // Seed Users
    console.log('Seeding Users...');
    for (const u of initialSeedData.users) {
      await client.query(
        `INSERT INTO users (id, phone, password_hash, role, is_approved, is_active, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO NOTHING`,
        [u.id, u.phone, u.password_hash, u.role, true, u.is_active, u.created_at]
      );
    }

    // Seed Member Profiles
    console.log('Seeding Member Profiles...');
    for (const p of initialSeedData.member_profiles) {
      await client.query(
        `INSERT INTO member_profiles (
          id, user_id, full_name, father_name, surname, gotra, kuldevi,
          gender, dob, marital_status, native_village, native_taluka,
          current_city, state, country, education, occupation, company_or_business,
          blood_group, photo_url, phone_visible, address, bio
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)
        ON CONFLICT (id) DO NOTHING`,
        [
          p.id,
          p.user_id,
          p.full_name,
          p.father_name,
          p.surname,
          p.gotra,
          p.kuldevi,
          p.gender,
          p.dob,
          p.marital_status,
          p.native_village,
          p.native_taluka,
          p.current_city,
          p.state,
          p.country,
          p.education,
          p.occupation,
          p.company_or_business,
          p.blood_group,
          p.photo_url,
          p.phone_visible,
          p.address,
          p.bio,
        ]
      );
    }

    // Seed Family Details
    console.log('Seeding Family Details...');
    for (const f of initialSeedData.family_details) {
      await client.query(
        `INSERT INTO family_details (id, member_id, full_name, relation, age, education, occupation, marital_status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT (id) DO NOTHING`,
        [f.id, f.member_id, f.full_name, f.relation, f.age, f.education, f.occupation, f.marital_status]
      );
    }

    // Seed Matrimony Profiles
    console.log('Seeding Matrimony Profiles...');
    for (const m of initialSeedData.matrimony_profiles) {
      await client.query(
        `INSERT INTO matrimony_profiles (
          id, user_id, member_id, height_cm, weight_kg, complexion, rashi, nakshatra,
          manglik, diet, annual_income, partner_expectations, hobbies, biodata_pdf_url,
          photos, is_verified, is_approved, is_featured, is_hidden
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
        ON CONFLICT (id) DO NOTHING`,
        [
          m.id,
          m.user_id,
          m.member_id,
          m.height_cm,
          m.weight_kg,
          m.complexion,
          m.rashi,
          m.nakshatra,
          m.manglik,
          m.diet,
          m.annual_income,
          m.partner_expectations,
          m.hobbies,
          m.biodata_pdf_url,
          m.photos,
          m.is_verified,
          true,
          m.is_featured,
          m.is_hidden,
        ]
      );
    }

    // Seed Events
    console.log('Seeding Events...');
    for (const ev of initialSeedData.events) {
      await client.query(
        `INSERT INTO events (id, title, title_gu, description, category, venue_name, address, city, start_time, end_time, banner_url, max_attendees, registration_open, created_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
         ON CONFLICT (id) DO NOTHING`,
        [
          ev.id,
          ev.title,
          ev.title_gu,
          ev.description,
          ev.category,
          ev.venue_name,
          ev.address,
          ev.city,
          ev.start_time,
          ev.end_time,
          ev.banner_url,
          ev.max_attendees,
          ev.registration_open,
          ev.created_by,
        ]
      );
    }

    // Seed Announcements
    console.log('Seeding Announcements...');
    for (const a of initialSeedData.announcements) {
      await client.query(
        `INSERT INTO announcements (id, title, title_gu, category, content, image_url, is_pinned, is_urgent, publish_date, created_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         ON CONFLICT (id) DO NOTHING`,
        [a.id, a.title, a.title_gu, a.category, a.content, a.image_url, a.is_pinned, a.is_urgent, a.publish_date, a.created_by]
      );
    }

    // Seed Funds
    console.log('Seeding Funds...');
    for (const f of initialSeedData.funds) {
      await client.query(
        `INSERT INTO funds (id, name, name_gu, description, target_amount, collected_amount, is_active)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT (id) DO NOTHING`,
        [f.id, f.name, f.name_gu, f.description, f.target_amount, f.collected_amount, f.is_active]
      );
    }

    // Seed Donations
    console.log('Seeding Donations...');
    for (const d of initialSeedData.donations) {
      await client.query(
        `INSERT INTO donations (id, user_id, fund_type, donor_name, donor_phone, donor_pan, amount, payment_mode, transaction_ref, payment_status, receipt_number, notes, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
         ON CONFLICT (id) DO NOTHING`,
        [
          d.id,
          d.user_id,
          d.fund_type,
          d.donor_name,
          d.donor_phone,
          d.donor_pan,
          d.amount,
          d.payment_mode,
          d.transaction_ref,
          d.payment_status,
          d.receipt_number,
          d.notes,
          d.created_at,
        ]
      );
    }

    // Seed Expenses
    console.log('Seeding Expenses...');
    for (const exp of initialSeedData.expenses) {
      await client.query(
        `INSERT INTO expenses (id, title, category, amount, date, bill_url, approved_by, notes, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (id) DO NOTHING`,
        [exp.id, exp.title, exp.category, exp.amount, exp.date, exp.bill_url, exp.approved_by, exp.notes, exp.created_at]
      );
    }

    // Seed Businesses
    console.log('Seeding Businesses...');
    for (const b of initialSeedData.businesses) {
      await client.query(
        `INSERT INTO businesses (id, user_id, business_name, category, description, address, city, phone, email, website, instagram, logo_url, is_approved, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
         ON CONFLICT (id) DO NOTHING`,
        [
          b.id,
          b.user_id,
          b.business_name,
          b.category,
          b.description,
          b.address,
          b.city,
          b.phone,
          b.email,
          b.website,
          b.instagram,
          b.logo_url,
          b.is_approved,
          b.created_at,
        ]
      );
    }

    // Seed Blood Donors
    console.log('Seeding Blood Donors...');
    for (const bd of initialSeedData.blood_donors) {
      await client.query(
        `INSERT INTO blood_donors (id, user_id, full_name, blood_group, city, phone, is_available, last_donated_date, emergency_notes, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         ON CONFLICT (id) DO NOTHING`,
        [bd.id, bd.user_id, bd.full_name, bd.blood_group, bd.city, bd.phone, bd.is_available, bd.last_donated_date, bd.emergency_notes, (bd as any).created_at || new Date()]
      );
    }

    // Seed Education Careers
    console.log('Seeding Education Careers...');
    for (const ec of initialSeedData.education_careers) {
      await client.query(
        `INSERT INTO education_careers (id, type, title, organization, description, eligibility, apply_link, contact_info, deadline, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         ON CONFLICT (id) DO NOTHING`,
        [ec.id, ec.type, ec.title, ec.organization, ec.description, ec.eligibility, ec.apply_link, ec.contact_info, ec.deadline, (ec as any).created_at || new Date()]
      );
    }

    // Seed Temples
    console.log('Seeding Temples...');
    for (const t of initialSeedData.temple_directory) {
      await client.query(
        `INSERT INTO temple_directory (id, temple_name, temple_name_gu, deity_name, deity_name_gu, location, description, history, photo_url, contact_phone, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         ON CONFLICT (id) DO NOTHING`,
        [t.id, t.temple_name, t.temple_name_gu, t.deity_name, t.deity_name_gu, t.location, t.description, t.history, t.photo_url, t.contact_phone, (t as any).created_at || new Date()]
      );
    }

    // Seed Committee Members
    console.log('Seeding Committee Members...');
    for (const c of initialSeedData.committee_members) {
      await client.query(
        `INSERT INTO committee_members (id, name, designation, designation_gu, city, phone, email, photo_url, term_years, priority_order, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         ON CONFLICT (id) DO NOTHING`,
        [c.id, c.name, c.designation, c.designation_gu, c.city, c.phone, c.email, c.photo_url, c.term_years, c.priority_order, (c as any).created_at || new Date()]
      );
    }

    // Seed Audit Logs
    console.log('Seeding Audit Logs...');
    for (const al of initialSeedData.audit_logs) {
      await client.query(
        `INSERT INTO audit_logs (id, admin_id, action, target_type, target_id, details, ip_address, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT (id) DO NOTHING`,
        [al.id, al.admin_id, al.action, al.target_type, al.target_id, JSON.stringify(al.details), al.ip_address, al.created_at]
      );
    }

    // Count tables
    const tableRes = await client.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`
    );
    console.log(`\n================================================================`);
    console.log(`MIGRATION COMPLETE! Created ${tableRes.rowCount} tables in Neon PostgreSQL:`);
    tableRes.rows.forEach((r) => console.log(`  ✓ ${r.table_name}`));
    console.log(`================================================================\n`);
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();

import { Request, Response } from 'express';
import { memoryStore, pool, isUsingPostgres } from '../db/db';

export async function getTemples(req: Request, res: Response): Promise<void> {
  let list: any[] = [];
  if (isUsingPostgres && pool) {
    const resTmp = await pool.query(`SELECT * FROM temple_directory ORDER BY temple_name ASC`);
    list = resTmp.rows;
  } else {
    list = memoryStore.temple_directory;
  }
  res.json({ success: true, temples: list });
}

export async function getCommittee(req: Request, res: Response): Promise<void> {
  let list: any[] = [];
  if (isUsingPostgres && pool) {
    const resComm = await pool.query(`SELECT * FROM committee_members ORDER BY priority_order ASC`);
    list = resComm.rows;
  } else {
    list = memoryStore.committee_members.sort((a, b) => a.priority_order - b.priority_order);
  }
  res.json({ success: true, committee: list });
}

export async function getHistory(req: Request, res: Response): Promise<void> {
  const historyData = {
    title: 'Rajgor Brahmin Samaj – Heritage, Legacy & Vedic Roots',
    title_gu: 'રાજગોર બ્રાહ્મણ સમાજ – વારસો, સંસ્કૃતિ તથા ઐતિહાસિક ગૌરવ',
    origin: 'The Rajgor Brahmins (also historically revered as Raja-Guru or Raj-Purohit) trace their venerable lineage back centuries as the spiritual preceptors, royal councilors, and ceremonial conductors for the ruling dynasties of Gujarat, Kutch, and Saurashtra.',
    principles: [
      {
        title: 'Vedic Learning & Sanskar',
        desc: 'Preserving Sanskrit scriptures, Gayatri Upasana, Yagnas, and imparting moral education to new generations.',
      },
      {
        title: 'Community Brotherhood (Sangathan)',
        desc: 'Fostering unity across borders, helping every family through education funds, medical relief, and matrimonial parichay.',
      },
      {
        title: 'Kuldevi Devotion',
        desc: 'Adherence to ancestral faith in Maa Chamunda, Maa Ashapura, Maa Khodiyar, Maa Meldi, Maa Umiya, and sacred Kuldevatas.',
      },
      {
        title: 'Modern Progressive Outlook',
        desc: 'Encouraging higher education in STEM, civil services, entrepreneurship, and global leadership for youth while remaining deeply grounded in Dharma.',
      },
    ],
    gotras: [
      'Kashyap (કશ્યપ)',
      'Gautam (ગૌતમ)',
      'Bharadwaj (ભારદ્વાજ)',
      'Vashistha (વશિષ્ઠ)',
      'Parashar (પારાશર)',
      'Shandilya (શાંડિલ્ય)',
      'Kaushik (કૌશિક)',
      'Garg (ગર્ગ)',
      'Vatsa (વત્સ)',
      'Haritas (હરિતાસ)',
    ],
    kuldevis: [
      'Maa Chamunda (માં ચામુંડા - ચોટીલા)',
      'Maa Ashapura (માં આશાપુરા - માતાનો મઢ)',
      'Maa Khodiyar (માં ખોડિયાર - રાજપરા / ગળધરા)',
      'Maa Meldi (માં મેલડી)',
      'Maa Bhavani (માં ભવાની)',
      'Maa Harsiddhi (માં હરસિદ્ધિ - ઉજ્જૈન / મિયાણી)',
      'Maa Brahmani (માં બ્રહ્માણી)',
      'Maa Umiya (માં ઉમિયા - ઊંઝા)',
    ],
  };

  res.json({ success: true, history: historyData });
}

import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { memoryStore, pool, isUsingPostgres } from '../db/db';

export async function getFunds(req: Request, res: Response): Promise<void> {
  let funds: any[] = [];
  if (isUsingPostgres && pool) {
    const resFunds = await pool.query(`SELECT * FROM funds WHERE is_active = true`);
    funds = resFunds.rows;
  } else {
    funds = memoryStore.funds.filter((f) => f.is_active);
  }

  res.json({ success: true, funds });
}

export async function createDonation(req: Request, res: Response): Promise<void> {
  const { fund_type, donor_name, donor_phone, donor_pan, amount, payment_mode, notes } = req.body;

  if (!fund_type || !donor_name || !donor_phone || !amount || Number(amount) <= 0) {
    res.status(400).json({ success: false, message: 'Fund type, donor name, phone and valid amount are required.' });
    return;
  }

  const donationId = `don-${uuidv4().substring(0, 8)}`;
  const currentYear = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const receiptNumber = `RBS-${currentYear}-${randomSuffix}`;
  const transactionRef = `UPI${Date.now()}`;

  const newDonation = {
    id: donationId,
    user_id: req.user?.id || null,
    fund_type,
    donor_name,
    donor_phone,
    donor_pan: donor_pan || '',
    amount: Number(amount),
    payment_mode: payment_mode || 'UPI',
    transaction_ref: transactionRef,
    payment_status: 'completed',
    receipt_number: receiptNumber,
    notes: notes || '',
    created_at: new Date(),
  };

  if (isUsingPostgres && pool) {
    await pool.query(
      `INSERT INTO donations (
        id, user_id, fund_type, donor_name, donor_phone, donor_pan, amount,
        payment_mode, transaction_ref, payment_status, receipt_number, notes
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [
        donationId,
        newDonation.user_id,
        fund_type,
        donor_name,
        donor_phone,
        donor_pan || '',
        newDonation.amount,
        newDonation.payment_mode,
        transactionRef,
        'completed',
        receiptNumber,
        notes || '',
      ]
    );

    // Update fund collected amount
    await pool.query(
      `UPDATE funds SET collected_amount = collected_amount + $1 WHERE id = $2`,
      [newDonation.amount, fund_type]
    );
  } else {
    memoryStore.donations.unshift(newDonation as any);
    const fund = memoryStore.funds.find((f) => f.id === fund_type);
    if (fund) {
      fund.collected_amount += Number(amount);
    }
  }

  res.status(201).json({
    success: true,
    message: 'Donation received successfully! Thank you for supporting Rajgor Samaj.',
    donation: newDonation,
    receiptNumber,
  });
}

export async function getDonationReceipt(req: Request, res: Response): Promise<void> {
  const { receiptNumber } = req.params;

  let donation: any = null;
  let fund: any = null;

  if (isUsingPostgres && pool) {
    const resDon = await pool.query(`SELECT * FROM donations WHERE receipt_number = $1`, [receiptNumber]);
    donation = resDon.rows[0];
    if (donation) {
      const resFund = await pool.query(`SELECT * FROM funds WHERE id = $1`, [donation.fund_type]);
      fund = resFund.rows[0];
    }
  } else {
    donation = memoryStore.donations.find((d) => d.receipt_number === receiptNumber);
    if (donation) {
      fund = memoryStore.funds.find((f) => f.id === donation.fund_type);
    }
  }

  if (!donation) {
    res.status(404).json({ success: false, message: 'Receipt not found.' });
    return;
  }

  res.json({
    success: true,
    receipt: {
      ...donation,
      fund_name: fund?.name || donation.fund_type,
      fund_name_gu: fund?.name_gu || '',
      trust_reg_no: 'TRUST/GUJ/RBS/2012/8874',
      tax_exempt_section: 'Section 80G of Income Tax Act, 1961',
      samaj_address: 'Rajgor Brahmin Samaj Bhavan, SG Highway, Ahmedabad, Gujarat - 382481',
      authorized_signatory: 'Gaurangbhai M. Bhatt (Treasurer)',
    },
  });
}

export async function getDonationHistory(req: Request, res: Response): Promise<void> {
  const { userOnly } = req.query;
  let list: any[] = [];

  if (isUsingPostgres && pool) {
    let sql = `
      SELECT d.*, f.name as fund_name
      FROM donations d
      LEFT JOIN funds f ON d.fund_type = f.id
    `;
    const params: any[] = [];
    if (userOnly === 'true' && req.user) {
      sql += ` WHERE d.user_id = $1`;
      params.push(req.user.id);
    }
    sql += ` ORDER BY d.created_at DESC LIMIT 50`;
    const result = await pool.query(sql, params);
    list = result.rows;
  } else {
    list = memoryStore.donations
      .filter((d) => {
        if (userOnly === 'true' && req.user) {
          return d.user_id === req.user.id;
        }
        return true;
      })
      .map((d) => {
        const f = memoryStore.funds.find((x) => x.id === d.fund_type);
        return { ...d, fund_name: f?.name || d.fund_type };
      });
  }

  res.json({ success: true, donations: list });
}

export async function getIncomeExpenseReport(req: Request, res: Response): Promise<void> {
  const donations = memoryStore.donations;
  const expenses = memoryStore.expenses;

  const totalDonations = donations.reduce((sum, d) => sum + Number(d.amount), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const netSurplus = totalDonations - totalExpenses;

  // Breakdown by fund
  const fundBreakdown: Record<string, number> = {};
  donations.forEach((d) => {
    fundBreakdown[d.fund_type] = (fundBreakdown[d.fund_type] || 0) + Number(d.amount);
  });

  // Breakdown by expense category
  const expenseBreakdown: Record<string, number> = {};
  expenses.forEach((e) => {
    expenseBreakdown[e.category] = (expenseBreakdown[e.category] || 0) + Number(e.amount);
  });

  res.json({
    success: true,
    report: {
      totalIncome: totalDonations,
      totalExpenses,
      netSurplus,
      fundBreakdown,
      expenseBreakdown,
      recentExpenses: expenses,
    },
  });
}

export async function createExpense(req: Request, res: Response): Promise<void> {
  const { title, category, amount, date, notes } = req.body;
  if (!title || !category || !amount || !date) {
    res.status(400).json({ success: false, message: 'Title, category, amount and date required.' });
    return;
  }

  const expId = `exp-${uuidv4().substring(0, 8)}`;
  const item = {
    id: expId,
    title,
    category,
    amount: Number(amount),
    date,
    bill_url: '',
    approved_by: req.user?.id || 'admin',
    notes: notes || '',
    created_at: new Date(),
  };

  if (isUsingPostgres && pool) {
    await pool.query(
      `INSERT INTO expenses (id, title, category, amount, date, approved_by, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [expId, title, category, item.amount, date, item.approved_by, notes || '']
    );
  } else {
    memoryStore.expenses.unshift(item);
  }

  res.status(201).json({ success: true, message: 'Expense record created.', expense: item });
}

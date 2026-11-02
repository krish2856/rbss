import { Router } from 'express';
import { authenticate, optionalAuthenticate } from '../middleware/auth';
import { requireRoles, requireApproved } from '../middleware/rbac';

// Controllers
import * as authCtrl from '../controllers/authController';
import * as memberCtrl from '../controllers/membersController';
import * as matrimonyCtrl from '../controllers/matrimonyController';
import * as eventCtrl from '../controllers/eventsController';
import * as announcementCtrl from '../controllers/announcementsController';
import * as donationCtrl from '../controllers/donationsController';
import * as careerCtrl from '../controllers/careersController';
import * as businessCtrl from '../controllers/businessesController';
import * as bloodCtrl from '../controllers/bloodDonorsController';
import * as samajCtrl from '../controllers/samajController';
import * as adminCtrl from '../controllers/adminController';

const router = Router();

// Health Check
router.get('/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'Rajgor Brahmin Samaj API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// --- Auth Routes ---
router.post('/auth/send-otp', authCtrl.sendOtp);
router.post('/auth/login', authCtrl.login);
router.post('/auth/register', authCtrl.register);
router.get('/auth/me', authenticate, authCtrl.getMe);
router.post('/auth/reset-password', authCtrl.resetPassword);

// --- Member Directory Routes ---
router.get('/members', optionalAuthenticate, memberCtrl.getMembers);
router.get('/members/:id', optionalAuthenticate, memberCtrl.getMemberById);
router.put('/members/profile/update', authenticate, memberCtrl.updateProfile);
router.post('/members/family/add', authenticate, memberCtrl.addFamilyMember);

// --- Matrimony Portal Routes ---
router.get('/matrimony/profiles', authenticate, requireApproved, matrimonyCtrl.getMatrimonyProfiles);
router.get('/matrimony/profiles/:id', authenticate, requireApproved, matrimonyCtrl.getMatrimonyProfileById);
router.post('/matrimony/profile/upsert', authenticate, requireApproved, matrimonyCtrl.upsertMatrimonyProfile);
router.post('/matrimony/interest/send', authenticate, requireApproved, matrimonyCtrl.sendInterest);
router.get('/matrimony/interests/my', authenticate, requireApproved, matrimonyCtrl.getMyInterests);
router.post('/matrimony/interest/respond', authenticate, requireApproved, matrimonyCtrl.respondInterest);

// --- Events Routes ---
router.get('/events', optionalAuthenticate, eventCtrl.getEvents);
router.get('/events/:id', optionalAuthenticate, eventCtrl.getEventById);
router.post('/events/:id/rsvp', authenticate, eventCtrl.rsvpEvent);
router.post('/events', authenticate, requireRoles(['super_admin', 'president', 'secretary']), eventCtrl.createEvent);

// --- Announcements Routes ---
router.get('/announcements', announcementCtrl.getAnnouncements);
router.post('/announcements', authenticate, requireRoles(['super_admin', 'president', 'secretary']), announcementCtrl.createAnnouncement);

// --- Donations & Samaj Funds Routes ---
router.get('/donations/funds', donationCtrl.getFunds);
router.post('/donations/donate', optionalAuthenticate, donationCtrl.createDonation);
router.get('/donations/receipt/:receiptNumber', donationCtrl.getDonationReceipt);
router.get('/donations/history', optionalAuthenticate, donationCtrl.getDonationHistory);
router.get('/donations/reports', authenticate, requireRoles(['super_admin', 'president', 'secretary', 'treasurer']), donationCtrl.getIncomeExpenseReport);
router.post('/donations/expenses', authenticate, requireRoles(['super_admin', 'treasurer']), donationCtrl.createExpense);

// --- Education & Career Routes ---
router.get('/careers', careerCtrl.getCareers);
router.post('/careers', authenticate, requireRoles(['super_admin', 'president', 'secretary', 'committee']), careerCtrl.createCareer);

// --- Business Directory Routes ---
router.get('/businesses', businessCtrl.getBusinesses);
router.post('/businesses', authenticate, businessCtrl.createBusiness);

// --- Blood Donor Directory Routes ---
router.get('/blood-donors', bloodCtrl.getBloodDonors);
router.post('/blood-donors/register', authenticate, bloodCtrl.registerBloodDonor);

// --- Samaj Heritage & Culture Routes ---
router.get('/samaj/temples', samajCtrl.getTemples);
router.get('/samaj/committee', samajCtrl.getCommittee);
router.get('/samaj/history', samajCtrl.getHistory);

// --- Admin Dashboard Routes ---
router.get('/admin/metrics', authenticate, requireRoles(['super_admin', 'president', 'secretary', 'treasurer', 'committee']), adminCtrl.getDashboardMetrics);
router.get('/admin/pending-members', authenticate, requireRoles(['super_admin', 'president', 'secretary']), adminCtrl.getPendingMembers);
router.post('/admin/approve-member/:userId', authenticate, requireRoles(['super_admin', 'president', 'secretary']), adminCtrl.approveMember);
router.post('/admin/reject-member/:userId', authenticate, requireRoles(['super_admin', 'president']), adminCtrl.rejectMember);
router.post('/admin/update-role', authenticate, requireRoles(['super_admin', 'president']), adminCtrl.updateUserRole);
router.get('/admin/audit-logs', authenticate, requireRoles(['super_admin', 'president']), adminCtrl.getAuditLogs);

export default router;

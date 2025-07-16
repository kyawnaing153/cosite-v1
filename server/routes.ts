import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {
  insertUserSchema,
  insertSiteSchema,
  insertLabourGroupSchema,
  insertLabourSchema,
  insertPurchaseSchema,
  insertSalarySchema,
  insertInvoiceSchema,
  insertInvoiceLabourDetailSchema,
} from "@shared/schema";

// JWT secret from environment
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Auth middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

const attendanceSchema = z.object({
  siteId: z.number().optional(),
  labourId: z.number().optional(),
  date: z.string().transform(str => new Date(str)).optional(),
  status: z.enum(['present', 'absent', 'half_day']).default('present'),
  hoursWorked: z.number().optional(),
  remarks: z.string().optional(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      const user = await storage.authenticateUser(username, password);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({ 
        token, 
        user: { 
          id: user.id, 
          username: user.username, 
          fullname: user.fullname,
          role: user.role 
        }
      });
    } catch (error) {
      res.status(400).json({ message: 'Invalid request data' });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(409).json({ message: 'User already exists' });
      }

      const user = await storage.createUser(userData);
      res.status(201).json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          fullname: user.fullname,
          role: user.role 
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({ message: 'Invalid request data' });
    }
  });

  app.get('/api/auth/me', authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ 
        id: user.id, 
        username: user.username, 
        fullname: user.fullname,
        role: user.role 
      });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Dashboard routes
  app.get('/api/dashboard/metrics', authenticateToken, async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      console.error('Dashboard metrics error:', error);
      res.status(500).json({ message: 'Failed to fetch metrics' });
    }
  });

  app.get('/api/dashboard/recent-sites', authenticateToken, async (req, res) => {
    try {
      const sites = await storage.getRecentSites();
      res.json(sites);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch recent sites' });
    }
  });

  app.get('/api/dashboard/recent-purchases', authenticateToken, async (req, res) => {
    try {
      const purchases = await storage.getRecentPurchases();
      res.json(purchases);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch recent purchases' });
    }
  });

  app.get('/api/dashboard/pending-wages', authenticateToken, async (req, res) => {
    try {
      const wages = await storage.getPendingWages();
      res.json(wages);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch pending wages' });
    }
  });

  // Sites routes
  app.get('/api/sites', authenticateToken, async (req, res) => {
    try {
      const sites = await storage.getSites();
      res.json(sites);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch sites' });
    }
  });

  app.get('/api/sites/:id', authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const site = await storage.getSite(id);
      if (!site) {
        return res.status(404).json({ message: 'Site not found' });
      }
      res.json(site);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch site' });
    }
  });

  app.post('/api/sites', authenticateToken, async (req, res) => {
    try {
      const siteData = insertSiteSchema.parse(req.body);
      const site = await storage.createSite(siteData);
      res.status(201).json(site);
    } catch (error) {
      console.error('Site creation error:', error);
      res.status(400).json({ message: 'Invalid site data' });
    }
  });

  app.put('/api/sites/:id', authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const siteData = insertSiteSchema.partial().parse(req.body);
      const site = await storage.updateSite(id, siteData);
      res.json(site);
    } catch (error) {
      res.status(400).json({ message: 'Invalid site data' });
    }
  });

  app.delete('/api/sites/:id', authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteSite(id);
      if (!success) {
        return res.status(404).json({ message: 'Site not found' });
      }
      res.json({ message: 'Site deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete site' });
    }
  });

  // Labour Groups routes
  app.get('/api/labour-groups', authenticateToken, async (req, res) => {
    try {
      const siteId = req.query.siteId ? parseInt(req.query.siteId as string) : undefined;
      const groups = await storage.getLabourGroups(siteId);
      res.json(groups);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch labour groups' });
    }
  });

  app.get('/api/labour-groups/:id', authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const group = await storage.getLabourGroup(id);
      if (!group) {
        return res.status(404).json({ message: 'Labour group not found' });
      }
      res.json(group);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch labour group' });
    }
  });

  app.post('/api/labour-groups', authenticateToken, async (req, res) => {
    try {
      const groupData = insertLabourGroupSchema.parse(req.body);
      const group = await storage.createLabourGroup(groupData);
      res.status(201).json(group);
    } catch (error) {
      console.error('Labour group creation error:', error);
      res.status(400).json({ message: 'Invalid labour group data' });
    }
  });

  app.put('/api/labour-groups/:id', authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const groupData = insertLabourGroupSchema.partial().parse(req.body);
      const group = await storage.updateLabourGroup(id, groupData);
      res.json(group);
    } catch (error) {
      res.status(400).json({ message: 'Invalid labour group data' });
    }
  });

  app.delete('/api/labour-groups/:id', authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteLabourGroup(id);
      if (!success) {
        return res.status(404).json({ message: 'Labour group not found' });
      }
      res.json({ message: 'Labour group deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete labour group' });
    }
  });

  // Labour routes
  app.get('/api/labour', authenticateToken, async (req, res) => {
    try {
      const siteId = req.query.siteId ? parseInt(req.query.siteId as string) : undefined;
      const labour = await storage.getLabour(siteId);
      res.json(labour);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch labour' });
    }
  });

  app.get('/api/labour/:id', authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const labour = await storage.getLabourById(id);
      if (!labour) {
        return res.status(404).json({ message: 'Labour not found' });
      }
      res.json(labour);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch labour' });
    }
  });

  app.post('/api/labour', authenticateToken, async (req: any, res) => {
    try {
      const labourData = insertLabourSchema.parse({
        ...req.body,
        recordedByUserId: req.user.id,
      });
      const labour = await storage.createLabour(labourData);
      res.status(201).json(labour);
    } catch (error) {
      console.error('Labour creation error:', error);
      res.status(400).json({ message: 'Invalid labour data' });
    }
  });

  app.put('/api/labour/:id', authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const labourData = insertLabourSchema.partial().parse(req.body);
      const labour = await storage.updateLabour(id, labourData);
      res.json(labour);
    } catch (error) {
      res.status(400).json({ message: 'Invalid labour data' });
    }
  });

  app.delete('/api/labour/:id', authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteLabour(id);
      if (!success) {
        return res.status(404).json({ message: 'Labour not found' });
      }
      res.json({ message: 'Labour deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete labour' });
    }
  });

  // Purchases routes
  app.get('/api/purchases', authenticateToken, async (req, res) => {
    try {
      const siteId = req.query.siteId ? parseInt(req.query.siteId as string) : undefined;
      const purchases = await storage.getPurchases(siteId);
      res.json(purchases);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch purchases' });
    }
  });

  app.get('/api/purchases/:id', authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const purchase = await storage.getPurchase(id);
      if (!purchase) {
        return res.status(404).json({ message: 'Purchase not found' });
      }
      res.json(purchase);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch purchase' });
    }
  });

  app.post('/api/purchases', authenticateToken, async (req, res) => {
    try {
      const purchaseData = insertPurchaseSchema.parse(req.body);
      const purchase = await storage.createPurchase(purchaseData);
      res.status(201).json(purchase);
    } catch (error) {
      console.error('Purchase creation error:', error);
      res.status(400).json({ message: 'Invalid purchase data' });
    }
  });

  app.put('/api/purchases/:id', authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const purchaseData = insertPurchaseSchema.partial().parse(req.body);
      const purchase = await storage.updatePurchase(id, purchaseData);
      res.json(purchase);
    } catch (error) {
      res.status(400).json({ message: 'Invalid purchase data' });
    }
  });

  app.delete('/api/purchases/:id', authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deletePurchase(id);
      if (!success) {
        return res.status(404).json({ message: 'Purchase not found' });
      }
      res.json({ message: 'Purchase deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete purchase' });
    }
  });

  // Salary routes
  app.get('/api/salaries', authenticateToken, async (req, res) => {
    try {
      const siteId = req.query.siteId ? parseInt(req.query.siteId as string) : undefined;
      const labourId = req.query.labourId ? parseInt(req.query.labourId as string) : undefined;
      const salaries = await storage.getSalaries(siteId, labourId);
      res.json(salaries);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch salaries' });
    }
  });

  app.get('/api/salaries/:id', authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const salary = await storage.getSalary(id);
      if (!salary) {
        return res.status(404).json({ message: 'Salary not found' });
      }
      res.json(salary);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch salary' });
    }
  });

  app.post('/api/salaries', authenticateToken, async (req: any, res) => {
    try {
      const salaryData = insertSalarySchema.parse({
        ...req.body,
        recordedByUserId: req.user.id,
      });
      const salary = await storage.createSalary(salaryData);
      res.status(201).json(salary);
    } catch (error) {
      console.error('Salary creation error:', error);
      res.status(400).json({ message: 'Invalid salary data' });
    }
  });

  app.put('/api/salaries/:id', authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const salaryData = insertSalarySchema.partial().parse(req.body);
      const salary = await storage.updateSalary(id, salaryData);
      res.json(salary);
    } catch (error) {
      res.status(400).json({ message: 'Invalid salary data' });
    }
  });

  app.delete('/api/salaries/:id', authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteSalary(id);
      if (!success) {
        return res.status(404).json({ message: 'Salary not found' });
      }
      res.json({ message: 'Salary deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete salary' });
    }
  });

  // Invoices routes
  app.get('/api/invoices', authenticateToken, async (req, res) => {
    try {
      const siteId = req.query.siteId ? parseInt(req.query.siteId as string) : undefined;
      const invoices = await storage.getInvoices(siteId);
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch invoices' });
    }
  });

  app.get('/api/invoices/:id', authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const invoice = await storage.getInvoice(id);
      if (!invoice) {
        return res.status(404).json({ message: 'Invoice not found' });
      }
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch invoice' });
    }
  });

  app.post('/api/invoices', authenticateToken, async (req, res) => {
    try {
      const invoiceData = insertInvoiceSchema.parse(req.body);
      const invoice = await storage.createInvoice(invoiceData);
      res.status(201).json(invoice);
    } catch (error) {
      console.error('Invoice creation error:', error);
      res.status(400).json({ message: 'Invalid invoice data' });
    }
  });

  app.put('/api/invoices/:id', authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const invoiceData = insertInvoiceSchema.partial().parse(req.body);
      const invoice = await storage.updateInvoice(id, invoiceData);
      res.json(invoice);
    } catch (error) {
      res.status(400).json({ message: 'Invalid invoice data' });
    }
  });

  app.delete('/api/invoices/:id', authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteInvoice(id);
      if (!success) {
        return res.status(404).json({ message: 'Invoice not found' });
      }
      res.json({ message: 'Invoice deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete invoice' });
    }
  });

  // Invoice Labour Detail routes
  app.get('/api/invoice-labour-details/:invoiceId', authenticateToken, async (req, res) => {
    try {
      const invoiceId = parseInt(req.params.invoiceId);
      const details = await storage.getInvoiceLabourDetails(invoiceId);
      res.json(details);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch invoice labour details' });
    }
  });

  app.post('/api/invoice-labour-details', authenticateToken, async (req: any, res) => {
    try {
      const detailData = insertInvoiceLabourDetailSchema.parse({
        ...req.body,
        recordedByUserId: req.user.id,
      });
      const detail = await storage.createInvoiceLabourDetail(detailData);
      res.status(201).json(detail);
    } catch (error) {
      console.error('Invoice labour detail creation error:', error);
      res.status(400).json({ message: 'Invalid invoice labour detail data' });
    }
  });

  // Attendance routes (basic implementation)
  app.get('/api/attendance', authenticateToken, async (req, res) => {
    try {
      // For now, return empty array as attendance is not fully implemented in storage
      // In a real implementation, you would have an attendance table
      res.json([]);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch attendance' });
    }
  });

  app.post('/api/attendance', authenticateToken, async (req: any, res) => {
    try {
      const attendanceData = attendanceSchema.parse(req.body);
      // For now, just return success
      // In a real implementation, you would save to an attendance table
      res.status(201).json({ 
        id: Date.now(), 
        ...attendanceData,
        recordedByUserId: req.user.id 
      });
    } catch (error) {
      console.error('Attendance creation error:', error);
      res.status(400).json({ message: 'Invalid attendance data' });
    }
  });

  app.put('/api/attendance/:id', authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const attendanceData = attendanceSchema.partial().parse(req.body);
      // For now, just return success
      res.json({ id, ...attendanceData });
    } catch (error) {
      res.status(400).json({ message: 'Invalid attendance data' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

import express from 'express';
import { z } from 'zod';
import { BudgetService } from '../services/BudgetService';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { logger } from '../utils/logger';

const router = express.Router();

// Validation schemas
const createBudgetSchema = z.object({
  body: z.object({
    contractId: z.string().uuid(),
    studyId: z.string().uuid(),
    siteId: z.string().uuid().optional(),
    budgetType: z.enum(['study_level', 'site_level', 'pass_through', 'startup', 'closeout']),
    totalBudget: z.number().positive(),
    currency: z.string().length(3).default('USD'),
    budgetPeriodStart: z.string().datetime(),
    budgetPeriodEnd: z.string().datetime(),
    lineItems: z.array(z.object({
      category: z.enum(['startup', 'enrollment', 'visits', 'procedures', 'monitoring', 'data_management', 'closeout', 'pass_through', 'other']),
      description: z.string().min(1).max(500),
      unitType: z.enum(['fixed', 'per_participant', 'per_visit', 'per_procedure', 'per_month', 'per_milestone', 'hourly']),
      unitRate: z.number().positive(),
      estimatedUnits: z.number().int().positive().default(1),
      milestoneTriggger: z.string().max(200).optional(),
      milestonePercentage: z.number().min(0).max(100).default(100),
      invoiceSchedule: z.enum(['upon_completion', 'monthly', 'quarterly', 'upfront', 'custom']).default('upon_completion')
    }))
  })
});

const updateBudgetSchema = z.object({
  body: z.object({
    totalBudget: z.number().positive().optional(),
    currency: z.string().length(3).optional(),
    status: z.enum(['draft', 'submitted', 'approved', 'active', 'completed', 'cancelled']).optional(),
    budgetPeriodStart: z.string().datetime().optional(),
    budgetPeriodEnd: z.string().datetime().optional()
  })
});

// GET /api/v1/budgets - List budgets with filtering
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      budgetType,
      studyId,
      siteId,
      contractId
    } = req.query;

    const filters = {
      status: status as string,
      budgetType: budgetType as string,
      studyId: studyId as string,
      siteId: siteId as string,
      contractId: contractId as string
    };

    const result = await BudgetService.getBudgets(
      parseInt(page as string),
      parseInt(limit as string),
      filters,
      req.user!
    );

    res.json(result);
  } catch (error) {
    logger.error('Error fetching budgets:', error);
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
});

// GET /api/v1/budgets/:id - Get budget by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const budget = await BudgetService.getBudgetById(req.params.id, req.user!);
    
    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    res.json(budget);
  } catch (error) {
    logger.error('Error fetching budget:', error);
    res.status(500).json({ error: 'Failed to fetch budget' });
  }
});

// POST /api/v1/budgets - Create new budget
router.post('/', authenticateToken, validateRequest(createBudgetSchema), async (req, res) => {
  try {
    const budget = await BudgetService.createBudget(req.body, req.user!);
    res.status(201).json(budget);
  } catch (error) {
    logger.error('Error creating budget:', error);
    res.status(500).json({ error: 'Failed to create budget' });
  }
});

// PUT /api/v1/budgets/:id - Update budget
router.put('/:id', authenticateToken, validateRequest(updateBudgetSchema), async (req, res) => {
  try {
    const budget = await BudgetService.updateBudget(req.params.id, req.body, req.user!);
    
    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    res.json(budget);
  } catch (error) {
    logger.error('Error updating budget:', error);
    res.status(500).json({ error: 'Failed to update budget' });
  }
});

// POST /api/v1/budgets/:id/approve - Approve budget
router.post('/:id/approve', authenticateToken, async (req, res) => {
  try {
    const result = await BudgetService.approveBudget(req.params.id, req.user!);
    res.json(result);
  } catch (error) {
    logger.error('Error approving budget:', error);
    res.status(500).json({ error: 'Failed to approve budget' });
  }
});

// GET /api/v1/budgets/:id/line-items - Get budget line items
router.get('/:id/line-items', authenticateToken, async (req, res) => {
  try {
    const lineItems = await BudgetService.getBudgetLineItems(req.params.id, req.user!);
    res.json(lineItems);
  } catch (error) {
    logger.error('Error fetching line items:', error);
    res.status(500).json({ error: 'Failed to fetch line items' });
  }
});

// PUT /api/v1/budgets/:id/line-items/:lineItemId - Update line item
router.put('/:id/line-items/:lineItemId', authenticateToken, async (req, res) => {
  try {
    const lineItem = await BudgetService.updateLineItem(
      req.params.id,
      req.params.lineItemId,
      req.body,
      req.user!
    );
    
    if (!lineItem) {
      return res.status(404).json({ error: 'Line item not found' });
    }

    res.json(lineItem);
  } catch (error) {
    logger.error('Error updating line item:', error);
    res.status(500).json({ error: 'Failed to update line item' });
  }
});

// GET /api/v1/budgets/:id/utilization - Get budget utilization report
router.get('/:id/utilization', authenticateToken, async (req, res) => {
  try {
    const utilization = await BudgetService.getBudgetUtilization(req.params.id, req.user!);
    res.json(utilization);
  } catch (error) {
    logger.error('Error fetching budget utilization:', error);
    res.status(500).json({ error: 'Failed to fetch budget utilization' });
  }
});

// GET /api/v1/budgets/:id/forecast - Get budget forecast
router.get('/:id/forecast', authenticateToken, async (req, res) => {
  try {
    const { months = 12 } = req.query;
    const forecast = await BudgetService.generateForecast(
      req.params.id,
      parseInt(months as string),
      req.user!
    );
    res.json(forecast);
  } catch (error) {
    logger.error('Error generating forecast:', error);
    res.status(500).json({ error: 'Failed to generate forecast' });
  }
});

// POST /api/v1/budgets/:id/copy - Copy budget to new study/site
router.post('/:id/copy', authenticateToken, async (req, res) => {
  try {
    const { targetStudyId, targetSiteId, adjustmentFactor = 1.0 } = req.body;
    
    const newBudget = await BudgetService.copyBudget(
      req.params.id,
      targetStudyId,
      targetSiteId,
      adjustmentFactor,
      req.user!
    );
    
    res.status(201).json(newBudget);
  } catch (error) {
    logger.error('Error copying budget:', error);
    res.status(500).json({ error: 'Failed to copy budget' });
  }
});

// GET /api/v1/budgets/templates - Get budget templates
router.get('/templates', authenticateToken, async (req, res) => {
  try {
    const { budgetType, therapeuticArea } = req.query;
    
    const templates = await BudgetService.getBudgetTemplates(
      budgetType as string,
      therapeuticArea as string,
      req.user!
    );
    
    res.json(templates);
  } catch (error) {
    logger.error('Error fetching budget templates:', error);
    res.status(500).json({ error: 'Failed to fetch budget templates' });
  }
});

export default router;

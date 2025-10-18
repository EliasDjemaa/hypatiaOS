import express from 'express';
import { z } from 'zod';
import { ContractService } from '../services/ContractService';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { logger } from '../utils/logger';

const router = express.Router();

// Validation schemas
const createContractSchema = z.object({
  body: z.object({
    contractType: z.enum(['master_service_agreement', 'study_contract', 'site_agreement', 'amendment', 'change_order']),
    sponsorOrganizationId: z.string().uuid(),
    croOrganizationId: z.string().uuid(),
    studyId: z.string().uuid().optional(),
    siteId: z.string().uuid().optional(),
    parentContractId: z.string().uuid().optional(),
    title: z.string().min(1).max(500),
    description: z.string().optional(),
    contractValue: z.number().positive().optional(),
    currency: z.string().length(3).default('USD'),
    effectiveDate: z.string().datetime().optional(),
    expirationDate: z.string().datetime().optional(),
    autoRenew: z.boolean().default(false),
    renewalPeriodMonths: z.number().int().positive().optional(),
  })
});

const updateContractSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(500).optional(),
    description: z.string().optional(),
    contractValue: z.number().positive().optional(),
    currency: z.string().length(3).optional(),
    status: z.enum(['draft', 'under_review', 'negotiating', 'pending_signature', 'executed', 'active', 'completed', 'terminated', 'expired']).optional(),
    effectiveDate: z.string().datetime().optional(),
    expirationDate: z.string().datetime().optional(),
    autoRenew: z.boolean().optional(),
    renewalPeriodMonths: z.number().int().positive().optional(),
  })
});

const addClauseSchema = z.object({
  body: z.object({
    clauseNumber: z.string().max(20),
    clauseType: z.enum(['payment_terms', 'deliverables', 'timeline', 'liability', 'indemnification', 'termination', 'intellectual_property', 'confidentiality', 'compliance', 'force_majeure', 'other']),
    title: z.string().min(1).max(255),
    content: z.string().min(1),
  })
});

// GET /api/v1/contracts - List contracts with filtering
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      contractType,
      studyId,
      organizationId,
      search
    } = req.query;

    const filters = {
      status: status as string,
      contractType: contractType as string,
      studyId: studyId as string,
      organizationId: organizationId as string,
      search: search as string
    };

    const result = await ContractService.getContracts(
      parseInt(page as string),
      parseInt(limit as string),
      filters,
      req.user!
    );

    res.json(result);
  } catch (error) {
    logger.error('Error fetching contracts:', error);
    res.status(500).json({ error: 'Failed to fetch contracts' });
  }
});

// GET /api/v1/contracts/:id - Get contract by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const contract = await ContractService.getContractById(req.params.id, req.user!);
    
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    res.json(contract);
  } catch (error) {
    logger.error('Error fetching contract:', error);
    res.status(500).json({ error: 'Failed to fetch contract' });
  }
});

// POST /api/v1/contracts - Create new contract
router.post('/', authenticateToken, validateRequest(createContractSchema), async (req, res) => {
  try {
    const contract = await ContractService.createContract(req.body, req.user!);
    res.status(201).json(contract);
  } catch (error) {
    logger.error('Error creating contract:', error);
    res.status(500).json({ error: 'Failed to create contract' });
  }
});

// PUT /api/v1/contracts/:id - Update contract
router.put('/:id', authenticateToken, validateRequest(updateContractSchema), async (req, res) => {
  try {
    const contract = await ContractService.updateContract(req.params.id, req.body, req.user!);
    
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    res.json(contract);
  } catch (error) {
    logger.error('Error updating contract:', error);
    res.status(500).json({ error: 'Failed to update contract' });
  }
});

// POST /api/v1/contracts/:id/clauses - Add clause to contract
router.post('/:id/clauses', authenticateToken, validateRequest(addClauseSchema), async (req, res) => {
  try {
    const clause = await ContractService.addClause(req.params.id, req.body, req.user!);
    res.status(201).json(clause);
  } catch (error) {
    logger.error('Error adding clause:', error);
    res.status(500).json({ error: 'Failed to add clause' });
  }
});

// GET /api/v1/contracts/:id/clauses - Get contract clauses
router.get('/:id/clauses', authenticateToken, async (req, res) => {
  try {
    const clauses = await ContractService.getContractClauses(req.params.id, req.user!);
    res.json(clauses);
  } catch (error) {
    logger.error('Error fetching clauses:', error);
    res.status(500).json({ error: 'Failed to fetch clauses' });
  }
});

// POST /api/v1/contracts/:id/ai-analysis - Run AI risk analysis
router.post('/:id/ai-analysis', authenticateToken, async (req, res) => {
  try {
    const analysis = await ContractService.runAIAnalysis(req.params.id, req.user!);
    res.json(analysis);
  } catch (error) {
    logger.error('Error running AI analysis:', error);
    res.status(500).json({ error: 'Failed to run AI analysis' });
  }
});

// POST /api/v1/contracts/:id/send-for-signature - Send contract for e-signature
router.post('/:id/send-for-signature', authenticateToken, async (req, res) => {
  try {
    const { signers, message } = req.body;
    
    const result = await ContractService.sendForSignature(
      req.params.id,
      signers,
      message,
      req.user!
    );
    
    res.json(result);
  } catch (error) {
    logger.error('Error sending for signature:', error);
    res.status(500).json({ error: 'Failed to send for signature' });
  }
});

// GET /api/v1/contracts/:id/signature-status - Check signature status
router.get('/:id/signature-status', authenticateToken, async (req, res) => {
  try {
    const status = await ContractService.getSignatureStatus(req.params.id, req.user!);
    res.json(status);
  } catch (error) {
    logger.error('Error checking signature status:', error);
    res.status(500).json({ error: 'Failed to check signature status' });
  }
});

// POST /api/v1/contracts/:id/terminate - Terminate contract
router.post('/:id/terminate', authenticateToken, async (req, res) => {
  try {
    const { reason, effectiveDate } = req.body;
    
    const result = await ContractService.terminateContract(
      req.params.id,
      reason,
      effectiveDate,
      req.user!
    );
    
    res.json(result);
  } catch (error) {
    logger.error('Error terminating contract:', error);
    res.status(500).json({ error: 'Failed to terminate contract' });
  }
});

// GET /api/v1/contracts/:id/audit-trail - Get contract audit trail
router.get('/:id/audit-trail', authenticateToken, async (req, res) => {
  try {
    const auditTrail = await ContractService.getAuditTrail(req.params.id, req.user!);
    res.json(auditTrail);
  } catch (error) {
    logger.error('Error fetching audit trail:', error);
    res.status(500).json({ error: 'Failed to fetch audit trail' });
  }
});

export default router;

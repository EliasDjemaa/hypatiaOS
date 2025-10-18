import { DatabaseManager } from '../database/DatabaseManager';
import { KafkaManager } from '../events/KafkaManager';
import { AIService } from './AIService';
import { ESignatureService } from './ESignatureService';
import { AuditService } from './AuditService';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export interface Contract {
  id: string;
  contractNumber: string;
  contractType: string;
  sponsorOrganizationId: string;
  croOrganizationId: string;
  studyId?: string;
  siteId?: string;
  parentContractId?: string;
  title: string;
  description?: string;
  contractValue?: number;
  currency: string;
  status: string;
  effectiveDate?: Date;
  expirationDate?: Date;
  autoRenew: boolean;
  renewalPeriodMonths?: number;
  signedDate?: Date;
  documentUrl?: string;
  esignatureEnvelopeId?: string;
  aiRiskScore?: number;
  aiRiskFactors?: any;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy?: string;
}

export interface ContractClause {
  id: string;
  contractId: string;
  clauseNumber: string;
  clauseType: string;
  title: string;
  content: string;
  aiRiskScore?: number;
  aiRiskCategory?: string;
  aiSuggestions?: string;
  negotiationStatus: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ContractService {
  
  static async getContracts(
    page: number = 1,
    limit: number = 20,
    filters: any = {},
    user: any
  ) {
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT c.*, 
             so.name as sponsor_name,
             co.name as cro_name,
             s.title as study_title
      FROM contracts c
      LEFT JOIN organizations so ON c.sponsor_organization_id = so.id
      LEFT JOIN organizations co ON c.cro_organization_id = co.id
      LEFT JOIN studies s ON c.study_id = s.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramIndex = 1;

    // Apply filters based on user role and organization
    if (user.role !== 'admin') {
      query += ` AND (c.sponsor_organization_id = $${paramIndex} OR c.cro_organization_id = $${paramIndex})`;
      params.push(user.organizationId);
      paramIndex++;
    }

    if (filters.status) {
      query += ` AND c.status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters.contractType) {
      query += ` AND c.contract_type = $${paramIndex}`;
      params.push(filters.contractType);
      paramIndex++;
    }

    if (filters.studyId) {
      query += ` AND c.study_id = $${paramIndex}`;
      params.push(filters.studyId);
      paramIndex++;
    }

    if (filters.search) {
      query += ` AND (c.title ILIKE $${paramIndex} OR c.contract_number ILIKE $${paramIndex})`;
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    // Count total records
    const countQuery = query.replace('SELECT c.*, so.name as sponsor_name, co.name as cro_name, s.title as study_title', 'SELECT COUNT(*)');
    const countResult = await DatabaseManager.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Add pagination
    query += ` ORDER BY c.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await DatabaseManager.query(query, params);

    return {
      contracts: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async getContractById(contractId: string, user: any): Promise<Contract | null> {
    const query = `
      SELECT c.*, 
             so.name as sponsor_name,
             co.name as cro_name,
             s.title as study_title
      FROM contracts c
      LEFT JOIN organizations so ON c.sponsor_organization_id = so.id
      LEFT JOIN organizations co ON c.cro_organization_id = co.id
      LEFT JOIN studies s ON c.study_id = s.id
      WHERE c.id = $1
    `;

    const result = await DatabaseManager.query(query, [contractId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const contract = result.rows[0];

    // Check access permissions
    if (user.role !== 'admin' && 
        contract.sponsor_organization_id !== user.organizationId && 
        contract.cro_organization_id !== user.organizationId) {
      throw new Error('Access denied');
    }

    return contract;
  }

  static async createContract(contractData: any, user: any): Promise<Contract> {
    const contractId = uuidv4();
    const contractNumber = await this.generateContractNumber(contractData.contractType);

    const query = `
      INSERT INTO contracts (
        id, contract_number, contract_type, sponsor_organization_id, 
        cro_organization_id, study_id, site_id, parent_contract_id,
        title, description, contract_value, currency, effective_date,
        expiration_date, auto_renew, renewal_period_months, created_by
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
      ) RETURNING *
    `;

    const params = [
      contractId,
      contractNumber,
      contractData.contractType,
      contractData.sponsorOrganizationId,
      contractData.croOrganizationId,
      contractData.studyId || null,
      contractData.siteId || null,
      contractData.parentContractId || null,
      contractData.title,
      contractData.description || null,
      contractData.contractValue || null,
      contractData.currency || 'USD',
      contractData.effectiveDate || null,
      contractData.expirationDate || null,
      contractData.autoRenew || false,
      contractData.renewalPeriodMonths || null,
      user.id
    ];

    const result = await DatabaseManager.query(query, params);
    const contract = result.rows[0];

    // Log audit event
    await AuditService.logEvent({
      eventType: 'contract_created',
      objectType: 'contract',
      objectId: contractId,
      newValues: contract,
      userId: user.id,
      ipAddress: user.ipAddress,
      userAgent: user.userAgent
    });

    // Publish event
    await KafkaManager.publishEvent('contract.created', {
      contractId,
      contractType: contractData.contractType,
      sponsorOrganizationId: contractData.sponsorOrganizationId,
      croOrganizationId: contractData.croOrganizationId,
      studyId: contractData.studyId,
      createdBy: user.id,
      timestamp: new Date().toISOString()
    });

    logger.info(`Contract created: ${contractId} by user ${user.id}`);

    return contract;
  }

  static async updateContract(contractId: string, updates: any, user: any): Promise<Contract | null> {
    // Get existing contract
    const existingContract = await this.getContractById(contractId, user);
    if (!existingContract) {
      return null;
    }

    // Build update query dynamically
    const updateFields: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        updateFields.push(`${this.camelToSnake(key)} = $${paramIndex}`);
        params.push(value);
        paramIndex++;
      }
    });

    if (updateFields.length === 0) {
      return existingContract;
    }

    updateFields.push(`updated_at = NOW()`);
    updateFields.push(`updated_by = $${paramIndex}`);
    params.push(user.id);
    paramIndex++;

    const query = `
      UPDATE contracts 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    params.push(contractId);

    const result = await DatabaseManager.query(query, params);
    const updatedContract = result.rows[0];

    // Log audit event
    await AuditService.logEvent({
      eventType: 'contract_updated',
      objectType: 'contract',
      objectId: contractId,
      oldValues: existingContract,
      newValues: updatedContract,
      userId: user.id,
      ipAddress: user.ipAddress,
      userAgent: user.userAgent
    });

    // Publish event
    await KafkaManager.publishEvent('contract.updated', {
      contractId,
      changes: updates,
      updatedBy: user.id,
      timestamp: new Date().toISOString()
    });

    logger.info(`Contract updated: ${contractId} by user ${user.id}`);

    return updatedContract;
  }

  static async addClause(contractId: string, clauseData: any, user: any): Promise<ContractClause> {
    // Verify contract exists and user has access
    const contract = await this.getContractById(contractId, user);
    if (!contract) {
      throw new Error('Contract not found');
    }

    const clauseId = uuidv4();

    const query = `
      INSERT INTO contract_clauses (
        id, contract_id, clause_number, clause_type, title, content
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const result = await DatabaseManager.query(query, [
      clauseId,
      contractId,
      clauseData.clauseNumber,
      clauseData.clauseType,
      clauseData.title,
      clauseData.content
    ]);

    const clause = result.rows[0];

    // Run AI analysis on the clause
    try {
      const aiAnalysis = await AIService.analyzeContractClause(clauseData.content, clauseData.clauseType);
      
      if (aiAnalysis) {
        await DatabaseManager.query(`
          UPDATE contract_clauses 
          SET ai_risk_score = $1, ai_risk_category = $2, ai_suggestions = $3
          WHERE id = $4
        `, [
          aiAnalysis.riskScore,
          aiAnalysis.riskCategory,
          aiAnalysis.suggestions,
          clauseId
        ]);
      }
    } catch (error) {
      logger.warn(`AI analysis failed for clause ${clauseId}:`, error);
    }

    // Log audit event
    await AuditService.logEvent({
      eventType: 'contract_clause_added',
      objectType: 'contract_clause',
      objectId: clauseId,
      newValues: clause,
      userId: user.id,
      ipAddress: user.ipAddress,
      userAgent: user.userAgent
    });

    logger.info(`Contract clause added: ${clauseId} to contract ${contractId}`);

    return clause;
  }

  static async getContractClauses(contractId: string, user: any): Promise<ContractClause[]> {
    // Verify contract exists and user has access
    const contract = await this.getContractById(contractId, user);
    if (!contract) {
      throw new Error('Contract not found');
    }

    const query = `
      SELECT * FROM contract_clauses 
      WHERE contract_id = $1 
      ORDER BY clause_number
    `;

    const result = await DatabaseManager.query(query, [contractId]);
    return result.rows;
  }

  static async runAIAnalysis(contractId: string, user: any) {
    const contract = await this.getContractById(contractId, user);
    if (!contract) {
      throw new Error('Contract not found');
    }

    const clauses = await this.getContractClauses(contractId, user);
    
    const analysis = await AIService.analyzeContract({
      contract,
      clauses
    });

    // Update contract with AI risk score
    if (analysis.overallRiskScore !== undefined) {
      await DatabaseManager.query(`
        UPDATE contracts 
        SET ai_risk_score = $1, ai_risk_factors = $2, updated_at = NOW()
        WHERE id = $3
      `, [
        analysis.overallRiskScore,
        JSON.stringify(analysis.riskFactors),
        contractId
      ]);
    }

    logger.info(`AI analysis completed for contract ${contractId}`);

    return analysis;
  }

  static async sendForSignature(contractId: string, signers: any[], message: string, user: any) {
    const contract = await this.getContractById(contractId, user);
    if (!contract) {
      throw new Error('Contract not found');
    }

    if (contract.status !== 'draft' && contract.status !== 'under_review') {
      throw new Error('Contract is not in a state that allows sending for signature');
    }

    const envelopeId = await ESignatureService.sendForSignature({
      contractId,
      documentUrl: contract.documentUrl,
      signers,
      message,
      subject: `Please sign: ${contract.title}`
    });

    // Update contract status
    await DatabaseManager.query(`
      UPDATE contracts 
      SET status = 'pending_signature', 
          esignature_envelope_id = $1,
          updated_at = NOW(),
          updated_by = $2
      WHERE id = $3
    `, [envelopeId, user.id, contractId]);

    // Log audit event
    await AuditService.logEvent({
      eventType: 'contract_sent_for_signature',
      objectType: 'contract',
      objectId: contractId,
      newValues: { envelopeId, signers },
      userId: user.id,
      ipAddress: user.ipAddress,
      userAgent: user.userAgent
    });

    logger.info(`Contract sent for signature: ${contractId}, envelope: ${envelopeId}`);

    return { envelopeId, status: 'pending_signature' };
  }

  static async getSignatureStatus(contractId: string, user: any) {
    const contract = await this.getContractById(contractId, user);
    if (!contract) {
      throw new Error('Contract not found');
    }

    if (!contract.esignatureEnvelopeId) {
      return { status: 'not_sent' };
    }

    const status = await ESignatureService.getEnvelopeStatus(contract.esignatureEnvelopeId);

    // Update contract if completed
    if (status.status === 'completed' && contract.status !== 'executed') {
      await DatabaseManager.query(`
        UPDATE contracts 
        SET status = 'executed', 
            signed_date = $1,
            updated_at = NOW()
        WHERE id = $2
      `, [new Date(), contractId]);

      // Publish event
      await KafkaManager.publishEvent('contract.signed', {
        contractId,
        signedDate: new Date().toISOString(),
        envelopeId: contract.esignatureEnvelopeId
      });
    }

    return status;
  }

  static async terminateContract(contractId: string, reason: string, effectiveDate: Date, user: any) {
    const contract = await this.getContractById(contractId, user);
    if (!contract) {
      throw new Error('Contract not found');
    }

    if (contract.status !== 'active' && contract.status !== 'executed') {
      throw new Error('Only active contracts can be terminated');
    }

    await DatabaseManager.query(`
      UPDATE contracts 
      SET status = 'terminated',
          expiration_date = $1,
          updated_at = NOW(),
          updated_by = $2
      WHERE id = $3
    `, [effectiveDate, user.id, contractId]);

    // Log audit event
    await AuditService.logEvent({
      eventType: 'contract_terminated',
      objectType: 'contract',
      objectId: contractId,
      newValues: { reason, effectiveDate },
      userId: user.id,
      ipAddress: user.ipAddress,
      userAgent: user.userAgent,
      reason
    });

    // Publish event
    await KafkaManager.publishEvent('contract.terminated', {
      contractId,
      reason,
      effectiveDate: effectiveDate.toISOString(),
      terminatedBy: user.id,
      timestamp: new Date().toISOString()
    });

    logger.info(`Contract terminated: ${contractId} by user ${user.id}`);

    return { status: 'terminated', effectiveDate, reason };
  }

  static async getAuditTrail(contractId: string, user: any) {
    // Verify contract exists and user has access
    const contract = await this.getContractById(contractId, user);
    if (!contract) {
      throw new Error('Contract not found');
    }

    const query = `
      SELECT fal.*, u.display_name as user_name
      FROM financial_audit_logs fal
      LEFT JOIN users u ON fal.user_id = u.id
      WHERE fal.object_type = 'contract' AND fal.object_id = $1
      ORDER BY fal.timestamp DESC
    `;

    const result = await DatabaseManager.query(query, [contractId]);
    return result.rows;
  }

  private static async generateContractNumber(contractType: string): Promise<string> {
    const prefix = this.getContractPrefix(contractType);
    const year = new Date().getFullYear();
    
    const query = `
      SELECT COUNT(*) as count 
      FROM contracts 
      WHERE contract_number LIKE $1 
      AND EXTRACT(YEAR FROM created_at) = $2
    `;
    
    const result = await DatabaseManager.query(query, [`${prefix}-${year}-%`, year]);
    const count = parseInt(result.rows[0].count) + 1;
    
    return `${prefix}-${year}-${count.toString().padStart(4, '0')}`;
  }

  private static getContractPrefix(contractType: string): string {
    const prefixes: { [key: string]: string } = {
      'master_service_agreement': 'MSA',
      'study_contract': 'SC',
      'site_agreement': 'SA',
      'amendment': 'AMD',
      'change_order': 'CO'
    };
    
    return prefixes[contractType] || 'CON';
  }

  private static camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}

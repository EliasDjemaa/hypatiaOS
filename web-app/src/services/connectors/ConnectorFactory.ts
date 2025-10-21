/**
 * Connector Factory Implementation
 * 
 * Factory for creating and managing different types of connectors.
 * Supports dependency injection and easy swapping between mock and real implementations.
 */

import {
  ConnectorFactory,
  EDCConnector,
  CTMSConnector,
  ERPConnector,
  eTMFConnector,
  IRTConnector,
  ConnectorCredentials,
} from './interfaces';

// Mock implementations
import { MockEDCConnector } from './mock/MockEDCConnector';
import { MockCTMSConnector } from './mock/MockCTMSConnector';
import { MockERPConnector } from './mock/MockERPConnector';

// Real implementations (to be added when APIs are available)
// import { VeevaEDCConnector } from './real/VeevaEDCConnector';
// import { MedidataCTMSConnector } from './real/MedidataCTMSConnector';
// import { NetSuiteERPConnector } from './real/NetSuiteERPConnector';

export class HypatiaConnectorFactory implements ConnectorFactory {
  private static instance: HypatiaConnectorFactory;
  private connectorCache = new Map<string, any>();

  private constructor() {}

  static getInstance(): HypatiaConnectorFactory {
    if (!HypatiaConnectorFactory.instance) {
      HypatiaConnectorFactory.instance = new HypatiaConnectorFactory();
    }
    return HypatiaConnectorFactory.instance;
  }

  createEDCConnector(type: string, credentials?: ConnectorCredentials): EDCConnector {
    const cacheKey = `edc-${type}`;
    
    if (this.connectorCache.has(cacheKey)) {
      return this.connectorCache.get(cacheKey);
    }

    let connector: EDCConnector;

    switch (type.toLowerCase()) {
      case 'mock':
      case 'test':
      case 'development':
        connector = new MockEDCConnector();
        break;
      
      // Real implementations (uncomment when available)
      // case 'veeva':
      // case 'veeva-vault':
      //   connector = new VeevaEDCConnector();
      //   break;
      
      // case 'medidata':
      // case 'rave':
      //   connector = new MedidataEDCConnector();
      //   break;
      
      // case 'redcap':
      //   connector = new REDCapConnector();
      //   break;
      
      // case 'castor':
      //   connector = new CastorEDCConnector();
      //   break;

      default:
        console.warn(`Unknown EDC connector type: ${type}. Falling back to mock.`);
        connector = new MockEDCConnector();
    }

    // Initialize connector with credentials if provided
    if (credentials) {
      connector.authenticate(credentials).catch(error => {
        console.error(`Failed to authenticate EDC connector ${type}:`, error);
      });
    }

    this.connectorCache.set(cacheKey, connector);
    return connector;
  }

  createCTMSConnector(type: string, credentials?: ConnectorCredentials): CTMSConnector {
    const cacheKey = `ctms-${type}`;
    
    if (this.connectorCache.has(cacheKey)) {
      return this.connectorCache.get(cacheKey);
    }

    let connector: CTMSConnector;

    switch (type.toLowerCase()) {
      case 'mock':
      case 'test':
      case 'development':
        connector = new MockCTMSConnector();
        break;
      
      // Real implementations (uncomment when available)
      // case 'veeva':
      // case 'veeva-vault-ctms':
      //   connector = new VeevaCTMSConnector();
      //   break;
      
      // case 'medidata':
      // case 'medidata-ctms':
      //   connector = new MedidataCTMSConnector();
      //   break;
      
      // case 'oracle':
      // case 'oracle-siebel':
      //   connector = new OracleCTMSConnector();
      //   break;

      default:
        console.warn(`Unknown CTMS connector type: ${type}. Falling back to mock.`);
        connector = new MockCTMSConnector();
    }

    if (credentials) {
      connector.authenticate(credentials).catch(error => {
        console.error(`Failed to authenticate CTMS connector ${type}:`, error);
      });
    }

    this.connectorCache.set(cacheKey, connector);
    return connector;
  }

  createERPConnector(type: string, credentials?: ConnectorCredentials): ERPConnector {
    const cacheKey = `erp-${type}`;
    
    if (this.connectorCache.has(cacheKey)) {
      return this.connectorCache.get(cacheKey);
    }

    let connector: ERPConnector;

    switch (type.toLowerCase()) {
      case 'mock':
      case 'test':
      case 'development':
        connector = new MockERPConnector();
        break;
      
      // Real implementations (uncomment when available)
      // case 'netsuite':
      //   connector = new NetSuiteERPConnector();
      //   break;
      
      // case 'sap':
      //   connector = new SAPERPConnector();
      //   break;
      
      // case 'quickbooks':
      //   connector = new QuickBooksConnector();
      //   break;
      
      // case 'oracle':
      // case 'oracle-erp':
      //   connector = new OracleERPConnector();
      //   break;

      default:
        console.warn(`Unknown ERP connector type: ${type}. Falling back to mock.`);
        connector = new MockERPConnector();
    }

    if (credentials) {
      connector.authenticate(credentials).catch(error => {
        console.error(`Failed to authenticate ERP connector ${type}:`, error);
      });
    }

    this.connectorCache.set(cacheKey, connector);
    return connector;
  }

  createeTMFConnector(type: string, credentials?: ConnectorCredentials): eTMFConnector {
    // Placeholder implementation - will be implemented when eTMF integration is needed
    throw new Error('eTMF connectors not yet implemented');
  }

  createIRTConnector(type: string, credentials?: ConnectorCredentials): IRTConnector {
    // Placeholder implementation - will be implemented when IRT integration is needed
    throw new Error('IRT connectors not yet implemented');
  }

  // Utility methods for connector management
  async connectAll(): Promise<boolean> {
    const connectors = Array.from(this.connectorCache.values());
    const results = await Promise.allSettled(
      connectors.map(connector => connector.connect())
    );

    const allConnected = results.every(result => 
      result.status === 'fulfilled' && result.value === true
    );

    return allConnected;
  }

  async disconnectAll(): Promise<void> {
    const connectors = Array.from(this.connectorCache.values());
    await Promise.allSettled(
      connectors.map(connector => connector.disconnect())
    );
    this.connectorCache.clear();
  }

  async healthCheckAll(): Promise<Record<string, any>> {
    const results: Record<string, any> = {};
    
    for (const [key, connector] of this.connectorCache.entries()) {
      try {
        results[key] = await connector.healthCheck();
      } catch (error) {
        results[key] = {
          status: 'unhealthy',
          error: error instanceof Error ? error.message : 'Unknown error',
          lastCheck: new Date().toISOString(),
        };
      }
    }

    return results;
  }

  getConnectorStatus(): Record<string, boolean> {
    const status: Record<string, boolean> = {};
    
    for (const [key, connector] of this.connectorCache.entries()) {
      status[key] = connector.isConnected();
    }

    return status;
  }

  clearCache(): void {
    this.connectorCache.clear();
  }

  // Configuration methods
  static createFromConfig(config: ConnectorConfig): HypatiaConnectorFactory {
    const factory = HypatiaConnectorFactory.getInstance();
    
    // Pre-create connectors based on configuration
    if (config.edc) {
      factory.createEDCConnector(config.edc.type, config.edc.credentials);
    }
    
    if (config.ctms) {
      factory.createCTMSConnector(config.ctms.type, config.ctms.credentials);
    }
    
    if (config.erp) {
      factory.createERPConnector(config.erp.type, config.erp.credentials);
    }

    return factory;
  }
}

// Configuration interfaces
export interface ConnectorConfig {
  edc?: {
    type: string;
    credentials?: ConnectorCredentials;
  };
  ctms?: {
    type: string;
    credentials?: ConnectorCredentials;
  };
  erp?: {
    type: string;
    credentials?: ConnectorCredentials;
  };
  etmf?: {
    type: string;
    credentials?: ConnectorCredentials;
  };
  irt?: {
    type: string;
    credentials?: ConnectorCredentials;
  };
}

// Default configuration for development
export const defaultConnectorConfig: ConnectorConfig = {
  edc: {
    type: process.env.REACT_APP_EDC_CONNECTOR_TYPE || 'mock',
    credentials: {
      apiKey: process.env.REACT_APP_EDC_API_KEY,
      endpoint: process.env.REACT_APP_EDC_ENDPOINT,
    },
  },
  ctms: {
    type: process.env.REACT_APP_CTMS_CONNECTOR_TYPE || 'mock',
    credentials: {
      apiKey: process.env.REACT_APP_CTMS_API_KEY,
      endpoint: process.env.REACT_APP_CTMS_ENDPOINT,
    },
  },
  erp: {
    type: process.env.REACT_APP_ERP_CONNECTOR_TYPE || 'mock',
    credentials: {
      apiKey: process.env.REACT_APP_ERP_API_KEY,
      endpoint: process.env.REACT_APP_ERP_ENDPOINT,
    },
  },
};

// Singleton instance getter
export const getConnectorFactory = () => HypatiaConnectorFactory.getInstance();

// Export default configured factory
export default HypatiaConnectorFactory.createFromConfig(defaultConnectorConfig);

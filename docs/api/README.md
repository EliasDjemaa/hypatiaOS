# hypatiaOS API Documentation

## Overview

The hypatiaOS API is built using a microservices architecture with RESTful APIs and event-driven communication. Each service exposes its own API endpoints while communicating internally via gRPC and Kafka events.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web App       │    │   Mobile App    │    │   External      │
│   (React)       │    │ (React Native)  │    │   Integrations  │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────┴─────────────┐
                    │     API Gateway           │
                    │     (nginx/Kong)          │
                    └─────────────┬─────────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
┌───────▼────────┐    ┌───────────▼────────┐    ┌──────────▼──────────┐
│ Auth Service   │    │ Study Management   │    │ EDC Engine          │
│ Port: 3001     │    │ Port: 3002         │    │ Port: 3003          │
└────────────────┘    └────────────────────┘    └─────────────────────┘
        │                         │                         │
        └─────────────────────────┼─────────────────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │     Event Bus (Kafka)     │
                    └───────────────────────────┘
```

## Authentication

All API endpoints (except auth endpoints) require authentication using JWT Bearer tokens.

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Token Refresh
Access tokens expire after 24 hours. Use the refresh token to obtain new access tokens.

## Services

### 1. Auth Service (Port 3001)

Handles authentication, authorization, and user management.

#### Base URL: `http://localhost:3001/api`

#### Endpoints:

**POST /auth/login**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "mfaToken": "123456" // Optional, required if MFA enabled
}
```

**POST /auth/register**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "displayName": "John Doe",
  "organizationId": "uuid",
  "role": "site_coordinator"
}
```

**POST /auth/refresh**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

**GET /users/profile**
- Returns current user profile

**PUT /users/profile**
- Updates user profile

**GET /roles**
- Lists available roles and permissions

### 2. Study Management Service (Port 3002)

Manages clinical studies, sites, and trial operations.

#### Base URL: `http://localhost:3002/api`

#### Endpoints:

**GET /studies**
- Lists studies accessible to the user

**POST /studies**
```json
{
  "protocolId": "PROTO-001",
  "title": "Phase II Study of Drug X",
  "phase": "phase_2",
  "therapeuticArea": "Oncology",
  "sponsorId": "uuid"
}
```

**GET /studies/{studyId}**
- Get study details

**GET /studies/{studyId}/sites**
- List sites for a study

**POST /studies/{studyId}/sites**
```json
{
  "organizationId": "uuid",
  "principalInvestigatorId": "uuid",
  "targetEnrollment": 50
}
```

### 3. EDC Engine Service (Port 3003)

Handles electronic data capture, forms, and clinical data.

#### Base URL: `http://localhost:3003/api`

#### Endpoints:

**GET /forms**
- List CRF forms for a study

**POST /forms**
```json
{
  "studyId": "uuid",
  "name": "Demographics",
  "formSchema": {
    "fields": [
      {
        "name": "dateOfBirth",
        "type": "date",
        "label": "Date of Birth",
        "required": true
      }
    ]
  }
}
```

**GET /participants/{participantId}/visits**
- List visits for a participant

**POST /visits/{visitId}/forms/{formId}**
```json
{
  "data": {
    "dateOfBirth": "1985-03-15",
    "gender": "Female"
  }
}
```

**GET /queries**
- List data queries

**POST /queries**
```json
{
  "formInstanceId": "uuid",
  "fieldName": "height",
  "message": "Please verify height measurement",
  "priority": "medium"
}
```

### 4. eTMF Service (Port 3004)

Manages documents and electronic Trial Master File.

#### Base URL: `http://localhost:3004/api`

#### Endpoints:

**GET /documents**
- List documents with filtering

**POST /documents/upload**
- Upload document (multipart/form-data)

**GET /documents/{documentId}/download**
- Download document

**PUT /documents/{documentId}/metadata**
```json
{
  "docType": "protocol",
  "tags": ["v2.0", "amendment"],
  "metadata": {
    "author": "Dr. Smith",
    "version": "2.0"
  }
}
```

**GET /etmf/index**
- Get eTMF completeness index

### 5. AI Engine Service (Port 3005)

Provides AI-powered automation and analysis.

#### Base URL: `http://localhost:3005/api`

#### Endpoints:

**POST /ai/protocol-parse**
```json
{
  "documentId": "uuid",
  "extractFields": ["endpoints", "eligibility", "visits"]
}
```

**POST /ai/document-tag**
```json
{
  "documentId": "uuid",
  "suggestTags": true,
  "suggestETMFCategory": true
}
```

**POST /ai/anomaly-check**
```json
{
  "formInstanceId": "uuid",
  "checkTypes": ["range", "consistency", "missing"]
}
```

**POST /ai/patient-match**
```json
{
  "studyId": "uuid",
  "inclusionCriteria": ["age >= 18", "diagnosis = cancer"],
  "exclusionCriteria": ["pregnant", "prior_therapy"]
}
```

## Error Handling

All APIs return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": {
    "field": "validation error details"
  }
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `500` - Internal Server Error

## Rate Limiting

- 100 requests per 15 minutes per IP for auth endpoints
- 1000 requests per hour for authenticated endpoints
- 10,000 requests per hour for admin users

## Webhooks

Services can register webhooks for real-time notifications:

**POST /webhooks/register**
```json
{
  "url": "https://your-app.com/webhook",
  "events": ["participant.enrolled", "form.submitted", "query.created"],
  "secret": "webhook_secret"
}
```

## Event Types

- `participant.enrolled`
- `participant.withdrawn`
- `form.submitted`
- `form.locked`
- `query.created`
- `query.resolved`
- `document.uploaded`
- `visit.scheduled`
- `visit.completed`
- `adverse_event.reported`

## SDKs and Libraries

### JavaScript/TypeScript
```bash
npm install @hypatia/sdk
```

```typescript
import { HypatiaClient } from '@hypatia/sdk';

const client = new HypatiaClient({
  baseUrl: 'http://localhost:8080/api',
  apiKey: 'your-api-key'
});

const studies = await client.studies.list();
```

### Python
```bash
pip install hypatia-sdk
```

```python
from hypatia_sdk import HypatiaClient

client = HypatiaClient(
    base_url='http://localhost:8080/api',
    api_key='your-api-key'
)

studies = client.studies.list()
```

## Integration Examples

### FHIR Integration
```json
POST /integration/fhir/observations
{
  "resourceType": "Observation",
  "subject": {"reference": "Patient/123"},
  "code": {"coding": [{"system": "http://loinc.org", "code": "29463-7"}]},
  "valueQuantity": {"value": 68, "unit": "kg"}
}
```

### HL7 v2 Integration
```
MSH|^~\&|LAB|HOSPITAL|EDC|HYPATIA|20240115120000||ORU^R01|123456|P|2.5
PID|1||S001^^^STUDY||DOE^JANE||19850315|F
OBR|1||LAB123|CBC^Complete Blood Count
OBX|1|NM|WBC^White Blood Cells|1|7.5|10*3/uL|4.0-11.0|N|||F
```

## Testing

### Postman Collection
Import the Postman collection from `/docs/api/postman/hypatia-api.json`

### cURL Examples

**Login:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Create Study:**
```bash
curl -X POST http://localhost:3002/api/studies \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"protocolId":"PROTO-001","title":"Test Study","phase":"phase_2"}'
```

## Compliance

### 21 CFR Part 11
- All data changes are logged with digital signatures
- User authentication with audit trails
- Electronic records are tamper-evident

### FHIR R4 Compliance
- Patient data follows FHIR Patient resource structure
- Observations use FHIR Observation resource
- Medications follow FHIR MedicationStatement

### CDISC Standards
- Export data in CDISC ODM format
- Generate SDTM domains for regulatory submission
- Support for define.xml metadata

## Support

For API support:
- Documentation: http://localhost:3000/docs
- GitHub Issues: https://github.com/your-org/hypatia-os/issues
- Email: api-support@hypatia-os.com

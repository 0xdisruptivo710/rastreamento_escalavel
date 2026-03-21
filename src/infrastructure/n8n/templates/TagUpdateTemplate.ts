import { WorkflowPayload } from '@/domain/interfaces/IN8NClient'

interface TagUpdateParams {
  slug: string
  tableName: string
  webhookPathTag: string
  nomeEmpresa: string
}

export function getTagUpdateTemplate(params: TagUpdateParams): WorkflowPayload {
  const { tableName, webhookPathTag, nomeEmpresa } = params

  return {
    name: `Tag Update - ${nomeEmpresa}`,
    settings: {
      executionOrder: 'v1',
    },
    nodes: [
      {
        parameters: {
          httpMethod: 'POST',
          path: webhookPathTag,
          responseMode: 'onReceived',
          options: {},
        },
        id: 'webhook-tag-update',
        name: 'Webhook Tag Update',
        type: 'n8n-nodes-base.webhook',
        typeVersion: 2,
        position: [250, 300],
        webhookId: `tag-${webhookPathTag}`,
      },
      {
        parameters: {
          conditions: {
            options: { caseSensitive: false, leftValue: '', typeValidation: 'strict' },
            conditions: [
              {
                id: 'filter-agendado',
                leftValue: '={{ JSON.stringify($json.body.tags || []) }}',
                rightValue: 'AGENDADO',
                operator: { type: 'string', operation: 'contains' },
              },
            ],
            combinator: 'and',
          },
          options: {},
        },
        id: 'filter-tag-agendado',
        name: 'Filtra Tag AGENDADO',
        type: 'n8n-nodes-base.if',
        typeVersion: 2,
        position: [470, 300],
      },
      {
        parameters: {
          mode: 'manual',
          duplicateItem: false,
          assignments: {
            assignments: [
              { id: 'first_name', name: 'first_name', value: '={{ $json.body.first_name }}', type: 'string' },
              { id: 'last_name', name: 'last_name', value: '={{ $json.body.last_name }}', type: 'string' },
              { id: 'email', name: 'email', value: '={{ $json.body.email }}', type: 'string' },
              { id: 'phone', name: 'phone', value: '={{ $json.body.phone }}', type: 'string' },
            ],
          },
          options: {},
        },
        id: 'edit-fields',
        name: 'Extrai Campos',
        type: 'n8n-nodes-base.set',
        typeVersion: 3.4,
        position: [690, 300],
      },
      {
        parameters: {
          operation: 'get',
          tableId: tableName,
          filters: {
            conditions: [
              {
                keyName: 'Número',
                condition: 'eq',
                keyValue: '={{ $json.phone }}',
              },
            ],
          },
        },
        id: 'get-lead-tag',
        name: 'Busca Lead',
        type: 'n8n-nodes-base.supabase',
        typeVersion: 1,
        position: [910, 300],
        credentials: {
          supabaseApi: {
            id: 'uTSutAr6qxhzfkcO',
            name: 'Supabase account',
          },
        },
      },
      {
        parameters: {
          conditions: {
            options: { caseSensitive: true, leftValue: '', typeValidation: 'strict' },
            conditions: [
              {
                id: 'condition-lead-exists',
                leftValue: '={{ $json.id }}',
                rightValue: '',
                operator: { type: 'number', operation: 'exists', singleValue: true },
              },
            ],
            combinator: 'and',
          },
          options: {},
        },
        id: 'filter-lead-exists',
        name: 'Se não estiver, passa',
        type: 'n8n-nodes-base.if',
        typeVersion: 2,
        position: [1130, 300],
      },
      {
        parameters: {
          mode: 'runOnceForEachItem',
          jsCode: `const now = new Date();\nreturn [{ json: { ...items[0].json, current_date: now.toISOString() } }];`,
        },
        id: 'date-now',
        name: 'Pega Data Atual',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [1350, 300],
      },
      {
        parameters: {
          mode: 'runOnceForEachItem',
          jsCode: `const date = new Date();\nconst unix = Math.floor(date.getTime() / 1000);\nreturn [{ json: { ...items[0].json, unix_timestamp: unix } }];`,
        },
        id: 'format-unix',
        name: 'Formata Unix Timestamp',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [1570, 300],
      },
      {
        parameters: {
          mode: 'runOnceForEachItem',
          jsCode: `const crypto = require('crypto');\nconst fn = $("Extrai Campos").item.json.first_name || '';\nreturn [{ json: { ...items[0].json, hashed_fn: crypto.createHash('sha256').update(fn.toLowerCase()).digest('hex') } }];`,
        },
        id: 'hash-fn',
        name: 'Hash First Name',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [1790, 300],
      },
      {
        parameters: {
          mode: 'runOnceForEachItem',
          jsCode: `const crypto = require('crypto');\nconst ln = $("Extrai Campos").item.json.last_name || '';\nreturn [{ json: { ...items[0].json, hashed_ln: crypto.createHash('sha256').update(ln.toLowerCase()).digest('hex') } }];`,
        },
        id: 'hash-ln',
        name: 'Hash Last Name',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [2010, 300],
      },
      {
        parameters: {
          mode: 'runOnceForEachItem',
          jsCode: `const crypto = require('crypto');\nconst phone = $("Extrai Campos").item.json.phone || '';\nreturn [{ json: { ...items[0].json, hashed_phone: crypto.createHash('sha256').update(phone).digest('hex') } }];`,
        },
        id: 'hash-phone-tag',
        name: 'Hash Phone',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [2230, 300],
      },
      {
        parameters: {
          method: 'GET',
          url: '=https://graph.facebook.com/v21.0/{{ $("Busca Lead").item.json.cta_clid }}',
          authentication: 'genericCredentialType',
          genericAuthType: 'httpQueryAuth',
          options: {},
          sendQuery: true,
          queryParameters: {
            parameters: [
              { name: 'fields', value: 'tracking_specs' },
            ],
          },
        },
        id: 'get-pixel-tag',
        name: 'Buscar ID pixel',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [2450, 300],
        credentials: {
          httpQueryAuth: {
            id: 'BbRxeFFy8pLUjl7V',
            name: 'Facebook Graph API',
          },
        },
      },
      {
        parameters: {
          mode: 'runOnceForEachItem',
          jsCode: `const tracking = items[0].json.tracking_specs || [];\nlet dataset_id = '';\nlet page_id = '';\n\nfor (const spec of tracking) {\n  if (spec.dataset) dataset_id = spec.dataset[0];\n  if (spec.page) page_id = spec.page[0];\n}\n\nreturn [{ json: { ...items[0].json, dataset_id, page_id } }];`,
        },
        id: 'extract-pixel-tag',
        name: 'Extrair ID pixel e page',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [2670, 300],
      },
      {
        parameters: {
          method: 'POST',
          url: '=https://graph.facebook.com/v21.0/{{ $json.dataset_id }}/events',
          authentication: 'genericCredentialType',
          genericAuthType: 'httpQueryAuth',
          sendBody: true,
          specifyBody: 'json',
          jsonBody: `={\n  "data": [\n    {\n      "event_name": "Schedule",\n      "event_time": {{ $("Formata Unix Timestamp").item.json.unix_timestamp }},\n      "action_source": "website",\n      "user_data": {\n        "fn": ["{{ $("Hash First Name").item.json.hashed_fn }}"],\n        "ln": ["{{ $("Hash Last Name").item.json.hashed_ln }}"],\n        "ph": ["{{ $("Hash Phone").item.json.hashed_phone }}"]\n      }\n    }\n  ]\n}`,
          options: {},
        },
        id: 'send-capi-schedule',
        name: 'Enviar conversão Schedule',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [2890, 300],
        credentials: {
          httpQueryAuth: {
            id: 'BbRxeFFy8pLUjl7V',
            name: 'Facebook Graph API',
          },
        },
      },
      {
        parameters: {
          operation: 'update',
          tableId: tableName,
          matchingColumn: 'Número',
          dataToSend: 'defineBelow',
          fieldsUi: {
            fieldValues: [
              { fieldName: 'Tracking', fieldValue: 'Feito' },
            ],
          },
        },
        id: 'update-tracking',
        name: 'Marca Tracking Feito',
        type: 'n8n-nodes-base.supabase',
        typeVersion: 1,
        position: [3110, 300],
        credentials: {
          supabaseApi: {
            id: 'uTSutAr6qxhzfkcO',
            name: 'Supabase account',
          },
        },
      },
    ],
    connections: {
      'Webhook Tag Update': { main: [[{ node: 'Filtra Tag AGENDADO', type: 'main', index: 0 }]] },
      'Filtra Tag AGENDADO': { main: [[{ node: 'Extrai Campos', type: 'main', index: 0 }], []] },
      'Extrai Campos': { main: [[{ node: 'Busca Lead', type: 'main', index: 0 }]] },
      'Busca Lead': { main: [[{ node: 'Se não estiver, passa', type: 'main', index: 0 }]] },
      'Se não estiver, passa': { main: [[{ node: 'Pega Data Atual', type: 'main', index: 0 }], []] },
      'Pega Data Atual': { main: [[{ node: 'Formata Unix Timestamp', type: 'main', index: 0 }]] },
      'Formata Unix Timestamp': { main: [[{ node: 'Hash First Name', type: 'main', index: 0 }]] },
      'Hash First Name': { main: [[{ node: 'Hash Last Name', type: 'main', index: 0 }]] },
      'Hash Last Name': { main: [[{ node: 'Hash Phone', type: 'main', index: 0 }]] },
      'Hash Phone': { main: [[{ node: 'Buscar ID pixel', type: 'main', index: 0 }]] },
      'Buscar ID pixel': { main: [[{ node: 'Extrair ID pixel e page', type: 'main', index: 0 }]] },
      'Extrair ID pixel e page': { main: [[{ node: 'Enviar conversão Schedule', type: 'main', index: 0 }]] },
      'Enviar conversão Schedule': { main: [[{ node: 'Marca Tracking Feito', type: 'main', index: 0 }]] },
    },
  }
}

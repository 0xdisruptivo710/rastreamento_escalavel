import { WorkflowPayload } from '@/domain/interfaces/IN8NClient'

interface LeadEntryParams {
  slug: string
  tableName: string
  webhookPath: string
  nomeEmpresa: string
}

export function getLeadEntryTemplate(params: LeadEntryParams): WorkflowPayload {
  const { tableName, webhookPath, nomeEmpresa } = params

  return {
    name: `Lead Entry - ${nomeEmpresa}`,
    settings: {
      executionOrder: 'v1',
    },
    nodes: [
      {
        parameters: {
          httpMethod: 'POST',
          path: webhookPath,
          responseMode: 'onReceived',
          options: {},
        },
        id: 'webhook-lead-entry',
        name: 'Webhook Lead Entry',
        type: 'n8n-nodes-base.webhook',
        typeVersion: 2,
        position: [250, 300],
        webhookId: `lead-${webhookPath}`,
      },
      {
        parameters: {
          conditions: {
            options: { caseSensitive: true, leftValue: '', typeValidation: 'strict' },
            conditions: [
              {
                id: 'condition-utm-clid',
                leftValue: '={{ $json.body.utm?.clid }}',
                rightValue: '',
                operator: { type: 'string', operation: 'exists', singleValue: true },
              },
            ],
            combinator: 'and',
          },
          options: {},
        },
        id: 'if-utm-exists',
        name: 'Verifica UTM',
        type: 'n8n-nodes-base.if',
        typeVersion: 2,
        position: [470, 300],
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
                keyValue: '={{ $json.body.phone }}',
              },
            ],
          },
        },
        id: 'get-a-row',
        name: 'Busca Lead',
        type: 'n8n-nodes-base.supabase',
        typeVersion: 1,
        position: [690, 300],
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
                id: 'condition-not-exists',
                leftValue: '={{ $json.id }}',
                rightValue: '',
                operator: { type: 'number', operation: 'notExists', singleValue: true },
              },
            ],
            combinator: 'and',
          },
          options: {},
        },
        id: 'filter-new-lead',
        name: 'Se não estiver, passa',
        type: 'n8n-nodes-base.if',
        typeVersion: 2,
        position: [910, 300],
      },
      {
        parameters: {
          mode: 'runOnceForEachItem',
          jsCode: `const now = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });\nreturn [{ json: { ...items[0].json, data_entrada: now } }];`,
        },
        id: 'pega-data',
        name: 'Pega Data de Entrada',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [1130, 300],
      },
      {
        parameters: {
          method: 'GET',
          url: '=https://graph.facebook.com/v21.0/{{ $("Webhook Lead Entry").item.json.body.utm.clid }}',
          authentication: 'genericCredentialType',
          genericAuthType: 'httpQueryAuth',
          options: {},
          sendQuery: true,
          queryParameters: {
            parameters: [
              { name: 'fields', value: 'campaign_name,adset_name,ad_name' },
            ],
          },
        },
        id: 'fb-campaign-data',
        name: 'Ver dados de campanha',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [1350, 300],
        credentials: {
          httpQueryAuth: {
            id: 'BbRxeFFy8pLUjl7V',
            name: 'Facebook Graph API',
          },
        },
      },
      {
        parameters: {
          mode: 'manual',
          duplicateItem: false,
          assignments: {
            assignments: [
              { id: 'nome', name: 'Nome', value: '={{ $("Webhook Lead Entry").item.json.body.name }}', type: 'string' },
              { id: 'numero', name: 'Número', value: '={{ $("Webhook Lead Entry").item.json.body.phone }}', type: 'string' },
              { id: 'email', name: 'E-mail', value: '={{ $("Webhook Lead Entry").item.json.body.email }}', type: 'string' },
              { id: 'cidade', name: 'Cidade', value: '={{ $("Webhook Lead Entry").item.json.body.city }}', type: 'string' },
              { id: 'campanha', name: 'Campanha', value: '={{ $json.campaign_name }}', type: 'string' },
              { id: 'conjunto', name: 'Conjunto', value: '={{ $json.adset_name }}', type: 'string' },
              { id: 'anuncio', name: 'Anúncio', value: '={{ $json.ad_name }}', type: 'string' },
              { id: 'source_id', name: 'source_id', value: '={{ $("Webhook Lead Entry").item.json.body.utm.id }}', type: 'string' },
              { id: 'cta_clid', name: 'cta_clid', value: '={{ $("Webhook Lead Entry").item.json.body.utm.clid }}', type: 'string' },
              { id: 'thumbnail', name: 'thumbnail', value: '={{ $("Webhook Lead Entry").item.json.body.utm.thumbnail }}', type: 'string' },
              { id: 'cta', name: 'cta', value: '={{ $("Webhook Lead Entry").item.json.body.utm.cta }}', type: 'string' },
              { id: 'url', name: 'url', value: '={{ $("Webhook Lead Entry").item.json.body.utm.url }}', type: 'string' },
              { id: 'source_url', name: 'source_url', value: '={{ $("Webhook Lead Entry").item.json.body.utm.source_url }}', type: 'string' },
              { id: 'data_criacao', name: 'data_criacao', value: '={{ $("Pega Data de Entrada").item.json.data_entrada }}', type: 'string' },
            ],
          },
          options: {},
        },
        id: 'set-fields',
        name: 'Junta info a ser armazenada',
        type: 'n8n-nodes-base.set',
        typeVersion: 3.4,
        position: [1570, 300],
      },
      {
        parameters: {
          operation: 'create',
          tableId: tableName,
          dataToSend: 'autoMapInputData',
          options: {},
        },
        id: 'create-a-row',
        name: 'Cria Lead no Supabase',
        type: 'n8n-nodes-base.supabase',
        typeVersion: 1,
        position: [1790, 300],
        credentials: {
          supabaseApi: {
            id: 'uTSutAr6qxhzfkcO',
            name: 'Supabase account',
          },
        },
      },
      {
        parameters: {
          mode: 'runOnceForEachItem',
          jsCode: `const date = new Date();\nconst unix = Math.floor(date.getTime() / 1000);\nreturn [{ json: { ...items[0].json, unix_timestamp: unix } }];`,
        },
        id: 'format-timestamp',
        name: 'Formata Timestamp Meta',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [2010, 300],
      },
      {
        parameters: {
          mode: 'runOnceForEachItem',
          jsCode: `const crypto = require('crypto');\nconst phone = items[0].json['Número'] || '';\nconst hashed = crypto.createHash('sha256').update(phone).digest('hex');\nreturn [{ json: { ...items[0].json, hashed_phone: hashed } }];`,
        },
        id: 'hash-phone',
        name: 'Criptografar telefone',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [2230, 300],
      },
      {
        parameters: {
          method: 'GET',
          url: '=https://graph.facebook.com/v21.0/{{ $("Webhook Lead Entry").item.json.body.utm.clid }}',
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
        id: 'get-pixel-id',
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
        id: 'extract-pixel-page',
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
          jsonBody: `={\n  "data": [\n    {\n      "event_name": "Lead",\n      "event_time": {{ $("Formata Timestamp Meta").item.json.unix_timestamp }},\n      "action_source": "website",\n      "user_data": {\n        "ph": ["{{ $("Criptografar telefone").item.json.hashed_phone }}"]\n      }\n    }\n  ]\n}`,
          options: {},
        },
        id: 'send-capi-lead',
        name: 'Enviar conversão de Lead',
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
    ],
    connections: {
      'Webhook Lead Entry': { main: [[{ node: 'Verifica UTM', type: 'main', index: 0 }]] },
      'Verifica UTM': { main: [[{ node: 'Busca Lead', type: 'main', index: 0 }], []] },
      'Busca Lead': { main: [[{ node: 'Se não estiver, passa', type: 'main', index: 0 }]] },
      'Se não estiver, passa': { main: [[{ node: 'Pega Data de Entrada', type: 'main', index: 0 }], []] },
      'Pega Data de Entrada': { main: [[{ node: 'Ver dados de campanha', type: 'main', index: 0 }]] },
      'Ver dados de campanha': { main: [[{ node: 'Junta info a ser armazenada', type: 'main', index: 0 }]] },
      'Junta info a ser armazenada': { main: [[{ node: 'Cria Lead no Supabase', type: 'main', index: 0 }]] },
      'Cria Lead no Supabase': { main: [[{ node: 'Formata Timestamp Meta', type: 'main', index: 0 }]] },
      'Formata Timestamp Meta': { main: [[{ node: 'Criptografar telefone', type: 'main', index: 0 }]] },
      'Criptografar telefone': { main: [[{ node: 'Buscar ID pixel', type: 'main', index: 0 }]] },
      'Buscar ID pixel': { main: [[{ node: 'Extrair ID pixel e page', type: 'main', index: 0 }]] },
      'Extrair ID pixel e page': { main: [[{ node: 'Enviar conversão de Lead', type: 'main', index: 0 }]] },
    },
  }
}

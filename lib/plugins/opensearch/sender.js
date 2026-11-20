import { getLogger } from '@sitespeed.io/log';

const log = getLogger('sitespeedio.plugin.opensearch');

export class OpenSearchSender {
  constructor(host, port, index, options = {}) {
    this.baseUrl = `${options.secure ? 'https' : 'http'}://${host}:${port || 9200}`;
    this.indexPrefix = index || 'sitespeed';
    if (options.username && options.password) {
      const encoded = Buffer.from(
        `${options.username}:${options.password}`
      ).toString('base64');
      this.authHeader = `Basic ${encoded}`;
    }
  }

  indexName(type) {
    const date = new Date().toISOString().slice(0, 10).replaceAll('-', '.');
    return type
      ? `${this.indexPrefix}-${type}-${date}`
      : `${this.indexPrefix}-${date}`;
  }

  async request(method, path, body) {
    const headers = { 'Content-Type': 'application/json' };
    if (this.authHeader) {
      headers['Authorization'] = this.authHeader;
    }
    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    if (response.status === 404) return;
    const result = await response.json();
    if (!response.ok) {
      throw new Error(
        `OpenSearch ${method} ${path} failed (${response.status}): ${JSON.stringify(result)}`
      );
    }
    return result;
  }

  // Only write the template when it is missing or older, so a template
  // that a user changed stays until we change ours.
  async putIndexTemplate(name, template) {
    const path = `/_index_template/${name}`;
    const existing = await this.request('GET', path);
    const version = existing?.index_templates?.[0]?.index_template?.version;
    if (version >= template.version) return false;
    await this.request('PUT', path, template);
    return true;
  }

  // OpenSearch ignores a policy_id in the index settings. Only the
  // ism_template of the policy makes new indices use it.
  async putISMPolicy(policyId, minIndexAge, indexPatterns) {
    const path = `/_plugins/_ism/policies/${policyId}`;
    const policy = {
      description: `Delete sitespeed ${policyId} indices after ${minIndexAge}`,
      default_state: 'hot',
      states: [
        {
          name: 'hot',
          actions: [],
          transitions: [
            {
              state_name: 'delete',
              conditions: { min_index_age: minIndexAge }
            }
          ]
        },
        {
          name: 'delete',
          actions: [{ delete: {} }],
          transitions: []
        }
      ],
      ism_template: [{ index_patterns: indexPatterns, priority: 100 }]
    };

    const existing = await this.request('GET', path);
    if (existing) {
      const current = existing.policy;
      const sameAge =
        current.states?.[0]?.transitions?.[0]?.conditions?.min_index_age ===
        minIndexAge;
      const samePatterns =
        JSON.stringify(current.ism_template?.[0]?.index_patterns) ===
        JSON.stringify(indexPatterns);
      if (sameAge && samePatterns) return false;
    }
    const query = existing
      ? `?if_seq_no=${existing._seq_no}&if_primary_term=${existing._primary_term}`
      : '';
    await this.request('PUT', path + query, { policy });
    // The ism_template only reaches indices created after this point
    await this.request(
      'POST',
      `/_plugins/_ism/add/${indexPatterns.join(',')}`,
      {
        policy_id: policyId
      }
    );
    return true;
  }

  async bulk(documents, index) {
    if (documents.length === 0) return;

    const index_ = index ?? this.indexName();
    const body =
      documents
        .flatMap(doc => [
          JSON.stringify({ index: { _index: index_ } }),
          JSON.stringify(doc)
        ])
        .join('\n') + '\n';

    const url = `${this.baseUrl}/_bulk`;
    log.debug('Sending %d document(s) to OpenSearch %s', documents.length, url);

    const headers = { 'Content-Type': 'application/x-ndjson' };
    if (this.authHeader) {
      headers['Authorization'] = this.authHeader;
    }

    const response = await fetch(url, { method: 'POST', headers, body });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`OpenSearch bulk failed (${response.status}): ${text}`);
    }

    const result = await response.json();
    if (result.errors) {
      const errors = result.items
        .filter(item => item.index?.error)
        .map(item => item.index.error);
      log.error('OpenSearch bulk had %d error(s): %j', errors.length, errors);
    }
  }
}

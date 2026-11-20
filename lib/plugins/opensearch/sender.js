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

  async putISMPolicy(policyId, minIndexAge) {
    const url = `${this.baseUrl}/_plugins/_ism/policies/${policyId}`;
    const body = JSON.stringify({
      policy: {
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
        ]
      }
    });

    const headers = { 'Content-Type': 'application/json' };
    if (this.authHeader) {
      headers['Authorization'] = this.authHeader;
    }

    const response = await fetch(url, { method: 'PUT', headers, body });
    if (!response.ok && response.status !== 409) {
      const text = await response.text();
      throw new Error(
        `Failed to create ISM policy ${policyId} (${response.status}): ${text}`
      );
    }
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

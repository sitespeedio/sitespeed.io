import { jest } from '@jest/globals';
import opensearch from '../lib/plugins/opensearch/index.js';

// Mock OpenSearch Client
const mockIndex = jest.fn();

jest.unstable_mockModule('@opensearch-project/opensearch', () => {
  return {
    Client: jest.fn().mockImplementation(() => ({
      index: mockIndex
    }))
  };
});

// Minimal mock for Sitespeed context
function createMockContext() {
  return {
    messageMaker: () => ({
      make: jest.fn()
    }),
    storageManager: {},
    getLogger: () => ({
      info: jest.fn(),
      error: jest.fn()
    })
  };
}

describe('opensearch', () => {
  let plugin;
  let context;

  beforeEach(async () => {
    jest.clearAllMocks();

    context = createMockContext();

    plugin = new opensearch({}, context, {});
    plugin.open(context, {
      opensearch: {
        host: 'localhost',
        port: 9200,
        protocol: 'http',
        index: 'test-index',
        auth: {
          username: 'user',
          password: 'pass'
        }
      }
    });
  });

  test('should initialize client with correct index', () => {
    expect(plugin.index).toBe('test-index');
    expect(plugin.client).toBeDefined();
  });

  test('transformMetrics should extract metrics correctly', () => {
    const input = {
      info: { url: 'https://example.com' },
      googleWebVitals: [
        {
          largestContentfulPaint: 2000,
          cumulativeLayoutShift: 0.12
        }
      ],
      browserScripts: [
        {
          timings: {
            pageTimings: {
              backEndTime: 50,
              domContentLoadedTime: 100,
              domInteractiveTime: 120,
              domainLookupTime: 20,
              frontEndTime: 300,
              pageLoadTime: 800,
              serverConnectionTime: 30,
              serverResponseTime: 60
            }
          }
        }
      ]
    };

    const result = plugin.transformMetrics(input);

    expect(result.url).toBe('https://example.com');
    expect(result.lcp).toBe(2000);
    expect(result.cls).toBe(0.12);
    expect(result.browserpbbackendtime).toBe(50);
    expect(result.browserpbpageLoadTime).toBe(800);
  });

  test('sendMetricsToOpenSearch should call client.index', async () => {
    mockIndex.mockResolvedValue({
      body: { _id: '123' }
    });

    const input = {
      info: { url: 'https://example.com' },
      googleWebVitals: [{}],
      browserScripts: [{}]
    };

    await plugin.sendMetricsToOpenSearch(input);

    expect(mockIndex).toHaveBeenCalledTimes(1);
    expect(mockIndex).toHaveBeenCalledWith(
      expect.objectContaining({
        index: 'test-index',
        refresh: false
      })
    );
  });

  test('processMessage should trigger sendMetricsToOpenSearch for correct message type', async () => {
    mockIndex.mockResolvedValue({
      body: { _id: 'abc' }
    });

    const spy = jest.spyOn(plugin, 'sendMetricsToOpenSearch');

    const message = {
      type: 'browsertime.pageSummary',
      data: {
        info: { url: 'https://example.com' },
        googleWebVitals: [{}],
        browserScripts: [{}]
      }
    };

    await plugin.processMessage(message, {});

    expect(spy).toHaveBeenCalledTimes(1);
  });

  test('processMessage should ignore other message types', async () => {
    const spy = jest.spyOn(plugin, 'sendMetricsToOpenSearch');

    const message = {
      type: 'other.type',
      data: {}
    };

    await plugin.processMessage(message, {});

    expect(spy).not.toHaveBeenCalled();
  });
});

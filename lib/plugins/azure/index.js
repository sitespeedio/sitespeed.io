import { relative, join, resolve as _resolve, sep } from 'node:path';
import fs from 'node:fs';
import { BlobServiceClient } from '@azure/storage-blob';
import { SitespeedioPlugin } from '@sitespeed.io/plugin';
import readdir from 'recursive-readdir';
import pLimit from 'p-limit';
import mime from 'mime-types';
import intel from 'intel';
import { throwIfMissing } from '../../support/util.js';

const log = intel.getLogger('sitespeedio.plugin.azure');

function ignoreDirectories(file, stats) {
    return stats.isDirectory();
}

async function upload(dir, azureOptions, prefix) {
    const blobServiceClient = BlobServiceClient.fromConnectionString(azureOptions.connectionString);
    const containerClient = blobServiceClient.getContainerClient(azureOptions.containerName);
    await containerClient.createIfNotExists();

    const files = await readdir(dir);
    const limit = pLimit(azureOptions.maxAsyncAzure || 20);
    const promises = [];

    for (let file of files) {
        promises.push(limit(() => uploadFile(file, containerClient, azureOptions, prefix, dir)));
    }

    return Promise.all(promises);
}

async function uploadFile(file, containerClient, azureOptions, prefix, baseDir) {
    const subPath = relative(baseDir, file);
    const blobName = join(azureOptions.path || prefix, subPath);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    const data = fs.readFileSync(file);
    const contentType = mime.lookup(file) || 'application/octet-stream';
    const options = { blobHTTPHeaders: { blobContentType: contentType } };
    // add custom parameters if any
    Object.assign(options, azureOptions.params);

    await blockBlobClient.upload(data, data.length, options);

    log.info(`Uploaded file to Azure Blob Storage: ${blobName}`);
}

export default class AzurePlugin extends SitespeedioPlugin {
    constructor(options, context, queue) {
        super({ name: 'azure', options, context, queue });
    }

    open(context, options) {
        this.azureOptions = options.azure;
        this.options = options;
        this.make = context.messageMaker('azure').make;
        throwIfMissing(this.azureOptions, ['containerName', 'connectionString'], 'azure');
        this.storageManager = context.storageManager;
    }

    async processMessage(message, queue) {
        if (message.type === 'sitespeedio.setup') {
            queue.postMessage(this.make('azure.setup'));
        } else if (message.type === 'html.finished') {
            const make = this.make;
            const azureOptions = this.azureOptions;
            const baseDir = this.storageManager.getBaseDir();

            log.info(`Uploading ${baseDir} to Azure Blob Storage container ${azureOptions.containerName}, this can take a while ...`);

            try {
                await upload(baseDir, azureOptions, this.storageManager.getStoragePrefix());
                log.info('Finished upload to Azure Blob Storage');
                if (azureOptions.removeLocalResult) {
                    fs.rmSync(baseDir, { recursive: true });
                    log.debug(`Removed local files and directory ${baseDir}`);
                } else {
                    log.debug(`Local result files and directories are stored in ${baseDir}`);
                }
            } catch (error) {
                queue.postMessage(make('error', error));
                log.error('Could not upload to Azure Blob Storage', error);
            }
            queue.postMessage(make('azure.finished'));
        }
    }
}


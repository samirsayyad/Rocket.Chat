import { MongoInternals } from 'meteor/mongo';
import { GridFSBucket, GridFSBucketWriteStream, ObjectId } from 'mongodb';
import { AppSourceStorage, IAppStorageItem } from '@rocket.chat/apps-engine/server/storage';

import { streamToBuffer } from '../../../file-upload/server/lib/streamToBuffer';

export class AppGridFSSourceStorage extends AppSourceStorage {
	private pathPrefix = 'GridFS:/';

	private bucket: GridFSBucket;

	constructor() {
		super();

		const { GridFSBucket } = MongoInternals.NpmModules.mongodb.module;
		const { db } = MongoInternals.defaultRemoteCollectionDriver().mongo;

		this.bucket = new GridFSBucket(db, {
			bucketName: 'rocketchat_apps_packages',
			chunkSizeBytes: 1024 * 255,
		});
	}

	public async store(item: IAppStorageItem, zip: Buffer): Promise<string> {
		return new Promise((resolve, reject) => {
			const filename = this.itemToFilename(item);
			const writeStream: GridFSBucketWriteStream = this.bucket.openUploadStream(filename)
				.on('finish', () => resolve(this.idToPath(writeStream.id)))
				.on('error', (error) => reject(error));

			writeStream.write(zip);
			writeStream.end();
		});
	}

	public async fetch(item: IAppStorageItem): Promise<Buffer> {
		return streamToBuffer(this.bucket.openDownloadStream(this.itemToObjectId(item)));
	}

	public async update(item: IAppStorageItem, zip: Buffer): Promise<string> {
		return new Promise((resolve, reject) => {
			const fileId = this.itemToFilename(item);
			const writeStream: GridFSBucketWriteStream = this.bucket.openUploadStream(fileId)
				.on('finish', () => {
					resolve(this.idToPath(writeStream.id));
					this.remove(item);
				})

				.on('error', (error) => reject(error));

			writeStream.write(zip);
			writeStream.end();
		});
	}

	public async remove(item: IAppStorageItem): Promise<void> {
		return new Promise((resolve, reject) => {
			this.bucket.delete(this.itemToObjectId(item), (error) => {
				if (error) {
					return reject(error);
				}

				resolve();
			});
		});
	}

	private itemToFilename(item: IAppStorageItem): string {
		return `${ item.info.nameSlug }-${ item.info.version }.package`;
	}

	private idToPath(id: GridFSBucketWriteStream['id']): string {
		return this.pathPrefix + id;
	}

	private itemToObjectId(item: IAppStorageItem): ObjectId {
		return new ObjectId(item.sourcePath?.substring(this.pathPrefix.length));
	}
}
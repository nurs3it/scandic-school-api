import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const BUCKETS = {
  merch: 'merch-images',
  clubs: 'clubs',
  tournaments: 'tournaments',
  receipts: 'receipts',
  attachments: 'attachments',
  attestation: 'attestation',
} as const;

type BucketKey = keyof typeof BUCKETS;

// Files live on the VPS: its nginx accepts WebDAV PUT/DELETE (basic auth) and
// serves GET publicly. MIME and size checks happen in the multer configs.
@Injectable()
export class StorageService {
  private readonly baseUrl: string;
  private readonly auth: string;
  private readonly logger = new Logger(StorageService.name);

  constructor(config: ConfigService) {
    this.baseUrl = config.getOrThrow<string>('FILES_URL').replace(/\/$/, '');
    const user = config.getOrThrow<string>('FILES_USER');
    const pass = config.getOrThrow<string>('FILES_PASS');
    this.auth = 'Basic ' + Buffer.from(`${user}:${pass}`).toString('base64');
  }

  private async uploadTo(
    bucketKey: BucketKey,
    file: Express.Multer.File,
    prefix = '',
  ): Promise<string> {
    const ext = file.originalname.split('.').pop()?.toLowerCase() || 'bin';
    const key = `${BUCKETS[bucketKey]}/${prefix}${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const url = `${this.baseUrl}/${key}`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: { Authorization: this.auth, 'Content-Type': file.mimetype },
      body: new Uint8Array(file.buffer),
    });
    if (!res.ok) throw new Error(`Upload ${key} failed: HTTP ${res.status}`);
    return url;
  }

  /**
   * Deletes a file previously returned by uploadTo; foreign URLs are ignored.
   * Never throws: the DB row is already gone, a leftover file is only logged.
   */
  async remove(url: string) {
    if (!url.startsWith(`${this.baseUrl}/`)) return;
    try {
      const res = await fetch(url.split('?')[0], {
        method: 'DELETE',
        headers: { Authorization: this.auth },
      });
      if (!res.ok && res.status !== 404) throw new Error(`HTTP ${res.status}`);
    } catch (e) {
      this.logger.warn(`Delete ${url} failed: ${(e as Error).message}`);
    }
  }

  // Existing API (merch)
  async upload(file: Express.Multer.File): Promise<string> {
    return this.uploadTo('merch', file);
  }
  async uploadMultiple(files: Express.Multer.File[]): Promise<string[]> {
    return Promise.all(files.map((f) => this.upload(f)));
  }
  async uploadNewsImage(
    buffer: Buffer,
    originalname: string,
    mimetype: string,
  ): Promise<string> {
    return this.uploadTo(
      'merch',
      { buffer, originalname, mimetype } as Express.Multer.File,
      'news/',
    );
  }

  async uploadNewsAttach(
    buffer: Buffer,
    originalname: string,
    mimetype: string,
  ): Promise<string> {
    return this.uploadTo(
      'attachments',
      { buffer, originalname, mimetype } as Express.Multer.File,
      'news/',
    );
  }

  // New API
  uploadClubImage(file: Express.Multer.File) {
    return this.uploadTo('clubs', file);
  }
  uploadTournamentBanner(file: Express.Multer.File) {
    return this.uploadTo('tournaments', file, 'banner/');
  }
  uploadTournamentQr(file: Express.Multer.File) {
    return this.uploadTo('tournaments', file, 'qr/');
  }
  uploadTournamentReceipt(file: Express.Multer.File) {
    return this.uploadTo('receipts', file);
  }
  uploadTournamentWinnerPhoto(file: Express.Multer.File) {
    return this.uploadTo('tournaments', file, 'winners/');
  }
  uploadTournamentGalleryPhoto(file: Express.Multer.File) {
    return this.uploadTo('tournaments', file, 'gallery/');
  }
  uploadAttestationFile(file: Express.Multer.File) {
    return this.uploadTo('attestation', file);
  }
}

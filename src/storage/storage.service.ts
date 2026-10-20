import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const IMAGE_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
];

const RECEIPT_MIMES = [...IMAGE_MIMES, 'application/pdf'];

const ATTACH_MIMES = [
  ...IMAGE_MIMES,
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/zip',
  'application/x-zip-compressed',
  'text/plain',
  'text/csv',
  'video/mp4',
];

const BUCKETS = {
  merch: 'merch-images',
  clubs: 'clubs',
  tournaments: 'tournaments',
  receipts: 'receipts',
  attachments: 'attachments',
  attestation: 'attestation',
} as const;

type BucketKey = keyof typeof BUCKETS;

@Injectable()
export class StorageService implements OnModuleInit {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(StorageService.name);

  constructor(private readonly config: ConfigService) {
    this.supabase = createClient(
      this.config.getOrThrow<string>('SUPABASE_URL'),
      this.config.getOrThrow<string>('SUPABASE_SERVICE_KEY'),
    );
  }

  async onModuleInit() {
    await this.ensureBucket(BUCKETS.merch, IMAGE_MIMES);
    await this.ensureBucket(BUCKETS.clubs, IMAGE_MIMES);
    await this.ensureBucket(BUCKETS.tournaments, IMAGE_MIMES);
    await this.ensureBucket(BUCKETS.receipts, RECEIPT_MIMES);
    await this.ensureBucket(BUCKETS.attachments, ATTACH_MIMES, 50 * 1024 * 1024);
    // Scanned PDFs are big; 50 MB is the Supabase free-plan ceiling
    await this.ensureBucket(BUCKETS.attestation, ATTACH_MIMES, 50 * 1024 * 1024);
  }

  private async ensureBucket(
    name: string,
    mimes: string[],
    fileSizeLimit = 10 * 1024 * 1024,
  ) {
    const { data: buckets } = await this.supabase.storage.listBuckets();
    const opts = { public: true, fileSizeLimit, allowedMimeTypes: mimes };
    // Existing buckets are synced too, so mime/size changes here reach Supabase
    const exists = buckets?.some((b) => b.name === name);
    const { error } = exists
      ? await this.supabase.storage.updateBucket(name, opts)
      : await this.supabase.storage.createBucket(name, opts);
    if (error) this.logger.error(`Bucket "${name}" sync failed: ${error.message}`);
    else if (!exists) this.logger.log(`Bucket "${name}" created`);
  }

  private async uploadTo(
    bucketKey: BucketKey,
    file: Express.Multer.File,
    prefix = '',
  ): Promise<string> {
    const ext = file.originalname.split('.').pop()?.toLowerCase() || 'bin';
    const fileName = `${prefix}${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const bucket = BUCKETS[bucketKey];
    const { error } = await this.supabase.storage
      .from(bucket)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });
    if (error) throw new Error(`Upload to ${bucket} failed: ${error.message}`);
    const { data } = this.supabase.storage.from(bucket).getPublicUrl(fileName);
    return data.publicUrl;
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

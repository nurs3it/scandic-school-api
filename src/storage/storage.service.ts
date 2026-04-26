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

const BUCKETS = {
  merch: 'merch-images',
  clubs: 'clubs',
  tournaments: 'tournaments',
  receipts: 'receipts',
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
  }

  private async ensureBucket(name: string, mimes: string[]) {
    const { data: buckets } = await this.supabase.storage.listBuckets();
    if (buckets?.some((b) => b.name === name)) return;
    const { error } = await this.supabase.storage.createBucket(name, {
      public: true,
      fileSizeLimit: 10 * 1024 * 1024,
      allowedMimeTypes: mimes,
    });
    if (error) this.logger.error(`Bucket "${name}" create failed: ${error.message}`);
    else this.logger.log(`Bucket "${name}" created`);
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
}

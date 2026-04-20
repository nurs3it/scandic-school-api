import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const BUCKET = 'merch-images';

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
    await this.ensureBucket();
  }

  private async ensureBucket() {
    const { data: buckets } = await this.supabase.storage.listBuckets();
    const exists = buckets?.some((b) => b.name === BUCKET);
    if (!exists) {
      const { error } = await this.supabase.storage.createBucket(BUCKET, {
        public: true,
        fileSizeLimit: 10 * 1024 * 1024, // 10 MB
        allowedMimeTypes: [
          'image/jpeg',
          'image/png',
          'image/webp',
          'image/gif',
          'image/avif',
        ],
      });
      if (error) {
        this.logger.error(
          `Failed to create bucket "${BUCKET}": ${error.message}`,
        );
      } else {
        this.logger.log(`Bucket "${BUCKET}" created`);
      }
    }
  }

  async upload(file: Express.Multer.File): Promise<string> {
    const ext = file.originalname.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await this.supabase.storage
      .from(BUCKET)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    const { data } = this.supabase.storage.from(BUCKET).getPublicUrl(fileName);
    return data.publicUrl;
  }

  async uploadMultiple(files: Express.Multer.File[]): Promise<string[]> {
    return Promise.all(files.map((f) => this.upload(f)));
  }

  async uploadNewsImage(
    buffer: Buffer,
    originalname: string,
    mimetype: string,
  ): Promise<string> {
    const ext = originalname.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `news/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await this.supabase.storage
      .from(BUCKET)
      .upload(fileName, buffer, {
        contentType: mimetype,
        upsert: false,
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    const { data } = this.supabase.storage.from(BUCKET).getPublicUrl(fileName);
    return data.publicUrl;
  }
}

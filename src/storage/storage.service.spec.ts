import { ConfigService } from '@nestjs/config';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  const fetchMock = jest.fn();
  let storage: StorageService;

  beforeEach(() => {
    fetchMock.mockReset().mockResolvedValue({ ok: true, status: 201 });
    global.fetch = fetchMock;
    storage = new StorageService(
      new ConfigService({
        FILES_URL: 'https://files.example.kz/',
        FILES_USER: 'api',
        FILES_PASS: 'secret',
      }),
    );
  });

  it('PUTs the file with basic auth and returns its public URL', async () => {
    const url = await storage.uploadAttestationFile({
      buffer: Buffer.from('pdf'),
      originalname: 'Отчёт.PDF',
      mimetype: 'application/pdf',
    } as Express.Multer.File);

    expect(url).toMatch(
      /^https:\/\/files\.example\.kz\/attestation\/\d+-\w+\.pdf$/,
    );
    const [putUrl, init] = fetchMock.mock.calls[0] as [
      string,
      { method: string; headers: Record<string, string> },
    ];
    expect(putUrl).toBe(url);
    expect(init.method).toBe('PUT');
    expect(init.headers.Authorization).toBe('Basic YXBpOnNlY3JldA==');
  });

  it('throws when the upload is rejected', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 401 });
    await expect(
      storage.upload({
        buffer: Buffer.from(''),
        originalname: 'a.png',
      } as Express.Multer.File),
    ).rejects.toThrow('HTTP 401');
  });

  it('removes own files, ignores foreign URLs and never throws', async () => {
    await storage.remove(
      'https://files.example.kz/attestation/1.pdf?download=x.pdf',
    );
    expect(fetchMock).toHaveBeenCalledWith(
      'https://files.example.kz/attestation/1.pdf',
      expect.objectContaining({ method: 'DELETE' }),
    );

    await storage.remove('https://wtmo.supabase.co/storage/x.pdf');
    expect(fetchMock).toHaveBeenCalledTimes(1);

    fetchMock.mockRejectedValue(new Error('down'));
    await expect(
      storage.remove('https://files.example.kz/a.pdf'),
    ).resolves.toBeUndefined();
  });
});

import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { UploadApiResponse, v2 } from 'cloudinary';
import { Readable } from 'stream';
import { CLOUDINARY } from '../cloudinary/cloudinary.provider';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

@Injectable()
export class UploadService {
  constructor(@Inject(CLOUDINARY) private readonly cloudinary: typeof v2) {}

  async uploadImage(
    file: Express.Multer.File,
    folder = 'goods-shop',
  ): Promise<UploadApiResponse> {
    if (!file) throw new BadRequestException('Không có file được gửi lên');

    if (!ALLOWED_MIME.includes(file.mimetype)) {
      throw new BadRequestException(
        'Định dạng ảnh không hợp lệ (chỉ nhận JPG, PNG, WEBP, GIF)',
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('Ảnh vượt quá dung lượng cho phép (5MB)');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          // tự nén/chuyển định dạng tối ưu, giữ chất lượng
          transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        },
        (error, result) => {
          if (error || !result) return reject(error);
          resolve(result);
        },
      );
      Readable.from(file.buffer).pipe(uploadStream);
    });
  }

  async deleteImage(publicId: string) {
    return this.cloudinary.uploader.destroy(publicId);
  }
}

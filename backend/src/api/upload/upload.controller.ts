import {
  BadRequestException,
  Controller,
  Delete,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
// import { UseGuards } from '@nestjs/common';
// import { AdminGuard } from '../auth/admin.guard'; // chỉ admin mới được upload/xóa ảnh

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  // @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Không có file được gửi lên');

    const result = await this.uploadService.uploadImage(
      file,
      'goods-shop/products',
    );

    return {
      url: result.secure_url,
      publicId: result.public_id,
      message: 'Tải ảnh lên thành công',
    };
  }

  @Delete('image')
  // @UseGuards(AdminGuard)
  async deleteImage(@Query('publicId') publicId: string) {
    if (!publicId) throw new BadRequestException('Thiếu publicId');
    await this.uploadService.deleteImage(publicId);
    return { message: 'Đã xóa ảnh' };
  }
}

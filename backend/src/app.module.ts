import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './api/auth/auth.module';
import { UsersModule } from './api/users/users.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './api/prisma/prisma.module';
import { JwtAuthGuard } from './api/auth/guards/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { ProductsService } from './api/products/products.service';
import { ProductsController } from './api/products/products.controller';
import { ProductsModule } from './api/products/products.module';
import { CategoriesModule } from './api/category/categories.module';
import { BrandsModule } from './api/brand/brands.module';
import { CloudinaryModule } from './api/cloudinary/cloudinary.module';
import { UploadModule } from './api/upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UsersModule,
    ConfigModule,
    PrismaModule,
    ProductsModule,
    CategoriesModule,
    BrandsModule,
    CloudinaryModule,
    UploadModule,
  ],
  controllers: [AppController, ProductsController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    ProductsService,
  ],
})
export class AppModule {}

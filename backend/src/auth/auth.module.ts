import { Module } from '@nestjs/common';
import { SupabaseGuard } from './supabase.guard';
import { AuthController } from './auth.controller';

@Module({
  controllers: [AuthController],
  providers: [SupabaseGuard],
  exports: [SupabaseGuard],
})
export class AuthModule {}

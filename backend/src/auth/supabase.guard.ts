import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jose from 'jose';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class SupabaseGuard implements CanActivate {
  private readonly logger = new Logger(SupabaseGuard.name);
  private JWKS: any;

  constructor(
    private configService: ConfigService,
    private supabaseService: SupabaseService,
  ) {
    const url = this.configService.get<string>('SUPABASE_URL');
    if (url) {
      // Initialize JWKS endpoint: https://<project-ref>.supabase.co/auth/v1/.well-known/jwks.json
      this.JWKS = jose.createRemoteJWKSet(new URL(`${url}/auth/v1/.well-known/jwks.json`));
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.split(' ')[1];

    try {
      if (!this.JWKS) {
        throw new Error('JWKS endpoint not initialized');
      }

      // Verify JWT using the Remote JWK Set
      const { payload } = await jose.jwtVerify(token, this.JWKS);
      
      if (!payload.sub) {
        throw new UnauthorizedException('Invalid token payload: missing sub');
      }

      // Derive authenticated user profile from DB using the verified sub (UUID)
      const { data: profile, error } = await this.supabaseService.getClient()
        .from('profiles')
        .select('*')
        .eq('id', payload.sub)
        .single();

      if (error || !profile) {
        this.logger.warn(`Verified token but profile not found for sub: ${payload.sub}`);
        throw new UnauthorizedException('User profile not found');
      }

      if (!profile.is_active) {
        throw new UnauthorizedException('User account is deactivated');
      }

      // Populate request with verified user data
      request.user = profile;
      request.accessToken = token;
      return true;
    } catch (err: any) {
      this.logger.error(`Token verification failed: ${err.message}`);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}

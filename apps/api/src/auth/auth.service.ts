import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    if (!email || !pass) {
      throw new UnauthorizedException('Email and password required');
    }

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password, ...result } = user;
    return result;
  }

  async login(email: string, pass: string) {
    const user = await this.validateUser(email, pass);

    const payload = {
      sub: user.email,
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async getMe(userPayload: any) {
    if (!userPayload || !userPayload.email) {
      throw new UnauthorizedException('Invalid user session');
    }

    const user = await this.prisma.user.findUnique({
      where: { email: userPayload.email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      // Return payload if DB record not found
      return {
        id: userPayload.id || userPayload.email,
        email: userPayload.email,
        name: userPayload.name,
        role: userPayload.role,
      };
    }

    return user;
  }
}
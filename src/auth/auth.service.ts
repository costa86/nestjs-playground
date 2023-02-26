import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuthDto } from "./dto";
import * as argon from "argon2";
import { Prisma } from "@prisma/client";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService, private jwt: JwtService, private config: ConfigService) {

    }
    async signToken(userId: number, email: string): Promise<{ access_token: string }> {
        const payload = { sub: userId, email };
        const secret = this.config.get('JWT_SECRET');
        const token = await this.jwt.signAsync(payload, { expiresIn: '60m', secret });
        return { access_token: token };
    }

    async signup(dto: AuthDto) {
        const hash = await argon.hash(dto.password);
        try {
            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    hash
                }
            });
            return this.signToken(user.id, user.email)
        } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError) {
                if (e.code === 'P2002') {
                    throw new ForbiddenException(`error in ${e.meta.target}. credentials taken`);
                }
                throw e;
            }
        }

    }

    async signin(dto: AuthDto) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (!user) throw new ForbiddenException("User not found");
        const matches = await argon.verify(user.hash, dto.password);
        if (!matches) throw new ForbiddenException("Invalid credentials");
        return this.signToken(user.id, user.email);
    }


}
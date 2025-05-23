import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(codigoUsuario: string, contrasena: string) {
    const usuario = await this.prisma.usuario.findFirst({
      where: { codigoUsuario },
    });

    if (!usuario || !usuario.estado) {
      throw new UnauthorizedException(
        'Credenciales inválidas o usuario inactivo.',
      );
    }

    const isMatch = await compare(contrasena, usuario.contrasena);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    return usuario;
  }

  async login(dto: { codigoUsuario: string; contrasena: string }) {
    const usuario = await this.validateUser(dto.codigoUsuario, dto.contrasena);

    const payload = {
      idUsuario: usuario.idUsuario,
      codigoUsuario: usuario.codigoUsuario,
      rol: usuario.rol,
    };

    const token = this.jwtService.sign(payload);

    return {
      token,
      usuario: {
        idUsuario: usuario.idUsuario,
        codigoUsuario: usuario.codigoUsuario,
        rol: usuario.rol,
      },
    };
  }
}

// auth.controller.ts
import { Body, Controller, Patch, Post, UseGuards, Req } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { CambiarContrasenaDto } from './dto/cambiar-contrasena.dto';
import { JwtAuthGuard } from './jwt.guard';
import { AlcanceActual, Roles, RolesGuard } from 'src/autorizacion/roles.guard';
import { Alcance, TODOS } from 'src/autorizacion/alcance';

import type { Request } from 'express';
@ApiTags('Autenticación') // Agrupa en Swagger bajo esta categoría
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiBody({ type: LoginAuthDto })
  @ApiResponse({ status: 200, description: 'Login exitoso.' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas.' })
  async login(@Body() body: LoginAuthDto, @Req() req: Request) {
    // Detrás del proxy (Traefik en Easypanel) la IP real llega en
    // X-Forwarded-For. Se toma la ÚLTIMA: la agrega el proxy. La primera la
    // escribe el cliente, y con ella se podía inventar una IP por intento y
    // saltarse el límite de 20 por IP.
    const reenviada =
      String(req.headers['x-forwarded-for'] ?? '')
        .split(',')
        .map((ip) => ip.trim())
        .filter(Boolean)
        .pop() ?? '';
    const usuario = await this.authService.login(
      body,
      reenviada || req.ip || 'desconocida',
    );
    return {
      // Con varias cuentas (varias empresas) no hay token: hay que elegir.
      message: 'cuentas' in usuario ? 'Elija la empresa' : 'Login exitoso',
      data: usuario,
    };
  }

  @Patch('contrasena')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...TODOS)
  @ApiOperation({ summary: 'Cambiar la propia contraseña (opcional)' })
  async cambiarContrasena(
    @AlcanceActual() alcance: Alcance,
    @Body() dto: CambiarContrasenaDto,
  ) {
    await this.authService.cambiarContrasena(alcance.idUsuario, dto);
    return { message: 'Contraseña actualizada.', data: null };
  }
}

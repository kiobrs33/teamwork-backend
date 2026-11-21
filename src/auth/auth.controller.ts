// auth.controller.ts
import { Body, Controller, Patch, Post, UseGuards } from '@nestjs/common';
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

@ApiTags('Autenticación') // Agrupa en Swagger bajo esta categoría
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiBody({ type: LoginAuthDto })
  @ApiResponse({ status: 200, description: 'Login exitoso.' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas.' })
  async login(@Body() body: LoginAuthDto) {
    const usuario = await this.authService.login(body);
    return {
      message: 'Login exitoso',
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

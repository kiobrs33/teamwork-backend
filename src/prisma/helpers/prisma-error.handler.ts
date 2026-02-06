// common/prisma/prisma-error.handler.ts
import {
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

export function handlePrismaError(error: unknown, entity = 'registro'): never {
  entity = entity.toUpperCase();

  // ✅ SI YA ES UNA HTTP EXCEPTION, NO LA TOQUES
  if (error instanceof HttpException) {
    throw error;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        throw new ConflictException(`Ya existe un ${entity} con esos datos`);

      case 'P2025':
        throw new NotFoundException(`El ${entity} no fue encontrado`);

      case 'P2003':
        throw new ConflictException(
          `No se puede procesar el ${entity} por relaciones inválidas`,
        );
    }
  }

  throw new InternalServerErrorException(
    `Error inesperado al procesar el ${entity}`,
  );
}

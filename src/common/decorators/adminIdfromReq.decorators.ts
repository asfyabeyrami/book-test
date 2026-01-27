import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';

export const Admin = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const admin = request.user;

    if (data === 'id') {
      const id = admin?.id;

      if (!id) {
        throw new BadRequestException('admin id not found');
      }

      return id;
    }

    return data ? admin?.[data] : admin;
  },
);

import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';

export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    if (data === 'id') {
      const id = user?.adminId || user?.id || user?.sub;
      if (!id) {
        throw new BadRequestException('user id not found');
      }

      return id;
    }

    return data ? user?.[data] : user;
  },
);

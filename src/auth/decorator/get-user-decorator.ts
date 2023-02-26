import { createParamDecorator, ExecutionContext } from '@nestjs/common';



export const GetUser = createParamDecorator(
    (data: string | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        //get only a field (first argument 'data') from user (handy!)
        if (data) {
            return request.user[data];
        }
        return request.user;
    },
);
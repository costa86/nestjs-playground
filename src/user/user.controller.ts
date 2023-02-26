import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from './../auth/decorator/index';
// import { AuthGuard } from '@nestjs/passport';
import { JwtGuard } from './../auth/guard/index';
import { EditUserDto } from './dto';
import { UserService } from './user.service';


@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
    constructor(private userService: UserService) {
    }
    //I do not know yet which approach is bettter..
    // @UseGuards(AuthGuard('jwt'))
    // @UseGuards(JwtGuard)
    // @Get()
    // sample(@Request() req: any) {
    //     return req.user;
    // }

    //weird abstraction to create custom decorator and get user info (@GetUser)...
    @Get('me')
    getMe(@GetUser() user: User) {
        return user;
    }

    @Patch()
    editUser(@GetUser('id') userId: number, @Body() dto: EditUserDto) {
        return this.userService.editUser(dto, userId);
    }

}



import { Body, Controller, HttpCode, HttpStatus, Post, Req } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthDto } from "./dto";
// import { Request } from "express";

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    // @Post('signup')
    // signup(@Req() req: Request) {
    //     console.log(req.body)
    //     return this.authService.signup()
    // }

    // this is another approach
    // @Post('signup')
    // signup(@Body('email',Parse) email: string, @Body('password') password: string) {
    //     console.log({ email, password })
    //     return this.authService.signup()
    // }

    // this is more agnostic
    @HttpCode(HttpStatus.CREATED)//optional
    @Post('signup')
    signup(@Body() dto: AuthDto) {
        return this.authService.signup(dto)
    }
    @HttpCode(HttpStatus.OK)
    @Post('signin')
    signin(@Body() dto: AuthDto) { return this.authService.signin(dto) }
}
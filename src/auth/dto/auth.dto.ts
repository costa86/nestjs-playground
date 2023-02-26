import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString, IsStrongPassword } from "class-validator";

export class AuthDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;
    @IsNotEmpty()
    @IsStrongPassword()
    password: string;
    @IsNotEmpty()
    @IsPhoneNumber('PT', { message: 'Invalid Portuguese phone number' })
    phone: string
}
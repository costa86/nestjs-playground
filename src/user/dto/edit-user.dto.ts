import { IsEmail, IsOptional } from "class-validator";

export class EditUserDto {
    @IsOptional()
    @IsEmail()
    email?: string
}
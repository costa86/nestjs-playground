import { IsNotEmpty, IsOptional, IsUrl } from "class-validator";

export class BookmarkDto {
    @IsNotEmpty()
    title: string;
    @IsOptional()
    description: string;
    @IsNotEmpty()
    @IsUrl()
    link: string
}

export class EditBookmarkDto {
    @IsOptional()
    title: string;
    @IsOptional()
    description: string;
    @IsOptional()
    @IsUrl()
    link: string
}
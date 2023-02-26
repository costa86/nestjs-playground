import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BookmarkDto, EditBookmarkDto } from './dto';

@Injectable()
export class BookmarkService {
    constructor(private prisma: PrismaService) { }

    async createBookmark(userId: number, dto: BookmarkDto) {
        const bookmark = await this.prisma.bookmark.create({
            data: {
                ...dto,
                userId: userId
            }
        })
        return bookmark;
    }

    async getBookmarks(userId: number) {
        const bookmarks = await this.prisma.bookmark.findMany({ where: { userId } });
        return bookmarks;
    }

    async getBookmarkById(bookmarkId: number, userId: number) {
        const bookmarks = await this.prisma.bookmark.findMany({ where: { userId, id: bookmarkId } });
        return bookmarks;
    }

    async userCanAccessBookmark(bookmarkId: number, userId: number): Promise<boolean> {
        const bookmark = await this.prisma.bookmark.findUnique({ where: { id: bookmarkId } });

        if (bookmark && bookmark.userId === userId) {
            return true;
        }
        throw new ForbiddenException('access denied');
    }


    async editBookmarkById(bookmarkId: number, userId: number, dto: EditBookmarkDto) {
        const userCanAccessBookmark = await this.userCanAccessBookmark(bookmarkId, userId);

        if (userCanAccessBookmark) {
            return await this.prisma.bookmark.update({ where: { id: bookmarkId }, data: { ...dto } })
        }
        return {}
    }

    async deleteBookmarkById(bookmarkId: number, userId: number) {
        const userCanAccessBookmark = await this.userCanAccessBookmark(bookmarkId, userId);

        if (userCanAccessBookmark) {
            return await this.prisma.bookmark.delete({ where: { id: bookmarkId } });
        }
        return {}

    }


}

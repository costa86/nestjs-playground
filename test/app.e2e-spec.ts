import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { AuthDto } from '../src/auth/dto';
import { EditUserDto } from 'src/user/dto';
import { BookmarkDto, EditBookmarkDto } from 'src/bookmark/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const port = 3333;
  const validEmail = 'ana@mail.com';
  const invalidEmail = 'ana@mail';
  const strongPassword = 'dddewFgtr34$5/gI';
  const weakPassword = 'admin123';
  const validPhone = '920-438-006';
  const validUrl = 'www.google.com';
  const whatever = 'whatever';
  const bookmarks = 'bookmarks';
  const host = 'localhost';


  beforeAll(async () => {
    const moduleRef =
      await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(port);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl(`http://${host}:${port}`);

  });

  afterAll(() => {
    app.close();
  })

  describe('Auth', () => {

    const dto: AuthDto = {
      email: validEmail,
      password: strongPassword,
      phone: validPhone
    };

    describe('Signup', () => {
      it('should sign up', () => {
        // return pactum.spec().post('/auth/signup').withBody(dto).expectStatus(HttpStatus.CREATED).inspect();//inspect to see output
        return pactum.spec().post('/auth/signup').withBody(dto).expectStatus(HttpStatus.CREATED);
      });
    })

    describe('Signin', () => {

      it('should sign in', () => {
        //usertAt will become a variable accessible as 'something $S{userAt}'
        return pactum.spec().post('/auth/signin').withBody(dto).expectStatus(HttpStatus.OK).stores('userAt', 'access_token');
      });

      it('should not sign in with empty password', () => {
        const dto: AuthDto = {
          email: validEmail,
          password: "",
          phone: validPhone
        };
        return pactum.spec().post('/auth/signin').withBody(dto).expectStatus(HttpStatus.BAD_REQUEST);
      });

      it('should not sign in with weak password', () => {
        const dto: AuthDto = {
          email: validEmail,
          password: weakPassword,
          phone: validPhone
        };
        return pactum.spec().post('/auth/signin').withBody(dto).expectStatus(HttpStatus.BAD_REQUEST);
      });

      it('should not sign in with invalid email', () => {
        const dto: AuthDto = {
          email: invalidEmail,
          password: strongPassword,
          phone: validPhone
        };
        return pactum.spec().post('/auth/signin').withBody(dto).expectStatus(HttpStatus.BAD_REQUEST);
      });

    });

  });

  describe('User', () => {

    describe('Current user', () => {
      describe('Get current user', () => {
        it('should get current user', () => {
          return pactum.spec().get('/users/me').withHeaders({ Authorization: 'Bearer $S{userAt}' }).expectStatus(HttpStatus.OK);
        });
      });

      describe('Edit current user', () => {

        it('should not edit current user with invalid email', () => {          
          const dto: EditUserDto = {
            email: whatever
          };
          return pactum
            .spec()
            .patch('/users')
            .withHeaders({ Authorization: 'Bearer $S{userAt}' })
            .withBody(dto)
            .expectStatus(HttpStatus.BAD_REQUEST);
        });

        it('should edit current user', () => {
          const dto: EditUserDto = {
            email: validEmail
          };
          return pactum
            .spec()
            .patch('/users')
            .withHeaders({ Authorization: 'Bearer $S{userAt}' })
            .withBody(dto)
            .expectStatus(HttpStatus.OK).expectBodyContains(dto.email);
        });

      });

    });


  });

  describe('Bookmarks', () => {

    describe('Get Bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum.spec()
          .get(`/${bookmarks}`)
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .expectStatus(HttpStatus.OK)
          .expectBody([]);
      });
    });


    describe('Create Bookmark', () => {

      it('should not create bookmark with invalid link', () => {
        const dto: BookmarkDto = {
          title: whatever,
          description: whatever,
          link: whatever
        };

        return pactum.spec()
          .post(`/${bookmarks}`)
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .withBody(dto)
          .expectStatus(HttpStatus.BAD_REQUEST).stores('bookmarkId', 'id');
      });


      it('should create bookmark', () => {

        const dto: BookmarkDto = {
          title: whatever,
          description: whatever,
          link: validUrl
        };

        return pactum.spec()
          .post(`/${bookmarks}`)
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .withBody(dto)
          .expectStatus(HttpStatus.CREATED).stores('bookmarkId', 'id');
      });


    });


    describe('Get Bookmark by id', () => {
      it('should get bookmark by id', () => {
        return pactum.spec()
          .get(`/${bookmarks}/{id}`)
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .withPathParams('id', '$S{bookmarkId}')
          .expectStatus(HttpStatus.OK);
      });
    });


    describe('Edit Bookmark', () => {
      it('should edit bookmark', () => {

        const dto: EditBookmarkDto = {
          title: whatever,
          description: whatever,
          link: validUrl
        };

        return pactum.spec()
          .patch(`/${bookmarks}/{id}`)
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .withPathParams('id', '$S{bookmarkId}')
          .withBody(dto)
          .expectStatus(HttpStatus.OK);
      });

      it('should not edit bookmark with invalid link', () => {
        const dto: EditBookmarkDto = {
          title: whatever,
          description: whatever,
          link: whatever
        };
        return pactum.spec()
          .patch(`/${bookmarks}/{id}`)
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .withPathParams('id', '$S{bookmarkId}')
          .withBody(dto)
          .expectStatus(HttpStatus.BAD_REQUEST);
      });


    });


  });

});



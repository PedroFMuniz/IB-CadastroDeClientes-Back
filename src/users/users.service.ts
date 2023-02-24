import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/createUser.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/updateUser.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private UsersRepo: Repository<User>,
  ) {}

  async createUser(dto: CreateUserDto): Promise<User> {
    try {
      const newUser = await this.UsersRepo.create();
      newUser.username = dto.username;
      newUser.salt = await bcrypt.genSalt();
      newUser.password = await this.hashPassword(dto.password, newUser.salt);
      console.log(newUser);
      await this.UsersRepo.save(newUser);
      return newUser;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async findUsers(): Promise<User[]> {
    try {
      return await this.UsersRepo.find();
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async findUser(id: string): Promise<User> {
    try {
      return await this.UsersRepo.findOneBy({ id });
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async updateUser(id: string, dto: UpdateUserDto): Promise<User> {
    try {
      const user = await this.UsersRepo.findOneBy({ id });
      user.username = dto.username;
      if (dto.password) {
        user.password = await this.hashPassword(dto.password, user.salt);
      }
      await this.UsersRepo.save(user);
      return user;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async deleteUser(id: string): Promise<string> {
    try {
      await this.UsersRepo.softRemove({ id });
      return 'Usuário removido com sucesso';
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async hashPassword(password: string, salt: string): Promise<string> {
    return bcrypt.hash(password, salt);
  }
}

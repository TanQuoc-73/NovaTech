import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import type { AuthenticatedUser } from './auth.types';
import { AddressDto } from './dto/address.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import { SupabaseAuthGuard } from './guards/supabase-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @UseGuards(SupabaseAuthGuard)
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.syncProfile(user);
  }

  @Post('sync-profile')
  @UseGuards(SupabaseAuthGuard)
  syncProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.syncProfile(user);
  }

  @Patch('me')
  @UseGuards(SupabaseAuthGuard)
  updateMe(
    @CurrentUser() user: AuthenticatedUser,
    @Body() payload: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(user, payload);
  }

  @Get('addresses')
  @UseGuards(SupabaseAuthGuard)
  getAddresses(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getAddresses(user.id);
  }

  @Post('addresses')
  @UseGuards(SupabaseAuthGuard)
  createAddress(
    @CurrentUser() user: AuthenticatedUser,
    @Body() payload: AddressDto,
  ) {
    return this.authService.createAddress(user.id, payload);
  }

  @Patch('addresses/:id')
  @UseGuards(SupabaseAuthGuard)
  updateAddress(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() payload: AddressDto,
  ) {
    return this.authService.updateAddress(user.id, id, payload);
  }

  @Delete('addresses/:id')
  @UseGuards(SupabaseAuthGuard)
  deleteAddress(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.authService.deleteAddress(user.id, id);
  }
}

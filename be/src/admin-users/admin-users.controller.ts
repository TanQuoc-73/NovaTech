import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';

import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { AdminUsersService } from './admin-users.service';
import type {
  AdminUpdateUserPayload,
  AdminUpdateUserRolePayload,
} from './admin-users.types';

@Controller('admin/users')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('admin')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  listUsers(
    @Query('q') q?: string,
    @Query('role') role?: string,
  ) {
    return this.adminUsersService.listUsers(q, role);
  }

  @Get(':id')
  getUser(@Param('id') id: string) {
    return this.adminUsersService.getUser(id);
  }

  @Patch(':id')
  updateUser(
    @Param('id') id: string,
    @Body() payload: AdminUpdateUserPayload,
  ) {
    return this.adminUsersService.updateUser(id, payload);
  }

  @Patch(':id/role')
  updateUserRole(
    @Param('id') id: string,
    @Body() payload: AdminUpdateUserRolePayload,
  ) {
    return this.adminUsersService.updateUserRole(id, payload);
  }

  @Delete(':id')
  deleteUser(@Param('id') id: string) {
    return this.adminUsersService.deleteUser(id);
  }
}

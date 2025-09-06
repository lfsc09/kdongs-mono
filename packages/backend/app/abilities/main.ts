/*
|--------------------------------------------------------------------------
| Bouncer abilities
|--------------------------------------------------------------------------
|
| You may export multiple abilities from this file and pre-register them
| when creating the Bouncer instance.
|
| Pre-registered policies and abilities can be referenced as a string by their
| name. Also they are must if want to perform authorization inside Edge
| templates.
|
*/

import { Bouncer } from '@adonisjs/bouncer';
import type User from '#models/user/user';
import { UserRole } from '../core/types/user/user_roles.js';

export const onlyAdmin = Bouncer.ability((user: User) => {
  return user.role === UserRole.ADMIN;
});

export const onlyUser = Bouncer.ability((user: User) => {
  return user.role === UserRole.USER;
});

export const anyUser = Bouncer.ability((user: User) => {
  return user.role === UserRole.USER || user.role === UserRole.ADMIN;
});

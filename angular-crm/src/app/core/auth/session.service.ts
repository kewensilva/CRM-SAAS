import { Injectable, computed, signal } from '@angular/core';

import { ACCESS_TOKEN_KEY } from './auth.service';

export type UserProfile = 'OWNER' | 'TENANT_ADMIN' | 'MANAGER' | 'USER';

interface AccessTokenPayload {
  sub: string;
  tenantId: string | null;
  profile: UserProfile;
}

const decodeAccessToken = (token: string): AccessTokenPayload | null => {
  const payloadSegment = token.split('.')[1];

  if (!payloadSegment) {
    return null;
  }

  try {
    return JSON.parse(atob(payloadSegment.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
};

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly profileSignal = signal<UserProfile | null>(null);

  readonly profile = this.profileSignal.asReadonly();
  readonly isOwner = computed(() => this.profileSignal() === 'OWNER');

  constructor() {
    const existingToken = localStorage.getItem(ACCESS_TOKEN_KEY);

    if (existingToken) {
      this.loadFromAccessToken(existingToken);
    }
  }

  loadFromAccessToken(accessToken: string): void {
    const payload = decodeAccessToken(accessToken);
    this.profileSignal.set(payload?.profile ?? null);
  }

  clear(): void {
    this.profileSignal.set(null);
  }
}

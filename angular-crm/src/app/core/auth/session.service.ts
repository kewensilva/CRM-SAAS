import { Injectable, computed, signal } from '@angular/core';

import { ACCESS_TOKEN_KEY, MUST_CHANGE_PASSWORD_KEY } from './auth.service';

export type UserProfile = 'OWNER' | 'TENANT_ADMIN' | 'MANAGER' | 'USER' | 'ANALYST';

interface AccessTokenPayload {
  sub: string;
  tenantId: string | null;
  profile: UserProfile;
  // Presente só em tokens emitidos via troca de contexto de um Analista (POST
  // /auth/switch-tenant) — o id do usuário Analista original, mesmo com profile
  // "TENANT_ADMIN" no restante do token (mesmo poder de um Tenant Admin no tenant escolhido).
  analystId?: string;
  // Mesma ideia de analystId, mas para o Owner acessando diretamente a base de um
  // cliente (POST /auth/enter-tenant) — permite voltar à visão de plataforma depois.
  ownerId?: string;
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
  private readonly analystIdSignal = signal<string | null>(null);
  private readonly ownerIdSignal = signal<string | null>(null);
  private readonly userIdSignal = signal<string | null>(null);
  // Não vem do JWT (não é claim de autorização, é só um estado de UI) — setado direto
  // pelo AuthService a partir da resposta de /auth/login, persistido à parte pra
  // sobreviver a um refresh de página (ver auth.service.ts > storeTokens).
  private readonly mustChangePasswordSignal = signal<boolean>(false);

  readonly profile = this.profileSignal.asReadonly();
  readonly userId = this.userIdSignal.asReadonly();
  readonly mustChangePassword = this.mustChangePasswordSignal.asReadonly();
  readonly isOwner = computed(() => this.profileSignal() === 'OWNER');
  readonly isAnalystBase = computed(() => this.profileSignal() === 'ANALYST');
  readonly isAnalystSession = computed(() => this.analystIdSignal() !== null);
  // true quando o Owner está acessando diretamente a base de um cliente (POST
  // /auth/enter-tenant) — profile já vira "TENANT_ADMIN" no restante do token, então essa
  // flag é o único jeito de saber que a sessão atual "pertence" a um Owner.
  readonly isOwnerImpersonating = computed(() => this.ownerIdSignal() !== null);

  constructor() {
    const existingToken = localStorage.getItem(ACCESS_TOKEN_KEY);

    if (existingToken) {
      this.loadFromAccessToken(existingToken);
    }

    this.mustChangePasswordSignal.set(localStorage.getItem(MUST_CHANGE_PASSWORD_KEY) === 'true');
  }

  loadFromAccessToken(accessToken: string): void {
    const payload = decodeAccessToken(accessToken);
    this.profileSignal.set(payload?.profile ?? null);
    this.analystIdSignal.set(payload?.analystId ?? null);
    this.ownerIdSignal.set(payload?.ownerId ?? null);
    this.userIdSignal.set(payload?.sub ?? null);
  }

  setMustChangePassword(value: boolean): void {
    this.mustChangePasswordSignal.set(value);
  }

  clear(): void {
    this.profileSignal.set(null);
    this.analystIdSignal.set(null);
    this.ownerIdSignal.set(null);
    this.userIdSignal.set(null);
    this.mustChangePasswordSignal.set(false);
  }
}

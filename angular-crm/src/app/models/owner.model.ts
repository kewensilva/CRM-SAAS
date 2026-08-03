export interface Owner {
  id: string;
  name: string;
  email: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface CreateOwnerPayload {
  name: string;
  email: string;
  password: string;
}

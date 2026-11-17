interface IInstanceProjection {
  instanceId: string;
  name: string;
  status: string;
  phoneNumber?: string;
  webhookUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  lastConnectedAt?: Date;
}

export type InstanceReadModel = IInstanceProjection;

export interface IInstanceReadRepository {
  findById(instanceId: string): Promise<InstanceReadModel | null>;
  findByName(name: string): Promise<InstanceReadModel | null>;
  findAll(): Promise<InstanceReadModel[]>;
  exists(instanceId: string): Promise<boolean>;
}

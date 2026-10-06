import { Injectable, OnModuleInit } from '@nestjs/common';
import { Application, ApplicationStatus } from './application.types';
import { seedApplications } from './applications.seed';

@Injectable()
export class ApplicationsRepository implements OnModuleInit {
  private readonly store = new Map<string, Application>();
  private nextId = 10042;

  onModuleInit(): void {
    this.resetWithSeed();
  }

  resetWithSeed(): void {
    this.store.clear();
    const { applications, nextId } = seedApplications();
    for (const application of applications) {
      this.store.set(application.id, structuredClone(application));
    }
    this.nextId = nextId;
  }

  /** Test helper to wipe and reseed. */
  reset(): void {
    this.resetWithSeed();
  }

  findAll(filters?: { search?: string; status?: ApplicationStatus }): Application[] {
    let items = Array.from(this.store.values());

    if (filters?.status) {
      items = items.filter((item) => item.status === filters.status);
    }

    if (filters?.search) {
      const needle = filters.search.trim().toLowerCase();
      items = items.filter((item) => {
        const name = item.data.legalName?.toLowerCase() ?? '';
        return name.includes(needle) || item.id.toLowerCase().includes(needle);
      });
    }

    return items
      .map((item) => structuredClone(item))
      .sort((a, b) => b.lastUpdatedAt.localeCompare(a.lastUpdatedAt));
  }

  findById(id: string): Application | undefined {
    const found = this.store.get(id);
    return found ? structuredClone(found) : undefined;
  }

  create(application: Omit<Application, 'id'> & { id?: string }): Application {
    const id = application.id ?? this.generateId();
    const created: Application = structuredClone({ ...application, id });
    this.store.set(id, created);
    return structuredClone(created);
  }

  update(id: string, application: Application): Application | undefined {
    if (!this.store.has(id)) {
      return undefined;
    }
    const updated = structuredClone(application);
    this.store.set(id, updated);
    return structuredClone(updated);
  }

  private generateId(): string {
    const id = `APP-${this.nextId}`;
    this.nextId += 1;
    return id;
  }
}

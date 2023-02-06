import { Module } from './holder.module.ts';

export class ModulesContainer extends Map<string, Module> {
  private readonly _applicationId = crypto.randomUUID();

  get applicationId(): string {
    return this._applicationId;
  }
}

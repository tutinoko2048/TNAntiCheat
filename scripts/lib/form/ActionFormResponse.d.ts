import type { ActionFormResponse as BaseActionFormResponse } from '@minecraft/server-ui';

export interface ActionFormButton {
  readonly text: string;
  readonly iconPath?: string;
  readonly id?: any;
}

export interface ActionFormResponse extends BaseActionFormResponse {
  button?: ActionFormButton;
}
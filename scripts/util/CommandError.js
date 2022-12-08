export class CommandError extends Error {
  constructor(args) {
    super(args);
    this.name = 'CommandError';
  }
}
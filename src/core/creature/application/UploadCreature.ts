export class UploadCreature {
  repository: any;

  constructor(repository: any) {
    this.repository = repository;
  }

  async execute(data: any) {
    // placeholder: forward to repository
    return this.repository.save(data);
  }
}

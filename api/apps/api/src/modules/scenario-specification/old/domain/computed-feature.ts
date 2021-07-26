export class ComputedFeature {
  constructor(
    public readonly name: string,
    public readonly parentFeatureId: string,
    public readonly derivedFromFeatureId: string,
    public readonly id: string,
  ) {}
}

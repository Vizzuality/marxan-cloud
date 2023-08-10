import FEATURE_ABUND_IMG from 'images/info-buttons/img_abundance_data.png';
import FEATURE_SOCIAL_IMG from 'images/info-buttons/img_social_uses.png';
import FEATURE_SPECIES_IMG from 'images/info-buttons/img_species_range.png';

const FeaturesInfo = (): JSX.Element => {
  return (
    <>
      <h4 className="mb-2.5 font-heading text-lg">What are features?</h4>
      <div className="space-y-2">
        <p>
          Features are the important habitats, species, processes, activities, and discrete areas
          that you want to consider in your planning process. Common feature data formats are range
          maps, polygons, abundances, and continuous scale or probability of occurrence maps (e.g.
          0-1). Features can include more than just ecological data but also be cultural and
          socio-economic areas like community fishing grounds or traditional-use areas, and other
          human activities and industries. Every feature must have a minimum target amount set. Some
          examples include:
        </p>
        <img src={FEATURE_SPECIES_IMG} alt="Feature-Range" />
        <img src={FEATURE_ABUND_IMG} alt="Feature-Abundance" />
        <img src={FEATURE_SOCIAL_IMG} alt="Feature-Social" />
      </div>
    </>
  );
};

export default FeaturesInfo;

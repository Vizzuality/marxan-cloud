export const UploadCostSurfaceInfoButtonContent = (): JSX.Element => {
  return (
    <div className="space-y-2.5 text-xs">
      <h4 className="font-heading">List of supported file formats:</h4>
      <p>Zipped: .shp (zipped shapefiles must include .shp, .shx, .dbf, and .prj files)</p>
    </div>
  );
};

export default UploadCostSurfaceInfoButtonContent;

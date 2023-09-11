export const UploadWDPAsInfoButtonContent = (): JSX.Element => {
  return (
    <div className="space-y-2.5 text-xs">
      <h4 className="mb-2.5 font-heading">
        When uploading shapefiles of protected areas, please make sure that:
      </h4>
      <ul className="list-disc space-y-1 pl-6">
        <li>this is a single zip file that includes all the components of a single shapefile;</li>
        <li>
          all the components are added to the “root”/top-level of the zip file itself (that is, not
          within any folder within the zip file);
        </li>
        <li>
          user-defined shapefile attributes are only considered for shapefiles of features, while
          they are ignored for any other kind of shapefile (planning grid, lock-in/out, etc), so you
          may consider excluding any attributes from shapefiles other than for features, in order to
          keep the shapefile’s file size as small as possible.
        </li>
      </ul>
    </div>
  );
};

export default UploadWDPAsInfoButtonContent;

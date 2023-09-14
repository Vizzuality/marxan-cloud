const ProtectedAreasFooter = (): JSX.Element => {
  return (
    <div className="mt-8 text-xs">
      <p className="text-gray-400">
        UNEP-WCMC and IUCN (2022), Protected Planet: The World Database on Protected Areas (WDPA)
        [On-line], [05/2022], Cambridge, UK: UNEP-WCMC and IUCN.
      </p>

      <p className="mt-7">
        Available at:{' '}
        <a
          className="text-blue-400"
          href="https://www.protectedplanet.net/"
          target="_blank"
          rel="noopener noreferrer"
        >
          www.protectedplanet.net
        </a>
      </p>
    </div>
  );
};

export default ProtectedAreasFooter;

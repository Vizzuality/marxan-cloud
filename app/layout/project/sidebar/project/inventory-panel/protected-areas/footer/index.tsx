const ProtectedAreasFooter = (): JSX.Element => {
  return (
    <div className="mt-8 text-xs">
      <p className="text-gray-300">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam tincidunt sem non arcu
        elementum, et dignissim felis volutpat consectetur adipiscing elit consectetur adipiscing
        elit.
      </p>

      <p className="mt-7">
        Lorem ipsum:{' '}
        <a className="text-blue-400" href="https://www.google.com" target="_blank">
          www.google.com
        </a>
        .
      </p>
    </div>
  );
};

export default ProtectedAreasFooter;

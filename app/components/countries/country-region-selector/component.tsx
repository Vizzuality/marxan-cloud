import React, { useState } from 'react';

import { useCountries } from 'hooks/countries';

import Loading from 'components/loading';
import Select from 'components/forms/select';

import CountryRegionSelectorProps from './types';

export const CountryRegionSelector: React.FC<CountryRegionSelectorProps> = ({
  country,
  region,
}: CountryRegionSelectorProps) => {
  const [selectedCountry, setSelectedCountry] = useState(country);
  const [selectedRegion, setSelectedRegion] = useState(region);
  const {
    data, isFetching, isFetched,
  } = useCountries({ includeAll: true });

  const handleCountryChange = (value) => {
    setSelectedCountry(value);
  };
  const handleRegionChange = (value) => {
    setSelectedRegion(value);
  };

  return (
    <div className="mt-6">
      <Loading
        visible={isFetching}
        className="absolute top-0 bottom-0 left-0 right-0 z-40 flex items-center justify-center w-full h-full bg-black bg-opacity-90"
        iconClassName="w-10 h-10 text-primary-500"
      />
      {isFetched && data?.length > 0 && (
        <div>
          {/* Country selector */}
          <Select
            status="none"
            size="base"
            theme="dark"
            options={data.map((c) => ({ label: c.name, value: c.id }))}
            initialSelected={selectedCountry?.id}
            onChange={handleCountryChange}
          />
          {/* Region selector */}
          <Select
            status="none"
            size="base"
            theme="dark"
            options={[]}
            initialSelected={selectedRegion?.id}
            onChange={handleRegionChange}
          />
        </div>
      )}
    </div>
  );
};

export default CountryRegionSelector;

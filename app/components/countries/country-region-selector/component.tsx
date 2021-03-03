import React, { useState } from 'react';

import { RegionLevel } from 'types/country-model';

import { useCountries, useCountryRegions } from 'hooks/countries';

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
    data: countriesData, isFetching: isFetchingCountries, isFetched: isFetchedCountries,
  } = useCountries({ includeAll: true });
  const {
    data: regionsData, isFetching: isFetchingRegions, isFetched: isFetchedRegions,
  } = useCountryRegions({ id: selectedCountry?.id, includeAll: true, level: RegionLevel.ONE });

  const handleCountryChange = (value) => {
    setSelectedCountry(value);
  };
  const handleRegionChange = (value) => {
    setSelectedRegion(value);
  };

  console.log('selectedCountry', selectedCountry);

  return (
    <div className="mt-6">
      <Loading
        visible={isFetchingCountries || isFetchingRegions}
        className="absolute top-0 bottom-0 left-0 right-0 z-40 flex items-center justify-center w-full h-full bg-black bg-opacity-90"
        iconClassName="w-10 h-10 text-primary-500"
      />
      {isFetchedCountries && countriesData?.length > 0 && (
        <div>
          {/* Country selector */}
          <Select
            status="none"
            size="base"
            theme="dark"
            options={countriesData.map((c) => ({ label: c.name, value: c.id }))}
            initialSelected={selectedCountry?.id}
            onChange={(value) => handleCountryChange({ id: value })}
          />
          {/* Region selector */}
          {isFetchedRegions && regionsData?.length > 0 && (
            <Select
              status="none"
              size="base"
              theme="dark"
              options={regionsData.map((c) => ({ label: c.name, value: c.id }))}
              initialSelected={selectedRegion?.id}
              onChange={handleRegionChange}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default CountryRegionSelector;

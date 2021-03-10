import React, { useState } from 'react';
import { Field as FieldRFF } from 'react-final-form';

import Field from 'components/forms/field';
import {
  composeValidators,
} from 'components/forms/validations';

import { RegionLevel } from 'types/country-model';

import { useCountries, useCountryRegions } from 'hooks/countries';
import { useAdministrativeAreas } from 'hooks/administrative-areas';

import Loading from 'components/loading';
import Select from 'components/forms/select';

import CountryRegionSelectorProps from './types';

export const CountryRegionSelector: React.FC<CountryRegionSelectorProps> = ({
  country,
  region,
  subRegion,
}: CountryRegionSelectorProps) => {
  const [selectedCountry, setSelectedCountry] = useState(country);
  const [selectedRegion, setSelectedRegion] = useState(region);
  const [selectedSubRegion, setSelectedSubRegion] = useState(subRegion);
  const {
    data: countriesData, isFetching: isFetchingCountries, isFetched: isFetchedCountries,
  } = useCountries({ includeAll: true });
  const {
    data: regionsData, isFetching: isFetchingRegions, isFetched: isFetchedRegions,
  } = useCountryRegions({ id: selectedCountry, includeAll: true, level: RegionLevel.ONE });
  const {
    data: subRegionsData, isFetching: isFetchingSubRegions, isFetched: isFetchedSubRegions,
  } = useAdministrativeAreas({ id: selectedRegion, includeAll: true });

  return (
    <div className="mt-6">
      <Loading
        visible={(isFetchingCountries && !isFetchedCountries)
          || (isFetchingRegions && !isFetchedRegions)
          || (isFetchingSubRegions && !isFetchedSubRegions)}
        className="absolute top-0 bottom-0 left-0 right-0 z-40 flex items-center justify-center w-full h-full bg-black bg-opacity-90"
        iconClassName="w-10 h-10 text-primary-500"
      />
      {isFetchedCountries && countriesData?.length > 0 && (
        <div>
          {/* Country selector */}
          <div className="mb-3">
            <FieldRFF
              name="countryId"
              validate={composeValidators([{ presence: true }])}
            >
              {(fprops) => (
                <Select
                  status="none"
                  size="base"
                  theme="dark"
                  clearSelectionActive
                  options={countriesData.map((c) => ({ label: c.name, value: c.id }))}
                  initialSelected={selectedCountry}
                  onChange={(value: string) => {
                    setSelectedCountry(value);
                    fprops.input.onChange(value);
                  }}
                />
              )}
            </FieldRFF>
          </div>
          {/* Region selector */}
          {isFetchedRegions && regionsData?.length > 0 && (
            <div className="mb-3">
              <FieldRFF
                name="adminAreaLevel1Id"
              >
                {(fprops) => (
                  <Field id="adminAreaLevel1Id" {...fprops}>
                    <Select
                      status="none"
                      size="base"
                      theme="dark"
                      clearSelectionActive
                      options={regionsData.map((c) => ({ label: c.name, value: c.id }))}
                      initialSelected={selectedRegion}
                      onChange={(value: string) => {
                        setSelectedRegion(value);
                        fprops.input.onChange(value);
                      }}
                    />
                  </Field>
                )}
              </FieldRFF>
            </div>
          )}
          {/* Sub-Region selector */}
          {isFetchedSubRegions && subRegionsData?.length > 0 && (
            <div>
              <FieldRFF
                name="adminAreaLevel2Id"
              >
                {(fprops) => (
                  <Field id="adminAreaLevel2Id" {...fprops}>
                    <Select
                      status="none"
                      size="base"
                      theme="dark"
                      clearSelectionActive
                      options={subRegionsData.map((c) => ({ label: c.name, value: c.id }))}
                      initialSelected={selectedSubRegion}
                      onChange={(value: string) => {
                        setSelectedSubRegion(value);
                        fprops.input.onChange(value);
                      }}
                    />
                  </Field>
                )}
              </FieldRFF>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CountryRegionSelector;

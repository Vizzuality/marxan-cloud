import React, { useEffect, useState } from 'react';

import { Field as FieldRFF } from 'react-final-form';

import Field from 'components/forms/field';
import {
  composeValidators,
} from 'components/forms/validations';

import { RegionLevel } from 'types/country-model';

import { useDispatch } from 'react-redux';
import { useCountries, useCountryRegions } from 'hooks/countries';
import { useAdministrativeAreas } from 'hooks/administrative-areas';

import { setBbox, setMinPuAreaSize, setMaxPuAreaSize } from 'store/slices/projects/new';

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
  const dispatch = useDispatch();

  const {
    data: countriesData, isFetching: isFetchingCountries, isFetched: isFetchedCountries,
  } = useCountries({ includeAll: true });

  const {
    data: regionsData, isFetching: isFetchingRegions, isFetched: isFetchedRegions,
  } = useCountryRegions({ id: selectedCountry, includeAll: true, level: RegionLevel.ONE });

  const {
    data: subRegionsData, isFetching: isFetchingSubRegions, isFetched: isFetchedSubRegions,
  } = useAdministrativeAreas({ id: selectedRegion, includeAll: true });

  useEffect(() => {
    setSelectedRegion(null);
    setSelectedSubRegion(null);
  }, [selectedCountry]);

  useEffect(() => {
    setSelectedSubRegion(null);
  }, [selectedRegion]);

  return (
    <div className="relative mt-6">
      {isFetchedCountries && countriesData?.length > 0 && (
        <div>
          {/* Country selector */}
          <div className="mb-3">
            <FieldRFF
              name="countryId"
              validate={composeValidators([{ presence: true }])}
            >
              {(fprops) => (
                <Field id="countryId" {...fprops}>
                  <Select
                    status="none"
                    size="base"
                    theme="dark"
                    placeholder="Select country..."
                    clearSelectionActive
                    options={countriesData.map((c) => ({ label: c.name, value: c.id }))}
                    initialSelected={selectedCountry}
                    onChange={(value: string) => {
                      const COUNTRY = countriesData.find((c) => c.id === value);
                      const { bbox, minPuAreaSize, maxPuAreaSize } = COUNTRY || {};
                      console.log('HELLLLLLLOOOO------->', minPuAreaSize, maxPuAreaSize);
                      dispatch(setBbox(bbox));
                      dispatch(setMinPuAreaSize(minPuAreaSize));
                      dispatch(setMaxPuAreaSize(maxPuAreaSize));

                      setSelectedCountry(value);
                      fprops.input.onChange(value);
                    }}
                  />
                </Field>
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
                      key={selectedCountry}
                      status="none"
                      size="base"
                      theme="dark"
                      placeholder="Select region (optional)"
                      clearSelectionActive
                      options={regionsData.map((c) => ({ label: c.name, value: c.id }))}
                      onChange={(value: string) => {
                        const COUNTRY = countriesData.find((c) => c.id === country);
                        const REGION = regionsData.find((c) => c.id === value);

                        const { bbox, minPuAreaSize, maxPuAreaSize } = REGION || COUNTRY || {};
                        dispatch(setBbox(bbox));
                        dispatch(setMinPuAreaSize(minPuAreaSize));
                        dispatch(setMaxPuAreaSize(maxPuAreaSize));

                        setSelectedRegion(value);
                        fprops.input.onChange(value);
                      }}
                      {...selectedSubRegion && {
                        initialSelected: selectedRegion,
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
                      key={selectedRegion}
                      status="none"
                      size="base"
                      theme="dark"
                      clearSelectionActive
                      placeholder="Select subregion (optional)"
                      options={subRegionsData.map((c) => ({ label: c.name, value: c.id }))}
                      onChange={(value: string) => {
                        const REGION = regionsData.find((c) => c.id === region);
                        const SUBREGION = subRegionsData.find((c) => c.id === value);
                        const { bbox, minPuAreaSize, maxPuAreaSize } = SUBREGION || REGION || {};
                        dispatch(setBbox(bbox));
                        dispatch(setMinPuAreaSize(minPuAreaSize));
                        dispatch(setMaxPuAreaSize(maxPuAreaSize));

                        setSelectedSubRegion(value);
                        fprops.input.onChange(value);
                      }}
                      {...selectedSubRegion && {
                        initialSelected: selectedSubRegion,
                      }}
                    />
                  </Field>
                )}
              </FieldRFF>
            </div>
          )}
        </div>
      )}

      <Loading
        visible={(isFetchingCountries && !isFetchedCountries)
          || (isFetchingRegions && !isFetchedRegions)
          || (isFetchingSubRegions && !isFetchedSubRegions)}
        className="z-40 flex items-center justify-center w-full h-12 bg-transparent bg-opacity-90"
        iconClassName="w-5 h-5 text-primary-500"
        transition={{
          duration: 0,
        }}
      />
    </div>
  );
};

export default CountryRegionSelector;

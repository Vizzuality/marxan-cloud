import { useEffect, useState, MouseEvent } from 'react';

import { Field as FieldRFF } from 'react-final-form';
import { useDispatch } from 'react-redux';

import { setBbox, setMinPuAreaSize, setMaxPuAreaSize } from 'store/slices/projects/new';

import { useAdministrativeAreas } from 'hooks/administrative-areas';
import { useCountries, useCountryRegions } from 'hooks/countries';

import Field from 'components/forms/field';
import Select from 'components/forms/select';
import { composeValidators } from 'components/forms/validations';
import Loading from 'components/loading';
import { Country, Region, SubRegion } from 'types/api/location';

export const CountryRegionSelector = ({
  country,
  region,
  subRegion,
  onClick,
}: {
  country?: Country['id'];
  region?: Region['id'];
  subRegion?: SubRegion['id'];
  onClick?: (evt: MouseEvent<HTMLDivElement>) => void;
}): JSX.Element => {
  const [selectedCountry, setSelectedCountry] = useState(country);
  const [selectedRegion, setSelectedRegion] = useState(region);
  const [selectedSubRegion, setSelectedSubRegion] = useState(subRegion);
  const dispatch = useDispatch();

  const {
    data: countriesData,
    isFetching: isFetchingCountries,
    isFetched: isFetchedCountries,
  } = useCountries({ includeAll: true });

  const {
    data: regionsData,
    isFetching: isFetchingRegions,
    isFetched: isFetchedRegions,
  } = useCountryRegions({ id: selectedCountry, includeAll: true, level: 1 });

  const {
    data: subRegionsData,
    isFetching: isFetchingSubRegions,
    isFetched: isFetchedSubRegions,
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
          <div aria-hidden="true" className="mb-3" onClick={onClick}>
            <FieldRFF name="countryId" validate={composeValidators([{ presence: true }])}>
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
              <FieldRFF name="adminAreaLevel1Id">
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
                      {...(selectedSubRegion && {
                        initialSelected: selectedRegion,
                      })}
                    />
                  </Field>
                )}
              </FieldRFF>
            </div>
          )}
          {/* Sub-Region selector */}
          {isFetchedSubRegions && subRegionsData?.length > 0 && (
            <div>
              <FieldRFF name="adminAreaLevel2Id">
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
                      {...(selectedSubRegion && {
                        initialSelected: selectedSubRegion,
                      })}
                    />
                  </Field>
                )}
              </FieldRFF>
            </div>
          )}
        </div>
      )}

      <Loading
        visible={
          (isFetchingCountries && !isFetchedCountries) ||
          (isFetchingRegions && !isFetchedRegions) ||
          (isFetchingSubRegions && !isFetchedSubRegions)
        }
        className="z-40 flex h-12 w-full items-center justify-center bg-transparent bg-opacity-90"
        iconClassName="w-10 h-10 text-primary-500"
        transition={{
          duration: 0,
        }}
      />
    </div>
  );
};

export default CountryRegionSelector;

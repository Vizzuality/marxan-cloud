import { CustomPlanningAreaRepository } from '@marxan/planning-area-repository';
import { BBox } from 'geojson';
import { assertDefined, FieldsOf, isDefined } from '@marxan/utils';
import { Test } from '@nestjs/testing';
import { HttpModule } from '@nestjs/common';
import { AdminArea } from '@marxan/admin-regions';
import { Country } from '@marxan-api/modules/countries/country.geo.entity';
import { CountriesService } from '@marxan-api/modules/countries/countries.service';
import { AdminPlanningAreasRepository } from '../admin-planning-areas.repository';
import { notFound } from '../abstract-planning-areas.service';
import { AllPlanningAreasService } from '../all-planning-areas.service';
import { CustomPlanningAreasService } from '../custom-planning-areas.service';
import { AdminPlanningAreasService } from '../admin-planning-areas.service';
import { CountryPlanningAreasService } from '../country-planning-areas.service';

export async function getFixtures() {
  class FakeCustomPlanningAreaRepository
    implements FieldsOf<CustomPlanningAreaRepository>
  {
    db: Record<string, { bbox: BBox; projectId?: string }> = {};

    async getBBox(id: string) {
      return this.db[id]?.bbox;
    }

    async has(id: string) {
      return id in this.db;
    }

    saveGeoJson(): never {
      throw new Error('not implemented');
    }

    async assignProject(id: string, projectId: string): Promise<void> {
      const entity = this.db[id];
      if (isDefined(entity)) entity.projectId = projectId;
    }
  }

  type FakeAdminArea = Pick<
    AdminArea,
    'gid0' | 'gid1' | 'gid2' | 'name0' | 'name1' | 'name2' | 'bbox' | 'id'
  >;

  class FakeAdminPlanningAreasRepository
    implements FieldsOf<AdminPlanningAreasRepository>
  {
    db: Record<string, FakeAdminArea> = {};

    async findAdminAreaGidsAndBBox(id: string) {
      return this.db[id] ?? notFound;
    }

    async findAdminAreaGidsAndNames(id: string) {
      return this.db[id] ?? notFound;
    }

    async findAdminAreaIdByLevelId(id: string) {
      return this.db[id] ?? notFound;
    }
  }

  type FakeCountry = Pick<Country, 'gid0' | 'name0' | 'bbox' | 'id'>;

  class FakeCountriesService
    implements Pick<CountriesService, 'getIdAndNameByGid0' | 'getBBoxByGid0'>
  {
    db: Record<string, FakeCountry> = {};

    async getIdAndNameByGid0(country: string) {
      return this.db[country];
    }

    async getBBoxByGid0(country: string) {
      return this.db[country];
    }
  }

  const testingModule = await Test.createTestingModule({
    imports: [HttpModule],
    providers: [
      AllPlanningAreasService,
      AdminPlanningAreasRepository,
      FakeCustomPlanningAreaRepository,
      {
        provide: CustomPlanningAreaRepository,
        useExisting: FakeCustomPlanningAreaRepository,
      },
      CustomPlanningAreasService,
      AdminPlanningAreasService,
      CountryPlanningAreasService,
      FakeCountriesService,
      {
        provide: CountriesService,
        useExisting: FakeCountriesService,
      },
      FakeAdminPlanningAreasRepository,
      {
        provide: AdminPlanningAreasRepository,
        useExisting: FakeAdminPlanningAreasRepository,
      },
    ],
  }).compile();

  const fakeCustomPlanningAreaRepository = testingModule.get(
    FakeCustomPlanningAreaRepository,
  );
  const fakeAdminPlanningAreasRepository = testingModule.get(
    FakeAdminPlanningAreasRepository,
  );
  const fakeCountriesService = testingModule.get(FakeCountriesService);
  const randomBbox = (): BBox => [
    Math.random(),
    Math.random(),
    Math.random(),
    Math.random(),
  ];
  const fixtures = {
    getService() {
      return testingModule.get(AllPlanningAreasService);
    },
    customPlanningAreaBBox: randomBbox(),
    customPlanningAreaAvailable(planningAreaGeometryId: string) {
      fakeCustomPlanningAreaRepository.db[planningAreaGeometryId] = {
        bbox: fixtures.customPlanningAreaBBox,
      };
    },
    get ids() {
      return {
        allIds: {
          planningAreaGeometryId: 'planningAreaGeometryId',
          adminAreaLevel1Id: fixtures.adminAreaLvl1.gid1,
          adminAreaLevel2Id: fixtures.adminAreaLvl2.gid2,
          countryId: fixtures.country1.gid0,
        },
        withoutPlanningAreaGeometryId: {
          adminAreaLevel1Id: fixtures.adminAreaLvl1.gid1,
          adminAreaLevel2Id: fixtures.adminAreaLvl2.gid2,
          countryId: fixtures.country1.gid0,
        },
        withoutPlanningAreaGeometryIdAndAdminAreaLevel2Id: {
          adminAreaLevel1Id: fixtures.adminAreaLvl1.gid1,
          countryId: fixtures.country1.gid0,
        },
        withOnlyCountryId: {
          countryId: fixtures.country1.gid0,
        },
      };
    },
    adminAreaLvl1: {
      id: 'internal-adm-level-1-id',
      gid0: 'country-1',
      gid1: 'adm-level-1',
      name0: 'Country 1',
      name1: 'Adm Level 1',
      bbox: randomBbox(),
    } as FakeAdminArea,
    adminAreaLvl2: {
      id: 'internal-adm-level-2-id',
      gid0: 'country-1',
      gid1: 'adm-level-1',
      gid2: 'adm-level-2',
      name0: 'Country 1',
      name1: 'Adm Level 1',
      name2: 'Adm Level 2',
      bbox: randomBbox(),
    } as FakeAdminArea,
    country1: {
      id: 'internal-country-1-id',
      gid0: 'country-1',
      name0: 'Country 1',
      bbox: randomBbox(),
    } as FakeCountry,
    adminAreaLvl1Available() {
      const adminArea = fixtures.adminAreaLvl1;
      assertDefined(adminArea.gid1);
      fakeAdminPlanningAreasRepository.db[adminArea.gid1] = adminArea;
    },
    adminAreaLvl2Available() {
      const adminArea = fixtures.adminAreaLvl2;
      assertDefined(adminArea.gid2);
      fakeAdminPlanningAreasRepository.db[adminArea.gid2] = adminArea;
    },
    countryAvailable() {
      const country = fixtures.country1;
      assertDefined(country.gid0);
      fakeCountriesService.db[country.gid0] = country;
    },
    customPlanningAreaAssignedTo(id: string, projectId: string) {
      expect(fakeCustomPlanningAreaRepository.db[id].projectId).toStrictEqual(
        projectId,
      );
    },
  };
  return fixtures;
}

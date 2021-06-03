import { Test } from '@nestjs/testing';
import { FileService } from '@marxan-geoprocessing/modules/files/files.service';
import { ShapefileService } from './shapefiles.service';
import { readdir } from 'fs/promises';
import { GeoJSON } from 'geojson';
import { validGeoJson, nonValidGeoJson } from './__mocks__/geojson';
jest.mock('fs/promises');

const mockFileService = () => ({});
describe('ShapefileService', () => {
  let shapefileService: ShapefileService;
  const minimumRequiredFiles = ['test.prj', 'test.dbf', 'test.shx', 'test.shp'];

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ShapefileService,
        { provide: FileService, useFactory: () => mockFileService },
      ],
    }).compile();
    jest.clearAllMocks();
    shapefileService = module.get<ShapefileService>(ShapefileService);
  });

  describe('Given a shapefile without all required files', () => {
    (readdir as jest.Mock).mockReturnValueOnce(
      minimumRequiredFiles.filter((file) => file != 'test.shp'),
    );
    describe('When the service checks the path', () => {
      it('Then it should return false', async () => {
        const result = await shapefileService.areRequiredShapefileFilesInFolder(
          '/path/to/glory',
        );
        expect(result).toBeFalsy();
      });
    });
  });
  describe('Given a shapefile with all required files', () => {
    (readdir as jest.Mock).mockReturnValueOnce(minimumRequiredFiles);
    describe('When the service checks the path', () => {
      it('Then it should return true', async () => {
        const result = await shapefileService.areRequiredShapefileFilesInFolder(
          '/path/to/glory',
        );
        expect(result).toBeTruthy();
      });
    });
  });

  describe('Given a GeoJSON with unsupported types', () => {
    describe('When the service check if its a supported type', () => {
      it('Then it should return false', () => {
        const result = shapefileService.isGeoJsonTypeSupported(
          nonValidGeoJson(),
        );
        expect(result).toBeFalsy();
      });
    });
  });

  describe('Given a GeoJON with supported types', () => {
    describe('When the service check if its a supported type', () => {
      it('Then it should return true', () => {
        const result = shapefileService.isGeoJsonTypeSupported(validGeoJson());
        expect(result).toBeTruthy();
      });
    });
  });
});

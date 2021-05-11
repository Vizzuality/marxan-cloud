# "Migration" steps

* `mkdir backend && cd backend`
* `nest g app api`
* `nest g app geoprocessing`
* `nest g lib shared`
* remove everything except tsconfig.app
* copy-paste all contents
* run `yarn` again in every application (& library)

Dont be afraid to restart IDE - TS Service will go crazy for a bit

# build checks

cd backend/apps/main-api
yarn build => main-api/dist - ok
(noticed that it contains /src while it shouldn't be the case; its due to `ormconfig.ts` is being outside of src directory)

cd backend/apps/geoprocessing
yarn build => geoprocessing/dist - ok
(same note as above)

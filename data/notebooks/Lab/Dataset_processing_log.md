# Dataset processing log


### Issues detected with models:  
**CreateFileFromDF**
- (Fixed) dict_writer.writerows(toCSV): toCSV not defined
    --> changed toCSV for data
- (Fixed) with InputDatFile, error: InputDatFile not iterable 
    --> added if/else logic and wrote file in a different way
- (Fixed) spec data had data in wrong header
    --> deleted keys that have not been filled with data
- (Fixed) When data is 0, keep 0 value and not delete

**_readTabularFile**
- (Fixed) When input.dat has comma as delimiter it does not split well the data 
    --> added:  if/else logic for comma delimiter and the rest

**Save button**
- (Fixed) Save button error
    --> fixed when CreateFileFromDF was fixed

**InputDatFile**
- Made BLOCKDEFNAME Optional
- Added default 3 to save outputs (0 is no file saved)
- Added SAVESUMMARY
- Added validators for all the save output options

**conservationFeature**
- Added 'prop' parameter and made Optional
- Made 'target' Optional
- Added validator to request that either 'prop' or 'target' are added (Does not triger when tested)

**generic**
- the order of the columns is important
- the name could vary
- Add SAVESOLMATRIX
- Add types to outputs (csv, txt, dat, no output)

## Test datasets problems

### 1. British Columbia


### 2. Coral Triangle

- There is no PU shp
    0. original files -- worked (outputs are txt, no blockdefname in input)
    1. mod input.dat -- failed
    2. mod input.dat, remove blockdefname -- worked
    3. mod input.dat, remove blockdefname, mod spec.dat -- worked
    4. mod input.dat, mod spec.dat -- failed
    5. mod input.dat, mod spec.dat, mod boundary -- failed
    6. mod input.dat, remove blockdefname.dat, mod spec.dat, mod boundary -- worked
    7. mod input.dat, mod spec.dat, mod boundary.dat, mod pu.dat -- failed
    8. mod input.dat, remove blockdefname, mod spec.dat, mod boundary.dat, mod pu.dat -- worked

### 3. Papua New Guinea
- There is no PU shp

## Questions:
BLM structure folder
where to define txt or csv
savesolution matrix

## Required files for each calculation:

### 5 MOST DIFFERENT SOLUTIONS
SAVEBEST 3 (output_best.csv)
SAVESOLUTIONSMATRIX 3 (output_solutionsmatrix.csv)

### GAP ANALYSIS
SPECNAME spec.dat
PUVSPNAME puvsp.name
PUNAME pu.dat

### BLM
pu shapefile
SAVESUMMARY 3 (output_sum.csv)
SAVEBEST 3 (output_best.csv)
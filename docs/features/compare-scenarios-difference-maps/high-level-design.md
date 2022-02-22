# Difference maps - High-level design

This document aims at providing an overview of the architecture of the difference maps for
the Marxan platform.

## Api scenario compare tiler design

The initial design of the api is based on [this document](https://docs.google.com/document/d/1T1Gp9RM6J-CoZoyIL7XBeUU1_w2ZrvN7rCSN_XAnBSg/edit#heading=h.51ul83hfhytz)

A user should provide 2 scenarios to compare, and the tiler should be able to provide the relative frequency maps of the 2 scenarios. The tiler should bear the `/api/v1/scenarios/{sid1}/compare/{sid2}/tiles/{z}/{x}/{y}.mvt` endpoint. where `sid1` and `sid2` are the scenario ids, `z` is the zoom level, `x` and `y` are the tile coordinates.

We need to ensure first that both scenarios are under the same project.

In order to compare solutions across any two given scenarios we will make use of the data already [configured for selection in scenario results](https://github.com/Vizzuality/marxan-cloud/blob/56d97aedd8dabe4cd22a7a9f1c84ff4f7bcb6b57/api/apps/geoprocessing/src/modules/scenarios/scenarios.service.ts#L45-L52): `frequencyValue`  in the table `output_scenarios_pu_data` for each scenario, which is calculated as `round((output.included_count/array_length(output.value, 1)::numeric)*100)::int as "frequencyValue"`

The vector tile properties that needs to be outputted are:

```json
{
 'id': 'id',
 'sid1': frequencyValue, 
 'sid2': frequencyValue
}
```

## Frontend Bivariate rules design

Rules are based on the [this document](https://docs.google.com/document/d/1r9Excv4juGThjPSdPZYx9yWke_LBh-LqGDFw6UTKa08/edit#heading=h.lce9j8b1epbp)

3 bivariate rules are defined:

* 3x3 bivariate categories based on design
* Never and always values based on (0,0) and (>90,>90)
* Arbitrary division based on `[<10, 10 - 50, > 50 ]` rule for each scenario that will map to  `[Low, Mid, High]` levels of presence in each scenario

Feature: Split

  @happypath
  Scenario: Split output
    Given the user is in Features tab 1/2
    And the user has added at least one Split layer (bioregional type)
    And the user selects the bioregional layer and a category to split by
    And the user selects the unique sub-categories he/she wants to keep
    When the features are processed (Continue)
    Then each sub-category appears as a new separate feature in Features tab 1/2

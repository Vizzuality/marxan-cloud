Feature: Intersection

  @happypath
  Scenario: Open intersection modal
    Given the user is in Features tab 1/2
    And the user has added at least one Intersection layer (species type)
    When The user clicks on 'Select features +'
    Then the Intersection modal opens

  @happypath
  Scenario: Intersection species with bioregional layer
    Given the user is in the Intersection modal
    And the user has selected a bioregional layer
    And the user has selected a category
    And the user has selected sub-categories
    And the user has saved
    When the features are processed (Continue)
    Then each intersection of species with sub-category appears as a new separate feature in Features tab 1/2

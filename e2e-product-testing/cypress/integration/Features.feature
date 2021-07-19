Feature: Add features modal
    @happypath
    Scenario: Open features modal
        Given the user is on the Features tab 1/2
        When the user selects 'Add features +'
        Then the modal to add features opens
    @happypath
    Scenario: Add features from inside platform
        Given the user is on Add features modal (Marxan 06b)
        When the user selects 'Add' on the features he/she wants to add and Saves
        Then the features are added to the Features tab 1/2
    Scenario: Upload features with incorrect shp
        Given the user is on Add features modal (Marxan 06b)
        And the user has an incorrect shapefile
        When the user uploads his/her shp via 'Upload your own features'
        Then the user gets an error message
    Scenario: Upload features with correct shp
        Given the user is on Add features modal (Marxan 06b)
        And the user has a correct shapefile
        When the user uploads his/her shp via 'Upload your own features'
        Then the features are added to the Features tab 1/2
    @happypath
    Scenario: Search features from inside platform with correct keywords
        Given the user is on Add features modal (Marxan 06b)
        When the user uses the search bar and types a keyword that matches a feature
        Then only the features that match the keyword are shown
    Scenario: Search features from inside platform with incorrect keywords
        Given the user is on Add features modal (Marxan 06b)
        When the user uses the search bar and types a keyword that does not matches any feature
        Then no features are shown

Feature: Split
    @happypath
    Scenario: Split output
        Given the user is in Features tab 1/2
        And the user has added at least one Split layer (bioregional type)
        And the user selects the bioregional layer and a category to split by
        And the user selects the unique sub-categories he/she wants to keep
        When the features are processed (Continue)
        Then each sub-category appears as a new separate feature in Features tab 1/2

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

Feature: Set targets
    @happypath
    Scenario: Set individual target
        Given the user is in Features tab 2/2
        When the user changes the value of the target of one feature
        Then the new target is displayed for that feature

    @happypath
    Scenario: Set block target
        Given the user is in Features tab 2/2
        When the user changes the value in the section 'ALL TARGETS'
        Then the target of all the features display the new value
    
Feature: Set FPF
    @happypath
    Scenario: Set individual FPF
        Given the user is in Features tab 2/2
        When the user changes the value of the FPF of one feature
        Then the new FPF is displayed for that feature

    @happypath
    Scenario: Set block FPF
        Given the user is in Features tab 2/2
        When the user changes the value in the section 'ALL FPF'
        Then the FPF of all the features display the new value

Feature: Feature processing
    @happypath
    Scenario: Feature processing
        Given the user is in Feature tab 2/2
        When the user clicks 'Continue'
        Then the user is sent to the Project dashboard to view the status of the Scenario
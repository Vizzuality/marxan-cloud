@happypath
Feature: Download solutions table

  Scenario: Download complete solutions table
    Given the user is in the solutions table modal
    When the user selects 'Download solutions'
    Then the user receives a bundle zip with all the result files in his/her local machine
